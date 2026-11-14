/* A style is the shape language: how round, how dense, how much shadow, how
   heavy the borders. Colour is a separate axis entirely. */

export type Style = {
  name: string;
  blurb: string;
  radius: number; // rem
  spacing: number; // rem, the base unit everything scales from
  borderWidth: number; // px
  /** Card / popover elevation, and the lift under a filled button. */
  shadowCard: string;
  shadowButton: string;
  /** Heading treatment. */
  tracking: string;
  headingWeight: number;
};

export const STYLES = {
  Nova: {
    name: "Nova",
    blurb: "The shadcn default — soft corners, quiet shadows.",
    radius: 0.625,
    spacing: 0.25,
    borderWidth: 1,
    shadowCard: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    shadowButton: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    tracking: "-0.01em",
    headingWeight: 600,
  },
  Vega: {
    name: "Vega",
    blurb: "Square and roomy. No shadows, nothing to hide behind.",
    radius: 0,
    spacing: 0.28,
    borderWidth: 1,
    shadowCard: "none",
    shadowButton: "none",
    tracking: "-0.02em",
    headingWeight: 600,
  },
  Maia: {
    name: "Maia",
    blurb: "Generous curves and a soft float.",
    radius: 1,
    spacing: 0.26,
    borderWidth: 1,
    shadowCard: "0 8px 24px -8px rgb(0 0 0 / 0.14)",
    shadowButton: "0 2px 6px -1px rgb(0 0 0 / 0.16)",
    tracking: "-0.015em",
    headingWeight: 600,
  },
  Lyra: {
    name: "Lyra",
    blurb: "Tight, sharp and dense — built for dashboards.",
    radius: 0.25,
    spacing: 0.22,
    borderWidth: 1,
    shadowCard: "0 1px 1px 0 rgb(0 0 0 / 0.06)",
    shadowButton: "none",
    tracking: "-0.005em",
    headingWeight: 600,
  },
  Mira: {
    name: "Mira",
    blurb: "Heavy rules and a hard offset shadow.",
    radius: 0.375,
    spacing: 0.25,
    borderWidth: 2,
    shadowCard: "3px 3px 0 0 var(--border)",
    shadowButton: "2px 2px 0 0 var(--border)",
    tracking: "-0.01em",
    headingWeight: 700,
  },
  Luma: {
    name: "Luma",
    blurb: "Airy and diffuse, with barely-there edges.",
    radius: 0.75,
    spacing: 0.3,
    borderWidth: 1,
    shadowCard: "0 16px 40px -20px rgb(0 0 0 / 0.22)",
    shadowButton: "0 4px 12px -4px rgb(0 0 0 / 0.2)",
    tracking: "-0.02em",
    headingWeight: 500,
  },
  Sera: {
    name: "Sera",
    blurb: "Editorial. Hairline rules, almost no rounding.",
    radius: 0.125,
    spacing: 0.25,
    borderWidth: 1,
    shadowCard: "none",
    shadowButton: "none",
    tracking: "0",
    headingWeight: 600,
  },
  Rhea: {
    name: "Rhea",
    blurb: "Pills everywhere — friendly and consumer-facing.",
    radius: 1.5,
    spacing: 0.26,
    borderWidth: 1,
    shadowCard: "0 4px 16px -6px rgb(0 0 0 / 0.16)",
    shadowButton: "0 2px 8px -2px rgb(0 0 0 / 0.22)",
    tracking: "-0.01em",
    headingWeight: 600,
  },
} satisfies Record<string, Style>;

export type StyleName = keyof typeof STYLES;
export const STYLE_NAMES = Object.keys(STYLES) as StyleName[];
