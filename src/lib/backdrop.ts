import { gamutFit, oklchToRgb, type Oklch } from "./color";
import { SHADER_NAMES, type ShaderName } from "./shaders";

/* An image behind the components, with a treatment driven by the theme.
   Procedural textures can't do this: Duotone maps an image's *luminance* onto
   two of your own inks, so it needs something photographic to work on.

   The named sources are generated SVG, not shipped files — so they work
   offline and, unlike a pasted URL, they survive a preset code as an index. */

export const BACKDROP_NAMES = ["None", "Clouds", "Ridges", "Custom", ...SHADER_NAMES] as const;
export type BackdropName = (typeof BACKDROP_NAMES)[number];

/** Shaders paint into a canvas, so the CSS image layer stands down for them. */
export function isShader(name: BackdropName): name is ShaderName {
  return (SHADER_NAMES as readonly string[]).includes(name);
}

export const TREATMENT_NAMES = ["Plain", "Mono", "Duotone"] as const;
export type TreatmentName = (typeof TREATMENT_NAMES)[number];

export const FADE_NAMES = ["Light", "Medium", "Strong"] as const;
export type FadeName = (typeof FADE_NAMES)[number];

/** How much of the backdrop survives under the UI. */
const FADE: Record<FadeName, number> = { Light: 0.14, Medium: 0.32, Strong: 0.6 };

/** The id the filter is published under; one filter, re-rendered per theme. */
export const DUOTONE_ID = "dk-duotone";

const field = (body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>${body}</svg>`,
  )}")`;

/* One big turbulence rasterised per theme change, not per frame. Expensive to
   generate, free to scroll — which is the right way round for a backdrop. */
/** The generated image sources. Shaders are not in here; they have no URL. */
const SOURCES: Record<"Clouds" | "Ridges", string> = {
  Clouds: field(
    `<filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='6' seed='7'/>` +
      `<feColorMatrix type='saturate' values='0'/></filter>` +
      `<rect width='100%' height='100%' filter='url(#f)'/>`,
  ),
  Ridges: field(
    `<filter id='f'><feTurbulence type='turbulence' baseFrequency='0.004 0.022' numOctaves='4' seed='3'/>` +
      `<feColorMatrix type='saturate' values='0'/></filter>` +
      `<rect width='100%' height='100%' filter='url(#f)'/>`,
  ),
};

export function backdropImage(name: BackdropName, custom: string | null): string {
  if (name === "None" || isShader(name)) return "none";
  if (name === "Custom") return custom ? `url("${custom.replace(/"/g, '\\"')}")` : "none";
  return SOURCES[name as "Clouds" | "Ridges"];
}

export function backdropFilter(treatment: TreatmentName): string {
  switch (treatment) {
    case "Duotone":
      return `url(#${DUOTONE_ID})`;
    case "Mono":
      return "grayscale(1) contrast(1.05)";
    default:
      return "none";
  }
}

export const backdropOpacity = (fade: FadeName) => FADE[fade];

const chan = (v: number) => (v / 255).toFixed(4);

/** feComponentTransfer tables mapping luminance 0..1 onto shadow..highlight. */
export function duotoneTables(shadow: Oklch, highlight: Oklch) {
  const s = oklchToRgb(gamutFit(shadow));
  const h = oklchToRgb(gamutFit(highlight));
  return {
    r: `${chan(s.r)} ${chan(h.r)}`,
    g: `${chan(s.g)} ${chan(h.g)}`,
    b: `${chan(s.b)} ${chan(h.b)}`,
  };
}

/** The filter markup. Lives in the DOM here, and in the export's HTML snippet. */
export function duotoneSvg(shadow: Oklch, highlight: Oklch): string {
  const t = duotoneTables(shadow, highlight);
  const lum = "0.2126 0.7152 0.0722 0 0 ";
  return `<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
  <filter id="${DUOTONE_ID}" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values="${lum}${lum}${lum}0 0 0 1 0" />
    <feComponentTransfer>
      <feFuncR type="table" tableValues="${t.r}" />
      <feFuncG type="table" tableValues="${t.g}" />
      <feFuncB type="table" tableValues="${t.b}" />
    </feComponentTransfer>
  </filter>
</svg>`;
}
