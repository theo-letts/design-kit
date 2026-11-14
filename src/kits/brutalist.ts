import { make } from "./build";
import type { Kit } from "./types";

export default {
  id: "brutalist",
  name: "Brutalist",
  note: "Heavy rules, bracket marks and a lean. Nothing is softened.",
  order: 3,
  config: make("Neutral", "Amber", {
    style: "Mira",
    outline: "Bracket",
    tilt: "Lean",
    typeScale: "Compact",
    interact: "Press",
    fontHeading: "Archivo",
    fontSans: "Archivo",
  }),
} satisfies Kit;
