import { describe, expect, it } from "vitest";

import { KITS } from "@/kits";
import { over, ratio, type Oklch } from "../color";
import { buildTheme } from "../theme";

/* The audit found contrast failures in five places, and every one of them
   was invisible until someone measured it: 4.47 reads exactly like 4.53 on
   a screen. This is that measurement, run on every kit, so none of them can
   come back quietly.
   
   AA for text is 4.5:1. WCAG 1.4.11 asks 3:1 for the boundary of a control
   and for a focus indicator, which is why input and ring are in here and
   border is not — the card's hairline is decoration, the field's is the
   only thing saying "this is a field". */

const TEXT = 4.5;
const NON_TEXT = 3;

const PAIRS: [surface: string, ink: string, min: number][] = [
  ["background", "foreground", TEXT],
  ["card", "card-foreground", TEXT],
  ["popover", "popover-foreground", TEXT],
  ["muted", "muted-foreground", TEXT],
  ["primary", "primary-foreground", TEXT],
  ["secondary", "secondary-foreground", TEXT],
  ["accent", "accent-foreground", TEXT],
  ["destructive", "destructive-foreground", TEXT],
  ["success", "success-foreground", TEXT],
  ["warning", "warning-foreground", TEXT],
  ["info", "info-foreground", TEXT],
  ["background", "input", NON_TEXT],
  ["background", "ring", NON_TEXT],
];

/** oklch(l c h / a) back into numbers, because the tokens are strings. */
function parse(value: string): Oklch & { a: number } {
  const m = value.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?/);
  if (!m) throw new Error(`not an oklch colour: ${value}`);
  return { l: +m[1], c: +m[2], h: +m[3], a: m[4] ? +m[4] : 1 };
}

describe.each(KITS.map((k) => [k.name, k] as const))("%s", (_name, kit) => {
  for (const mode of ["light", "dark"] as const) {
    describe(mode, () => {
      const tokens = buildTheme(kit.config)[mode];
      const page = parse(tokens.background);

      /* A translucent surface has no contrast of its own — only a contrast
         against what is behind it. Glass cards read 2.2 against their own
         text if you measure the token literally, which is a number about
         nothing. Composite first. */
      const solid = (value: string) => {
        const c = parse(value);
        return c.a < 1 ? over(c, c.a, page) : c;
      };

      it.each(PAIRS)("%s on %s clears %s:1", (surface, ink, min) => {
        const r = ratio(
          solid(tokens[surface as keyof typeof tokens]),
          solid(tokens[ink as keyof typeof tokens]),
        );
        expect(r).toBeGreaterThanOrEqual(min);
      });
    });
  }
});
