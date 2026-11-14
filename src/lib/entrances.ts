/* How overlays arrive.

   Dialogs, sheets, popovers and toasts all appeared instantly — the one place
   motion is most expected and was most absent. These are keyframes rather than
   transitions because an element entering the DOM has no previous state to
   transition from.

   Timing comes from the motion axis, so the two stay in step instead of
   disagreeing about how fast this theme moves. */

export const ENTRANCE_NAMES = ["None", "Fade", "Scale", "Rise", "Spring"] as const;
export type EntranceName = (typeof ENTRANCE_NAMES)[number];

export const ENTRANCE_BLURBS: Record<EntranceName, string> = {
  None: "Overlays simply appear.",
  Fade: "Opacity only. The quietest option.",
  Scale: "Grows from 96% as it fades in.",
  Rise: "Comes up from below.",
  Spring: "Overshoots a little, then settles.",
};

const KEYFRAMES = `@keyframes dk-fade {
  from { opacity: 0; }
}

@keyframes dk-scale {
  from { opacity: 0; transform: scale(0.96); }
}

@keyframes dk-rise {
  from { opacity: 0; transform: translateY(8px); }
}

@keyframes dk-rise-sheet {
  from { transform: translateX(16px); }
}

@keyframes dk-rise-drawer {
  from { transform: translateY(100%); }
}`;

const ANIMATION: Record<Exclude<EntranceName, "None">, string> = {
  Fade: "dk-fade",
  Scale: "dk-scale",
  Rise: "dk-rise",
  Spring: "dk-scale",
};

/* Spring overshoots; the rest use the theme's own curve. */
const EASE: Record<Exclude<EntranceName, "None">, string> = {
  Fade: "var(--motion-ease, ease)",
  Scale: "var(--motion-ease, ease)",
  Rise: "var(--motion-ease, ease)",
  Spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

const FLOATING =
  '[data-slot="popover-content"], [data-slot="hover-card-content"], [data-slot="context-menu-content"], [data-slot="toast"], [data-slot="alert-dialog-content"]';

export function entranceCss(name: EntranceName, scope = ""): string {
  if (name === "None") return "";
  const anim = ANIMATION[name];
  const ease = EASE[name];
  const dur = "var(--motion-duration, 190ms)";
  const list = (sels: string) =>
    sels
      .split(", ")
      .map((t) => `${scope}${t}`)
      .join(",\n");

  return `${KEYFRAMES}

${list(FLOATING)} {
  animation: ${anim} ${dur} ${ease} both;
}

/* Sheets and drawers come from their own edge whatever the entrance, because
   a sheet that fades in from the centre is not a sheet. */
${scope}[data-slot="sheet-content"] {
  animation: dk-rise-sheet ${dur} ${ease} both, dk-fade ${dur} ${ease} both;
}

${scope}[data-slot="drawer-content"] {
  animation: dk-rise-drawer ${dur} ${ease} both;
}

@media (prefers-reduced-motion: reduce) {
${list(FLOATING)},
  ${scope}[data-slot="sheet-content"],
  ${scope}[data-slot="drawer-content"] {
    animation: dk-fade 1ms both;
  }
}`;
}
