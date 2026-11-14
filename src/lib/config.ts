import { type Oklch } from "./color";
import { FONTS, type FontName, type MonoFontName } from "./fonts";
import {
  BASE_NAMES,
  BASE_SCALES,
  CHART_SPREAD_NAMES,
  RADII,
  RADIUS_NAMES,
  SURFACE_NAMES,
  THEME_NAMES,
  THEME_SCALES,
  type BaseName,
  type ChartSpread,
  type RadiusName,
  type SurfaceName,
  type ThemeName,
} from "./scales";
import { STYLES, STYLE_NAMES, type StyleName } from "./styles";
import { STRENGTH_NAMES, TEXTURE_NAMES, type StrengthName, type TextureName } from "./textures";
import { type TiltName } from "./tilt";
import { type MotionName } from "./motion";
import { type BorderName, type BorderTintName } from "./border";
import { type ButtonOutlineName, type OutlineName } from "./outline";
import { type CaseName, type SizeName } from "./wording";
import { type DepthName } from "./glass";
import { type TypeScaleName, type HeadingWeightName } from "./type";
import { type ElevationName } from "./elevation";
import { type InteractName } from "./interact";
import { type EntranceName } from "./entrances";
import { type BackdropName, type FadeName, type TreatmentName } from "./backdrop";

export type ConfigColors = {
  background: Oklch;
  foreground: Oklch;
  primary: Oklch;
  accent: Oklch;
  destructive: Oklch;
};

export type Config = {
  style: StyleName;
  radius: RadiusName;
  surface: SurfaceName;
  chart: ChartSpread;
  fontHeading: FontName;
  fontSans: FontName;
  fontMono: MonoFontName;
  typeScale: TypeScaleName;
  /** Overrides the style preset's heading weight. "Auto" keeps the preset's. */
  headingWeight: HeadingWeightName;
  /** How headings and the small UI wording are cased. Rendering only — the
      words in the components are untouched. */
  headingCase: CaseName;
  labelCase: CaseName;
  bodyCase: CaseName;
  /** A nudge on top of the type scale, per group. */
  headingSize: SizeName;
  labelSize: SizeName;
  bodySize: SizeName;
  mode: "light" | "dark";
  /** The page behind the components, and the component surfaces, are separate
      layers — a grained page under clean cards is a different look from both. */
  pageTexture: TextureName;
  pageTextureStrength: StrengthName;
  /** A second texture stacked over the page one — the grain in "grainy mesh". */
  pageGrain: TextureName;
  pageGrainStrength: StrengthName;
  cardTexture: TextureName;
  cardTextureStrength: StrengthName;
  tilt: TiltName;
  motion: MotionName;
  interact: InteractName;
  entrance: EntranceName;
  outline: OutlineName;
  /** The stroke's contrast, and how much of the brand hue it carries. */
  border: BorderName;
  borderTint: BorderTintName;
  /** Buttons get their own stroke axis — see src/lib/outline.ts. */
  buttonOutline: ButtonOutlineName;
  elevation: ElevationName;
  glassDepth: DepthName;
  backdrop: BackdropName;
  backdropTreatment: TreatmentName;
  backdropFade: FadeName;
  /** A pasted URL or data URI. Deliberately outside the preset code: an image
      does not fit in 46 characters, so Custom is the one thing that does not
      travel with a shared link. */
  backdropUrl: string | null;
  /** The raw colours. Named scales write into these; a screenshot overwrites them. */
  colors: ConfigColors;
};

/* ------------------------------------------------- applying a named scale */

/** A neutral ramp, resolved for the mode you're currently looking at. */
export function baseColors(name: BaseName, mode: "light" | "dark") {
  const { h, c } = BASE_SCALES[name];
  // Light backgrounds stay just off-white so the family is still legible after a
  // round-trip through hex; the foreground carries most of the tint either way.
  return mode === "dark"
    ? { background: { l: 0.145, c, h }, foreground: { l: 0.985, c: c * 0.6, h } }
    : { background: { l: 0.993, c: c * 0.5, h }, foreground: { l: 0.145, c: c * 1.8, h } };
}

export function applyBase(config: Config, name: BaseName): Config {
  return { ...config, colors: { ...config.colors, ...baseColors(name, config.mode) } };
}

export function applyThemeColor(config: Config, name: ThemeName): Config {
  const primary = THEME_SCALES[name];
  // Accent follows the brand unless a screenshot has said otherwise.
  return { ...config, colors: { ...config.colors, primary, accent: primary } };
}

const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

/** Read the dropdown label back off the raw colours.
 *  Only the dark end of the ramp holds enough chroma to survive a hex round-trip,
 *  so compare whichever of the two that is for the current mode. */
export function detectBase(colors: ConfigColors): BaseName | "Custom" {
  type Pair = { background: Oklch; foreground: Oklch };
  // Which end is dark is a property of the colours, not of the mode you are viewing.
  const mode = colors.background.l < 0.5 ? "dark" : "light";
  const tinted = (c: Pair) => (mode === "dark" ? c.background : c.foreground);
  const plain = (c: Pair) => (mode === "dark" ? c.foreground : c.background);
  const got = tinted(colors);

  let best: BaseName | "Custom" = "Custom";
  let bestGap = Infinity;
  for (const name of BASE_NAMES) {
    const want = tinted(baseColors(name, mode));
    if (!near(want.l, got.l, 0.03)) continue;
    if (!near(plain(baseColors(name, mode)).l, plain(colors).l, 0.03)) continue;
    const greyish = want.c < 0.003 && got.c < 0.003;
    if (!greyish && !near(want.h, got.h, 22)) continue;
    const gap = Math.abs(want.c - got.c);
    if (gap <= 0.004 && gap < bestGap) {
      bestGap = gap;
      best = name;
    }
  }
  return best;
}

export function detectThemeColor(colors: ConfigColors): ThemeName | "Custom" {
  for (const name of THEME_NAMES) {
    const t = THEME_SCALES[name];
    if (
      near(t.l, colors.primary.l, 0.015) &&
      near(t.c, colors.primary.c, 0.012) &&
      (t.c < 0.01 || near(t.h, colors.primary.h, 8))
    ) {
      return name;
    }
  }
  return "Custom";
}

/** Radius in rem: the explicit choice, or whatever the style wants. */
export const effectiveRadius = (config: Config) =>
  RADII[config.radius] ?? STYLES[config.style].radius;

export const DEFAULT_CONFIG: Config = {
  style: "Nova",
  radius: "Default",
  surface: "Solid",
  chart: "Analogous",
  fontHeading: "Inter",
  fontSans: "Inter",
  fontMono: "Paper Mono",
  typeScale: "Default",
  headingWeight: "Auto",
  headingCase: "As written",
  labelCase: "As written",
  bodyCase: "As written",
  headingSize: "Default",
  labelSize: "Default",
  bodySize: "Default",
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
  border: "Auto",
  borderTint: "Neutral",
  buttonOutline: "Default",
  elevation: "Default",
  glassDepth: "Blur",
  backdrop: "None",
  backdropTreatment: "Duotone",
  backdropFade: "Medium",
  backdropUrl: null,
  colors: {
    ...baseColors("Neutral", "light"),
    primary: THEME_SCALES.Neutral,
    accent: THEME_SCALES.Neutral,
    destructive: THEME_SCALES.Red,
  },
};
