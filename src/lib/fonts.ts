/** The type library, shared by the sidebar's pickers, the vision endpoint's schema
 *  and the code export. Grouped by what the face *does*, because picking type by an
 *  alphabetical list of 41 names is picking blind.
 *
 *  `q` is the family's own `css2` query fragment. It has to be per-family: asking
 *  Google for a weight a family doesn't cut fails the whole request, not just that
 *  family, so these are verified against the API rather than assumed. */

export type FontSpec = {
  name: string;
  /** The family's own `css2` query fragment, for faces that come from the CDN. */
  q?: string;
  /** The @font-face block, for faces this project ships itself. */
  face?: string;
};
/** What the face falls back to while the CDN is still fetching it. A serif that
 *  waits behind `sans-serif` reflows into something with the wrong colour. */
export type FontKind = "sans" | "serif" | "mono";

export const FONT_GROUPS = [
  {
    label: "Interface",
    kind: "sans",
    fonts: [
      { name: "Inter", q: "Inter:wght@400;500;600;700" },
      { name: "Geist", q: "Geist:wght@400;500;600;700" },
      { name: "DM Sans", q: "DM+Sans:wght@400;500;600;700" },
      { name: "Manrope", q: "Manrope:wght@400;500;600;700" },
      { name: "Plus Jakarta Sans", q: "Plus+Jakarta+Sans:wght@400;500;600;700" },
      { name: "Figtree", q: "Figtree:wght@400;500;600;700" },
      { name: "Public Sans", q: "Public+Sans:wght@400;500;600;700" },
    ],
  },
  {
    label: "Grotesque",
    kind: "sans",
    fonts: [
      { name: "Space Grotesk", q: "Space+Grotesk:wght@400;500;600;700" },
      { name: "Bricolage Grotesque", q: "Bricolage+Grotesque:wght@400;500;600;700" },
      { name: "Schibsted Grotesk", q: "Schibsted+Grotesk:wght@400;500;600;700" },
      { name: "Archivo", q: "Archivo:wght@400;500;600;700" },
      { name: "Outfit", q: "Outfit:wght@400;500;600;700" },
      { name: "Syne", q: "Syne:wght@400;500;600;700" },
    ],
  },
  {
    label: "Humanist",
    kind: "sans",
    fonts: [
      { name: "Work Sans", q: "Work+Sans:wght@400;500;600;700" },
      { name: "Karla", q: "Karla:wght@400;500;600;700" },
      { name: "Epilogue", q: "Epilogue:wght@400;500;600;700" },
      { name: "Sora", q: "Sora:wght@400;500;600;700" },
    ],
  },
  {
    label: "Serif",
    kind: "serif",
    fonts: [
      { name: "Source Serif 4", q: "Source+Serif+4:wght@400;500;600;700" },
      { name: "Newsreader", q: "Newsreader:wght@400;500;600;700" },
      { name: "Lora", q: "Lora:wght@400;500;600;700" },
      { name: "Crimson Pro", q: "Crimson+Pro:wght@400;500;600;700" },
      { name: "EB Garamond", q: "EB+Garamond:wght@400;500;600;700" },
      { name: "Spectral", q: "Spectral:wght@400;500;600;700" },
    ],
  },
  {
    label: "Display",
    kind: "serif",
    fonts: [
      { name: "Playfair Display", q: "Playfair+Display:wght@400;500;600;700" },
      { name: "Instrument Serif", q: "Instrument+Serif" },
      { name: "Fraunces", q: "Fraunces:wght@400;500;600;700" },
      { name: "Bodoni Moda", q: "Bodoni+Moda:wght@400;500;600;700" },
      { name: "DM Serif Display", q: "DM+Serif+Display" },
      {
        /* Vercel's display serif, shipped here rather than fetched: it is not
           on Google Fonts, only in the `geist` npm package, under the OFL.
           The variable file is the one to carry — its axis is not weight but
           ELSH, which swaps the shape of every dot in the face (round,
           square, triangle, heart). The default is round. */
        name: "Geist Serif",
        face: `@font-face {
  font-family: "Geist Serif";
  src: url("/fonts/GeistSerifVF.woff2") format("woff2-variations");
  font-weight: 400;
  font-display: swap;
}`,
      },
    ],
  },
  {
    label: "Condensed",
    kind: "sans",
    fonts: [
      { name: "Oswald", q: "Oswald:wght@400;500;600;700" },
      { name: "Archivo Narrow", q: "Archivo+Narrow:wght@400;500;600;700" },
      { name: "Anton", q: "Anton" },
    ],
  },
  {
    label: "The Sunday Paper",
    kind: "serif",
    fonts: [
      {
        name: "Sunday Masthead",
        face: `@font-face {
  font-family: "Sunday Masthead";
  src: url("/fonts/SundayMasthead-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}`,
      },
      {
        name: "Sunday Protest Marker",
        face: `@font-face {
  font-family: "Sunday Protest Marker";
  src: url("/fonts/SundayProtestMarker-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}`,
      },
      {
        name: "Sunday TB Hand",
        face: `@font-face {
  font-family: "Sunday TB Hand";
  src: url("/fonts/SundayTBHand-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}`,
      },
      {
        name: "Sunday AC Hand",
        face: `@font-face {
  font-family: "Sunday AC Hand";
  src: url("/fonts/SundayACHand-Thin.woff2") format("woff2");
  font-weight: 100;
  font-display: swap;
}`,
      },
      {
        name: "Sunday Collaborative",
        face: `@font-face {
  font-family: "Sunday Collaborative";
  src: url("/fonts/SundayCollaborativeAlphabetVF.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}`,
      },
    ],
  },
  {
    label: "Monospace",
    kind: "mono",
    fonts: [
      /* Shipped, and in this list as well as the mono slot: a mono body face is
         a real choice, not only a code font. */
      {
        name: "Paper Mono",
        face: `@font-face {
  font-family: "Paper Mono";
  src: url("/fonts/PaperMono-Variable.woff2") format("woff2");
  font-weight: 100 800;
  font-style: normal;
  font-display: swap;
}`,
      },
      { name: "JetBrains Mono", q: "JetBrains+Mono:wght@400;500;600;700" },
      { name: "IBM Plex Mono", q: "IBM+Plex+Mono:wght@400;500;600;700" },
      { name: "Space Mono", q: "Space+Mono:wght@400;700" },
    ],
  },
] as const satisfies readonly { label: string; kind: FontKind; fonts: readonly FontSpec[] }[];

export type FontName = (typeof FONT_GROUPS)[number]["fonts"][number]["name"];

export const FONT_SPECS: readonly FontSpec[] = FONT_GROUPS.flatMap((g) => [...g.fonts]);

/** A tuple, because the vision endpoint's schema is an enum over exactly these. */
export const FONTS = FONT_SPECS.map((f) => f.name) as unknown as readonly [FontName, ...FontName[]];

const GENERIC: Record<FontKind, string> = {
  sans: "ui-sans-serif, system-ui, sans-serif",
  serif: "ui-serif, Georgia, serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const KIND = new Map<string, FontKind>(
  FONT_GROUPS.flatMap((g) => g.fonts.map((f) => [f.name, g.kind as FontKind] as const)),
);

/** The full stack for a family — the name, then what it should wait behind. */
export const fontStack = (name: string) => `"${name}", ${GENERIC[KIND.get(name) ?? "sans"]}`;

/** Mono has its own slot: these set `--font-mono`, not the body face. */
export const MONO_FONTS = [
  "Paper Mono",
  "JetBrains Mono",
  "IBM Plex Mono",
  "Space Mono",
  "System",
] as const;
export type MonoFontName = (typeof MONO_FONTS)[number];

export const MONO_STACKS: Record<MonoFontName, string> = {
  "Paper Mono": '"Paper Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  "JetBrains Mono": '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  "IBM Plex Mono": '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  "Space Mono": '"Space Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  System: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

/** Self-hosted faces need their @font-face shipped; CDN ones do not. */
/** Faces this project ships rather than fetching. Mono lives here too, since the
 *  mono slot is picked from its own list and never appears in FONT_SPECS. */
export const SELF_HOSTED: Partial<Record<MonoFontName, string>> = {
  "Paper Mono": `@font-face {
  font-family: "Paper Mono";
  src: url("/fonts/PaperMono-Variable.woff2") format("woff2");
  font-weight: 100 800;
  font-style: normal;
  font-display: swap;
}`,
};

const BY_NAME = new Map(FONT_SPECS.map((f) => [f.name, f.q]));
const FACE_BY_NAME = new Map(
  FONT_SPECS.filter((f) => f.face).map((f) => [f.name, f.face as string]),
);

/** The Google Fonts URL for a set of families, or null if none of them is a CDN face. */
export function fontUrl(names: (string | undefined)[]): string | null {
  const qs = [...new Set(names.filter(Boolean) as string[])]
    .map((n) => BY_NAME.get(n))
    .filter(Boolean) as string[];
  if (!qs.length) return null;
  return `https://fonts.googleapis.com/css2?${qs.map((q) => `family=${q}`).join("&")}&display=swap`;
}

/** The whole library in one request — what the font menu needs so each name can be
 *  shown in its own face. Fetched when a picker first opens, not at startup. */
export const ALL_FONTS_URL = fontUrl(FONT_SPECS.map((f) => f.name))!;

/** Add a stylesheet once per URL. Returns nothing: the browser handles the rest. */
export function loadFontCss(url: string | null, id: string) {
  if (!url || typeof document === "undefined") return;
  const existing = document.getElementById(id) as HTMLLinkElement | null;
  if (existing?.href === url) return;
  const link = existing ?? document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
  if (!existing) document.head.appendChild(link);
}

/** The @font-face blocks for whichever of these families this project ships.
 *  Used both to install them at startup and to hand them over in the export —
 *  one source, so a kit cannot export a face the app renders differently. */
export function selfHostedCss(names: (string | undefined)[]): string {
  const blocks = [...new Set(names.filter(Boolean) as string[])]
    .map((n) => FACE_BY_NAME.get(n) ?? SELF_HOSTED[n as MonoFontName])
    .filter(Boolean) as string[];
  return blocks.join("\n\n");
}

/** Declare every shipped face once. @font-face does not fetch anything until a
 *  family is actually used, so declaring all of them up front costs nothing. */
export function installSelfHostedFaces() {
  if (typeof document === "undefined" || document.getElementById("dk-self-hosted")) return;
  const css = selfHostedCss([...FACE_BY_NAME.keys(), ...Object.keys(SELF_HOSTED)]);
  if (!css) return;
  const style = document.createElement("style");
  style.id = "dk-self-hosted";
  style.textContent = css;
  document.head.appendChild(style);
}

/** The markup a project needs so the exported CSS has faces to point at. Without
 *  this the theme is right and the type is whatever the OS had lying around. */
export function fontLinkTags(names: (string | undefined)[]): string | null {
  const url = fontUrl(names);
  if (!url) return null;
  return `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${url}" rel="stylesheet" />`;
}
