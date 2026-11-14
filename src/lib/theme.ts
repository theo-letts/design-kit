import {
  ensureContrast,
  formatOklch,
  gamutFit,
  isDark,
  mix,
  readableOn,
  rotate,
  withC,
  withL,
  type Oklch,
} from "./color";
import { effectiveRadius, type Config, type ConfigColors } from "./config";
import { STYLES } from "./styles";
import { fontStack, MONO_STACKS } from "./fonts";
import { typeVars, HEADING_WEIGHTS } from "./type";
import { elevationVars } from "./elevation";
import { stackTextures, textureCss } from "./textures";
import { TILT_RANGE, tiltSeedRules } from "./tilt";
import { MOTION, MOTION_RULE } from "./motion";
import { DEPTHS } from "./glass";
import { borderStep, tintBorder } from "./border";
import { buttonOutlineCss, outlineCss } from "./outline";
import { mobileCss } from "./mobile";
import { caseCss, headingSizeCss, stepScale } from "./wording";
import { isShader } from "./backdrop";
import { FRAGMENT_SHADERS } from "./shaders";
import { backdropFilter, backdropImage, backdropOpacity, duotoneSvg } from "./backdrop";

export const TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "info",
  "info-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

export type TokenName = (typeof TOKENS)[number];
export type Tokens = Record<TokenName, string>;

export type Theme = {
  config: Config;
  light: Tokens;
  dark: Tokens;
  /** The raw colours behind each mode, which the texture layer also needs. */
  colors: { light: ConfigColors; dark: ConfigColors };
};

/** Flip the colours you can see into a plausible set for the other mode. */
function invert(colors: ConfigColors, from: "light" | "dark"): ConfigColors {
  const toDark = from === "light";
  const background = withC(
    { ...colors.background, l: toDark ? 0.145 : 1 },
    Math.min(colors.background.c, 0.014),
  );
  const foreground = withC(
    { ...colors.foreground, l: toDark ? 0.985 : 0.145 },
    Math.min(colors.foreground.c, 0.012),
  );
  const lift = (c: Oklch) =>
    toDark
      ? withC(withL(c, Math.max(c.l, 0.62)), Math.max(c.c * 0.95, 0.02))
      : withC(withL(c, Math.min(c.l, 0.58)), c.c);
  return {
    background,
    foreground,
    primary: lift(colors.primary),
    accent: lift(colors.accent),
    destructive: lift(colors.destructive),
  };
}

/** The five chart slots, fanned out from the brand hue. */
function charts(primary: Oklch, spread: Config["chart"], dark: boolean): Oklch[] {
  const base = withC(primary, Math.max(primary.c, 0.09));
  const l = (i: number) => (dark ? 0.62 + i * 0.05 : 0.64 - i * 0.035);
  switch (spread) {
    case "Neutral":
      return [0, 1, 2, 3, 4].map((i) =>
        withC({ ...base, l: dark ? 0.45 + i * 0.11 : 0.78 - i * 0.12 }, 0.012),
      );
    case "Analogous":
      return [0, 1, 2, 3, 4].map((i) => withL(rotate(base, (i - 2) * 22), l(i)));
    case "Complement":
      return [0, 1, 2, 3, 4].map((i) =>
        withL(rotate(base, i % 2 === 0 ? i * 8 : 180 + i * 8), l(i)),
      );
    default:
      return [0, 1, 2, 3, 4].map((i) => withL(rotate(base, i * 64), l(i)));
  }
}

function buildTokens(colors: ConfigColors, config: Config): Tokens {
  const dark = isDark(colors.background);
  const bg = colors.background;
  const fg = colors.foreground;
  const subtle = config.surface === "Subtle";
  const glass = config.surface === "Glass";

  const step = (t: number) => mix(bg, fg, t);
  // Solid lifts cards off the page; Subtle keeps them flush and leans on borders.
  const card = subtle ? bg : dark ? step(0.045) : withL(bg, Math.min(1, bg.l + 0.012));
  const popover = subtle ? (dark ? step(0.06) : bg) : card;
  /* Glass is a translucent surface, not just a blur: backdrop-filter behind an
     opaque colour does nothing but cost a compositing layer. Popovers stay
     more opaque than cards, since they land over arbitrary content. */
  const depth = DEPTHS[config.glassDepth];
  const veil = (c: Oklch, a: number) =>
    glass ? formatOklch(c).replace(/\)$/, ` / ${a})`) : formatOklch(c);
  const muted = step(dark ? 0.09 : 0.055);
  /* The border axis replaces the surface-aware default only when it is asked
     to; "Auto" returns exactly the numbers that were hard-coded here. The
     tint is applied after, and preserves lightness, so the two axes do not
     interfere. */
  const border = tintBorder(
    step(borderStep(config.border, dark, subtle)),
    colors.primary,
    config.borderTint,
  );
  /* Secondary text, proportional first and then held to AA. The proportion
     is the design — 42% of the way from the ink toward the page — but a
     palette with a shorter range lands that proportion closer to the page
     and the text quietly stops being readable: Tomato Slate and Neon Slate
     both measured 3.81 against their own muted surface. Start where the
     design says, move only if it fails. */
  const mutedFg = ensureContrast(mix(fg, bg, dark ? 0.38 : 0.42), muted, 4.5);

  /* The three states shadcn leaves out.
     
     Every product needs them, and a system that ships only `destructive`
     makes each consumer invent the other three — which is how four products
     end up with four greens. They are derived rather than picked: another
     three colour wells in the sidebar would be three more things to get
     wrong, and what matters is that they sit in *this* palette rather than
     being borrowed off a generic ramp.
     
     Each takes the destructive's lightness, because that is the weight this
     theme has already chosen for "a state colour on this page". Only the
     hue changes — plus a chroma cap, because equal chroma does not read as
     equal intensity: amber at a red's saturation is painful, and blue can
     carry more than either. */
  const stateColour = (hue: number, cap: number, floor = 0): Oklch =>
    gamutFit({
      l: Math.max(colors.destructive.l, floor),
      c: Math.min(colors.destructive.c, cap),
      h: hue,
    });

  const success = stateColour(148, 0.16);
  /* Amber carries a lightness floor the other two do not need. At a red's
     lightness, hue 78 is olive — the colour is arithmetically correct and
     nobody reads it as a warning. Yellows have to sit lighter to be
     recognised as yellow at all, so the foreground flips to dark, which is
     what a warning chip looks like everywhere. */
  const warning = stateColour(78, 0.16, 0.82);
  const info = stateColour(248, 0.19);

  const accentSurface = mix(bg, colors.accent, dark ? 0.26 : 0.22);

  /* A focus ring is a non-text indicator, so 3:1 against what it sits on —
     WCAG 1.4.11. A brand colour close to the page's own lightness makes a
     ring that is technically there and practically invisible. */
  const ring = ensureContrast(withC(colors.primary, Math.max(colors.primary.c, 0.03)), bg, 3);
  const chart = charts(colors.primary, config.chart, dark);

  const t = (c: Oklch) => formatOklch(c);
  return {
    background: t(bg),
    foreground: t(fg),
    card: veil(card, dark ? depth.dark : depth.light),
    "card-foreground": t(fg),
    popover: veil(popover, Math.min((dark ? depth.dark : depth.light) + 0.25, 0.95)),
    "popover-foreground": t(fg),
    primary: t(colors.primary),
    "primary-foreground": t(readableOn(colors.primary)),
    secondary: t(muted),
    "secondary-foreground": t(fg),
    muted: t(muted),
    "muted-foreground": t(mutedFg),
    accent: t(accentSurface),
    "accent-foreground": t(readableOn(accentSurface)),
    destructive: t(colors.destructive),
    "destructive-foreground": t(readableOn(colors.destructive)),
    success: t(success),
    "success-foreground": t(readableOn(success)),
    warning: t(warning),
    "warning-foreground": t(readableOn(warning)),
    info: t(info),
    "info-foreground": t(readableOn(info)),
    border: t(border),
    /* --input exists to be the stronger of the two and has been a copy of
       --border all along. A control's boundary is what identifies it as a
       control, so it owes 3:1 under WCAG 1.4.11 — measured, every kit was
       between 1.29 and 1.56. The card's hairline stays decorative; the
       field's does not. */
    input: t(ensureContrast(border, bg, 3)),
    ring: t(ring),
    "chart-1": t(chart[0]),
    "chart-2": t(chart[1]),
    "chart-3": t(chart[2]),
    "chart-4": t(chart[3]),
    "chart-5": t(chart[4]),
    sidebar: t(step(dark ? 0.03 : 0.025)),
    "sidebar-foreground": t(fg),
    "sidebar-primary": t(colors.primary),
    "sidebar-primary-foreground": t(readableOn(colors.primary)),
    "sidebar-accent": t(accentSurface),
    "sidebar-accent-foreground": t(readableOn(accentSurface)),
    "sidebar-border": t(border),
    "sidebar-ring": t(ring),
  };
}

export function buildTheme(config: Config): Theme {
  /* Measure the colours rather than trusting `config.mode`. Flipping the mode
     toggle changes which side you are looking at, not the colours themselves,
     so the two disagree the moment you press it — and a screenshot can arrive
     with either. Deriving the side keeps the flip lossless both ways. */
  const side = isDark(config.colors.background) ? "dark" : "light";
  const other = invert(config.colors, side);
  const here = buildTokens(config.colors, config);
  const there = buildTokens(other, config);
  return side === "light"
    ? { config, light: here, dark: there, colors: { light: config.colors, dark: other } }
    : { config, light: there, dark: here, colors: { light: other, dark: config.colors } };
}

/** Each texture layer is four CSS values, so a layer exports as four lines.
 *  Page and card are independent: a grained page under clean cards is a
 *  different look from grain on both, and neither is reachable from one axis. */
function layerVars(
  theme: Theme,
  mode: "light" | "dark",
  layer: "page" | "card",
): Record<string, string> {
  const colors = theme.colors[mode];
  const c = theme.config;
  const inks = { ink: mix(colors.background, colors.foreground, 0.55), brand: colors.primary };
  const name = layer === "page" ? c.pageTexture : c.cardTexture;
  const strength = layer === "page" ? c.pageTextureStrength : c.cardTextureStrength;

  const base = textureCss(name, strength, inks, mode);
  /* The page can carry a grain on top of its colour field. Nearly every
     reference background is exactly that pair — a mesh or gradient with a
     tooth over it — and one slot can only ever give you half of it. */
  const t =
    layer === "page"
      ? stackTextures(textureCss(c.pageGrain, c.pageGrainStrength, inks, mode), base)
      : base;

  const p = layer === "page" ? "--texture" : "--card-texture";
  return {
    [`${p}-image`]: t.image,
    [`${p}-size`]: t.size,
    [`${p}-position`]: t.position,
    [`${p}-blend`]: t.blend,
  };
}

/** The Offset treatment's ink: 26% of the way from the colour toward the
 *  page, keeping 61% of its chroma, on the same hue. Measured off the
 *  reference rather than chosen — see the README. Hue is carried across
 *  rather than interpolated, because mix() takes the short way round the
 *  wheel and a neutral page still has h = 0. */
function offsetInk(colour: Oklch, background: Oklch): string {
  return formatOklch(
    gamutFit({
      l: colour.l + (background.l - colour.l) * 0.26,
      c: colour.c * 0.61,
      h: colour.h,
    }),
  );
}

/** Outline colours are the one part of a stroke treatment that is palette-
 *  dependent, so they vary with the mode the way the tokens do. */
function outlineVars(theme: Theme, mode: "light" | "dark"): Record<string, string> {
  const dark = mode === "dark";
  const colors = theme.colors[mode];
  const edge = mix(colors.background, colors.foreground, dark ? 0.42 : 0.28);
  const a = (c: typeof edge, alpha: number) => formatOklch(c).replace(/\)$/, ` / ${alpha})`);
  return {
    // A lit edge is a light source, so it is white in both modes — just quieter
    // in light, where there is less contrast to spend.
    "--outline-lit": dark ? "oklch(1 0 0 / 0.11)" : "oklch(1 0 0 / 0.75)",
    "--outline-shade": dark ? "oklch(0 0 0 / 0.35)" : "oklch(0 0 0 / 0.05)",
    "--outline-top": a(edge, dark ? 0.85 : 0.95),
    "--outline-bottom": a(edge, dark ? 0.08 : 0.12),
    "--outline-arm": "14px",
    /* Offset's one ink, used for both the stroke and the drop. It is pulled
       off the brand hue rather than the neutral border, because a stamp in
       the border grey is only Mira's shadow again — the reference look is a
       chromatic line, and a Neutral theme still lands on a grey one.

       The three numbers are measured off the reference rather than guessed:
       its stroke sits 26% of the way from the brand toward the page and
       keeps 61% of the brand's chroma, on the same hue to within a fifth of
       a degree. Hue is carried across rather than interpolated — mix() takes
       the short way round the wheel, and a neutral page still has h = 0, so
       mixing a blue brand with a grey page lands in violet. */
    "--outline-ink": offsetInk(colors.primary, colors.background),
    /* A destructive button stamped in the brand colour is the brand
       endorsing the delete. The stamp belongs to whatever it is stamping, so
       the same derivation runs again on destructive and the button picks the
       one that matches its fill. */
    "--outline-ink-destructive": offsetInk(colors.destructive, colors.background),
    /* Three times the stroke, so the drop grows with the shape language
       instead of being a fixed number that only suits one style. The fallback
       carries this style's own width, because the export does not emit
       --border-width — without it a 2px style would paste as a 3px drop. */
    "--outline-drop": `calc(var(--border-width, ${STYLES[theme.config.style].borderWidth}px) * 3)`,
    "--ring-soft": a(colors.primary, dark ? 0.3 : 0.22),
    "--outline-mark": formatOklch(mix(colors.background, colors.foreground, dark ? 0.58 : 0.45)),
  };
}

/** The shadow ladder, tinted by the surface it falls on. */
function elevation(theme: Theme, mode: "light" | "dark"): Record<string, string> {
  const vars = elevationVars(
    theme.config.elevation,
    theme.colors[mode].background,
    mode === "dark",
  );
  // The style's own card and button shadows defer to the ladder when set.
  if (Object.keys(vars).length) {
    vars["--shadow-card"] = vars["--elevation-1"];
    vars["--shadow-button"] = vars["--elevation-0"];
  }
  return vars;
}

function backdropVars(theme: Theme): Record<string, string> {
  const c = theme.config;
  return {
    "--backdrop-image": backdropImage(c.backdrop, c.backdropUrl),
    "--backdrop-filter": backdropFilter(c.backdropTreatment),
    "--backdrop-opacity": String(backdropOpacity(c.backdropFade)),
  };
}

const textureVars = (theme: Theme, mode: "light" | "dark") => ({
  ...layerVars(theme, mode, "page"),
  ...layerVars(theme, mode, "card"),
});

/** The fragment shader behind a shader backdrop. Not CSS, and never will be —
 *  so Get Code hands it over as its own step, with the mount it needs. */
export function toBackdropShader(theme: Theme): string | null {
  const name = theme.config.backdrop;
  if (!isShader(name)) return null;
  return `// ${name} — the fragment shader. Mount it on a full-screen canvas
// behind your content, with the three palette colours as uniforms in
// LINEAR space (sRGB values straight from CSS will read washed out).

${FRAGMENT_SHADERS[name]}`;
}

/** The duotone filter markup, which has to live in the document, not the CSS.
 *  Shadow is the page, highlight the brand — so it is your own two inks. */
export function toBackdropSvg(theme: Theme, mode: "light" | "dark"): string | null {
  if (theme.config.backdrop === "None" || theme.config.backdropTreatment !== "Duotone") {
    return null;
  }
  const colors = theme.colors[mode];
  return duotoneSvg(colors.background, colors.primary);
}

/** Shape variables, which are the same in both modes. */
function styleVars(config: Config): Record<string, string> {
  const s = STYLES[config.style];
  return {
    "--radius": `${effectiveRadius(config)}rem`,
    "--spacing": `${s.spacing}rem`,
    "--border-width": `${s.borderWidth}px`,
    "--shadow-card": s.shadowCard,
    "--shadow-button": s.shadowButton,
    "--tracking-heading": s.tracking,
    "--weight-heading": String(HEADING_WEIGHTS[config.headingWeight] ?? s.headingWeight),
    "--font-sans": fontStack(config.fontSans),
    "--font-heading": fontStack(config.fontHeading),
    "--font-mono": MONO_STACKS[config.fontMono],
    ...typeVars(config.typeScale, (step) =>
      stepScale(step, {
        heading: config.headingSize,
        label: config.labelSize,
        body: config.bodySize,
      }),
    ),
    // Glass needs something behind it to blur; over a flat page it just reads
    // as a lighter card, which is why it pairs with Mesh or a page texture.
    "--surface-blur": config.surface === "Glass" ? `${DEPTHS[config.glassDepth].blur}px` : "0px",
    "--surface-saturate":
      config.surface === "Glass" ? String(DEPTHS[config.glassDepth].saturate) : "1",
    "--tilt-range": `${TILT_RANGE[config.tilt]}deg`,
    "--motion-duration": `${MOTION[config.motion].duration}ms`,
    "--motion-ease": MOTION[config.motion].ease,
  };
}

export function themeVars(theme: Theme, mode: "light" | "dark"): React.CSSProperties {
  const vars: Record<string, string> = {
    colorScheme: mode,
    ...styleVars(theme.config),
    ...textureVars(theme, mode),
    ...backdropVars(theme),
    ...outlineVars(theme, mode),
    ...elevation(theme, mode),
  };
  for (const name of TOKENS) vars[`--${name}`] = theme[mode][name];
  return vars as React.CSSProperties;
}

const block = (tokens: Tokens, indent = "  ") =>
  TOKENS.map((n) => `${indent}--${n}: ${tokens[n]};`).join("\n");

/** The CSS you paste into a real shadcn/ui project's globals.css. */
const varLines = (vars: Record<string, string>, indent = "  ") =>
  Object.entries(vars)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");

/* Each effect is a small, self-contained rule, emitted only when it is on, so
   a plain theme exports exactly what it did before any of this existed. */

const PAGE_RULE = `body {
  background-color: var(--background);
  background-image: var(--texture-image);
  background-size: var(--texture-size);
  background-position: var(--texture-position);
  background-blend-mode: var(--texture-blend);
}`;

const BACKDROP_RULE = `body {
  position: relative;
  isolation: isolate;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image: var(--backdrop-image);
  background-size: cover;
  background-position: center;
  filter: var(--backdrop-filter);
  opacity: var(--backdrop-opacity);
  pointer-events: none;
}`;

const CARD_SELECTOR = '[data-slot="card"], [data-slot="alert"], [data-slot="item-group"]';

const CARD_RULE = `${CARD_SELECTOR} {
  background-image: var(--card-texture-image);
  background-size: var(--card-texture-size);
  background-position: var(--card-texture-position);
  background-blend-mode: var(--card-texture-blend);
}`;

const GLASS_RULE = `${CARD_SELECTOR}, [data-slot="popover-content"], [data-slot="sheet-content"] {
  backdrop-filter: blur(var(--surface-blur)) saturate(var(--surface-saturate));
  -webkit-backdrop-filter: blur(var(--surface-blur)) saturate(var(--surface-saturate));
}`;

const tiltRule = () => `${CARD_SELECTOR} {
  transform: rotate(calc(var(--tilt-seed, 0) * var(--tilt-range)));
}

@media (prefers-reduced-motion: reduce) {
  ${CARD_SELECTOR} { transform: none; }
}

${tiltSeedRules('[data-slot="card"]')}`;

export function toCss(theme: Theme): string {
  const s = STYLES[theme.config.style];
  const c = theme.config;
  const page = c.pageTexture !== "None" || c.pageGrain !== "None";
  const card = c.cardTexture !== "None";
  const glass = c.surface === "Glass";
  const tilt = c.tilt !== "None";
  // A shader paints into a canvas, so the CSS image layer is not part of its export.
  const backdrop = c.backdrop !== "None" && !isShader(c.backdrop);
  const motion = c.motion !== "Smooth";
  /* The type scale has never been part of the export, which did not show
     while it was one axis you could re-pick by hand. The size axes live
     entirely in these variables, so now it has to travel. */
  const typed =
    c.typeScale !== "Default" ||
    c.headingSize !== "Default" ||
    c.labelSize !== "Default" ||
    c.bodySize !== "Default";
  const typeLines = typed
    ? varLines(
        typeVars(c.typeScale, (step) =>
          stepScale(step, { heading: c.headingSize, label: c.labelSize, body: c.bodySize }),
        ),
      ) + "\n"
    : "";
  const outline = c.outline !== "Default";
  const btnOutline = c.buttonOutline !== "Default";
  const inks = outline || btnOutline;

  const extras = [
    backdrop ? BACKDROP_RULE : "",
    page ? PAGE_RULE : "",
    card ? CARD_RULE : "",
    glass ? GLASS_RULE : "",
    tilt ? tiltRule() : "",
    motion ? MOTION_RULE : "",
    outline ? outlineCss(c.outline) : "",
    btnOutline ? buttonOutlineCss(c.buttonOutline) : "",
    caseCss({ heading: c.headingCase, label: c.labelCase, body: c.bodyCase }),
    headingSizeCss(c.headingSize),
    mobileCss(),
  ].filter(Boolean);

  const layered = (mode: "light" | "dark") => {
    const vars: Record<string, string> = {};
    if (page) Object.assign(vars, layerVars(theme, mode, "page"));
    if (card) Object.assign(vars, layerVars(theme, mode, "card"));
    if (backdrop) Object.assign(vars, backdropVars(theme));
    if (inks) Object.assign(vars, outlineVars(theme, mode));
    return Object.keys(vars).length ? varLines(vars) + "\n" : "";
  };

  return `:root {
  color-scheme: light;
  --radius: ${effectiveRadius(c)}rem;
  --spacing: ${s.spacing}rem;
  --font-sans: ${fontStack(c.fontSans)};
  --font-heading: ${fontStack(c.fontHeading)};
  --font-mono: ${MONO_STACKS[c.fontMono]};
${glass ? `  --surface-blur: ${DEPTHS[c.glassDepth].blur}px;\n  --surface-saturate: ${DEPTHS[c.glassDepth].saturate};\n` : ""}${tilt ? `  --tilt-range: ${TILT_RANGE[c.tilt]}deg;\n` : ""}${motion ? `  --motion-duration: ${MOTION[c.motion].duration}ms;\n  --motion-ease: ${MOTION[c.motion].ease};\n` : ""}${typeLines}${layered("light")}${block(theme.light)}
}

.dark {
  color-scheme: dark;
${layered("dark")}${block(theme.dark)}
}${extras.length ? `\n\n${extras.join("\n\n")}` : ""}`;
}
