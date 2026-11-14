import type { Kit } from "./types";

export type { Kit } from "./types";

/* Every file in this folder is a kit, so saving one from the remixer is a file
   write and nothing else — no array to edit, no import to remember. Eager,
   because the picker needs all of them on first paint. */
const modules = import.meta.glob<{ default: Kit }>("./*.ts", { eager: true });

export const KITS: Kit[] = Object.entries(modules)
  .filter(([path]) => !/\/(index|types|build)\.ts$/.test(path))
  .map(([, m]) => m.default)
  .filter((k): k is Kit => Boolean(k?.id))
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.name.localeCompare(b.name));

/** The kit this project starts on: the remixer's initial state, what Reset
 *  returns to, and the first sheet the viewer shows.
 *
 *  Named rather than "whichever sorts first", so reordering the pickers
 *  cannot quietly move the house style — and so there is one place to change
 *  when it does move. */
export const HOUSE_KIT_ID = "green-3";

export const DEFAULT_KIT = KITS.some((k) => k.id === HOUSE_KIT_ID)
  ? HOUSE_KIT_ID
  : (KITS[0]?.id ?? "plain");

export const kitById = (id: string) => KITS.find((k) => k.id === id) ?? KITS[0];

/** The house kit's config, for the remixer's starting state and Reset. */
export const houseConfig = () => kitById(DEFAULT_KIT).config;
