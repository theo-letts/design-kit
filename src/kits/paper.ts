import { make, withColors } from "./build";
import type { Kit } from "./types";

export default {
  id: "paper",
  name: "Paper",
  note: "Read off paper.design/mono: hard offset shadow, mono headings, near-black brand.",
  order: 1,
  config: withColors(
    make("Stone", "Blue", {
      style: "Mira",
      // The chart ramp fans from the brand hue, and this brand is near-black —
      // so an analogous spread invents a hue that is not in the kit at all.
      chart: "Neutral",
      fontHeading: "JetBrains Mono",
      fontSans: "Inter",
      fontMono: "Paper Mono",
      elevation: "Default",
    }),
    {
      background: "#f6f6f3",
      foreground: "#141414",
      primary: "#1f1f1f",
      accent: "#5b8ef0",
      destructive: "#dc2626",
    },
  ),
} satisfies Kit;
