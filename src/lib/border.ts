import { gamutFit, type Oklch } from "./color";

/* The border was the one colour with no control at all.

   It is derived — a mix from the page toward the ink, 11.5% of the way in
   light and 16% in dark, or more under Subtle, where flush cards lean on the
   stroke to separate them. That derivation is good, and it is why borders
   come out warm on a warm page without anyone choosing it. What it cannot do
   is take an instruction: "a little stronger" and "carry some of the brand"
   were both unreachable.

   So two axes rather than one, because they are genuinely separate
   questions. Strength is how far the stroke sits from the page, which is a
   contrast decision. Tint is what hue it carries, which is not — and keeping
   them apart means tinting a border cannot quietly change how visible it is. */

export const BORDER_NAMES = ["Auto", "Faint", "Soft", "Default", "Strong", "Heavy"] as const;
export type BorderName = (typeof BORDER_NAMES)[number];

export const BORDER_BLURBS: Record<BorderName, string> = {
  Auto: "Derived from the surface: firmer under Subtle, where cards sit flush.",
  Faint: "Barely there. Needs a shadow or a fill to do the separating.",
  Soft: "Quieter than the default.",
  Default: "The shadcn weight, fixed rather than surface-aware.",
  Strong: "Reads as a drawn line rather than an edge.",
  Heavy: "A rule. Pairs with flat elevation and square corners.",
};

/* How far from the page, as a fraction of the way to the ink. Light mode
   values: a dark page needs more separation for the same apparent strength,
   so these are scaled on the dark side rather than listed twice. */
const STRENGTH: Record<Exclude<BorderName, "Auto">, number> = {
  Faint: 0.06,
  Soft: 0.09,
  Default: 0.115,
  Strong: 0.17,
  Heavy: 0.26,
};

const DARK_FACTOR = 1.4;

export const BORDER_TINT_NAMES = ["Neutral", "Hint", "Tinted", "Brand"] as const;
export type BorderTintName = (typeof BORDER_TINT_NAMES)[number];

export const BORDER_TINT_BLURBS: Record<BorderTintName, string> = {
  Neutral: "Straight off the page/ink mix. No hue of its own.",
  Hint: "A quarter of the brand's chroma. You notice it beside grey.",
  Tinted: "Half. The stroke is clearly coloured but still a border.",
  Brand: "Most of the way. Blueprint territory.",
};

const TINT: Record<BorderTintName, number> = {
  Neutral: 0,
  Hint: 0.25,
  Tinted: 0.5,
  Brand: 0.85,
};

/** How far along background → foreground the border sits. */
export function borderStep(name: BorderName, dark: boolean, subtle: boolean): number {
  if (name === "Auto") return dark ? (subtle ? 0.2 : 0.16) : subtle ? 0.145 : 0.115;
  const t = STRENGTH[name];
  return dark ? Math.min(0.95, t * DARK_FACTOR) : t;
}

/** Pull a neutral border toward the brand hue.
 *
 *  Lightness is kept exactly. That is the whole reason tint is its own axis:
 *  mixing toward a dark brand would drag the stroke darker and the tint would
 *  read as "stronger", which is the other axis's job. Only hue and chroma
 *  move, so a tinted border has the same contrast as the neutral one it
 *  replaced — and a Neutral theme, whose brand has no chroma, correctly
 *  stays grey at every setting. */
export function tintBorder(border: Oklch, brand: Oklch, name: BorderTintName): Oklch {
  const amount = TINT[name] ?? 0;
  if (amount === 0) return border;
  return gamutFit({ l: border.l, c: brand.c * amount, h: brand.h });
}
