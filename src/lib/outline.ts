/* Outline treatments. The axis the kit had was border *width*, which is the
   least interesting dimension of a stroke.

   One generator serves both the app and the export, so the scoped rules the
   canvas uses and the bare rules you paste into a project cannot drift apart.
   Gradient and Bracket draw on a ::after overlay rather than the element's own
   background, because the card texture layer already owns background-image. */

export const OUTLINE_NAMES = [
  "Default",
  "Hairline",
  "Ring",
  "Lit",
  "Gradient",
  "Bracket",
  "Double",
  "Offset",
] as const;
export type OutlineName = (typeof OUTLINE_NAMES)[number];

/** What each treatment is for, shown under the picker. */
export const OUTLINE_BLURBS: Record<OutlineName, string> = {
  Default: "The style preset's own border width.",
  Hairline: "True sub-pixel. Finer than 1px on retina.",
  Ring: "An inset ring — crisper on round corners, and takes no layout space.",
  Lit: "A highlight along the top edge, as if lit from above.",
  Gradient: "A stroke that fades from bright at the top to nothing at the bottom.",
  Bracket: "Corner marks only, like crop marks.",
  Double: "A thick/thin pair, the way a broadsheet rules a column.",
  Offset: "A stroke and a hard shadow in one ink, dropped down and right.",
};

const TARGET = '[data-slot="card"], [data-slot="alert"], [data-slot="item-group"]';

const TARGETS = TARGET.split(", ");

/** Rules for one treatment. `scope` prefixes the selector; "" gives the
 *  bare version that goes into an exported stylesheet. */
export function outlineRules(name: OutlineName, scope = ""): string {
  const list = (suffix = "") => TARGETS.map((t) => `${scope}${t}${suffix}`).join(",\n");
  const sel = list();
  const block = (body: string) => `${sel} {\n${body}\n}`;

  /* Every overlay treatment needs the same two things: somewhere to anchor,
     and the parent's corner radius. Each selector needs its own ::after —
     appending once to a comma list only reaches the final selector. */
  const overlay = (body: string) =>
    `${sel} {\n  position: relative;\n}\n\n${list("::after")} {\n` +
    `  content: "";\n  position: absolute;\n  inset: 0;\n` +
    `  border-radius: inherit;\n  pointer-events: none;\n${body}\n}`;

  switch (name) {
    case "Hairline":
      return block("  border-width: 0.5px;");

    case "Ring":
      // No border at all: an inset ring hugs the radius and shifts no layout.
      return block(
        "  border-color: transparent;\n" +
          "  box-shadow:\n    var(--shadow-card, none),\n" +
          "    inset 0 0 0 var(--border-width, 1px) var(--border);",
      );

    case "Lit":
      return block(
        "  box-shadow:\n    var(--shadow-card, none),\n" +
          "    inset 0 1px 0 0 var(--outline-lit),\n" +
          "    inset 0 -1px 0 0 var(--outline-shade);",
      );

    case "Gradient":
      // Masked ring: paint the gradient, then punch out everything but the edge.
      return overlay(
        "  padding: var(--border-width, 1px);\n" +
          "  background: linear-gradient(to bottom, var(--outline-top), var(--outline-bottom));\n" +
          "  -webkit-mask:\n    linear-gradient(#000 0 0) content-box,\n    linear-gradient(#000 0 0);\n" +
          "  mask:\n    linear-gradient(#000 0 0) content-box,\n    linear-gradient(#000 0 0);\n" +
          "  -webkit-mask-composite: xor;\n  mask-composite: exclude;",
      );

    case "Bracket": {
      // Eight bars: two per corner, each a solid gradient sized to the arm.
      /* Marks need more presence than a border: a continuous stroke reads at
         low contrast, eight 14px bars do not. Hence their own token. */
      const bar = "linear-gradient(var(--outline-mark), var(--outline-mark))";
      const arm = "var(--outline-arm) var(--border-width, 1px)";
      const armV = "var(--border-width, 1px) var(--outline-arm)";
      const layers = [
        [`${bar} left top/${arm}`, `${bar} left top/${armV}`],
        [`${bar} right top/${arm}`, `${bar} right top/${armV}`],
        [`${bar} left bottom/${arm}`, `${bar} left bottom/${armV}`],
        [`${bar} right bottom/${arm}`, `${bar} right bottom/${armV}`],
      ].flat();
      return overlay(
        "  border-radius: 0;\n  background:\n    " +
          layers.join(",\n    ") +
          ";\n  background-repeat: no-repeat;",
      );
    }

    /* The stroke and the shadow are the same ink, so the drop reads as the
       stroke thickening on two sides rather than as the card floating. That is
       also why it replaces --shadow-card instead of composing with it the way
       Ring and Lit do: a card is stamped or it floats, not both. */
    case "Offset":
      return block(
        "  border-color: var(--outline-ink);\n" +
          "  box-shadow: var(--outline-drop) var(--outline-drop) 0 0 var(--outline-ink);",
      );

    case "Double":
      return block("  border-style: double;\n  border-width: 3px;");

    default:
      return "";
  }
}

/** Only the treatment in use is emitted, so a Default theme stays untouched. */
export function outlineCss(name: OutlineName, scope = ""): string {
  const rules = outlineRules(name, scope);
  if (!rules) return "";
  // Bracket squares off the overlay, so the card's own corners must go too.
  const extra =
    name === "Bracket"
      ? `\n\n${TARGETS.map((t) => `${scope}${t}`).join(",\n")} {\n  border-color: transparent;\n}`
      : "";
  return rules + extra;
}

/* ------------------------------------------------------- button outlines */

/* Buttons need their own axis rather than inheriting the card's. A card is
   always a bordered box; a button is usually a filled one, so half the card
   treatments have nothing to act on and the other half act on the wrong
   thing. Each treatment below says plainly which variants it touches. */

export const BUTTON_OUTLINE_NAMES = ["Default", "Hairline", "Ring", "Lit", "Offset"] as const;
export type ButtonOutlineName = (typeof BUTTON_OUTLINE_NAMES)[number];

export const BUTTON_OUTLINE_BLURBS: Record<ButtonOutlineName, string> = {
  Default: "The style preset's own button.",
  Hairline: "Thins the stroke on outline buttons. Filled ones have none to thin.",
  Ring: "The stroke moves inside the box, so it hugs the radius and adds no width.",
  Lit: "A highlight along the top edge and a shade below — a physical chip.",
  Offset: "A stroke and a hard shadow in one ink, matching the Offset card.",
};

/* Ghost and link are the two variants with no box to draw: giving them a
   stroke at rest is the one thing they exist to avoid. */
const BTN = '[data-slot="button"]:not([data-variant="ghost"]):not([data-variant="link"])';
const BTN_BORDERED = '[data-slot="button"][data-variant="outline"]';

export function buttonOutlineCss(name: ButtonOutlineName, scope = ""): string {
  const rule = (target: string, body: string) => `${scope}${target} {\n${body}\n}`;

  switch (name) {
    case "Hairline":
      return rule(BTN_BORDERED, "  border-width: 0.5px;");

    case "Ring":
      return rule(
        BTN_BORDERED,
        "  border-color: transparent;\n" +
          "  box-shadow: inset 0 0 0 var(--border-width, 1px) var(--border);",
      );

    case "Lit":
      return rule(
        BTN,
        "  box-shadow:\n    var(--shadow-button, none),\n" +
          "    inset 0 1px 0 0 var(--outline-lit),\n" +
          "    inset 0 -1px 0 0 var(--outline-shade);",
      );

    /* The interaction axis rewrites box-shadow on :hover and :active, and it
       reaches for --shadow-button when it wants "whatever this button rests
       at". Redefining that token is what keeps the stamp under the pointer
       for Flat, Press and Sink; Lift and Glow deliberately lose it, which is
       right — a button that rises off the page is no longer stamped to it. */
    case "Offset": {
      const drop = "var(--outline-drop) var(--outline-drop) 0 0 var(--outline-ink)";
      const root = scope.trim() || ":root";
      /* Destructive carries its own ink. One ink for every variant means a
         delete button is stamped in the brand colour, which reads as the
         brand endorsing the delete — and on a red fill a green stamp is just
         a mistake. The variable swaps; the rule above stays as it was.

         It was scoped to the button alone, which made the argument and then
         declined to apply it: a destructive alert — the thing a status page
         is actually built out of — kept the sea-green drop against a red
         edge. Any element that has declared itself destructive gets the
         matching ink now. data-variant covers button and alert, which carry
         it already; data-tone is the opt-in for a surface that has no
         variant of its own, a card being the case that prompted this. The
         property inherits, so a destructive alert also hands the right ink
         to anything stamped inside it. */
      const danger = `[data-variant="destructive"],\n${scope}[data-tone="destructive"]`;
      /* A segmented control is one object, not three. Left to themselves,
         every button in a group casts its own drop — and in a row each
         shadow lands under the next button, so the seams fill with hard
         vertical bars and the last one hangs off the end. The group takes
         the drop; the buttons keep their strokes, which is what welds them
         together in the first place. The same goes for a button welded into
         an input group. */
      const joined = ['[data-slot="button-group"]', '[data-slot="input-group"]'];
      return (
        `${root} {\n  --shadow-button: ${drop};\n}\n\n` +
        rule(
          BTN,
          "  border: var(--border-width, 1px) solid var(--outline-ink);\n" +
            `  box-shadow: ${drop};`,
        ) +
        "\n\n" +
        /* Pressed, the button sinks into its own stamp: it travels the
           length of the drop and the drop goes, so the face lands where the
           shadow was. It is `translate` and not `transform` because the
           interaction axis owns transform on :active — the two properties
           compose, where a second transform would erase the first. */
        rule(
          `${BTN}:active`,
          "  translate: var(--outline-drop) var(--outline-drop);\n  box-shadow: none;",
        ) +
        "\n\n" +
        /* The press is quicker than anything else the button does, so it is
           retimed alone. `all` comes first and the two properties again
           after it, because the last entry naming a property wins: that
           keeps the colour transitions the button already declares. A plain
           `transition: translate 80ms` would drop them, since this sheet is
           unlayered and beats the transition-all utility outright. Under
           reduced motion the rule is absent and the press simply lands. */
        "@media (prefers-reduced-motion: no-preference) {\n" +
        rule(
          BTN,
          "  transition-property: all, translate, box-shadow;\n" +
            "  transition-duration: var(--motion-duration, 150ms), 80ms, 80ms;",
        ) +
        "\n}\n\n" +
        rule(danger, "  --outline-ink: var(--outline-ink-destructive);") +
        "\n\n" +
        joined
          /* Carries the same :not() guards as the rule above, because
             without them this selector is one attribute lighter and loses to
             it — and a rule that loses silently looks exactly like a rule
             that was never written. */
          .map(
            (g) =>
              rule(`${g} > ${BTN}`, "  box-shadow: none;") +
              "\n\n" +
              /* Nor does a joined button press. It has no drop of its own to
                 sink into, and moved anyway it slides across its neighbour's
                 stroke and opens a gap in the seam the group is welded by.
                 :active makes this one heavier than the press rule, so it
                 wins whichever is written first. */
              rule(`${g} > ${BTN}:active`, "  translate: none;"),
          )
          .join("\n\n") +
        "\n\n" +
        rule(
          '[data-slot="button-group"]',
          /* The same expression the rounded-md utility uses. --radius-md
             itself is a @theme token, which generates that utility but is
             not published as a variable on the element — reading it falls
             back, and the drop comes out with tighter corners than the
             buttons it is shadowing. */
          "  border-radius: calc(var(--radius) - 2px);\n" + `  box-shadow: ${drop};`,
        )
      );
    }

    default:
      return "";
  }
}
