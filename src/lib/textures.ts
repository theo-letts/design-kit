import { oklchToHex, type Oklch } from "./color";

/* A texture is three CSS values — an image, a size and a blend mode — so the
   whole axis survives `toCss()` into a real project as three lines on <body>.
   Nothing here needs a component, a pseudo-element or a stacking context.

   Two families live side by side:
   - Geometric ones (dots, grid, hatch, mesh, halftone) bake the theme's own
     colour into the gradient, so they retint when the palette moves.
   - Noise ones (grain, paper) are colourless SVG tiles that take their colour
     from whatever they are blended over. Tiles are small and repeat, rather
     than running feTurbulence across the whole page, which is slow. */

export const TEXTURE_NAMES = [
  "None",
  "Grain",
  "Paper",
  "Dots",
  "Grid",
  "Hatch",
  "Mesh",
  "Halftone",
  "Weave",
  "Dither",
] as const;
export type TextureName = (typeof TEXTURE_NAMES)[number];

export const STRENGTH_NAMES = ["Light", "Medium", "Strong"] as const;
export type StrengthName = (typeof STRENGTH_NAMES)[number];

const STRENGTH: Record<StrengthName, number> = { Light: 0.5, Medium: 1, Strong: 1.8 };

export type TextureCss = {
  image: string;
  size: string;
  blend: string;
  /* One entry per image layer, always. Stacking two textures concatenates
     these lists, and CSS cycles a short list rather than erroring — which
     silently misaligns every layer after the first. */
  position: string;
};

const NONE: TextureCss = { image: "none", size: "auto", blend: "normal", position: "0 0" };

/** oklch with an alpha channel, which is what every gradient stop here wants. */
const ink = (c: Oklch, alpha: number) =>
  `oklch(${c.l.toFixed(4)} ${c.c.toFixed(4)} ${c.h.toFixed(2)} / ${Math.min(alpha, 1).toFixed(3)})`;

const svg = (body: string, w: number, h = w) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>`,
  )}")`;

/** feTurbulence, rasterised by the browser once per tile and then repeated. */
const noise = (freq: string, octaves: number, opacity: number, tile: number) =>
  svg(
    `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${octaves}' stitchTiles='stitch'/>` +
      `<feColorMatrix type='saturate' values='0'/></filter>` +
      `<rect width='100%' height='100%' filter='url(#n)' opacity='${opacity.toFixed(3)}'/>`,
    tile,
  );

/** Recursive Bayer construction: M2n = [[4M, 4M+2], [4M+3, 4M+1]]. */
function bayer(order: number): number[][] {
  if (order === 0) return [[0]];
  const prev = bayer(order - 1);
  const n = prev.length;
  const out: number[][] = [];
  for (let y = 0; y < n * 2; y++) {
    out[y] = [];
    for (let x = 0; x < n * 2; x++) {
      const add = y < n ? (x < n ? 0 : 2) : x < n ? 3 : 1;
      out[y][x] = prev[y % n][x % n] * 4 + add;
    }
  }
  return out;
}

const BAYER_8 = bayer(3);

export type TextureInks = {
  /** Neutral, for line work: dots, grid, hatch, halftone. */
  ink: Oklch;
  /** The brand hue, which only Mesh actually spends. */
  brand: Oklch;
};

export function textureCss(
  name: TextureName,
  strength: StrengthName,
  inks: TextureInks,
  mode: "light" | "dark",
): TextureCss {
  const k = STRENGTH[strength];
  const dark = mode === "dark";
  const tint = inks.ink;

  switch (name) {
    case "Grain":
      return {
        image: noise("0.9", 3, Math.min(0.55 * k, 1), 128),
        size: "128px 128px",
        // Overlay keeps mid-tones; on dark surfaces it blows out, so soften it.
        blend: dark ? "soft-light" : "overlay",
        position: "0 0",
      };

    case "Paper": {
      // Directional fibre over a finer tooth, which is what paper stock reads as.
      const fibre = noise("0.012 0.5", 2, Math.min(0.5 * k, 1), 220);
      const tooth = noise("1.4", 2, Math.min(0.28 * k, 1), 90);
      return {
        image: `${fibre}, ${tooth}`,
        size: "220px 220px, 90px 90px",
        blend: dark ? "soft-light, soft-light" : "multiply, overlay",
        position: "0 0, 0 0",
      };
    }

    case "Dots":
      return {
        image: `radial-gradient(${ink(tint, 0.5 * k)} 1px, transparent 1px)`,
        size: "14px 14px",
        blend: "normal",
        position: "0 0",
      };

    case "Grid":
      return {
        image:
          `linear-gradient(${ink(tint, 0.42 * k)} 1px, transparent 1px), ` +
          `linear-gradient(90deg, ${ink(tint, 0.42 * k)} 1px, transparent 1px)`,
        size: "32px 32px, 32px 32px",
        blend: "normal, normal",
        position: "0 0, 0 0",
      };

    case "Hatch":
      return {
        image: `repeating-linear-gradient(45deg, ${ink(tint, 0.3 * k)} 0 1px, transparent 1px 7px)`,
        size: "auto",
        blend: "normal",
        position: "0 0",
      };

    case "Mesh": {
      // Soft blobs off the brand hue, the one texture that carries real colour.
      const b = inks.brand;
      const blob = (h: number, a: number, x: string, y: string) =>
        `radial-gradient(60% 60% at ${x} ${y}, ${ink({ ...b, h: (b.h + h + 360) % 360 }, a * k)} 0%, transparent 70%)`;
      return {
        image: [
          blob(0, 0.5, "12%", "8%"),
          blob(55, 0.4, "88%", "22%"),
          blob(-45, 0.35, "70%", "85%"),
        ].join(", "),
        size: "cover, cover, cover",
        blend: "normal, normal, normal",
        position: "0 0, 0 0, 0 0",
      };
    }

    case "Halftone": {
      // Two offset dot screens, the way a duotone print actually lands.
      const a = ink(tint, 0.4 * k);
      return {
        image:
          `radial-gradient(${a} 1.1px, transparent 1.2px), ` +
          `radial-gradient(${a} 1.1px, transparent 1.2px)`,
        size: "8px 8px, 8px 8px",
        blend: "normal, normal",
        position: "0 0, 4px 4px",
      };
    }

    case "Weave": {
      // Warp and weft, a half-cell apart, which is what canvas grain is.
      const a = ink(tint, 0.26 * k);
      return {
        image:
          `repeating-linear-gradient(0deg, ${a} 0 1px, transparent 1px 3px), ` +
          `repeating-linear-gradient(90deg, ${a} 0 1px, transparent 1px 3px)`,
        size: "auto, auto",
        blend: "normal, normal",
        position: "0 0, 0 0",
      };
    }

    case "Dither": {
      /* An 8x8 ordered-dither tile. Strength is the threshold, so it maps onto
         exactly the thing that varies in a real dither: how many cells are lit. */
      const level = Math.min(0.16 * k, 0.95);
      const fill = oklchToHex(tint);
      const cells: string[] = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if ((BAYER_8[y][x] + 0.5) / 64 < level) {
            cells.push(`<rect x='${x * 2}' y='${y * 2}' width='2' height='2'/>`);
          }
        }
      }
      return {
        image: svg(`<g fill='${fill}' fill-opacity='0.75'>${cells.join("")}</g>`, 16),
        size: "16px 16px",
        blend: "normal",
        position: "0 0",
      };
    }

    default:
      return NONE;
  }
}

/** Stack `over` on top of `under`, keeping all four layer lists aligned. */
export function stackTextures(over: TextureCss, under: TextureCss): TextureCss {
  if (over.image === "none") return under;
  if (under.image === "none") return over;
  return {
    image: `${over.image}, ${under.image}`,
    size: `${over.size}, ${under.size}`,
    blend: `${over.blend}, ${under.blend}`,
    position: `${over.position}, ${under.position}`,
  };
}
