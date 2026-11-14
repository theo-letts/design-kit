/** Minimal color maths: sRGB <-> OKLab/OKLCH, contrast, mixing. */

export type Rgb = { r: number; g: number; b: number }; // 0..255
export type Oklch = { l: number; c: number; h: number }; // l 0..1, c 0..0.4, h 0..360

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

function srgbToLinear(v: number) {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}
function linearToSrgb(v: number) {
  const x = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.round(clamp(x) * 255);
}

export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = srgbToLinear(r),
    lg = srgbToLinear(g),
    lb = srgbToLinear(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h: c < 1e-4 ? 0 : h };
}

export function oklchToRgb({ l, c, h }: Oklch): Rgb {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: linearToSrgb(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    g: linearToSrgb(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    b: linearToSrgb(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  };
}

/** Pull chroma down until the color fits in sRGB without clipping. */
export function gamutFit(col: Oklch): Oklch {
  let { l, c, h } = col;
  l = clamp(l, 0, 1);
  for (let i = 0; i < 24 && c > 0; i++) {
    const { r, g, b } = oklchToRgb({ l, c, h });
    const raw = [r, g, b];
    if (raw.every((v) => v >= 0 && v <= 255)) break;
    c *= 0.9;
  }
  return { l, c, h };
}

const r3 = (n: number, p = 4) => Number(n.toFixed(p));

export function formatOklch(col: Oklch): string {
  const { l, c, h } = gamutFit(col);
  if (c < 0.0005) return `oklch(${r3(l)} 0 0)`;
  return `oklch(${r3(l)} ${r3(c)} ${r3(h, 2)})`;
}

export function parseOklch(str: string): Oklch {
  const m = str.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i);
  if (!m) return { l: 0.5, c: 0, h: 0 };
  const l = m[1].endsWith("%") ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
  return { l, c: parseFloat(m[2]), h: parseFloat(m[3]) };
}

export function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export const oklchToHex = (c: Oklch) => rgbToHex(oklchToRgb(gamutFit(c)));
export const hexToOklch = (h: string) => rgbToOklch(hexToRgb(h));

/** WCAG relative luminance, for picking readable foregrounds. */
export function luminance({ r, g, b }: Rgb) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrast(a: Rgb, b: Rgb) {
  const la = luminance(a),
    lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** The contrast of two oklch colours, gamut-fitted first.
 *
 *  Alpha is not handled and must not be: a translucent colour has no
 *  contrast of its own, only a contrast against whatever is behind it.
 *  Composite before measuring — see `over`. */
export function ratio(a: Oklch, b: Oklch): number {
  return contrast(oklchToRgb(gamutFit(a)), oklchToRgb(gamutFit(b)));
}

/** Composite a translucent colour over an opaque one, so the result can be
 *  measured. A glass card reports a contrast of 2.2 against its own text if
 *  you read the token literally; what the eye sees is the card over the
 *  page, which is what this returns. */
export function over(fg: Oklch, alpha: number, bg: Oklch): Oklch {
  const a = Math.min(1, Math.max(0, alpha));
  return {
    l: bg.l + (fg.l - bg.l) * a,
    c: bg.c + (fg.c - bg.c) * a,
    h: a > 0.5 ? fg.h : bg.h,
  };
}

/** Push `colour` away from `against` until it clears `target`, by lightness.
 *
 *  Only lightness moves, and only as far as it has to. Hue and chroma are
 *  the design decision; contrast is the constraint — a fixer that desaturates
 *  to pass has solved the test and lost the colour. Returns the original if
 *  it already clears, so a palette that was designed carefully is untouched.
 *
 *  It can fail: black text on a black page cannot be fixed by nudging. When
 *  neither direction reaches the target, it returns the better of the two
 *  rather than pretending, and the caller gets the closest honest answer. */
export function ensureContrast(colour: Oklch, against: Oklch, target: number): Oklch {
  /* Clear the bar by a hair rather than landing on it. The value is
     serialised to four decimal places on its way into CSS, and a colour that
     measured exactly 3.00 here comes back as 2.99 when it is parsed again —
     a failure invented entirely by rounding. */
  const goal = target + 0.05;
  if (ratio(colour, against) >= goal) return colour;

  let best = colour;
  let bestRatio = ratio(colour, against);

  for (const direction of [1, -1]) {
    let candidate = colour;
    // 1% steps: fine enough that the fix is invisible, coarse enough to end.
    for (let i = 1; i <= 100; i++) {
      const l = colour.l + direction * i * 0.01;
      if (l < 0 || l > 1) break;
      candidate = { ...colour, l };
      const r = ratio(candidate, against);
      if (r > bestRatio) {
        bestRatio = r;
        best = candidate;
      }
      if (r >= goal) return candidate;
    }
  }
  return best;
}

/** Readable text color on top of `bg`, tinted with the bg hue so it never
 *  looks sterile — and guaranteed to clear `target`.
 *
 *  Picking the better of white and near-black is not the same as passing:
 *  measured across the kits, destructive-on-white came out at 4.47, which
 *  is a fail by 0.03 and invisible without a number. The floor is enforced
 *  rather than assumed. */
export function readableOn(bg: Oklch, tint = 0.012, target = 4.5): Oklch {
  const light: Oklch = { l: 0.985, c: Math.min(bg.c, tint), h: bg.h };
  const dark: Oklch = { l: 0.205, c: Math.min(bg.c, tint * 2), h: bg.h };
  const pick = ratio(bg, light) >= ratio(bg, dark) ? light : dark;
  return ensureContrast(pick, bg, target);
}

export function mix(a: Oklch, b: Oklch, t: number): Oklch {
  // interpolate hue the short way round
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  let h = a.h + dh * t;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;
  return { l: a.l + (b.l - a.l) * t, c: a.c + (b.c - a.c) * t, h };
}

export const withL = (c: Oklch, l: number): Oklch => ({ ...c, l: clamp(l) });
export const withC = (c: Oklch, ch: number): Oklch => ({ ...c, c: Math.max(0, ch) });
export const rotate = (c: Oklch, deg: number): Oklch => ({ ...c, h: (c.h + deg + 360) % 360 });
export const isDark = (c: Oklch) => luminance(oklchToRgb(gamutFit(c))) < 0.4;
