import { formatOklch, mix, withL, type Oklch } from "./color";

/* Elevation as a ladder rather than one shadow.

   Two things separate a convincing shadow from a cheap one. It is two layers,
   not one — a tight key shadow for the contact edge and a wide ambient one for
   the room; and it is *tinted*, carrying a little of the surface it falls on,
   because pure black over a warm page reads as dirt. */

export const ELEVATION_NAMES = ["Default", "Flat", "Soft", "Lifted", "Dramatic"] as const;
export type ElevationName = (typeof ELEVATION_NAMES)[number];

type Rung = { y: number; blur: number; spread: number; alpha: number };

/* Four rungs: resting, raised, overlay, modal. Each entry is the key shadow;
   the ambient one is derived from it so the pair always stays in proportion. */
const LADDERS: Record<Exclude<ElevationName, "Default">, Rung[]> = {
  Flat: [
    { y: 0, blur: 0, spread: 0, alpha: 0 },
    { y: 1, blur: 1, spread: 0, alpha: 0.04 },
    { y: 1, blur: 2, spread: 0, alpha: 0.06 },
    { y: 2, blur: 4, spread: 0, alpha: 0.08 },
  ],
  Soft: [
    { y: 1, blur: 2, spread: -1, alpha: 0.06 },
    { y: 2, blur: 6, spread: -1, alpha: 0.08 },
    { y: 6, blur: 16, spread: -3, alpha: 0.1 },
    { y: 12, blur: 32, spread: -6, alpha: 0.14 },
  ],
  Lifted: [
    { y: 1, blur: 3, spread: -1, alpha: 0.1 },
    { y: 4, blur: 10, spread: -2, alpha: 0.12 },
    { y: 10, blur: 24, spread: -4, alpha: 0.16 },
    { y: 20, blur: 48, spread: -8, alpha: 0.22 },
  ],
  Dramatic: [
    { y: 2, blur: 6, spread: -1, alpha: 0.16 },
    { y: 8, blur: 20, spread: -3, alpha: 0.2 },
    { y: 18, blur: 44, spread: -6, alpha: 0.26 },
    { y: 32, blur: 72, spread: -10, alpha: 0.34 },
  ],
};

const ink = (c: Oklch, alpha: number) => formatOklch(c).replace(/\)$/, ` / ${alpha.toFixed(3)})`);

/** The four rungs as CSS values, tinted toward the page's own hue. */
export function elevationVars(
  name: ElevationName,
  background: Oklch,
  dark: boolean,
): Record<string, string> {
  if (name === "Default") return {};
  const ladder = LADDERS[name];
  /* The shadow colour: nearly black, but carrying the background's hue. In
     dark mode it goes fully black — there is nothing below to tint it with. */
  const base = dark
    ? withL(mix(background, { l: 0, c: 0, h: 0 }, 0.9), 0)
    : withL(background, 0.18);

  const vars: Record<string, string> = {};
  ladder.forEach((r, i) => {
    if (r.alpha === 0) {
      vars[`--elevation-${i}`] = "none";
      return;
    }
    const key = `0 ${r.y}px ${r.blur}px ${r.spread}px ${ink(base, r.alpha)}`;
    // Ambient: wider, softer, and never spread inward.
    const amb = `0 ${Math.round(r.y * 2)}px ${Math.round(r.blur * 2.2)}px ${Math.round(r.spread / 2)}px ${ink(base, r.alpha * 0.5)}`;
    vars[`--elevation-${i}`] = `${key}, ${amb}`;
  });
  return vars;
}
