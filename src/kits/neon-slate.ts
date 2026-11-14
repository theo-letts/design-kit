import { make, withPalette } from "./build";
import type { Kit } from "./types";

/* Three fluorescents on grey, and nothing softened. Square corners and a ring
   outline because fluorescent colour against a rounded, shadowed card reads as
   a toy — the hard geometry is what keeps it looking deliberate.

   The pink carries destructive here. It is not a red, but it is the loudest
   thing in the set, and loudest is what destructive has to be. */

export default {
  id: "neon-slate",
  name: "Neon Slate",
  note: "Cyan, lime and shocking pink on grey. Square, ringed, nothing softened.",
  order: 9,
  config: withPalette(
    make("Mauve", "Cyan", {
      style: "Vega",
      radius: "None",
      surface: "Solid",
      outline: "Ring",
      elevation: "Flat",
      typeScale: "Compact",
      chart: "Spectrum",
      fontHeading: "Syne",
      fontSans: "Archivo",
      interact: "Press",
      entrance: "None",
      motion: "Snap",
    }),
    "neon-slate",
  ),
} satisfies Kit;
