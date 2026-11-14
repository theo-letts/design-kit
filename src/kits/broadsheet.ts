import { make } from "./build";
import type { Kit } from "./types";

export default {
  id: "broadsheet",
  name: "Broadsheet",
  note: "Square and ruled. Double outlines and a serif pairing on an editorial scale.",
  order: 2,
  config: make("Stone", "Blue", {
    style: "Vega",
    radius: "None",
    surface: "Subtle",
    outline: "Double",
    typeScale: "Editorial",
    elevation: "Flat",
    fontHeading: "Playfair Display",
    fontSans: "Source Serif 4",
    interact: "Flat",
    entrance: "Fade",
  }),
} satisfies Kit;
