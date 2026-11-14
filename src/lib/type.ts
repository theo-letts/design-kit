/* The type scale. Until now only the *families* were themed, which is the
   smaller half: a 1.125 ratio and a 1.333 ratio are different designs long
   before anyone changes the typeface.

   Every step is derived from one base and one ratio, so the scale stays in
   proportion instead of being eight hand-picked numbers that drift. */

export const TYPE_SCALE_NAMES = ["Compact", "Default", "Comfortable", "Editorial"] as const;
export type TypeScaleName = (typeof TYPE_SCALE_NAMES)[number];

export type TypeScale = {
  /** Body size in rem. */
  base: number;
  ratio: number;
  /** Body line-height, unitless. */
  leading: number;
  /** Heading line-height — always tighter; large text needs less room. */
  leadingHeading: number;
  /** Body tracking in em. Headings get the style preset's own. */
  tracking: number;
};

export const TYPE_SCALES: Record<TypeScaleName, TypeScale> = {
  Compact: { base: 0.875, ratio: 1.125, leading: 1.45, leadingHeading: 1.15, tracking: 0 },
  Default: { base: 0.875, ratio: 1.2, leading: 1.5, leadingHeading: 1.2, tracking: 0 },
  Comfortable: { base: 0.9375, ratio: 1.25, leading: 1.6, leadingHeading: 1.25, tracking: 0 },
  Editorial: { base: 1, ratio: 1.333, leading: 1.7, leadingHeading: 1.1, tracking: -0.003 },
};

/* Tailwind's names, where each sits relative to the body step, and which
   leading it takes. Large text needs proportionally less room, so the
   heading steps take the tighter one. */
const STEPS: [name: string, power: number, heading: boolean][] = [
  ["xs", -2, false],
  ["sm", -1, false],
  ["base", 0, false],
  ["lg", 1, false],
  ["xl", 2, true],
  ["2xl", 3, true],
  ["3xl", 4, true],
  ["4xl", 5, true],
];

const round = (n: number) => `${Math.round(n * 1000) / 1000}rem`;

/** The scale as CSS variables, which `@theme inline` maps onto text-* utilities.
 *  `scale` nudges individual steps — see SIZE_STEPS in wording.ts. */
export function typeVars(
  name: TypeScaleName,
  scale: (step: string) => number = () => 1,
): Record<string, string> {
  const s = TYPE_SCALES[name];
  /* Tailwind's own names, not this project's.
  
     These used to be --type-* and were mapped onto --text-* in an
     `@theme inline` block, which worked here and nowhere else: the mapping
     is the app's, so an exported theme carried variable names no consumer
     reads, and the whole type scale arrived and silently did nothing. The
     indirection is gone — one name, spelled the way the utility spells it. */
  const vars: Record<string, string> = {
    "--type-tracking": `${s.tracking}em`,
  };
  for (const [step, power, heading] of STEPS) {
    vars[`--text-${step}`] = round(s.base * s.ratio ** power * scale(step));
    vars[`--text-${step}--line-height`] = String(heading ? s.leadingHeading : s.leading);
  }
  return vars;
}

/* Heading weight. The style presets each carry one, which is right — weight is
   part of a shape language. But a typeface can want a weight its style never
   anticipated: Paper Mono only reads as a heading face near the top of its
   range, and no preset goes past 700. "Auto" defers to the style, so this is
   an override and not a second source of truth. */
export const HEADING_WEIGHT_NAMES = [
  "Auto",
  "Regular",
  "Medium",
  "Semibold",
  "Bold",
  "ExtraBold",
] as const;
export type HeadingWeightName = (typeof HEADING_WEIGHT_NAMES)[number];

export const HEADING_WEIGHTS: Record<HeadingWeightName, number | null> = {
  Auto: null,
  Regular: 400,
  Medium: 500,
  Semibold: 600,
  Bold: 700,
  ExtraBold: 800,
};
