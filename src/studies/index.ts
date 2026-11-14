import type { Study, StudyEntry } from "./types";

export type { Study, StudyEntry } from "./types";

/* Every .tsx in this folder is a study, globbed the same way kits are: adding
   one is writing a file, with no array to edit.

   It is globbed twice. Once for the module, and once as raw text, because the
   point of the section is to hand you the code — and the only code that can
   never be out of date with what you are looking at is the file that drew it. */
const modules = import.meta.glob<{ default: Study }>("./*.tsx", { eager: true });
const sources = import.meta.glob<string>("./*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});

/* A study file ends with five lines of metadata that are no use in your
   project, so each one marks the part that is. Without the markers you get
   the whole file, which is wrong but never misleading. */
const START = "/* --- study:start --- */";
const END = "/* --- study:end --- */";

function reusable(src: string): string {
  const a = src.indexOf(START);
  const b = src.indexOf(END);
  if (a < 0 || b < 0 || b < a) return src.trim();
  return src.slice(a + START.length, b).trim();
}

export const STUDIES: StudyEntry[] = Object.entries(modules)
  .map(([path, m]) => ({ ...m.default, source: reusable(sources[path] ?? "") }))
  .filter((s): s is StudyEntry => Boolean(s?.id))
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.name.localeCompare(b.name));

export const DEFAULT_STUDY = STUDIES[0]?.id ?? "";
export const studyById = (id: string) => STUDIES.find((s) => s.id === id) ?? STUDIES[0];
