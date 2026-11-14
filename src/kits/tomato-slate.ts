import { make, withPalette } from "./build";
import type { Kit } from "./types";

/* Warm grey stock, ink type, lime doing the pointing. The restraint is the
   design: with a brand colour this loud, anything else competing for attention
   cancels it out — so the shapes stay quiet and flat and let the colour work.

   Lime is the primary rather than the accent on purpose. The accent slot tints
   hover surfaces; it cannot hold a fluorescent. Smoky rose goes there. */

export default {
  id: "tomato-slate",
  name: "Tomato Slate",
  note: "Slate stock, ink type, lime brand. Quiet shapes so the colour can shout.",
  order: 8,
  config: withPalette(
    make("Mauve", "Neutral", {
      style: "Sera",
      radius: "Small",
      surface: "Solid",
      outline: "Hairline",
      elevation: "Flat",
      typeScale: "Default",
      chart: "Neutral",
      fontHeading: "Archivo",
      fontSans: "Public Sans",
      interact: "Press",
      entrance: "Fade",
      motion: "Snap",
    }),
    "tomato-slate",
  ),
} satisfies Kit;
