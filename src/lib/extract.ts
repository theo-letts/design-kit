import { contrast, oklchToRgb, rgbToOklch, withC, withL, isDark, type Oklch } from "./color";
import type { Config } from "./config";

type Bucket = { l: number; c: number; h: number; n: number; edge: number };

const SAMPLE_WIDTH = 320;

/** Draw the image small and read its pixels back. */
async function rasterize(src: string): Promise<ImageData> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Could not decode that image."));
    img.src = src;
  });
  const scale = Math.min(1, SAMPLE_WIDTH / img.naturalWidth);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

/** Group pixels into coarse OKLCH cells and keep a running mean of each. */
function quantize(data: ImageData): Bucket[] {
  const { width, height } = data;
  const px = data.data;
  const map = new Map<string, Bucket & { sl: number; sc: number; sx: number; sy: number }>();
  const edgeX = width * 0.12;
  const edgeY = height * 0.12;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (px[i + 3] < 128) continue;
      const col = rgbToOklch({ r: px[i], g: px[i + 1], b: px[i + 2] });
      const lk = Math.round(col.l * 14);
      const ck = Math.round(col.c * 20);
      const hk = col.c < 0.02 ? 0 : Math.round(col.h / 15);
      const key = `${lk}:${ck}:${hk}`;
      const onEdge = x < edgeX || x > width - edgeX || y < edgeY || y > height - edgeY;
      let b = map.get(key);
      if (!b) {
        b = { l: 0, c: 0, h: 0, n: 0, edge: 0, sl: 0, sc: 0, sx: 0, sy: 0 };
        map.set(key, b);
      }
      b.n++;
      if (onEdge) b.edge++;
      b.sl += col.l;
      b.sc += col.c;
      // average hue on the unit circle so 359° and 1° don't average to 180°
      const rad = (col.h * Math.PI) / 180;
      b.sx += Math.cos(rad) * col.c;
      b.sy += Math.sin(rad) * col.c;
    }
  }

  const out: Bucket[] = [];
  for (const b of map.values()) {
    let h = (Math.atan2(b.sy, b.sx) * 180) / Math.PI;
    if (h < 0) h += 360;
    out.push({ l: b.sl / b.n, c: b.sc / b.n, h, n: b.n, edge: b.edge });
  }
  return out.sort((a, b) => b.n - a.n);
}

const rgb = (c: Oklch) => oklchToRgb(c);
const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/** Read a palette out of a screenshot: page surface, text, brand, accent. */
export async function extractConfig(src: string, base: Config): Promise<Config> {
  const data = await rasterize(src);
  const buckets = quantize(data);
  if (!buckets.length) throw new Error("That image had no readable pixels.");

  const total = buckets.reduce((s, b) => s + b.n, 0);
  const floor = total * 0.0012;

  // The page background is whatever dominates the outer frame of the shot.
  const byEdge = [...buckets].sort((a, b) => b.edge - a.edge);
  const bgRaw = (byEdge[0]?.edge ?? 0) > total * 0.02 ? byEdge[0] : buckets[0];
  const background = withC({ l: bgRaw.l, c: bgRaw.c, h: bgRaw.h }, Math.min(bgRaw.c, 0.02));
  const bgRgb = rgb(background);
  const dark = isDark(background);

  // Text is the high-contrast colour that still covers real area.
  let foreground = base.colors.foreground;
  let bestFg = 0;
  for (const b of buckets) {
    if (b.n < floor) continue;
    const score = contrast(bgRgb, rgb(b)) * Math.log10(b.n + 10);
    if (score > bestFg) {
      bestFg = score;
      foreground = withC({ l: b.l, c: b.c, h: b.h }, Math.min(b.c, 0.02));
    }
  }
  foreground = withL(foreground, dark ? Math.max(foreground.l, 0.9) : Math.min(foreground.l, 0.25));

  // Brand colour: saturated, readable against the background, and actually present.
  let primary: Oklch | null = null;
  let bestP = 0;
  for (const b of buckets) {
    if (b.n < floor || b.c < 0.045) continue;
    if (contrast(bgRgb, rgb(b)) < 1.35) continue;
    const score = b.c * Math.sqrt(b.n);
    if (score > bestP) {
      bestP = score;
      primary = { l: b.l, c: b.c, h: b.h };
    }
  }
  if (primary) {
    // Nudge into a range that works as a filled button surface.
    primary = dark
      ? withL(primary, Math.min(Math.max(primary.l, 0.58), 0.8))
      : withL(primary, Math.min(Math.max(primary.l, 0.42), 0.68));
  } else {
    primary = dark ? withL(foreground, 0.92) : withL(foreground, 0.2);
  }

  // Accent: the next distinct hue, if the shot has one.
  let accent: Oklch | null = null;
  let bestA = 0;
  for (const b of buckets) {
    if (b.n < floor || b.c < 0.04) continue;
    if (hueGap(b.h, primary.h) < 28) continue;
    const score = b.c * Math.sqrt(b.n);
    if (score > bestA) {
      bestA = score;
      accent = { l: b.l, c: b.c, h: b.h };
    }
  }
  if (!accent) accent = { ...primary, h: (primary.h + 32) % 360 };

  // Destructive: reuse a red from the shot if there is one, else keep the default.
  let destructive = base.colors.destructive;
  for (const b of buckets) {
    if (b.n < floor * 0.5 || b.c < 0.08) continue;
    if (hueGap(b.h, 27) > 18) continue;
    destructive = withL({ l: b.l, c: b.c, h: b.h }, Math.min(Math.max(b.l, 0.5), 0.65));
    break;
  }

  return {
    ...base,
    mode: dark ? "dark" : "light",
    colors: { background, foreground, primary, accent, destructive },
  };
}
