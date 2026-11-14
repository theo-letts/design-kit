import type { RawMeasured } from "./capture";

/** A captured page is untrusted input. Its title, font names and custom-property
 *  values are author-controlled strings, and they are about to be pasted into a
 *  prompt — so each one has to match a shape before it goes anywhere. Anything
 *  that doesn't is dropped, not escaped: a font family with a newline in it is
 *  not a font family. */

const COLOR =
  /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%/]{1,40}\)|hsla?\([\d\s.,%/a-z]{1,48}\)|(oklch|oklab|lab|lch)\([\d\s.,%/-]{1,48}\)|color\([\w\s.,%/-]{1,60}\))$/i;
const FAMILY = /^[\w .'&+-]{1,48}$/;
/** Lengths, colour functions and the keyword `inset`, and nothing else. */
const SHADOW = /^[\w\s.,()%#/-]{1,160}$/;
const TOKEN = /^--[a-z0-9_-]{1,40}$/i;

const color = (v: string | null | undefined) => (v && COLOR.test(v.trim()) ? v.trim() : null);
const family = (v: string | null | undefined) => (v && FAMILY.test(v.trim()) ? v.trim() : null);

export type Measured = {
  title: string;
  background: string | null;
  foreground: string | null;
  fontBody: string | null;
  fontHeading: string | null;
  radiusRem: number | null;
  shadow: string | null;
  pattern: string | null;
  candidates: { color: string; where: string }[];
  tokens: { name: string; value: string }[];
};

/** Token names that say what the colour is *for*. A site can declare hundreds of
 *  custom properties; these are the two dozen worth showing. */
const MEANS =
  /(^|-)(background|bg|surface|canvas|foreground|fg|text|copy|primary|brand|accent|secondary|destructive|danger|error|negative|border|ring|muted|card|popover|link|button|btn)(-|$)/i;
/** Atomic-CSS builds emit names like `--sx-1gm0lru`, which tell us nothing. */
const HASHED = /^--[a-z]{0,4}-?[a-z0-9]*\d[a-z0-9]{4,}$/i;

function rank(tokens: { name: string; value: string }[]) {
  return tokens
    .map((t, i) => ({ t, i, score: (MEANS.test(t.name) ? 2 : 0) - (HASHED.test(t.name) ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, 28)
    .map((x) => x.t);
}

export function safeMeasured(raw: RawMeasured): Measured {
  const num = Number(raw.radiusRem);
  return {
    // Printable ASCII only, one line, short: a title is a label here, nothing more.
    title: String(raw.title ?? "")
      .replace(/[^\x20-\x7e]/g, "")
      .slice(0, 80)
      .trim(),
    background: color(raw.background),
    foreground: color(raw.foreground),
    fontBody: family(raw.fontBody),
    fontHeading: family(raw.fontHeading),
    radiusRem: Number.isFinite(num) && num >= 0 && num <= 4 ? Math.round(num * 1000) / 1000 : null,
    shadow: raw.shadow && SHADOW.test(raw.shadow.trim()) ? raw.shadow.trim() : null,
    pattern: ["none", "gradient", "repeating", "image"].includes(String(raw.pattern))
      ? String(raw.pattern)
      : null,
    candidates: (raw.candidates ?? [])
      .map((c) => ({
        color: color(c.color),
        where: String(c.where ?? "")
          .replace(/[^\w ]/g, "")
          .slice(0, 24),
      }))
      .filter((c): c is { color: string; where: string } => c.color !== null)
      .slice(0, 8),
    tokens: rank(
      (raw.tokens ?? [])
        .filter((t) => TOKEN.test(String(t.name ?? "")) && color(t.value))
        .map((t) => ({ name: t.name.trim(), value: t.value.trim() })),
    ),
  };
}

/** The measurements, as a block the model can read. Marked as data on purpose. */
export function measuredBlock(m: Measured): string {
  const lines: string[] = [];
  const add = (k: string, v: string | number | null) => v !== null && lines.push(`${k}: ${v}`);
  add("page title", m.title || null);
  add("body background", m.background);
  add("body text colour", m.foreground);
  add("body font family", m.fontBody);
  add("heading font family", m.fontHeading);
  add("median control border-radius", m.radiusRem === null ? null : `${m.radiusRem}rem`);
  add("most common panel box-shadow", m.shadow);
  add("page background-image", m.pattern);
  if (m.candidates.length) {
    lines.push(
      `filled controls and links, largest first: ${m.candidates
        .map((c) => `${c.color} (${c.where})`)
        .join("; ")}`,
    );
  }
  if (m.tokens.length) {
    lines.push(
      `CSS custom properties declared on :root: ${m.tokens.map((t) => `${t.name}=${t.value}`).join("; ")}`,
    );
  }
  return lines.join("\n");
}
