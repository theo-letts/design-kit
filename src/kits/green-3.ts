import { DEFAULT_CONFIG } from "@/lib/config";

import type { Kit } from "./types";

/* Saved from the remixer on 2026-11-14, and since promoted: this is the kit
   the project starts on.

   Motion and Entrance were both saved as "None", which meant every animation
   in the kit resolved to a zero duration — the axis is the switch, so a
   sliding tab pill or a panel opening at its own height simply cut. They are
   Smooth and Scale now. See HOUSE_KIT_ID in src/kits/index.ts, and `npm run
   kit`, which writes it out as a drop-in stylesheet for other projects.
   Edit freely — this is an ordinary source file. */
export default {
  id: "green-3",
  name: "Green 3",
  note: "The house kit. Sea green on warm paper, set lower case in Geist Serif.",
  order: -1,
  config: {
    ...DEFAULT_CONFIG,
    ...{
      style: "Luma",
      radius: "Large",
      surface: "Solid",
      chart: "Neutral",
      fontHeading: "Geist Serif",
      fontSans: "Geist",
      fontMono: "Paper Mono",
      typeScale: "Default",
      headingWeight: "Regular",
      headingCase: "lower",
      labelCase: "lower",
      bodyCase: "lower",
      headingSize: "Larger",
      labelSize: "Larger",
      bodySize: "Larger",
      mode: "light",
      pageTexture: "None",
      pageTextureStrength: "Medium",
      pageGrain: "None",
      pageGrainStrength: "Medium",
      cardTexture: "None",
      cardTextureStrength: "Medium",
      tilt: "None",
      motion: "Smooth",
      interact: "Lift",
      entrance: "Scale",
      outline: "Offset",
      border: "Auto",
      borderTint: "Neutral",
      buttonOutline: "Offset",
      elevation: "Flat",
      glassDepth: "Blur",
      backdrop: "None",
      backdropTreatment: "Duotone",
      backdropFade: "Medium",
      backdropUrl: null,
      colors: {
        background: {
          l: 0.993,
          c: 0.0055,
          h: 45,
        },
        foreground: {
          l: 0.145,
          c: 0.019799999999999998,
          h: 45,
        },
        primary: {
          l: 0.5309422958971752,
          c: 0.11118349013916512,
          h: 146.93093836431467,
        },
        accent: {
          l: 0.8960644210984385,
          c: 0.019083401699815154,
          h: 96.88554167720103,
        },
        destructive: {
          l: 0.654782440819989,
          c: 0.20289380619480482,
          h: 32.232124504523966,
        },
      },
    },
  },
} satisfies Kit;
