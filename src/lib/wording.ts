/* How the wording is set: its case, and its size relative to whatever the
   component already chose.

   Both work the same way and on the same three groups, so they live together.

   Case is a typographic axis, not a content decision.

   Uppercase labels over title-case headings is a whole house style; so is the
   all-lowercase one. The words in the components never change — this is
   `text-transform`, so what is written stays written and only the rendering
   moves. Copy a heading out of the page and you get the sentence back.

   Headings, labels and body get their own axis, because the interesting
   settings are the ones where they disagree. */

export const CASE_NAMES = ["As written", "Title", "UPPER", "lower", "Small Caps"] as const;
export type CaseName = (typeof CASE_NAMES)[number];

export const CASE_BLURBS: Record<CaseName, string> = {
  "As written": "Whatever the component says. No transform at all.",
  Title: "Capitalises Every Word, Including The Small Ones.",
  UPPER: "All caps, with the extra tracking caps need.",
  lower: "all lowercase, which reads quieter than it looks.",
  "Small Caps": "Caps at x-height. Synthesised if the face has none.",
};

type Case = {
  transform: string;
  caps: string;
  /** Extra tracking in em. Caps are drawn to sit apart; set solid they jam. */
  track: number;
};

export const CASES: Record<CaseName, Case> = {
  "As written": { transform: "none", caps: "normal", track: 0 },
  /* CSS capitalize is per *word*, so it capitalises "a", "of" and "the" too.
     Real title case needs a stop-word list and that is a content decision,
     not a style one — so this is honestly named Title, not Title Case. */
  Title: { transform: "capitalize", caps: "normal", track: 0 },
  UPPER: { transform: "uppercase", caps: "normal", track: 0.06 },
  lower: { transform: "lowercase", caps: "normal", track: 0 },
  /* all-small-caps covers both cases at once, so the transform stays out of
     it. Most webfaces ship no small caps and the browser squashes capitals
     instead, which is lighter than the real thing but still reads. */
  "Small Caps": { transform: "none", caps: "all-small-caps", track: 0.05 },
};

/** Headings, matching the rule in index.css that already owns their tracking. */
const HEADING = ['[data-slot="card-title"]', "h1", "h2", "h3"];

/* The small wording: the words a UI uses about itself rather than the words
   it is carrying. */
const LABEL = [
  '[data-slot="label"]',
  '[data-slot="badge"]',
  '[data-slot="eyebrow"]',
  '[data-slot="button"]',
  "th",
];

/* The words the UI is carrying — which is to say everything else, so this
   one is not a list.

   The first version named five slots and missed most of the page: a sheet is
   mostly plain divs and spans, and a rule that waits for data-slot never
   reaches "UPCOMING", or a select's own option text, or the row labels in a
   summary. text-transform inherits, so the honest target is the canvas
   itself — set it once on .themed and every descendant gets it, including
   the elements nobody thought to give a slot.

   Running text is still the one place where case is a real risk rather than
   a flourish: UPPER costs about a third of reading speed over a paragraph,
   because word shape is what the eye matches and caps throw it away. lower
   keeps the shapes and only drops the capitals, which is why the
   all-lowercase house style is the one that survives at length. */

/* Some things inside the canvas are content rather than wording, and casing
   them would be a lie rather than a style.

   What someone typed, and code: an uppercase transform over an input makes
   the field disagree with its own value — the box reads SMITH@EXAMPLE.COM
   while the value is lowercase.

   And strings where case is part of the meaning rather than the styling.
   "US$12.94" set lowercase reads "us$12.94", which is not a quieter way of
   writing the same thing — it is a currency mark spelled wrong. There is no
   way to tell those apart from CSS, so a component has to say so: `abbr`,
   which is what the element is for, or data-case="keep" on anything else. */
const CONTENT = ["input", "textarea", "code", "pre", "abbr", '[data-case="keep"]'];

function block(targets: string[], name: CaseName, scope: string, track: string): string {
  /* A kit file written by hand, or a config stored before this axis existed,
     can arrive with a name that is not in the table. Falling back beats
     throwing: the glob means one such config would otherwise take both
     products down with a blank screen. */
  const c = CASES[name] ?? CASES["As written"];
  const sel = targets.map((t) => `${scope}${t}`).join(",\n");
  return (
    `${sel} {\n  text-transform: ${c.transform};\n` +
    `  font-variant-caps: ${c.caps};\n` +
    (c.track ? `  letter-spacing: calc(${track} + ${c.track}em);\n` : "") +
    `}`
  );
}

export type CaseConfig = { heading: CaseName; label: CaseName; body: CaseName };

/** Only the axes in use are emitted, so a default theme keeps every
 *  component's own casing — the eyebrow, which is uppercase by design, is not
 *  quietly turned back into sentence case.
 *
 *  Body is set on the canvas and inherited; heading and label are overrides
 *  on top of it. A group left "As written" while body is set therefore
 *  follows the body, which is what "I set it all to lowercase" should mean. */
export function caseCss(c: CaseConfig, scope = ""): string {
  const parts: string[] = [];

  if (c.body !== "As written") {
    const root = scope.trim() || ":root";
    const set = CASES[c.body] ?? CASES["As written"];

    /* Inheritance alone is not enough, for two reasons found by looking at
       the sheet with everything set to lowercase.

       Any element carrying its own utility — the `uppercase` on a stat
       tile's "UPCOMING" — keeps it, because an inherited value only applies
       where there is no declaration of its own. And form controls do not
       inherit text-transform at all: the UA stylesheet sets `none` on
       button, select and option, so a nav button and every line of a
       dropdown stayed capitalised while the text beside them changed.

       So the rule declares rather than inherits. `*` is blunt and that is
       the point: "all the wording" means the elements nobody gave a slot. */
    parts.push(
      `${root},\n${scope}* {\n  text-transform: ${set.transform};\n` +
        `  font-variant-caps: ${set.caps};\n}`,
    );
    if (set.track) {
      // Tracking stays on the root only; on * it would flatten every
      // component's own letter-spacing along with it.
      parts.push(
        `${root} {\n  letter-spacing: calc(var(--type-tracking, 0em) + ${set.track}em);\n}`,
      );
    }
    parts.push(
      `${CONTENT.map((t) => `${scope}${t}`).join(",\n")} {\n` +
        `  text-transform: none;\n  font-variant-caps: normal;\n}`,
    );
  }

  if (c.heading !== "As written") {
    parts.push(block(HEADING, c.heading, scope, "var(--tracking-heading, 0em)"));
  }
  if (c.label !== "As written") {
    parts.push(block(LABEL, c.label, scope, "var(--type-tracking, 0em)"));
  }
  return parts.join("\n\n");
}

/* ------------------------------------------------------------------ size */

/* The type scale sets one base and one ratio for the whole page, which is the
   right shape for a scale and the wrong shape for an argument about whether
   the labels are too big. This is the nudge on top.

   It does NOT work like the case axis, and the first attempt that did was
   wrong. `font-size: calc(1em * k)` looks like "whatever you are, times k",
   but em in font-size resolves against the *parent*, so it replaces the
   element's own size instead of scaling it: a 12px badge in a 16px card came
   out at 13.6px, larger than it started, and every heading inside one parent
   would have collapsed to a single size.

   So the multiplier is applied to the scale's own steps instead, in JS, where
   each group's steps keep their ratios to each other and nothing compounds.
   The groups are steps, not selectors:

     heading   lg · xl · 2xl · 3xl · 4xl
     body      base · sm
     label     xs

   sm is the seam. A label set in text-sm moves with the body rather than with
   the labels, which is the price of mapping three groups onto one scale. */

export const SIZE_NAMES = ["Smaller", "Small", "Default", "Large", "Larger"] as const;
export type SizeName = (typeof SIZE_NAMES)[number];

export const SIZES: Record<SizeName, number> = {
  Smaller: 0.85,
  Small: 0.925,
  Default: 1,
  Large: 1.1,
  Larger: 1.25,
};

export const SIZE_BLURBS: Record<SizeName, string> = {
  Smaller: "−15% on this group's steps.",
  Small: "−7.5%.",
  Default: "Whatever the type scale gives it.",
  Large: "+10%.",
  Larger: "+25%.",
};

export type SizeConfig = { heading: SizeName; label: SizeName; body: SizeName };

/** Which scale steps each group owns. */
export const SIZE_STEPS: Record<keyof SizeConfig, string[]> = {
  heading: ["lg", "xl", "2xl", "3xl", "4xl"],
  body: ["base", "sm"],
  label: ["xs"],
};

/** The multiplier for one step, or 1 if no group claims it. */
export function stepScale(step: string, c: SizeConfig): number {
  for (const group of ["heading", "body", "label"] as const) {
    if (SIZE_STEPS[group].includes(step)) return SIZES[c[group]] ?? 1;
  }
  return 1;
}

/* Anything that opted out of the scale does not move with it. The card title
   is the one that matters: it carries no size class at all, so it sits at the
   root 1rem and a heading nudge would leave the commonest heading in the kit
   exactly where it was. Pinning it to calc(1rem * k) is exact — at Default
   the multiplier is 1 and nothing is emitted, so the rendering is untouched —
   and rem, not em, so it cannot compound.

   An element with an arbitrary size (text-[11px]) is still outside all of
   this, and should be: that is what picking a literal pixel value means. */
export function headingSizeCss(size: SizeName, scope = ""): string {
  const k = SIZES[size] ?? 1;
  if (k === 1) return "";
  return `${scope}[data-slot="card-title"] {\n  font-size: calc(1rem * ${k});\n}`;
}
