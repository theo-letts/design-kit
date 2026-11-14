import { hexToOklch, type Oklch } from "./color";

/* Named scales, the way the real create page models colour: you pick a family,
   not a hex. Each entry is a generator — it fills in the raw colours, which stay
   the source of truth so a screenshot can still override them. */

/** Neutral ramps. A base is really just a hue and how much of it bleeds in. */
export const BASE_SCALES = {
  Neutral: { h: 0, c: 0 },
  Stone: { h: 65, c: 0.006 },
  Zinc: { h: 286, c: 0.006 },
  Mauve: { h: 315, c: 0.008 },
  Olive: { h: 120, c: 0.007 },
  Mist: { h: 225, c: 0.009 },
  Taupe: { h: 45, c: 0.011 },
} as const;

export type BaseName = keyof typeof BASE_SCALES;
export const BASE_NAMES = Object.keys(BASE_SCALES) as BaseName[];

/** Brand hues, as the light-mode primary.
 *  Held as sRGB hex on purpose: these have to survive a round-trip through a
 *  preset code, and an oklch value outside sRGB would not come back the same. */
export const THEME_HEX = {
  Neutral: "#171717",
  Amber: "#d97706",
  Blue: "#2563eb",
  Cyan: "#0891b2",
  Emerald: "#059669",
  Fuchsia: "#c026d3",
  Green: "#16a34a",
  Indigo: "#4f46e5",
  Lime: "#65a30d",
  Orange: "#ea580c",
  Pink: "#db2777",
  Purple: "#9333ea",
  Red: "#dc2626",
  Rose: "#e11d48",
  Sky: "#0284c7",
  Teal: "#0d9488",
  Violet: "#7c3aed",
  Yellow: "#ca8a04",
} as const;

export const THEME_SCALES: Record<string, Oklch> = Object.fromEntries(
  Object.entries(THEME_HEX).map(([k, v]) => [k, hexToOklch(v)]),
);

export type ThemeName = keyof typeof THEME_SCALES;
export const THEME_NAMES = Object.keys(THEME_SCALES) as ThemeName[];

/** How the five chart slots fan out from a hue. */
export const CHART_SPREADS = {
  Neutral: "mono",
  Analogous: "analogous",
  Complement: "complement",
  Spectrum: "spectrum",
} as const;

export type ChartSpread = keyof typeof CHART_SPREADS;
export const CHART_SPREAD_NAMES = Object.keys(CHART_SPREADS) as ChartSpread[];

/** Radius choices. `Default` defers to whatever the style asks for. */
export const RADII = {
  Default: null,
  None: 0,
  Small: 0.25,
  Medium: 0.5,
  Large: 0.875,
  Full: 1.5,
} as const;

export type RadiusName = keyof typeof RADII;
export const RADIUS_NAMES = Object.keys(RADII) as RadiusName[];

/** Filled vs. subtle surfaces for menus and popovers. */
/* Appended, never reordered: the preset code stores the index. */
export const SURFACE_NAMES = ["Solid", "Subtle", "Glass"] as const;
export type SurfaceName = (typeof SURFACE_NAMES)[number];
