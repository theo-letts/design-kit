/* What the kit promises on a phone.
 *
 *  These are rules, not breakpoint tweaks, and they ship with the theme
 *  rather than living in this app — a consumer who installs the kit gets
 *  them too, because "works on mobile" is a property of the system and not
 *  of the page that happens to be showing it.
 *
 *  Three of them, each with a reason:
 *
 *  1. A control is at least 44px to the finger. shadcn's default button is
 *     36px, which is fine for a cursor and under every published floor for
 *     touch — Apple asks 44pt, Material 48dp, WCAG 2.5.8 a hard 24px. The
 *     visual size is left alone and the *hit area* is grown, because making
 *     every button 44px tall on desktop would be a worse design to fix an
 *     input problem that desktop does not have.
 *
 *  2. A row of things that does not fit scrolls rather than clipping. A tab
 *     strip or a segmented control at 375px either scrolls or silently
 *     loses its last option, and losing it is not a trade anyone chose.
 *
 *  3. A dialog on a small screen comes from the bottom. A centred box with
 *     a 2rem margin is a desktop shape; at 375px it leaves a sliver of page
 *     on each side and puts the actions where the thumb cannot reach.
 */

/** Controls that must be comfortable to hit. Anything a finger aims at. */
const TOUCH = [
  '[data-slot="button"]',
  '[data-slot="toggle"]',
  '[data-slot="checkbox"]',
  '[data-slot="radio-group-item"]',
  '[data-slot="switch"]',
  '[data-slot="menu-item"]',
  '[data-slot="input-otp-slot"]',
  '[role="tab"]',
];

/** The smallest width the kit is designed to hold together at. */
export const MIN_WIDTH = 360;

export function mobileCss(scope = ""): string {
  const touch = TOUCH.map((t) => `${scope}${t}`).join(",\n");
  const touchAfter = TOUCH.map((t) => `${scope}${t}::after`).join(",\n");

  return `@media (pointer: coarse) {
${touch} {
  position: relative;
}

/* The target is grown with a pseudo-element rather than padding, so the
   control keeps the size it was designed at and only the area that accepts
   a tap changes. pointer-events stays off it: the click belongs to the
   control, and an overlay that swallows it would be a worse bug than the
   one this fixes. */
${touchAfter} {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  min-width: 44px;
  min-height: 44px;
  pointer-events: none;
}
}

/* A row that does not fit scrolls. Clipping loses the last option without
   saying so, which is the failure mode nobody notices until a user cannot
   reach the thing they were told to tap. */
${scope}[data-slot="tabs-list"],
${scope}[data-slot="button-group"],
${scope}[data-slot="toggle-group"],
${scope}[data-slot="pagination"] {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

${scope}[data-slot="tabs-list"]::-webkit-scrollbar,
${scope}[data-slot="button-group"]::-webkit-scrollbar,
${scope}[data-slot="toggle-group"]::-webkit-scrollbar,
${scope}[data-slot="pagination"]::-webkit-scrollbar {
  display: none;
}

/* A long unbreakable token sets the minimum width of everything that
   contains it, so one file path in a paragraph of prose can push a whole
   column past the screen — which is what a registry path was doing here,
   30px at a time. "anywhere" rather than "break-word" because only
   "anywhere" counts toward a min-content size, and the min-content size is
   the measurement that was wrong. */
${scope}code,
${scope}[data-slot="kbd"] {
  overflow-wrap: anywhere;
}

/* Tables are the one thing that genuinely cannot reflow: a column dropped
   to make it fit is data removed from the page. It scrolls instead. */
${scope}[data-slot="table-scroll"] {
  width: 100%;
  overflow-x: auto;
}

/* A dialog arrives from the bottom on a small screen, where a centred box
   wastes the width it has and puts its actions out of thumb reach. */
@media (max-width: ${MIN_WIDTH + 280}px) {
${scope}[data-slot="alert-dialog-content"],
${scope}[data-slot="dialog-content"] {
  max-width: 100%;
  width: 100%;
  margin-top: auto;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
}`;
}
