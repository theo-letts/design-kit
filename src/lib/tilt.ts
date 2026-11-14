/* Off-axis layout. Every other axis in the kit is a token, but rotation is
   per-element: a single angle on every card reads as a broken page, not a
   deliberate one. So the angle is a fixed, irregular-looking sequence that
   repeats every nine siblings — stable across re-renders, unlike Math.random,
   which would reshuffle the page on every keystroke. */

export const TILT_NAMES = ["None", "Nudge", "Lean", "Scatter"] as const;
export type TiltName = (typeof TILT_NAMES)[number];

/** Degrees at the far end of the sequence. Past ~2deg cards start to collide. */
export const TILT_RANGE: Record<TiltName, number> = {
  None: 0,
  Nudge: 0.4,
  Lean: 0.9,
  Scatter: 1.8,
};

/** Nine multipliers in [-1, 1]. Hand-picked so no two neighbours agree and the
    run has no obvious period; a tidy ramp would read as a fan, not a scatter. */
export const TILT_SEEDS = [0.9, -0.5, 0.35, -1, 0.65, -0.2, 1, -0.75, 0.45];

/** The rules that put the sequence on the page, shared by the app and the export. */
export function tiltSeedRules(prefix: string, indent = ""): string {
  return TILT_SEEDS.map(
    (v, i) =>
      `${indent}${prefix}:nth-child(${TILT_SEEDS.length}n + ${i + 1}) { --tilt-seed: ${v}; }`,
  ).join("\n");
}
