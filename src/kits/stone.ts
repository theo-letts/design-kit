import { DEFAULT_CONFIG } from "@/lib/config";

import type { Kit } from "./types";

/* Saved from the remixer on 2026-11-13.
   Edit freely — this is an ordinary source file. */
export default {
  id: "stone",
  name: "Stone",
  note: "Saved from the remixer.",
  config: {
    ...DEFAULT_CONFIG,
    style: "Nova",
    radius: "None",
    surface: "Solid",
    chart: "Neutral",
    fontHeading: "Geist Serif",
    fontSans: "Geist",
    fontMono: "Paper Mono",
    typeScale: "Editorial",
    headingWeight: "Regular",
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
    outline: "Default",
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
        l: 0.9263785307951693,
        c: 0.06996065102160101,
        h: 95.04065929773661,
      },
      accent: {
        l: 0.9263785307951693,
        c: 0.06996065102160101,
        h: 95.04065929773661,
      },
      destructive: {
        l: 0.7299894721579983,
        c: 0.1465563808709615,
        h: 38.908124116205315,
      },
    },
  },
} satisfies Kit;
