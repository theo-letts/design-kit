import { readableOn, withC, withL, type Oklch } from "./color";

/* `destructive` was the only state colour in the kit, which meant no component
   could report success, a warning or a note honestly — a green "paid" badge had
   to be hard-coded or faked with the brand colour. These three are derived from
   the mode rather than stored, so they stay legible against any background and
   can never drift out of step with it. */

export const SEMANTIC_NAMES = ["success", "warning", "info"] as const;
export type SemanticName = (typeof SEMANTIC_NAMES)[number];

/** Hues chosen for meaning, not for harmony: a success green pulled toward a
 *  blue brand stops reading as success, which is the only job it has. */
const HUE: Record<SemanticName, number> = { success: 152, warning: 78, info: 245 };

export function semanticColor(name: SemanticName, dark: boolean): Oklch {
  const base: Oklch = { l: 0.56, c: 0.15, h: HUE[name] };
  // Warning sits at a hue the eye reads as much lighter than its L implies, so
  // it is pulled down to keep white text on it legible.
  const l = name === "warning" ? (dark ? 0.72 : 0.62) : dark ? 0.68 : 0.55;
  return withC(withL(base, l), name === "warning" ? 0.16 : 0.15);
}

export function semanticTokens(dark: boolean): Record<string, Oklch> {
  const out: Record<string, Oklch> = {};
  for (const name of SEMANTIC_NAMES) {
    const color = semanticColor(name, dark);
    out[name] = color;
    out[`${name}-foreground`] = readableOn(color);
  }
  return out;
}
