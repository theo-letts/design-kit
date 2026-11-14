/* How deep the glass is. Blur and fill travel together: a heavy blur behind an
   opaque fill is wasted, and a transparent fill with a light blur just looks
   like a washed-out card. Deep is the one that reads as frosted glass —
   the blur does the work, not the tint. */

export const DEPTH_NAMES = ["Frost", "Blur", "Deep"] as const;
export type DepthName = (typeof DEPTH_NAMES)[number];

export type Depth = {
  blur: number;
  saturate: number;
  /** Card fill alpha, per mode. */
  dark: number;
  light: number;
};

export const DEPTHS: Record<DepthName, Depth> = {
  Frost: { blur: 8, saturate: 1.3, dark: 0.68, light: 0.74 },
  Blur: { blur: 18, saturate: 1.7, dark: 0.55, light: 0.62 },
  Deep: { blur: 44, saturate: 2.1, dark: 0.34, light: 0.42 },
};
