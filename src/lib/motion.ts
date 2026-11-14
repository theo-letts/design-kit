/* How the theme moves. Duration and easing travel together, because the pair
   is what reads as a character — a long duration on a sharp curve feels broken,
   and a short one on a bouncy curve never gets to bounce. */

export const MOTION_NAMES = ["None", "Snap", "Smooth", "Bouncy", "Slow"] as const;
export type MotionName = (typeof MOTION_NAMES)[number];

export type Motion = { duration: number; ease: string };

export const MOTION: Record<MotionName, Motion> = {
  None: { duration: 0, ease: "linear" },
  Snap: { duration: 110, ease: "cubic-bezier(0.2, 0, 0, 1)" },
  Smooth: { duration: 190, ease: "cubic-bezier(0.4, 0, 0.2, 1)" },
  Bouncy: { duration: 260, ease: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
  Slow: { duration: 420, ease: "cubic-bezier(0.4, 0, 0.2, 1)" },
};

/* Only elements that already declare a transition are retimed. Setting a
   duration on everything would be worse than it sounds: transition-property
   defaults to `all`, so every colour the theme changes would animate too. */
export const MOTION_SELECTOR = '[class*="transition"], [data-slot]';

export const MOTION_RULE = `${MOTION_SELECTOR} {
  transition-duration: var(--motion-duration);
  transition-timing-function: var(--motion-ease);
}

@media (prefers-reduced-motion: reduce) {
  ${MOTION_SELECTOR} {
    transition-duration: 1ms;
  }
}`;
