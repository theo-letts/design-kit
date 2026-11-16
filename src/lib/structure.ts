/* The style preset, applied.
 *
 *  A preset is a handful of variables — --border-width, --shadow-card,
 *  --shadow-button, --tracking-heading, --weight-heading — and these are the
 *  rules that make anything read them. Without them the variables are
 *  present and inert.
 *
 *  They lived in the app's own stylesheet until now, which meant the export
 *  carried the variables and not the rules: a consumer installing a preset
 *  with 2px borders and a hard offset shadow got neither, because their
 *  shadcn Card uses Tailwind's own `border` and its own shadow. Half the
 *  kit arrived. Generating them here, the way the outline and case axes are
 *  generated, means the app and the export cannot disagree about what a
 *  preset is. */

/** Surfaces that carry the card's border and shadow. */
const SURFACES = [
  '[data-slot="card"]',
  '[data-slot="alert"]',
  '[data-slot="popover-content"]',
  '[data-slot="hover-card-content"]',
  '[data-slot="context-menu-content"]',
  '[data-slot="alert-dialog-content"]',
  '[data-slot="sheet-content"]',
  '[data-slot="toast"]',
  '[data-slot="calendar"]',
  '[data-slot="item-group"]',
  '[data-slot="empty"]',
];

/** Controls that take the stroke width but not the shadow. */
const BORDERED = [
  '[data-slot="input"]',
  '[data-slot="textarea"]',
  '[data-slot="select"]',
  '[data-slot="input-group"]',
  '[data-slot="input-otp-slot"]',
  '[data-slot="combobox-trigger"]',
  '[data-slot="radio-card"]',
  '[data-slot="toggle-group"]',
  '[data-slot="button"][data-variant="outline"]',
];

/** Filled buttons, which take the button shadow rather than the card's. */
const FILLED = ["default", "secondary", "destructive"].map(
  (v) => `[data-slot="button"][data-variant="${v}"]`,
);

const HEADINGS = ['[data-slot="card-title"]', "h1", "h2", "h3"];

export function structureCss(scope = ""): string {
  const list = (items: string[]) => items.map((t) => `${scope}${t}`).join(",\n");

  /* border-style is declared, not assumed. Tailwind's preflight sets
     `border: 0 solid` on every element, so inside a Tailwind build a width
     on its own is enough and this line changes nothing. Outside one it is
     the whole rule: border-style initialises to `none`, and a border of
     `none` draws nothing however wide it is. The offset treatment still
     paints its drop, so what you got was a hard L sitting beside an edge
     that was never drawn — on a card, on an alert, on every bordered
     control. It looked like a bug in the shadow. It was a missing keyword. */
  return `${list(SURFACES)} {
  border-style: solid;
  border-width: var(--border-width);
  box-shadow: var(--shadow-card);
}

${list(BORDERED)} {
  border-style: solid;
  border-width: var(--border-width);
}

/* A group owns the box; the input inside it is only the text field. The rule
   above is right on its own and wrong here — at (0,2,0) it outranks the
   group's own [&>input]:border-0 at (0,1,1), so the input kept a border the
   group had explicitly removed. Its radius and shadow were never taken off
   it at all, so what you got was a second rounded rect inside the first,
   with the seam showing against the addon. */
${scope}[data-slot="input-group"] > input,
${scope}[data-slot="input-group"] > [data-slot="input"],
${scope}[data-slot="input-group"] > textarea {
  border-width: 0;
  border-radius: 0;
  box-shadow: none;
}

${list(FILLED)} {
  box-shadow: var(--shadow-button);
}

${list(HEADINGS)} {
  letter-spacing: var(--tracking-heading);
  font-weight: var(--weight-heading);
}`;
}
