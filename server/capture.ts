import { existsSync } from "node:fs";
import { chromium, type Page } from "playwright-core";

/** Where to find a Chrome to drive. playwright-core ships no browser of its own,
 *  so we borrow the one already on the machine (scripts/film.mjs does the same —
 *  it can't import this file because it runs outside Vite's TS pipeline). */
export function chromePath(): string | null {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return existsSync(mac) ? mac : null;
}

const WIDTH = 1280;
const HEIGHT = 820;

/** Everything the page told us about itself. Values are raw strings straight off
 *  the page, so nothing here may be trusted until `safeMeasured` has passed it. */
export type RawMeasured = {
  title: string;
  background: string | null;
  foreground: string | null;
  fontBody: string | null;
  fontHeading: string | null;
  radiusRem: number | null;
  shadow: string | null;
  /** A fixed vocabulary, decided in the page: never a raw background-image value,
   *  which could be a megabyte of data URI with anything at all inside it. */
  pattern: "none" | "gradient" | "repeating" | "image" | null;
  candidates: { color: string; where: string }[];
  tokens: { name: string; value: string }[];
};

export type Capture = {
  dataUrl: string;
  mediaType: "image/png";
  url: string;
  measured: RawMeasured;
};

/** Read the page's own computed styles. Measuring beats guessing: the font stack,
 *  the button radius and the body colours are facts here, not impressions. */
async function measure(page: Page): Promise<RawMeasured> {
  return page.evaluate(() => {
    const clear = (v: string) => !v || v === "transparent" || /rgba\(0, 0, 0, 0\)/.test(v);
    const firstFamily = (stack: string) =>
      stack
        .split(",")[0]
        ?.trim()
        .replace(/^["']|["']$/g, "") || "";

    /** The colour you actually see behind an element. */
    const bgBehind = (el: Element | null) => {
      for (let n: Element | null = el; n; n = n.parentElement) {
        const b = getComputedStyle(n).backgroundColor;
        if (!clear(b)) return b;
      }
      return null;
    };

    const seen = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        r.width >= 8 &&
        r.height >= 8 &&
        r.top < innerHeight &&
        r.bottom > 0 &&
        s.visibility !== "hidden" &&
        s.display !== "none" &&
        Number(s.opacity) > 0.15
      );
    };

    const body = document.body;
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    // The heading face, from the largest heading that actually has words in it.
    let fontHeading: string | null = null;
    const heads = [...document.querySelectorAll("h1,h2,h3")].filter(
      (h) => seen(h) && (h.textContent ?? "").trim().length > 2,
    );
    if (heads.length) fontHeading = firstFamily(getComputedStyle(heads[0]).fontFamily);

    // Radius from things that are shaped like controls — median, so one odd pill
    // among a dozen square buttons doesn't decide it.
    // Only controls the author actually dressed: a bare <input> with no fill and no
    // border inherits 0 and would drag the median down past every real button.
    const controls = [...document.querySelectorAll("button,[role='button'],input,textarea,select")]
      .filter(seen)
      .filter((c) => {
        const s = getComputedStyle(c);
        return !clear(s.backgroundColor) || parseFloat(s.borderTopWidth) > 0;
      })
      .slice(0, 40);
    let radiusRem: number | null = null;
    if (controls.length) {
      const radii = controls
        .map((c) => parseFloat(getComputedStyle(c).borderTopLeftRadius) || 0)
        .sort((a, b) => a - b);
      radiusRem = radii[Math.floor(radii.length / 2)] / rootPx;
    }

    // The shadow the page actually uses, by consensus across its panels: a hard
    // offset is a different design language from a soft blur, and reading one as
    // the other is most of why a match can come back looking generic.
    let shadow: string | null = null;
    const panels = [...document.querySelectorAll("div,section,article,aside,li")]
      .filter(seen)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width * r.height > 10_000 && r.width < innerWidth * 0.98;
      })
      .slice(0, 250);
    const shadows = new Map<string, number>();
    for (const el of panels) {
      const v = getComputedStyle(el).boxShadow;
      if (!v || v === "none") continue;
      shadows.set(v, (shadows.get(v) ?? 0) + 1);
    }
    if (shadows.size) {
      shadow = [...shadows.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }

    // Likewise the page's own backdrop, classified rather than quoted.
    const pageImage = [document.body, document.documentElement]
      .map((el) => getComputedStyle(el).backgroundImage)
      .find((v) => v && v !== "none");
    const pattern: "none" | "gradient" | "repeating" | "image" = !pageImage
      ? "none"
      : /repeating-/.test(pageImage)
        ? "repeating"
        : /gradient\(/.test(pageImage)
          ? "gradient"
          : "image";

    // Brand candidates: filled controls, plus link text. Area-weighted, because a
    // 4px coloured dot is not the brand colour.
    const candidates: { color: string; where: string; area: number }[] = [];
    for (const el of [...document.querySelectorAll("button,[role='button'],a,[class*='btn']")]
      .filter(seen)
      .slice(0, 120)) {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (!clear(s.backgroundColor)) {
        candidates.push({
          color: s.backgroundColor,
          where: `${el.tagName.toLowerCase()} fill`,
          area: r.width * r.height,
        });
      }
      if (el.tagName === "A" && !clear(s.color)) {
        candidates.push({ color: s.color, where: "link text", area: r.width * r.height });
      }
    }
    candidates.sort((a, b) => b.area - a.area);

    // Design tokens, if the site has any: the highest-fidelity signal there is.
    const tokens: { name: string; value: string }[] = [];
    const push = (name: string, value: string) => {
      if (!name.startsWith("--") || tokens.length >= 160) return;
      const v = value.trim();
      if (!/^(#|rgb|hsl|oklch|oklab|lab|lch|color\()/i.test(v)) return;
      if (tokens.some((t) => t.name === name)) return;
      tokens.push({ name, value: v });
    };
    const rootStyle = getComputedStyle(document.documentElement);
    for (let i = 0; i < rootStyle.length; i++) {
      const name = rootStyle.item(i);
      if (name.startsWith("--")) push(name, rootStyle.getPropertyValue(name));
    }
    if (!tokens.length) {
      // Older engines don't enumerate custom properties; read the sheets instead.
      for (const sheet of [...document.styleSheets]) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue; // cross-origin sheet
        }
        for (const rule of [...rules]) {
          if (!(rule instanceof CSSStyleRule)) continue;
          if (!/^(:root|html)\b/.test(rule.selectorText)) continue;
          for (let i = 0; i < rule.style.length; i++) {
            const name = rule.style.item(i);
            if (name.startsWith("--")) push(name, rule.style.getPropertyValue(name));
          }
        }
      }
    }

    return {
      title: document.title ?? "",
      // A transparent body over a transparent html is not a measurement — it means
      // the canvas is whatever the UA paints. Report nothing and let the shot decide.
      background: bgBehind(body),
      foreground: getComputedStyle(body).color,
      fontBody: firstFamily(getComputedStyle(body).fontFamily) || null,
      fontHeading,
      radiusRem,
      shadow,
      pattern,
      candidates: candidates.slice(0, 8).map(({ color, where }) => ({ color, where })),
      tokens,
    };
  });
}

/** Render a URL in real Chrome, then hand back a screenshot and the page's own
 *  computed styles. Throws with a readable message; the caller decides the code. */
export async function captureUrl(url: string, scheme: "light" | "dark"): Promise<Capture> {
  const exe = chromePath();
  if (!exe)
    throw Object.assign(new Error("No Chrome found. Set CHROME_PATH to a Chrome binary."), {
      code: "no-chrome",
    });

  const browser = await chromium.launch({ executablePath: exe });
  try {
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
      colorScheme: scheme,
      // A plain desktop Chrome string: some sites serve a different design to
      // anything they read as a bot, which would make the match a lie.
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    });
    page.setDefaultTimeout(20_000);
    await page.goto(url, { waitUntil: "load", timeout: 25_000 });
    // Settle: webfonts swapping in change both the screenshot and the measurement.
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
    await page.waitForTimeout(400);

    const measured = await measure(page);
    const png = await page.screenshot({ type: "png" });
    return {
      dataUrl: `data:image/png;base64,${png.toString("base64")}`,
      mediaType: "image/png",
      url: page.url(),
      measured,
    };
  } finally {
    await browser.close().catch(() => {});
  }
}
