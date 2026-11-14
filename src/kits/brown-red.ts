import { make, withPalette } from "./build";
import type { Kit } from "./types";

/* Off-white paper, oxblood primary, custard behind it. A warm palette wants
   warm type, so this is the one that goes fully serif — Fraunces above
   Crimson Pro, on an editorial scale with room to breathe.

   Coral takes destructive rather than the oxblood, because a destructive that
   matches the primary stops being a warning and becomes decoration. */

export default {
  id: "brown-red",
  name: "Brown Red",
  note: "Floral white and oxblood, set in serif on an editorial scale.",
  order: 10,
  config: withPalette(
    make("Taupe", "Red", {
      style: "Sera",
      radius: "Small",
      surface: "Subtle",
      outline: "Hairline",
      elevation: "Flat",
      typeScale: "Editorial",
      chart: "Analogous",
      fontHeading: "Fraunces",
      fontSans: "Crimson Pro",
      interact: "Flat",
      entrance: "Fade",
      motion: "Slow",
    }),
    "brown-red",
  ),
} satisfies Kit;
