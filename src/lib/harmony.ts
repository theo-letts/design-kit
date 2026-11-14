import { mix, rotate, withC, type Oklch } from "./color";

/* Until now the accent followed the brand hue exactly, so every theme was one
   colour and its neutrals. A harmony derives the accent from the primary by a
   fixed angle, which is how colour has been chosen on a wheel for two hundred
   years — and because it is derived rather than stored, moving the brand hue
   moves the accent with it. */

export const HARMONY_NAMES = [
  "Mono",
  "Analogous",
  "Split",
  "Triad",
  "Complement",
  "Custom",
] as const;
export type HarmonyName = (typeof HARMONY_NAMES)[number];

const ANGLE: Record<Exclude<HarmonyName, "Custom" | "Mono">, number> = {
  Analogous: 34,
  Split: 152,
  Triad: 120,
  Complement: 180,
};

export const HARMONY_BLURBS: Record<HarmonyName, string> = {
  Mono: "One hue. The accent is the brand colour.",
  Analogous: "A neighbour on the wheel — quiet, closely related.",
  Split: "Just off the opposite — contrast without the clash.",
  Triad: "A third of the wheel away. Balanced and lively.",
  Complement: "Straight across. The loudest pairing there is.",
  Custom: "Whatever is in the accent slot, untouched.",
};

/** The accent a harmony implies. `Custom` hands back what was already there,
 *  which is what a screenshot or a URL match writes. */
export function harmonize(primary: Oklch, name: HarmonyName, current: Oklch): Oklch {
  if (name === "Custom") return current;
  if (name === "Mono") return primary;
  // A rotation of grey is still grey. On a monochrome brand a harmony means
  // nothing unless the accent is allowed to carry some colour of its own.
  const base = primary.c < 0.025 ? withC(primary, 0.075) : primary;
  return rotate(base, ANGLE[name]);
}

/* ------------------------------------------------------------ temperature */

/* The neutrals carry more of a design's feeling than the brand colour does —
   a warm off-white page reads as paper, the same page cooled reads as screen.
   Tempering the background and foreground is enough: card, muted, border and
   the sidebar are all mixed from those two, so the whole ramp follows. */

export const TEMPERATURE_NAMES = ["Cool", "Neutral", "Warm"] as const;
export type TemperatureName = (typeof TEMPERATURE_NAMES)[number];

const TINT: Record<Exclude<TemperatureName, "Neutral">, number> = { Warm: 68, Cool: 252 };

export function temper(color: Oklch, name: TemperatureName, amount = 0.16): Oklch {
  if (name === "Neutral") return color;
  // Mix toward a tint at the same lightness, so only the hue and chroma move.
  return mix(color, { l: color.l, c: 0.085, h: TINT[name] }, amount);
}
