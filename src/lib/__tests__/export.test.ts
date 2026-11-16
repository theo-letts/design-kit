import { describe, expect, it } from "vitest";

import { houseConfig, KITS } from "@/kits";
import type { Config } from "../config";
import { ELEVATION_NAMES } from "../elevation";
import { BUTTON_OUTLINE_NAMES, buttonOutlineCss, OUTLINE_NAMES, outlineCss } from "../outline";
import { STYLE_NAMES } from "../styles";
import { buildTheme, themeVars, toCss } from "../theme";

/* The exported sheet, read the way a project that installs it reads it: on
   its own, with no canvas around it.

   Both bugs here shipped in 0.2.0 and neither could be seen from inside this
   repository. The canvas sets every variable inline and scopes the outline
   rules one attribute deeper than the export does, so the app was right and
   the file it wrote was not. Nothing in here renders anything — it asks the
   two questions a browser would have answered: is every variable this sheet
   reads defined in it, and when two of its rules name the same selector,
   does the one that was meant to win come last. */

const sheetFor = (config: Config) => toCss(buildTheme(config));
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

type Rule = { selectors: string[]; decls: Record<string, string> };

/** The sheet's top-level rules, in order. At-rules are skipped: nothing the
 *  cascade checks below care about is conditional. The generators only emit
 *  flat blocks, so this is a scanner over that shape and not a CSS parser. */
function rulesOf(css: string): Rule[] {
  const src = strip(css);
  const out: Rule[] = [];
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i);
    if (open < 0) break;
    let depth = 1;
    let j = open + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") depth--;
      j++;
    }
    const prelude = src.slice(i, open).trim();
    const body = src.slice(open + 1, j - 1);
    i = j;
    if (prelude.startsWith("@")) continue;

    const decls: Record<string, string> = {};
    for (const part of body.split(";")) {
      const at = part.indexOf(":");
      if (at < 0) continue;
      decls[part.slice(0, at).trim()] = part
        .slice(at + 1)
        .trim()
        .replace(/\s*\n\s*/g, " ");
    }
    out.push({ selectors: prelude.split(",").map((s) => s.trim()), decls });
  }
  return out;
}

/** What an element matched by exactly this selector ends up with. Rules that
 *  name the same selector have the same specificity, so the last one to
 *  declare the property is the one that applies. */
function winner(rules: Rule[], selector: string, prop: string): string | undefined {
  let value: string | undefined;
  for (const r of rules) {
    if (r.selectors.includes(selector) && prop in r.decls) value = r.decls[prop];
  }
  return value;
}

/** A block's variables, one per line as varLines writes them. Line by line
 *  rather than split on `;`, because a texture is a data URI with its own. */
function blockVars(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return {};
  const body = css.slice(start, css.indexOf("\n}", start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/^\s*(--[\w-]+):\s*(.*);$/gm)) out[m[1]] = m[2];
  return out;
}

/** Every `var(--x)` with no fallback that the sheet never defines. */
function undefinedVars(css: string): string[] {
  const src = strip(css);
  const defined = new Set([...src.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const read = new Set([...src.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map((m) => m[1]));
  return [...read].filter((name) => !defined.has(name)).sort();
}

const PRESET = [
  "--border-width",
  "--shadow-card",
  "--shadow-button",
  "--tracking-heading",
  "--weight-heading",
];

describe("the exported sheet defines what it reads", () => {
  /* `border-width: var(--border-width)` with the variable missing is not a
     missing border. The declaration is invalid at computed-value time and
     the property resets to `medium` — 3px on every card and input. A var()
     with a fallback is exempt: that is what the fallback is for. */
  it.each(KITS.map((k) => [k.name, k.config] as const))("%s", (_name, config) => {
    expect(undefinedVars(sheetFor(config))).toEqual([]);
  });

  it("whatever the style, elevation and outline", () => {
    const house = houseConfig();
    const missing = new Set<string>();
    for (const style of STYLE_NAMES) {
      for (const elevation of ELEVATION_NAMES) {
        for (const name of undefinedVars(sheetFor({ ...house, style, elevation }))) {
          missing.add(name);
        }
      }
    }
    for (const outline of OUTLINE_NAMES) {
      for (const buttonOutline of BUTTON_OUTLINE_NAMES) {
        for (const name of undefinedVars(sheetFor({ ...house, outline, buttonOutline }))) {
          missing.add(name);
        }
      }
    }
    expect([...missing]).toEqual([]);
  });

  /* Defined is not the same as right. The canvas is the reference — it is
     what the kit was designed against — so the sheet has to resolve each of
     the preset's variables to the value the canvas sets inline, in both
     modes. Dark inherits from :root where it has nothing of its own to say. */
  it.each(KITS.map((k) => [k.name, k.config] as const))(
    "%s gives the preset the canvas's values",
    (_name, config) => {
      const theme = buildTheme(config);
      const css = toCss(theme);
      const root = blockVars(css, ":root");
      const dark = { ...root, ...blockVars(css, ".dark") };
      const canvas = (mode: "light" | "dark") => themeVars(theme, mode) as Record<string, string>;
      for (const name of PRESET) {
        expect(root[name], `${name} in :root`).toBe(canvas("light")[name]);
        expect(dark[name], `${name} in .dark`).toBe(canvas("dark")[name]);
      }
    },
  );

  it("gives the house kit a 1px stroke and regular, tightened headings", () => {
    const root = blockVars(sheetFor(houseConfig()), ":root");
    expect(root["--border-width"]).toBe("1px");
    expect(root["--tracking-heading"]).toBe("-0.02em");
    expect(root["--weight-heading"]).toBe("400");
  });
});

describe("the outline axes survive the preset's own rules", () => {
  /* The structure rule sets border-width and box-shadow on every surface.
     An outline treatment sets one or both on the same selectors at the same
     specificity, so in a bare sheet whichever comes later wins. With the
     structure rule last, Offset kept its coloured stroke and lost its drop
     — a card with `box-shadow: var(--shadow-card)` where the stamp should
     be. Every declaration an axis makes has to be the one left standing. */
  const house = houseConfig();

  const survives = (sheet: string, axis: string) => {
    const exported = rulesOf(sheet);
    const own = rulesOf(axis);
    for (const rule of own) {
      for (const selector of rule.selectors) {
        for (const prop of Object.keys(rule.decls)) {
          expect(winner(exported, selector, prop), `${selector} { ${prop} }`).toBe(
            winner(own, selector, prop),
          );
        }
      }
    }
  };

  it.each(OUTLINE_NAMES.filter((n) => n !== "Default"))("%s cards", (outline) => {
    survives(sheetFor({ ...house, outline }), outlineCss(outline));
  });

  it.each(BUTTON_OUTLINE_NAMES.filter((n) => n !== "Default"))("%s buttons", (buttonOutline) => {
    survives(sheetFor({ ...house, buttonOutline }), buttonOutlineCss(buttonOutline));
  });

  it("leaves the house kit's cards stamped", () => {
    const exported = rulesOf(sheetFor(house));
    for (const slot of ["card", "alert", "item-group"]) {
      expect(winner(exported, `[data-slot="${slot}"]`, "box-shadow")).toBe(
        "var(--outline-drop) var(--outline-drop) 0 0 var(--outline-ink)",
      );
    }
  });
});

describe("the sheet draws the borders it colours", () => {
  /* `border-width` alone draws nothing. border-style initialises to `none`,
     and `none` is not a thin border — it is no border at whatever width you
     asked for. Inside a Tailwind build preflight sets `border: 0 solid` on
     every element and the width is enough; the exported sheet has no
     preflight under it, so it has to say `solid` itself.

     What this cost: the Offset treatment still painted its drop, so a card
     showed a hard coloured L hanging beside an edge that was never drawn.
     It read as a broken shadow, which is why it survived review — the bug
     was two selectors away from the thing that looked wrong. */
  const widthWithoutStyle = (css: string) => {
    const rules = rulesOf(css);
    const bad = new Set<string>();
    for (const rule of rules) {
      for (const selector of rule.selectors) {
        const width = winner(rules, selector, "border-width");
        if (!width || width === "0" || width === "0px") continue;
        const styled = rules.some(
          (r) =>
            r.selectors.includes(selector) && ("border-style" in r.decls || "border" in r.decls),
        );
        if (!styled) bad.add(selector);
      }
    }
    return [...bad].sort();
  };

  it.each(KITS.map((k) => [k.name, k.config] as const))("%s", (_name, config) => {
    expect(widthWithoutStyle(sheetFor(config))).toEqual([]);
  });

  it("whatever the outline treatment", () => {
    const house = houseConfig();
    const bad = new Set<string>();
    for (const outline of OUTLINE_NAMES) {
      for (const buttonOutline of BUTTON_OUTLINE_NAMES) {
        for (const s of widthWithoutStyle(sheetFor({ ...house, outline, buttonOutline }))) {
          bad.add(s);
        }
      }
    }
    expect([...bad]).toEqual([]);
  });

  /* The destructive ink was scoped to the destructive *button*, so a card or
     an alert that had gone destructive kept the sea-green stamp against a red
     edge. A status page is mostly destructive surfaces and no destructive
     buttons at all, which is the case that found this. */
  it("gives a destructive surface the destructive ink, not just a button", () => {
    const rules = rulesOf(sheetFor({ ...houseConfig(), outline: "Offset" }));
    for (const selector of ['[data-variant="destructive"]', '[data-tone="destructive"]']) {
      expect(winner(rules, selector, "--outline-ink"), selector).toBe(
        "var(--outline-ink-destructive)",
      );
    }
  });
});
