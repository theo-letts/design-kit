import { describe, expect, it } from "vitest";

import { borderStep, tintBorder } from "../border";
import { buttonOutlineCss, outlineCss } from "../outline";
import { caseCss, headingSizeCss } from "../wording";

/* These cover the mistakes this kit has actually made, rather than the API
   surface in general. Every case below was a real bug once. */

describe("caseCss", () => {
  it("emits nothing when every axis is left alone", () => {
    // The eyebrow is uppercase by design; a rule setting `none` would undo it.
    expect(caseCss({ heading: "As written", label: "As written", body: "As written" })).toBe("");
  });

  it("declares on every element rather than relying on inheritance", () => {
    /* Form controls do not inherit text-transform and utilities beat an
       inherited value, so a body rule has to say `*` out loud. */
    const css = caseCss({ heading: "As written", label: "As written", body: "lower" });
    expect(css).toContain(":root,\n* {");
    expect(css).toContain("text-transform: lowercase");
  });

  it("exempts what someone typed and what is code", () => {
    const css = caseCss({ heading: "As written", label: "As written", body: "UPPER" });
    for (const exempt of ["input", "textarea", "code", "pre", "abbr", '[data-case="keep"]']) {
      expect(css).toContain(exempt);
    }
  });
});

describe("outline", () => {
  it("gives a destructive button its own ink", () => {
    const css = buttonOutlineCss("Offset");
    expect(css).toContain("--outline-ink: var(--outline-ink-destructive)");
  });

  it("silences the drop on buttons inside a group, and beats the rule it has to beat", () => {
    /* A segmented control is one object. The group rule has to carry the
       same :not() guards or it loses on specificity and does nothing. */
    const css = buttonOutlineCss("Offset");
    const grouped = css
      .split("\n\n")
      .find((block) => block.includes('[data-slot="button-group"] > ') && block.includes("none"));
    expect(grouped).toBeDefined();
    expect(grouped).toContain(':not([data-variant="ghost"])');
  });

  it("presses a stroked button into its own drop", () => {
    const css = buttonOutlineCss("Offset");
    expect(css).toContain(
      '[data-slot="button"]:not([data-variant="ghost"]):not([data-variant="link"]):active {\n' +
        "  translate: var(--outline-drop) var(--outline-drop);\n  box-shadow: none;\n}",
    );
  });

  it("retimes the press without dropping the button's other transitions", () => {
    /* Unlayered, a bare `transition: translate 80ms` beats transition-all
       and every colour change on the button stops animating. */
    const css = buttonOutlineCss("Offset");
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: no-preference\) \{\n[^{]+\{\n {2}transition-property: all, translate, box-shadow;/,
    );
    expect(css).not.toMatch(/^\s*transition:/m);
  });

  it("holds a joined button still when it is pressed", () => {
    /* Moved, a segment slides over its neighbour and opens the seam. */
    const css = buttonOutlineCss("Offset");
    for (const group of ["button-group", "input-group"]) {
      expect(css).toContain(
        `[data-slot="${group}"] > [data-slot="button"]:not([data-variant="ghost"]):not([data-variant="link"]):active {\n  translate: none;\n}`,
      );
    }
  });

  it("writes nothing for Default", () => {
    expect(outlineCss("Default")).toBe("");
    expect(buttonOutlineCss("Default")).toBe("");
    expect(headingSizeCss("Default")).toBe("");
  });
});

describe("border", () => {
  it("Auto reproduces the numbers that used to be hard-coded", () => {
    expect(borderStep("Auto", false, false)).toBeCloseTo(0.115, 5);
    expect(borderStep("Auto", true, false)).toBeCloseTo(0.16, 5);
    expect(borderStep("Auto", false, true)).toBeCloseTo(0.145, 5);
  });

  it("asks more of a dark page for the same apparent strength", () => {
    expect(borderStep("Default", true, false)).toBeGreaterThan(borderStep("Default", false, false));
  });

  it("tints without touching lightness", () => {
    /* The whole reason tint is its own axis: moving lightness would make a
       tinted border read as a stronger one, which is the other axis's job. */
    const border = { l: 0.89, c: 0, h: 0 };
    const brand = { l: 0.55, c: 0.2, h: 262 };
    for (const name of ["Hint", "Tinted", "Brand"] as const) {
      expect(tintBorder(border, brand, name).l).toBeCloseTo(0.89, 5);
    }
  });
});
