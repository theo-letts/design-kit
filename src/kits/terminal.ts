import { make } from "./build";
import type { Kit } from "./types";

export default {
  id: "terminal",
  name: "Terminal",
  note: "Mono throughout on near-black, with a hairline outline and no lift.",
  order: 5,
  config: make("Neutral", "Emerald", {
    mode: "dark",
    style: "Sera",
    radius: "None",
    outline: "Hairline",
    elevation: "Flat",
    interact: "Glow",
    entrance: "None",
    typeScale: "Compact",
    fontHeading: "IBM Plex Mono",
    fontSans: "IBM Plex Mono",
    fontMono: "IBM Plex Mono",
  }),
} satisfies Kit;
