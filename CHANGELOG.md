# Changelog

Versions describe the **exported kit**, not this repository. Bump when the
exported CSS changes meaning — new tokens, different derivations, rules that
behave differently. A new preset changes values, not the contract, and does
not earn a bump.

The source of truth is `src/lib/version.ts`. `npm run kit` stamps it into the
package, both registry items, and the stylesheet as `--kit-version`.

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
