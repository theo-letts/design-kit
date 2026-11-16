# Changelog

Versions describe the **exported kit**, not this repository. Bump when the
exported CSS changes meaning — new tokens, different derivations, rules that
behave differently. A new preset changes values, not the contract, and does
not earn a bump.

The source of truth is `src/lib/version.ts`. `npm run kit` stamps it into the
package, both registry items, and the stylesheet as `--kit-version`.

## 0.2.1

**The stylesheet now works on its own.** 0.2.0 shipped the preset's rules and
left out the values they read, and nothing here could show it: the canvas sets
every variable inline and scopes its outline rules one attribute deeper than
the export does. Both fixes are to `toCss`, so they reach `kit/*.css`, the
copied brief and the Get Code dialog alike. The registry item already carried
the variables and is unchanged apart from its version.

- **Fixed** `--border-width`, `--shadow-card`, `--shadow-button`,
  `--tracking-heading` and `--weight-heading` being read by the sheet and never
  defined in it. An undefined `border-width: var(--border-width)` is not "no
  border": it resets to `medium`, so cards, inputs and outline buttons drew
  3px strokes, and headings lost their tracking and weight. They are now in
  `:root`, from the same function the canvas uses.
- **Added** the elevation ladder, `--elevation-0` to `--elevation-3`, when a
  kit sets one. `.dark` repeats only the rungs whose tint differs.
- **Fixed** `border-style` never being declared. Tailwind's preflight sets
  `border: 0 solid` on every element, so inside a Tailwind build a width was
  enough; on its own the sheet set a width over the initial `border-style:
none`, which draws nothing at any width. Cards, alerts and every bordered
  control had no border — and because the Offset treatment still painted its
  drop, what showed was a hard coloured L hanging beside an edge that was
  never drawn. Surfaces and bordered controls now say `solid` themselves.
- **Fixed** `--outline-ink-destructive` applying only to
  `[data-slot="button"][data-variant="destructive"]`. A destructive alert or
  card kept the brand stamp against a red edge — green on red, on a status
  page built from exactly those surfaces. Any element carrying
  `data-variant="destructive"` now takes the matching ink, and
  `data-tone="destructive"` is the opt-in for a surface with no variant of
  its own.
- **Fixed** the outline axes being overwritten by the preset's own rules. The
  two name the same selectors at the same specificity and the preset came
  last, so Offset cards kept their coloured stroke and lost the drop; Hairline
  and Double lost their widths, Ring and Lit their inset strokes, and Hairline
  outline buttons their 0.5px. The outline rules now follow the preset.

- **Fixed** the registry item carrying only part of the kit. `npx shadcn add`
  installed the tokens, the case rules, the motion rule and the outline
  treatment, and silently left out the preset's structure rules and the whole
  mobile layer — so that route gave you a 1px stroke whatever the preset said,
  no card or button shadow, no heading tracking or weight, no 44px touch
  targets and no scrolling tab strip. It now carries the same rules as the
  stylesheet, in the same order.

If you copied 0.2.0 and patched around this, delete the patch: a second
definition of these variables after the import would now override the kit's.
If you installed 0.2.0 or an early 0.2.1 as a registry item, re-add it: the
missing rules do not arrive on their own.

## 0.2.0

**The kit now transfers.** Before this, consumers received the variables of a
style preset and none of the rules that read them: `--border-width`,
`--shadow-card`, `--tracking-heading` and `--weight-heading` were applied only
in this app's own stylesheet. A preset with 2px borders and a hard offset
shadow arrived as neither.

- **Added** `success`, `warning` and `info` tokens with foregrounds, derived
  from the palette. shadcn ships only `destructive`, which is how four
  products end up with four greens.
- **Added** a mobile contract that ships with the theme: 44px touch targets on
  coarse pointers, rows and tables that scroll instead of clipping, long
  tokens that wrap, dialogs that arrive from the bottom.
- **Added** a second registry item carrying `ui.tsx`, `icons.tsx` and
  `utils.ts`, so component work is no longer stranded in this repo.
- **Added** `--kit-version`, so a consumer or an agent can tell what they have.
- **Changed** every derived colour to meet contrast: `--input` and `--ring`
  now clear 3:1 for non-text contrast, and every text pair clears 4.5:1.
  Destructive-on-dark was 4.47 — a fail by 0.03, invisible without a number.
- **Changed** the type variables to Tailwind's own names. `--mono` and
  `--type-*` were private indirections, so an exported theme carried names no
  consumer reads and the type scale silently did nothing.
- **Fixed** an input inside an input group drawing a second bordered box
  inside the group's.
- **Fixed** a destructive button stamped in the brand colour under the Offset
  outline, and every button in a segmented control casting its own drop.

## 0.1.0

First export: the shadcn token contract in both modes, the style presets, and
the axis rules, as a stylesheet and a `registry:theme` item.
