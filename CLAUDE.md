# design-kit

A theming kit for Tailwind v4 and shadcn/ui. Four pages built from one engine,
and an exportable package in `kit/`.

## Commands

```bash
npm run dev          # the four pages
npm run ci           # types, tests, format, build — run before committing
npm run kit          # regenerate kit/ (needs the dev server running)
npm run film         # visual gate, 7 axis probes
npm run film:kits    # visual gate, every kit in both modes (45 frames)
```

## How it is put together

A config is a set of independent axes — colour, type, shape, motion, case,
size, border, outline. `src/lib/theme.ts` turns one into CSS variables.
Everything else is generated from those: `outline.ts`, `wording.ts`,
`structure.ts`, `mobile.ts` each export a function that produces rules, and
**both the live canvas and the exported stylesheet call the same function**.
That is the rule to preserve: if you add a rule that styles components, put it
in a generator, not in `index.css`. A rule that lives only in `index.css` does
not reach anyone who installs the kit — which is how the style presets shipped
as variables with nothing reading them.

Kits are files in `src/kits/`, globbed. Adding one means writing a file.
`green-3` is the house kit — `HOUSE_KIT_ID` in `src/kits/index.ts`.

## Before you change a colour derivation

Run `npm test`. 390 of the 414 tests are contrast checks across every kit in
both modes. They exist because five real failures were invisible without a
number: destructive-on-dark at 4.47 looks exactly like 4.53.

## The visual gate

It screenshots `.themed` and compares at zero tolerance. When it fails, **read
the diff image before re-baselining**. Measure where the changed pixels are:
a few tight bands is a real change, a hundred scattered small ones is text
re-shaping because a webfont had not landed. Re-baselining a flake bakes it in.

It is not fully deterministic. Roughly eight runs in ten are clean; the rest
are that font race. `film/fonts-cache` holds the faces so only the first run
on a machine fetches them.

## Conventions

- Comments explain _why_, especially where the obvious approach was wrong and
  what happened when it was tried. Several are the only record of a bug.
- `kit/` is generated but committed, because the registry route serves it from
  the repo. CI regenerates it and fails on a diff.
- Prettier is the formatter. ESLint is not installed: `typescript-eslint` caps
  at TypeScript 6 and this is on 7.
