import { make } from "./build";
import type { Kit } from "./types";

export default {
  id: "glass",
  name: "Glass",
  note: "Dark, translucent surfaces with a deep blur and a gradient outline.",
  order: 4,
  config: make("Mauve", "Violet", {
    mode: "dark",
    style: "Rhea",
    surface: "Glass",
    glassDepth: "Deep",
    outline: "Gradient",
    elevation: "Lifted",
    fontHeading: "Outfit",
    fontSans: "Outfit",
  }),
} satisfies Kit;
