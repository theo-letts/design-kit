/* What happens when you touch something.

   Motion says how long a change takes; nothing said what actually moves. Every
   component here hard-codes its hover as a colour swap (`hover:bg-primary/90`),
   which is the one interaction that reads the same in every design. This axis
   adds the part that carries character: whether a control rises, sinks, presses
   or blooms.

   Colour hovers stay where they are — these compose on top as transform and
   shadow, so nothing has to be rewritten per component. */

export const INTERACT_NAMES = ["Flat", "Lift", "Press", "Sink", "Glow"] as const;
export type InteractName = (typeof INTERACT_NAMES)[number];

export const INTERACT_BLURBS: Record<InteractName, string> = {
  Flat: "Colour only. Nothing moves.",
  Lift: "Rises toward you on hover, settles when pressed.",
  Press: "Stays put, then shrinks under the press.",
  Sink: "Pushes into the page, like a physical key.",
  Glow: "Blooms a ring of the brand colour.",
};

type Recipe = {
  hoverY: string;
  hoverShadow: string;
  hoverScale: string;
  activeY: string;
  activeScale: string;
  activeShadow: string;
};

const RECIPES: Record<InteractName, Recipe> = {
  Flat: {
    hoverY: "0",
    hoverShadow: "var(--shadow-button, none)",
    hoverScale: "1",
    activeY: "0",
    activeScale: "1",
    activeShadow: "var(--shadow-button, none)",
  },
  Lift: {
    hoverY: "-1px",
    hoverShadow: "var(--elevation-2, var(--shadow-card, none))",
    hoverScale: "1",
    activeY: "0",
    activeScale: "1",
    activeShadow: "var(--elevation-0, none)",
  },
  Press: {
    hoverY: "0",
    hoverShadow: "var(--shadow-button, none)",
    hoverScale: "1",
    activeY: "0",
    activeScale: "0.97",
    activeShadow: "var(--elevation-0, none)",
  },
  Sink: {
    hoverY: "0",
    hoverShadow: "var(--shadow-button, none)",
    hoverScale: "1",
    activeY: "1px",
    activeScale: "1",
    activeShadow: "inset 0 2px 4px 0 oklch(0 0 0 / 0.18)",
  },
  Glow: {
    hoverY: "0",
    hoverShadow: "0 0 0 4px var(--ring-soft), var(--shadow-button, none)",
    hoverScale: "1",
    activeY: "0",
    activeScale: "0.99",
    activeShadow: "0 0 0 2px var(--ring-soft)",
  },
};

/* Buttons and anything else that behaves like one. Cards are deliberately
   excluded: a card that lifts under the pointer reads as clickable, and most
   of them are not. */
const TARGET =
  '[data-slot="button"], [data-slot="toggle"], [data-slot="menu-item"], [data-slot="radio-card"]';

export function interactCss(name: InteractName, scope = ""): string {
  if (name === "Flat") return "";
  const r = RECIPES[name];
  const sel = (suffix: string) =>
    TARGET.split(", ")
      .map((t) => `${scope}${t}${suffix}`)
      .join(",\n");

  /* Transform and box-shadow only. Touch devices have no hover, so the
     active rules carry the feedback there. */
  return `${sel(":hover:not(:disabled)")} {
  transform: translateY(${r.hoverY}) scale(${r.hoverScale});
  box-shadow: ${r.hoverShadow};
}

${sel(":active:not(:disabled)")} {
  transform: translateY(${r.activeY}) scale(${r.activeScale});
  box-shadow: ${r.activeShadow};
}`;
}
