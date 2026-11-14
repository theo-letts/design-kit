import { make } from "./build";
import type { Kit } from "./types";

/* Plain shadcn with the type swapped and nothing else touched — same neutral
   ramp, same radii, borders and shadows as the Plain kit. This is a starting
   point to iterate from, not a finished look: holding every other axis at the
   default means anything you see here is the typefaces doing it.

   The Sunday Paper's own faces (SIL OFL 1.1, dennisgrauel/The-Sunday-Paper-fonts)
   over Paper Mono. The masthead face carries the headings and Paper Mono does
   everything else — the Sunday faces are drawn, not fitted for running text, so
   using one for body copy would be a costume rather than a typeface choice. */

export default {
  id: "sunday",
  name: "Sunday",
  note: "Default shadcn, retyped: Sunday Masthead over Paper Mono, every other axis left alone.",
  order: 6,
  config: make("Neutral", "Neutral", {
    fontHeading: "Sunday Masthead",
    fontSans: "Paper Mono",
    fontMono: "Paper Mono",
  }),
} satisfies Kit;
