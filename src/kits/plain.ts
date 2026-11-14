import { make } from "./build";
import type { Kit } from "./types";

export default {
  id: "plain",
  name: "Plain",
  note: "The shadcn default, untouched. The control against which the rest are judged.",
  order: 0,
  config: make("Neutral", "Neutral"),
} satisfies Kit;
