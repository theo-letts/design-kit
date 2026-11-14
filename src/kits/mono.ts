import { make } from "./build";
import type { Kit } from "./types";

/* One typeface doing every job. Paper Mono is a text face at its lighter
   weights and a display face near the top of its range, so the hierarchy here
   is carried by weight and size alone — there is no second family to lean on.

   ExtraBold is the point. No style preset goes past 700, which is why the
   heading weight is an override: a monospace set at 600 reads as code, and the
   same letters at 800 read as a masthead. */

export default {
  id: "mono",
  name: "Mono",
  note: "Paper Mono throughout, headings at ExtraBold. One family, hierarchy by weight.",
  order: 7,
  config: make("Neutral", "Neutral", {
    fontHeading: "Paper Mono",
    fontSans: "Paper Mono",
    fontMono: "Paper Mono",
    headingWeight: "ExtraBold",
  }),
} satisfies Kit;
