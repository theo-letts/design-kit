import { hexToOklch, readableOn } from "./color";
import type { Config } from "./config";

/* Palettes you have collected, kept as the hexes they were picked as.

   A palette is five colours. The theme has five colour slots. It is tempting
   to map them one to one, and it is wrong: background and foreground are not
   free choices, they are a contrast pair, and a palette that happens to
   contain no light neutral cannot supply a page colour without inventing one.

   The accent slot is not a second brand colour, whatever its name suggests:
   theme.ts mixes it 22% into the background to make the hover and selected
   surfaces. A fluorescent put there comes back as a pale tint. So the colour a
   palette is known for belongs on primary, and accent gets whatever should
   quietly warm the surfaces.

   So a palette fills only the slots it genuinely has. Where it has no neutral
   pair, background and foreground are left alone and the palette lands on
   primary, accent and destructive — which is the part you actually came for.
   Nothing here is derived or guessed: every value below is a hex off one of
   the swatches. */

export type Slot = keyof Config["colors"];

export type Palette = {
  id: string;
  name: string;
  /** Every colour in the palette, named as picked, in the order picked. */
  swatches: readonly { name: string; hex: string }[];
  /** Only the slots this palette can fill honestly. */
  colors: Partial<Record<Slot, string>>;
  /** Set when the palette's own ground is dark. */
  mode?: Config["mode"];
  note: string;
};

export const PALETTES = [
  {
    id: "tomato-slate",
    name: "Tomato Slate",
    swatches: [
      { name: "Pale Slate", hex: "#D0CCD0" },
      { name: "Tomato", hex: "#FE654F" },
      { name: "Smoky Rose", hex: "#7D6167" },
      { name: "Lime Yellow", hex: "#C7EF00" },
      { name: "Ink Black", hex: "#11151C" },
    ],
    colors: {
      background: "#D0CCD0",
      foreground: "#11151C",
      primary: "#C7EF00",
      accent: "#7D6167",
      destructive: "#FE654F",
    },
    note: "Warm grey stock, lime brand, tomato for danger and rose in the hovers.",
  },
  {
    id: "neon-slate",
    name: "Neon Slate",
    swatches: [
      { name: "Pale Slate", hex: "#D0CCD0" },
      { name: "Strong Cyan", hex: "#00C2D1" },
      { name: "Shocking Pink", hex: "#ED33B9" },
      { name: "Lime Yellow", hex: "#C7EF00" },
      { name: "Ink Black", hex: "#11151C" },
    ],
    colors: {
      background: "#D0CCD0",
      foreground: "#11151C",
      primary: "#00C2D1",
      accent: "#C7EF00",
      destructive: "#ED33B9",
    },
    note: "Three fluorescents on grey. The pink is loud enough to carry danger.",
  },
  {
    id: "cherry-fern",
    name: "Cherry Fern",
    swatches: [
      { name: "Cherry Blossom", hex: "#EDAFB8" },
      { name: "Fern", hex: "#3A7D44" },
      { name: "Vanilla Custard", hex: "#F5E7B2" },
      { name: "Black", hex: "#000000" },
      { name: "Glaucous", hex: "#7776BC" },
    ],
    colors: {
      background: "#F5E7B2",
      foreground: "#000000",
      primary: "#3A7D44",
      accent: "#7776BC",
      destructive: "#EDAFB8",
    },
    note: "Custard ground, fern primary. No red in the set, so destructive is soft.",
  },
  {
    id: "brown-red",
    name: "Brown Red",
    swatches: [
      { name: "Brown Red", hex: "#A22C29" },
      { name: "Floral White", hex: "#FEFCF4" },
      { name: "Vanilla Custard", hex: "#F5E7B2" },
      { name: "Black", hex: "#000000" },
      { name: "Coral Glow", hex: "#F4845F" },
    ],
    colors: {
      background: "#FEFCF4",
      foreground: "#000000",
      primary: "#A22C29",
      accent: "#F5E7B2",
      destructive: "#F4845F",
    },
    note: "Off-white paper, oxblood primary, custard and coral behind it.",
  },
  {
    id: "chestnut",
    name: "Chestnut",
    swatches: [
      { name: "Brown Red", hex: "#A22C29" },
      { name: "Floral White", hex: "#FEFCF4" },
      { name: "Vanilla Custard", hex: "#F5E7B2" },
      { name: "Black", hex: "#000000" },
      { name: "Chestnut", hex: "#902923" },
    ],
    colors: {
      background: "#FEFCF4",
      foreground: "#000000",
      primary: "#A22C29",
      accent: "#F5E7B2",
      destructive: "#902923",
    },
    note: "The same ground with two reds instead of one — quieter, more serious.",
  },
  {
    id: "forest-signal",
    name: "Forest Signal",
    swatches: [
      { name: "Forest Green", hex: "#0E943B" },
      { name: "Ocean Twilight", hex: "#2047B7" },
      { name: "Fiery Terracotta", hex: "#F35135" },
      { name: "Bubblegum Fizz", hex: "#FA6AD2" },
      { name: "Atomic Tangerine", hex: "#F6783E" },
    ],
    colors: { primary: "#0E943B", accent: "#FA6AD2", destructive: "#F35135" },
    note: "Five saturated colours and no neutral, so it keeps the page you have.",
  },
  {
    id: "electric-flag",
    name: "Electric Flag",
    swatches: [
      { name: "Navy Electric", hex: "#390099" },
      { name: "Flag Red", hex: "#DB162F" },
      { name: "Amber Gold", hex: "#FFBD00" },
      { name: "Emerald", hex: "#06D6A0" },
      { name: "Cherry Blossom", hex: "#FCB0B3" },
    ],
    colors: { primary: "#390099", accent: "#FFBD00", destructive: "#DB162F" },
    note: "Deep violet against gold, with a red that is unmistakably a warning.",
  },
  {
    id: "blazing-black",
    name: "Blazing Black",
    swatches: [
      { name: "Black", hex: "#06070E" },
      { name: "Blazing Flame", hex: "#F34213" },
      { name: "Fuchsia Plum", hex: "#CB429F" },
      { name: "Tuscan Sun", hex: "#F3CA40" },
      { name: "Cornflower Ocean", hex: "#0E6BA8" },
    ],
    /* The only near-black here is the ground, so this one runs dark. It has no
       light neutral for the type, so the ink is derived from the ground — see
       applyPalette below, which is the only place anything is invented. */
    mode: "dark",
    colors: {
      background: "#06070E",
      primary: "#F34213",
      accent: "#F3CA40",
      destructive: "#CB429F",
    },
    note: "Near-black ground with flame, sun and ocean on top. Runs dark.",
  },
  {
    id: "coral-sea",
    name: "Coral Sea",
    swatches: [
      { name: "Vibrant Coral", hex: "#FF785A" },
      { name: "Carbon Black", hex: "#191919" },
      { name: "Bone", hex: "#E0DDCF" },
      { name: "Sea Green", hex: "#5B8C5A" },
      { name: "Parchment", hex: "#F1F0EA" },
    ],
    /* Coral is the colour this palette is known for, and it still goes to
       destructive rather than primary. An orange-red is read as a warning
       before it is read as a brand, and the palette has a second chromatic
       colour that is not — so green leads and coral warns, the same way
       Tomato Slate puts its lime in front and its tomato behind. */
    colors: {
      background: "#F1F0EA",
      foreground: "#191919",
      primary: "#5B8C5A",
      accent: "#E0DDCF",
      destructive: "#FF785A",
    },
    note: "Parchment and carbon, a sea-green brand, coral for the warnings.",
  },
  {
    id: "gunmetal-bone",
    name: "Gunmetal Bone",
    swatches: [
      { name: "Gunmetal", hex: "#474448" },
      { name: "Shadow Grey", hex: "#2D232E" },
      { name: "Bone", hex: "#E0DDCF" },
      { name: "Taupe Grey", hex: "#534B52" },
      { name: "Parchment", hex: "#F1F0EA" },
    ],
    /* Five neutrals and not one chromatic colour, so destructive is the one
       slot this palette cannot fill: it keeps whatever red you already had.
       Gunmetal and Taupe Grey are within a hair of each other in lightness —
       a primary and its second, with only one slot to put them in. */
    colors: {
      background: "#F1F0EA",
      foreground: "#2D232E",
      primary: "#474448",
      accent: "#E0DDCF",
    },
    note: "Warm greys on parchment. No colour at all, so the red stays yours.",
  },
] as const satisfies readonly Palette[];

/** Literal ids, so a kit cannot name a palette that does not exist. */
export type PaletteId = (typeof PALETTES)[number]["id"];

export const PALETTE_NAMES = PALETTES.map((p) => p.name);

export function paletteById(id: PaletteId): Palette {
  return PALETTES.find((p) => p.id === id) as Palette;
}

/** Fold a palette onto a config. Slots the palette does not supply are left as
 *  they are, so picking one is additive rather than a reset. */
export function applyPalette(config: Config, palette: Palette): Config {
  const colors = { ...config.colors };
  for (const [slot, hex] of Object.entries(palette.colors) as [Slot, string][]) {
    colors[slot] = hexToOklch(hex);
  }

  /* A palette that brings its own ground must bring its own ink. buildTheme
     works out which mode the configured colours describe by measuring the
     background, so a dark ground left beside the previous light foreground is
     read as one coherent dark side — and you get near-black type on near-black
     paper. readableOn picks the ink, tinted by the ground's own hue, which is
     the one invention here and a necessary one: Blazing Black has no light
     neutral to offer. */
  if (palette.colors.background && !palette.colors.foreground) {
    colors.foreground = readableOn(colors.background);
  }

  return { ...config, mode: palette.mode ?? config.mode, colors };
}
