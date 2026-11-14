import { describe, expect, it } from "vitest";

import { MIN_WIDTH, mobileCss } from "../mobile";
import { buildTheme, toCss } from "../theme";
import { kitById, DEFAULT_KIT } from "@/kits";

/* The mobile contract is a promise the kit makes, so it is tested like one.
   Every assertion here is a rule that was absent before, and each absence
   was measurable: 1,383 clipped elements on the remixer, 23 on the kit page,
   and a 36px button under every published touch floor. */

describe("the mobile contract", () => {
  const css = mobileCss();

  it("grows the touch target without growing the control", () => {
    /* 44px is Apple's figure; WCAG 2.5.8 asks 24 and Material 48. The point
       of doing it on ::after is that the button stays the size it was
       designed at — a kit that fattened every control on desktop to fix a
       touch problem would have traded one design for another. */
    expect(css).toContain("@media (pointer: coarse)");
    expect(css).toContain("min-width: 44px");
    expect(css).toContain("min-height: 44px");
    expect(css).toContain("pointer-events: none");
  });

  it("covers the controls a finger actually aims at", () => {
    for (const slot of ["button", "toggle", "checkbox", "switch", "menu-item"]) {
      expect(css).toContain(`[data-slot="${slot}"]`);
    }
    expect(css).toContain('[role="tab"]');
  });

  it("makes rows that do not fit scroll rather than clip", () => {
    for (const slot of ["tabs-list", "button-group", "toggle-group", "pagination"]) {
      expect(css).toContain(`[data-slot="${slot}"]`);
    }
    expect(css).toContain("overflow-x: auto");
  });

  it("lets a long unbreakable token wrap", () => {
    // Only `anywhere` counts toward a min-content size, which is the
    // measurement that pushed a column 30px past the screen.
    expect(css).toContain("overflow-wrap: anywhere");
  });

  it("states the width it is designed to hold together at", () => {
    expect(MIN_WIDTH).toBeLessThanOrEqual(375);
  });

  it("travels with the exported theme, not just this app", () => {
    /* A consumer installs CSS, not this repository. If the contract lived
       in the app's own stylesheet it would be a promise only this page
       keeps. */
    const exported = toCss(buildTheme(kitById(DEFAULT_KIT).config));
    expect(exported).toContain("@media (pointer: coarse)");
    expect(exported).toContain("overflow-wrap: anywhere");
  });
});
