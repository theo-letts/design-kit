import { make, withPalette } from "./build";
import type { Kit } from "./types";

/* The only dark kit in the set. Flame, sun and ocean over near-black, which is
   the one arrangement where fully saturated colour is comfortable to look at:
   a dark ground gives each hue somewhere to sit instead of vibrating against
   white.

   The palette carries no light neutral, so the ink is derived from the ground
   itself — see applyPalette in src/lib/palettes.ts. Pinning a dark background
   without a matching foreground is what made this kit unreadable at first:
   the theme reads the pair as one side, and two dark values are a dark side
   with dark type on it. */

export default {
  id: "blazing-black",
  name: "Blazing Black",
  note: "Flame, sun and ocean over near-black. The dark one.",
  order: 11,
  config: withPalette(
    make("Zinc", "Orange", {
      mode: "dark",
      style: "Maia",
      radius: "Medium",
      surface: "Subtle",
      outline: "Default",
      elevation: "Soft",
      typeScale: "Default",
      chart: "Spectrum",
      fontHeading: "Space Grotesk",
      fontSans: "Inter",
      interact: "Glow",
      entrance: "Rise",
      motion: "Smooth",
    }),
    "blazing-black",
  ),
} satisfies Kit;
