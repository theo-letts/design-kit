# Design Kit

A local take on [ui.shadcn.com/create](https://ui.shadcn.com/create): a live component
canvas on the right, the knobs that drive it on the left — plus a dropzone that reads
those knobs off a screenshot, or off any URL, which the original doesn't do.

## Four products, one engine

The repo builds four pages from the same theme code:

|                | What it is                                                                                                  | Where                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Remixer**    | The full tool: every axis in the sidebar, screenshot and URL matching, the code export. For _making_ a kit. | `/` → `src/App.tsx`                      |
| **Specimens**  | The sheet on its own, with a kit picker and nothing else. For _looking at_ a kit.                           | `/specimens.html` → `src/Viewer.tsx`     |
| **Studies**    | A sandbox of small self-contained pieces, each shown beside its own source. For _keeping_ a thing you made. | `/studies.html` → `src/StudyGallery.tsx` |
| **Design Kit** | The house kit on the full set, with nothing to turn. For _showing_ someone the system.                      | `/kit.html` → `src/DesignKit.tsx`        |

All four render through `src/components/ThemedCanvas.tsx`, which owns the token
variables, the font loading, the duotone filter and the generated outline and
behaviour rules. Neither page can drift from the other, because there is only one
path onto the screen — the extraction was checked against the visual gate, which
passed unchanged at zero tolerance.

The viewer has no controls on purpose. A kit is not tuned there; it is a file in
`src/kits/`, edited and reloaded. The picker is the only decision on screen,
`←`/`→` steps through, and the chosen kit is in the URL so a particular view can
be linked to.

**Save as kit** closes the loop between the two. Tune a theme in the remixer,
name it, and the dev server writes `src/kits/<id>.ts` — one file per kit, which
`index.ts` collects with a glob, so saving needs no edit to an array and no
import to remember. The endpoint is dev-only and writes nothing but that folder:
the name is slugged to `[a-z0-9-]` before it ever touches a path, the resolved
file is checked to be inside the folder, and the config is validated down to
each colour being a real oklch triple — because every kit file is imported by
the glob, so one malformed kit would take down both products on the next
reload.

## Run it

```bash
npm install
npm run dev
```

Then give the sidebar something to match:

- **a screenshot** — drop it in, or hit ⌘V anywhere with one on the clipboard;
- **a URL** — type it into the field under the dropzone, paste a link with ⌘V, or drag a
  tab onto the panel.

The whole canvas retints immediately.

The Design Kit page deliberately has no kit picker. A picker invites a comparison, and
the point of that page is that this is the one — it reads the house kit from
`HOUSE_KIT_ID` and renders it. It is the page to send someone who asked what the design
system looks like; `npm run kit` is what you send them when they want to use it.

## Taking the kit elsewhere

```bash
npm run kit
```

Writes the house kit — **Green 3** — to `kit/` as a drop-in stylesheet, with the faces it
self-hosts and their licences beside it. It drives the running app to do it, the same way
the visual gate does, so `npm run dev` has to be up; the generators are TypeScript with
extensionless imports that node will not load, and reimplementing them in the script is
exactly how a build output starts lying about the thing it came from.

It takes the house kit by default. `--kit <id>` exports a different one and `--out <dir>`
puts it somewhere else, but the point of the command is the one kit you actually ship.

`kit/` is a package, not a folder to copy — though copying still works. It carries:

|                         |                                                                              |
| ----------------------- | ---------------------------------------------------------------------------- |
| `green-3.css`           | The whole theme: `@font-face`, both modes, and every rule the axes generate. |
| `registry/green-3.json` | A shadcn `registry:theme` item, for `npx shadcn add <url>`.                  |
| `package.json`          | `exports` for `./theme.css`, `./fonts/*` and the registry item.              |
| `fonts/`                | The self-hosted faces and their licences.                                    |

The registry item is the interesting one, because shadcn merges it into the consumer's
own `globals.css` rather than appending a sheet. Three things had to be true for it to
work anywhere but here:

- **The names are translated.** This project maps some of its own onto Tailwind's inside
  an `@theme inline` block — `--font-mono` reads `--mono`, every `--text-*` reads a
  `--type-*`. A consumer has no such block, so shipping the internal names would ship
  variables nothing reads and the type scale would arrive and quietly do nothing.
- **The buckets are different things.** `cssVars.theme` is for tokens that generate
  utilities, so it holds the fonts, the radius, the spacing and the text scale with its
  line-height pairs. Everything the kit invented for its own rules — stroke widths, the
  shadow ladder, the motion pair, the Offset inks — goes to `:root` in `css`, because it
  generates nothing.
- **`cssVars` takes bare names and `css` does not.** Mixing them writes `shadow-card: …`
  into a stylesheet, which is not a declaration at all and fails silently.

Two things the item says out loud in its `docs`, because both reach past the kit's own
components: the self-hosted faces cannot travel in a registry item, which carries CSS and
not binaries; and the body case axis, unscoped, compiles to `:root, *`, so installing this
kit recases the consuming app.

### Versions

`src/lib/version.ts` is the single source. `npm run kit` stamps it into the package, both
registry items, and the stylesheet itself as `--kit-version`, so a consumer — or an agent
reading their CSS — can tell which build they have without asking anyone. Bump it when
the exported CSS changes _meaning_: new tokens, different derivations, rules that behave
differently. Not for a new preset, which changes values and not the contract.

It used to live in `kit/package.json` and be read back each run so regeneration would not
reset it. That worked and was the wrong place — the folder is output, so the one number
nobody could regenerate was being kept in the thing that gets deleted and rebuilt.

### The supported route

**The registry, with npm as the backstop.** Two items, and the theme depends on the
components, so `npx shadcn add .../green-3.json` brings both:

|                           |                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `green-3.json`            | `registry:theme`. Tokens, the style preset's rules, the axis rules, the mobile contract. |
| `green-3-components.json` | `registry:ui`. `ui.tsx`, `icons.tsx` and `utils.ts`, with npm dependencies declared.     |

The components item exists because CSS cannot carry a sliding tab indicator, a panel that
opens at its own height, or a table that scrolls. A shadcn consumer owns their copy of
every component, so without it every change to `ui.tsx` is stranded in this repo. It
ships the files whole: `ui.tsx` is one 2,300-line module, and splitting it is worth doing
for its own sake rather than as a prerequisite for shipping it.

### Publishing

Everything is ready except the two things that need your accounts. In order:

```bash
git remote add origin git@github.com:<you>/design-kit.git
git push -u origin main
```

Then replace `REPLACE-ME` in `package.json` and in `scripts/kit.mjs` with your owner
name, and run `npm run kit` so the published package carries the right repository URL.

`kit/` is committed on purpose, which is unusual for generated output and is what makes
the registry route work without hosting anything: the files are served straight from the
repository.

```
https://raw.githubusercontent.com/<you>/design-kit/main/kit/registry/green-3.json
```

Committed output goes stale, so CI regenerates it and fails on a diff.

For npm, the package is `kit/`, not this repository — this one is the tool:

```bash
npm run release     # regenerates, then publishes from kit/
```

Bump `src/lib/version.ts` first, and add the entry to `CHANGELOG.md`. Nothing propagates
to any product until one of these exists; every consumer today holds a snapshot with no
way back to you.

## How a reference is read

Two paths, tried in that order:

1. **Claude vision** — if a key is set, the image is sent to `claude-opus-5-5` through a
   dev-server-only endpoint (`server/vision-plugin.ts`) and comes back as structured
   tokens: colors, light/dark, corner radius and the closest matching typefaces. The key
   stays on the server; the browser never sees it.

   Put it in `.env.local` at the project root (gitignored, see `.env.example`):

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

   Then restart `npm run dev` — the startup banner tells you which path is live. An
   exported env var wins over the file, so this works too:

   ```bash
   ANTHROPIC_API_KEY=sk-ant-... npm run dev
   ```

2. **Local pixel extraction** — with no key, `src/lib/extract.ts` does the colour half
   in the browser: it downscales the image, buckets pixels in OKLCH, takes the page
   background from the outer frame of the shot, body text from the highest-contrast
   colour that still covers real area, and the brand colour from the most saturated one
   that does. No network, no key, instant. Radius and fonts stay where you left them.

Either way the reference lands in the sidebar as an ordinary config — five colours,
plus the nearest **style** when Claude reads the corner radius. From there
`src/lib/theme.ts` expands it into the full shadcn token set — cards, muted, borders,
ring, five chart colours, sidebar — and synthesises the opposite mode, so a dark
screenshot still gives you a sane light theme (and vice versa).

## Shipped typefaces

Two families are served from `public/fonts` rather than fetched from a CDN, both
under the SIL Open Font License 1.1, with their licence and authors files beside
them:

- **Paper Mono** — [paper-design/paper-mono](https://github.com/paper-design/paper-mono). One variable file, Thin to ExtraBold.
- **The Sunday Paper** — [dennisgrauel/The-Sunday-Paper-fonts](https://github.com/dennisgrauel/The-Sunday-Paper-fonts), the font library of an independent publication: Sunday Masthead, Protest Marker, TB Hand, AC Hand and Collaborative.

`@font-face` does not fetch anything until a family is actually used, so all of
them are declared once at startup from `src/lib/fonts.ts` and only the ones a
theme selects are downloaded. That one source also feeds the export, so a kit
cannot hand over a face the app renders differently.

The repo's README says Masthead resolves "only the characters used in the
masthead" and Protest Marker "only A–Z". That is out of date: tested
character by character against a fallback, all five carry A–Z, a–z, 0–9 and
common punctuation. They are still drawn rather than fitted for running text,
which is why the **Sunday** kit sets the masthead for headings and leaves the
body to Paper Mono.

## Palettes

Ten collected palettes are built in, under **Colour → Palette** in the sidebar and
in the command palette (⌘K) under _Palette_. Each is stored in `src/lib/palettes.ts`
as the hexes it was picked as, with the swatch names kept.

A palette has five colours and the theme has five colour slots, but they are not
mapped one to one. Background and foreground are a contrast pair, not free choices,
so a palette only fills the slots it can fill honestly: palettes with no neutral —
Forest Signal, Electric Flag — land on primary, accent and destructive and leave the
page colour you already have.

Two things are worth knowing before adding more. `accent` is not a second brand
colour: `theme.ts` mixes it 22% into the background to make hover and selected
surfaces, so a fluorescent put there comes back as a pale tint. The colour a palette
is known for belongs on `primary`. And a palette that brings its own ground must
bring its own ink — `buildTheme` decides which mode the colours describe by measuring
the background, so a dark background beside a light-mode foreground is read as one
dark side, with near-black type on near-black paper. Where a dark palette has no
light neutral to offer, `applyPalette` derives the ink with `readableOn`. That is the
only value in the whole feature that is not a hex off a swatch.

Two palettes fill fewer than five slots for the opposite reason to Forest Signal.
Gunmetal Bone is five neutrals with no chromatic colour at all, so `destructive` is
the slot it cannot fill and keeps whatever red you had. Coral Sea has two chromatic
colours and puts the one it is named for on `destructive`, not `primary`: an
orange-red is read as a warning before it is read as a brand.

Four palettes are also saved as kits — Tomato Slate, Neon Slate, Brown Red and
Blazing Black — each with its own type and shapes rather than just colour.

## Studies

The remixer tunes a theme and the specimen sheet proves it on the standard set.
Neither is anywhere to try something that is not a shadcn component yet, which is
what `/studies.html` is for: small self-contained pieces, each running in whichever
kit you pick, each sitting next to the file that drew it.

Adding one is writing a `.tsx` in `src/studies/` — the index globs the folder the
same way `src/kits/` is globbed, so there is no array to edit. Restart the dev server
afterwards: Tailwind's scan does not always notice a brand-new file, and the symptom is
not an error but a few classes silently doing nothing — a `max-w-3xl` that computes to
`max-width: none` while every class the rest of the project already uses works fine.

The part worth knowing is how the code gets on screen. Each file is globbed **twice**:
once as a module for the component, and once with `?raw` for its text. The panel shows
the second one. That is deliberate — a hand-written snippet beside a live component is
one edit away from being a lie, and the only code that cannot go stale is the file that
drew what you are looking at.

A study file ends with five lines of metadata that are no use in your project, so each
one brackets the part that is:

```tsx
/* --- study:start --- */
export function Halftone(...) { ... }
/* --- study:end --- */
```

Without the markers you get the whole file — wrong, but never misleading.

Three to start with, and all three answer the pointer.

**Halftone** screens any function of x and y into one ink, two ways.

The default is **dither**, which is what the reference actually does. Looked at closely —
a 150px crop of the video blown up — its pictures are square cells on an axis-aligned
grid, all the same size, and the tone is carried by how many are on: mid-tone comes out
as an exact checkerboard, shadows as solid runs pocked with single white holes,
highlights as isolated squares. That is an ordered dither against a Bayer threshold map,
not a halftone, and no amount of tuning dot radius gets you there. The grid stays
axis-aligned because rotating a dither destroys the lattice that makes it legible.

**dots** is the printer's halftone, kept as the alternative: circles on a 45° grid whose
_area_ carries the tone. Radius goes as the square root of coverage, because area is what
the eye integrates — screen a linear ramp without that and the midtones come out a full
stop too dark — and the grid is turned 45° because a round-dot grid set square-on reads
as rows and columns before it reads as a picture.

A drawing read back through `fieldFromDraw` is _binary_: 1 inside the shape, 0 outside. A
dither has nothing to say about that, and the first pass came out as solid blobs with
ragged edges. `shade()` ramps coverage across the shape along the light, which is what
gives the lattice something to express — and it keeps a floor, or the far side drops out
and takes the silhouette with it.

The
pointer _is_ the light — its position maps onto the sphere and z is derived from the
other two, so the terminator sweeps across the face. Picking a fixed z instead points the
light at the camera near the middle and the moon flattens into a ring, lit centre and
dark rim, which is what the first version did. A click sends a ring through the screen:
a narrow gaussian band travelling outward, thickening whatever it crosses.

It draws to a **canvas**, and the motion is the reason. A fine screen is a couple of
thousand dots; as SVG that is a couple of thousand DOM nodes to diff every frame, which
is comfortably over budget at 60fps. The light eases toward the pointer one lerp per
frame — that lerp is the whole of the "follow" feeling — and the loop stops as soon as
nothing is moving, so an idle study costs no frames. Canvas has no cascade, so the
component reads the resolved `color` off itself each frame: that is what keeps it on the
theme's ink rather than a hard-coded blue.

**Odometer** rolls digits by sliding a column of static glyphs behind a one-line window
— nothing animates the number. It rolls the way the value went, which needs a strip
running past both ends of 0–9: 9 counting up lands on the spare 0 above it rather than
winding backwards through 8, 7, 6, and the reel is put back inside the real range with
the transition off, invisibly, before it moves again. Drag across it, or focus it and
arrow.

**Dot Meter** reads a value as a count rather than a length, so it survives widths where
a bar has collapsed to a sliver. Unlit dots sit small and faint, so lighting one is a pop
rather than a fade, and the stagger counts out from the frontier rather than from dot
zero — counted from the start of the row, the whole meter lags behind your drag.

They take their ink from `currentColor` and their timing from `--motion-duration`, so a
study restyles with the kit instead of carrying its own palette, and each carries its own
`prefers-reduced-motion` check rather than importing one, so it pastes into a project
whole.

**Front Page** is the one that uses the others. It is a newspaper set in a single ink —
masthead, rules, two columns of real text — where every picture is a few arcs drawn into
an offscreen canvas and read back as coverage by `fieldFromDraw`. No images, no assets. A
newspaper got its range from dot size rather than from more inks, and that constraint is
what holds the page together.

Its first version was unreadable and the drawings were not the reason. At pitch 6 on a
150px canvas a duck is twenty-five dots across and stops being a duck; rendered solid,
the same path was obviously a duck all along. The screen has to be fine enough that you
read the picture before you read the dots, which here is a pitch of 4. When a screened
drawing fails, check the pitch before you redraw it.

It is also the one study that imports another, which is the point of a primitive. The
code panel shows one file, so that import is a dangling reference if you paste it
somewhere without `halftone.tsx` — the file says so at the top.

One thing the gallery had to give up: arrows step between studies, but two studies now
want their own arrow keys. The stage keeps them — anything that already called
`preventDefault`, and anything focused inside the canvas, is left alone. Without that,
arrowing a slider inside a study silently changes which study you are looking at.

One wrinkle worth recording: the page component is `StudyGallery.tsx`, not `Studies.tsx`.
macOS matches filenames without case, so a page at `src/Studies.tsx` and a folder at
`src/studies/` are one path as far as the resolver is concerned — `@/studies` then lands
on the page importing itself, and writing the second file silently overwrites the first.

## Matching a URL

A picture of a site is a lossy record of it. The site itself is not — so a URL takes a
different route (`server/capture.ts`): the dev server drives the Chrome already on the
machine through `playwright-core`, loads the page at 1280×820, waits for webfonts to
settle, and then asks the page about itself before taking the shot.

What comes back is measured, not guessed:

- the body background and text colour, walking up from `<body>` to the first surface
  that actually paints something;
- the real font families, from `getComputedStyle`, so "sohne-var" or "GeistSans" are
  names rather than impressions of letterforms;
- the median corner radius across visible controls — filtered to the ones the author
  actually dressed, since a bare `<input>` inherits 0 and would drag the median under
  every real button;
- the largest filled buttons and link colours, area-weighted, because a 4px coloured dot
  is not the brand colour;
- the site's own `:root` custom properties, when it has any. Ranked by whether the name
  says what the colour is _for_ (`--primary`, `--background`, `--destructive`) and
  against names that look machine-generated, then capped at 28.

The screenshot and those measurements go to Claude together, with the measurements
marked as facts and the picture as context for them. That is what lets `ui.shadcn.com`
come back as Geist with shadcn's own `#e7000b` destructive red rather than a plausible
near-miss.

Three details worth knowing:

- **The kit's light/dark toggle is sent with the request.** A site that only goes dark
  behind `prefers-color-scheme` would otherwise always be captured light.
- **`localhost` is allowed on purpose**, and a bare local host defaults to `http`, not
  `https` — pointing the kit at the app you are building on `:3000` is the best reason
  for this to exist.
- **A page is untrusted input.** Its title, font names and custom-property values are
  author-controlled strings about to be pasted into a prompt, so `server/measured.ts`
  checks every one against a shape — colour, family name, token name — and drops what
  doesn't match rather than escaping it. A font family with a newline in it is not a
  font family.

If the capture succeeds but the reading fails, the screenshot still comes back and the
browser extracts colours from it locally — so URL matching works without a key too, just
without the type and radius.

## What the sidebar does

Colour and shape are separate axes, the same split the original makes.

| Control                         | What it changes                                                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Style**                       | The shape language — radius, spacing, border weight, shadow, heading tracking. Eight of them: Nova, Vega, Maia, Lyra, Mira, Luma, Sera, Rhea. |
| **Base Color**                  | The neutral ramp behind surfaces, borders and text: Neutral, Stone, Zinc, Mauve, Olive, Mist, Taupe.                                          |
| **Theme**                       | The brand hue, 17 of them plus Neutral.                                                                                                       |
| **Chart Color**                 | How `chart-1..5` fan out: Neutral, Analogous, Complement, Spectrum.                                                                           |
| **Heading / Font / Mono**       | Typefaces for headings, body and code, picked separately.                                                                                     |
| **Type Scale**                  | Base size, ratio and leading: Compact, Default, Comfortable, Editorial.                                                                       |
| **Heading / Label / Body Case** | How the wording is cased, on three separate axes.                                                                                             |
| **Heading / Label / Body Size** | A nudge on top of the type scale, per group.                                                                                                  |
| **Elevation**                   | The shadow ladder: Default, Flat, Soft, Lifted, Dramatic.                                                                                     |
| **Interaction**                 | What a control does under the pointer: Flat, Lift, Press, Sink, Glow.                                                                         |
| **Entrance**                    | How overlays arrive: None, Fade, Scale, Rise, Spring.                                                                                         |
| **Radius**                      | Overrides the style's own rounding, or leaves it alone.                                                                                       |
| **Surface**                     | Solid lifts cards off the page, Subtle keeps them flush, Glass makes them translucent.                                                        |
| **Depth**                       | How deep the glass is: Frost, Blur, Deep. Only shown for Glass.                                                                               |
| **Tilt**                        | Knocks cards off axis: None, Nudge, Lean, Scatter.                                                                                            |
| **Motion**                      | How the theme moves: None, Snap, Smooth, Bouncy, Slow.                                                                                        |
| **Border**                      | How far the stroke sits from the page, and how much brand hue it carries.                                                                     |
| **Outline**                     | How a card's stroke is drawn, beyond its width. Eight treatments.                                                                             |
| **Button Outline**              | The same question for buttons, which are a different shape of problem.                                                                        |
| **Custom colors**               | The five raw colours underneath. A screenshot writes straight into these.                                                                     |

A style is nothing but CSS variables — `--radius`, `--spacing`, `--border-width`,
`--shadow-card`, `--tracking-heading`. Components pick them up through `data-slot`
hooks, the same seams real shadcn/ui components expose. `--spacing` is the one
Tailwind v4 computes its whole spacing scale from, so density comes along for free.

Those hooks outrank the components, which is a trap worth knowing before you add one.
`.themed [data-slot="input"]` is (0,2,0); a Tailwind arbitrary variant like the input
group's own `[&>input]:border-0` is (0,1,1). So the kit's border-width rule won, every
input inside a group kept a border the group had explicitly removed, and — since
nothing ever took off its radius or shadow either — a search field drew a second
rounded rect inside the first, with the seam showing against the addon. A group owns
its box; the rule that says so has to be specific enough to say it.

## Textures

> **Off for now.** The texture and backdrop axes are switched off across the kit:
> no preset sets one, the shuffle never picks one, and the controls are out of the
> sidebar and the command palette. The generators, the CSS and the export path below
> are all still here and still work — `pageTexture`, `cardTexture` and `backdrop` are
> still on `Config`, defaulting to `None`. Nothing covers them while they are off:
> the gate drives the app through a stored config, and the `OFF` guard clears that
> config on load, so a gate state asking for a texture films one without. Switching
> them back on means three places: the rows in `Sidebar.tsx`, the shuffle lines in
> `App.tsx`, and that guard.

A texture is three CSS values — an image, a size and a blend mode — so the whole axis
exports as a handful of lines on `body`. There is no overlay element and no stacking
context to fight with, because the image is blended into the surface's own background
colour.

Page and card are **separate layers**. A grained page under clean cards is a
different look from grain on both, and neither is reachable from a single axis.

The page itself takes **two** textures: a colour field and a grain stacked over it.
Nearly every reference background is that pair — a mesh or gradient with a tooth over
it — and one slot can only ever give you half of it. Stacking concatenates four lists
(image, size, position, blend) in step; CSS cycles a short list rather than erroring,
which silently misaligns every layer after the first, so each texture now carries one
position entry per image layer.

Two families:

- **Geometric** (dots, grid, hatch, mesh, halftone) bake the theme's own colour into
  the gradient stops, so they retint when the palette moves — including when a
  screenshot rewrites it.
- **Noise** (grain, paper) are colourless SVG tiles that take their colour from
  whatever they sit on. The tiles are small and repeat; running `feTurbulence` across
  a whole page is slow, so it runs once per 128px tile instead.

Blend modes are chosen per mode — `multiply`/`overlay` reads as ink on paper in light,
and turns to mud in dark, where `soft-light` is used instead.

**Dither** is a real 8×8 Bayer matrix, built recursively rather than pasted in, and
Strength is the threshold — so the dial controls how many cells are lit, which is the
thing that actually varies in an ordered dither.

## Glass and tilt

**Glass** is a third Surface. It makes cards and popovers translucent _and_ blurs what
is behind them — a `backdrop-filter` behind an opaque colour does nothing but cost a
compositing layer, so the token carries alpha too. It needs something behind it worth
blurring: pair it with Mesh or a page texture, or it just reads as a lighter card.

**Depth** bundles the blur and the fill, because the pair is what reads: a heavy blur
behind an opaque fill is wasted, and a transparent fill with a light blur just looks
washed out. At `Deep` the blur does the work and the tint barely registers.

**Tilt** knocks cards off axis. Every other axis here is a token, but rotation is
per-element: one angle on every card reads as a broken page rather than a deliberate
one. So the angle comes from a fixed nine-step sequence of multipliers, stable across
re-renders — `Math.random` would reshuffle the page on every keystroke. Angles stay
under 2°, past which neighbouring cards start to overlap, and the whole thing is off
under `prefers-reduced-motion`.

Both export as their own small rule blocks rather than as variables, and a theme with
neither switched on exports exactly what it did before they existed.

## Backdrop

> **Off for now.** The texture and backdrop axes are switched off across the kit:
> no preset sets one, the shuffle never picks one, and the controls are out of the
> sidebar and the command palette. The generators, the CSS and the export path below
> are all still here and still work — `pageTexture`, `cardTexture` and `backdrop` are
> still on `Config`, defaulting to `None`. Nothing covers them while they are off:
> the gate drives the app through a stored config, and the `OFF` guard clears that
> config on load, so a gate state asking for a texture films one without. Switching
> them back on means three places: the rows in `Sidebar.tsx`, the shuffle lines in
> `App.tsx`, and that guard.

Procedural textures generate a pattern from your palette. A backdrop does the opposite:
it takes an image and maps _its_ luminance onto two of your inks. **Duotone** reduces
the image with an SVG `feColorMatrix`, then runs an `feComponentTransfer` table from
`background` to `primary` — so the image is tinted in your own theme, and retints when
the palette moves.

Three things worth knowing:

- The backdrop needs its own layer. `filter` applies to an element's descendants, so
  greyscaling the canvas itself would take the UI down with it — hence a `::before`.
- The filter is **markup, not CSS**. `filter: url(#id)` only resolves against a filter
  that is in the document, so **Get Code** hands you the SVG as its own step.
- `Clouds` and `Ridges` are generated SVG, so they work offline and need no asset
  pipeline. `Custom` takes any image URL or data URI.

## Border

The border was the one colour with no control at all. It is _derived_ — a mix from the
page toward the ink, 11.5% of the way in light and 16% in dark, or more under Subtle
where flush cards lean on the stroke to separate them. That derivation is good, and it
is why borders come out warm on a warm page without anyone choosing it. What it could
not do is take an instruction.

Two axes, because they are genuinely separate questions.

**Border** is contrast: `Auto`, `Faint`, `Soft`, `Default`, `Strong`, `Heavy`. Auto
returns exactly the surface-aware numbers that used to be hard-coded, so a default theme
is untouched — the visual gate passed at zero tolerance, which is the point of keeping
it. The named steps are fixed instead, listed for light mode and scaled by 1.4 on the
dark side, because a dark page needs more separation for the same apparent strength.

**Border Tint** is hue: `Neutral`, `Hint`, `Tinted`, `Brand` — a quarter, a half, most of
the brand's chroma.

Tint keeps the border's **lightness exactly**, and that is the whole reason it is its own
axis. Mixing toward a dark brand would drag the stroke darker, so tinting would read as
"stronger" and quietly do the other axis's job. Only hue and chroma move: measured across
all four settings the lightness holds at 0.8955 while chroma goes 0 → 0.05 → 0.1 → 0.17.
A Neutral theme, whose brand has no chroma, correctly stays grey at every setting.

`--input` follows `--border`, as it did before.

## Outlines

Border _width_ is the least interesting dimension of a stroke, so the outline axis
covers the rest:

|              |                                                                                    |
| ------------ | ---------------------------------------------------------------------------------- |
| **Hairline** | True sub-pixel. Noticeably finer than 1px on retina.                               |
| **Ring**     | An inset ring instead of a border — hugs the radius, shifts no layout.             |
| **Lit**      | A highlight along the top edge and a shade along the bottom, as if lit from above. |
| **Gradient** | A masked stroke fading from bright at the top to nothing at the bottom.            |
| **Bracket**  | Corner marks only, like crop marks.                                                |
| **Double**   | A thick/thin pair, the way a broadsheet rules a column.                            |
| **Offset**   | A stroke and a hard shadow in one ink, dropped down and right.                     |

### Offset, and where its numbers come from

Offset is the one treatment with a colour of its own. The rest derive from `--border`
or a neutral mix; this one is deliberately chromatic, because a stamp in border grey is
just the Mira preset's shadow again. The ink and the drop are measured off the reference
rather than chosen:

- The stroke sits **26% of the way from the brand toward the page**, keeps **61% of the
  brand's chroma**, and stays on the **same hue** — within a fifth of a degree.
- The drop is **three times the stroke**, so it grows with the shape language instead of
  being a number that only suits one style.

Hue is carried across rather than interpolated. `mix()` takes the short way round the
wheel and a neutral page still has `h: 0`, so mixing a blue brand with a grey page
arrives in violet. With a Neutral theme the chroma is zero and the ink lands on grey,
which is the right answer rather than a fallback.

It replaces `--shadow-card` instead of composing with it the way Ring and Lit do. A card
is stamped to the page or floating above it; it cannot be both.

### Buttons

Buttons get their own axis. A card is always a bordered box, so every card treatment has
something to act on. A button is usually a _filled_ one — half the card treatments have
no stroke to work with and the other half act on the wrong thing. So each button
treatment says plainly which variants it touches:

|              |                                                                             |
| ------------ | --------------------------------------------------------------------------- |
| **Hairline** | Thins the stroke on outline buttons. Filled ones have none to thin.         |
| **Ring**     | The stroke moves inside the box, hugging the radius and adding no width.    |
| **Lit**      | A highlight above and a shade below — the one that suits a _filled_ button. |
| **Offset**   | The card's stamp, on a button.                                              |

Ghost and link are excluded throughout: a stroke at rest is the one thing they exist to
avoid.

Offset also redefines `--shadow-button`, which is what keeps the stamp under the pointer.
The interaction axis rewrites `box-shadow` on `:hover` and `:active`, reaching for that
token when it wants "whatever this button rests at". Lift and Glow still drop the stamp
on hover, and that is correct — a button rising off the page is no longer stamped to it.

Two implementation notes that are easy to get wrong:

- Gradient and Bracket draw on a `::after` overlay rather than the element's own
  background, because the **card texture layer already owns `background-image`**. On
  the element itself they would fight; on an overlay they compose.
- Brackets get their own colour token rather than `--border`. A continuous stroke reads
  fine at low contrast; eight 14px bars do not, and on a dark card they vanish.

`src/lib/outline.ts` generates the rules once and both the canvas and the export use it,
scoped differently — so what you see and what you paste cannot drift apart.

## Shaders

Three of the Backdrop options — **Drift**, **Flow** and **Caustics** — are fragment
shaders rather than images. A shader cannot be a token: it is a program writing pixels
into a canvas, not a value the browser can paint from. What makes it fit is that the
backdrop is already a separate layer behind the content, so swapping its CSS image for
a canvas changes nothing above it.

One full-screen canvas, DOM on top. A canvas per card would hit the browser's context
cap and take text rendering, selection and accessibility down with it.

What the implementation has to get right, in rough order of how easily it is missed:

- **The colour round trip has two halves.** Uniforms go in linearised so the mixing is
  physically correct, and the result must be written back as sRGB, because the default
  framebuffer is 8-bit and does no encoding. Do only the first half and everything
  renders far too dark.
- **Never call `WEBGL_lose_context` in cleanup.** The effect re-runs on the same canvas
  whenever the shader or palette changes — and twice on mount under StrictMode — and
  `getContext()` hands back the same, permanently lost, context.
- **Half resolution, viewport height.** A backdrop is about to be blurred and faded to
  a third; paying for every device pixel of a full scrolling board is waste. A
  zero-height sticky wrapper keeps the canvas on the viewport without taking layout.
- **Stop when nothing is looking** — `visibilitychange` and an IntersectionObserver.
  Under `prefers-reduced-motion` it renders a single frame and holds it.

The shader is the one thing that cannot ride in the CSS, so **Get Code** hands it over
as its own step.

## Motion

Duration and easing travel together as one choice, because the pair is what reads as a
character — a long duration on a sharp curve feels broken, and a short one on a bouncy
curve never gets to bounce. Two tokens, `--motion-duration` and `--motion-ease`.

Only elements that already declare a transition are retimed. Timing everything would be
worse than it sounds: `transition-property` defaults to `all`, so every colour the theme
changes would animate too. `prefers-reduced-motion` drops it to 1ms.

The axis is the switch for everything below, which is worth knowing before you debug a
missing animation: a kit saved with Motion **None** resolves every duration in the kit to
zero, so a sliding pill and a panel opening at its own height both simply cut. Green 3
was saved that way and is now Smooth.

### What moves, and why

|               |                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Panels**    | Accordion and collapsible open at the content's own height — a grid row going `0fr → 1fr`, the one thing CSS can interpolate that means "whatever height this turns out to be". No `max-height` guess to animate at the wrong speed, no JS measurement to go stale. The content stays mounted so there is something to animate, so it goes `inert` when closed. |
| **Tabs**      | One pill that moves, not a background that appears on a different button. A cross-fade between two boxes reads as two things; sliding one reads as the same thing going somewhere. It animates `left` and `width` rather than a transform, because scaling a bordered, rounded pill stretches its corners and its stroke.                                       |
| **The theme** | Colours, borders, shadows and radii interpolate when the tokens change. This is the one animation the remixer exists for — every slider is a colour change, and forty cards snapping between palettes reads as a reload rather than an adjustment.                                                                                                              |
| **Pages**     | The four documents cross-fade with `@view-transition`, so moving between tabs is one view becoming another instead of a white flash. Chrome only; everywhere else navigates as before.                                                                                                                                                                          |

Two things that look like details and are not. The theme transition lives in `@layer
base` on purpose: a blanket `transition-property` would otherwise outrank the utilities
— `transition-[left,width]` on the tab pill, `transition-[grid-template-rows]` on a panel
— and _replace_ them, stopping the two most visible animations in the kit. In the base
layer it only reaches elements that never declared one of their own.

And the specimen sheet deliberately does not key its canvas on the kit. Keying it
remounts every card on a kit change, and a remount cannot animate: the old cards are
destroyed and new ones appear already in their final colours. Without the key, switching
kits _morphs_, which is the comparison that page is for.

## Type

Three slots, not two. Real shadcn has `--font-mono` and this kit did not, so everything
the canvas sets in `font-mono` — invoice IDs, `Kbd`, the OTP boxes, the code sample in
the resizable pane — was falling through to whatever the OS called monospace, untouched
by the theme. `--font-mono` now maps through `@theme inline`, so Tailwind's `font-mono`
utility follows the sidebar.

**Paper Mono** ships with the project: one 52 KB variable `.woff2` covering Thin to
ExtraBold, self-hosted from `public/fonts/`. It is by Paper Design under the SIL Open
Font License 1.1, and `PaperMono-LICENSE.txt` sits beside it as that licence requires.
The other faces still come from the Google Fonts link in `index.html`.

That split matters for the export. A CDN face needs a link you already have; a
self-hosted one has no line to copy, so **Get Code** hands over the `@font-face` block
and tells you to drop the `.woff2` in your public folder — the third case, after the
duotone filter and the shader, of something that is not CSS alone.

## Case

Case is a typographic axis, not a content decision. Uppercase labels over title-case
headings is a whole house style; so is the all-lowercase one. The words in the
components never change — this is `text-transform`, so copy a heading out of the page
and you get the sentence back.

Headings, labels and body get separate axes, because the interesting settings are the
ones where they disagree. Five values each: **As written**, **Title**, **UPPER**,
**lower**, **Small Caps**.

- `capitalize` is per _word_, so it capitalises "a", "of" and "the" too. Real title case
  needs a stop-word list, and that is a content decision rather than a style one — hence
  **Title**, not Title Case.
- Caps are drawn to sit apart and jam when set solid, so UPPER adds 0.06em of tracking
  and Small Caps 0.05em, on top of whatever the style and scale already set.
- Small Caps is `font-variant-caps: all-small-caps`, which covers both cases at once.
  Most webfaces ship no small caps and the browser squashes capitals instead — lighter
  than the real thing, still legible.

The label axis covers labels, badges, buttons, eyebrows and table headers — the words a
UI uses about itself. **Body is not a list.** It is set on the canvas and on every
element inside it, and heading and label are overrides on top; a group left _As written_
while body is set follows the body, which is what "I set it all to lowercase" should
mean.

The first version did name five slots for body, and missed most of the page. A sheet is
mostly plain divs and spans, so a rule that waits for `data-slot` never reaches a stat
tile's "UPCOMING", a select's own option text, or the row labels in a summary. Two
separate reasons, both found by looking:

- An element carrying its own utility keeps it. An inherited value only applies where
  there is no declaration of its own, so the `uppercase` on a tile label beat it.
- Form controls do not inherit `text-transform` at all — the UA stylesheet sets `none`
  on `button`, `select` and `option`, so a nav button and every line of a dropdown stayed
  capitalised while the text beside them changed.

So the rule declares rather than inherits, with `.themed *`. Blunt, and that is the
point. Tracking stays on the root only — on `*` it would flatten every component's own
letter-spacing with it.

### What opts out

Some strings inside the canvas are content rather than wording, and casing them is a lie
rather than a style:

|                      |                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `input`, `textarea`  | What someone typed. An uppercase transform makes the box read SMITH@EXAMPLE.COM while the value is lowercase. |
| `code`, `pre`        | Code.                                                                                                         |
| `abbr`               | What the element is for.                                                                                      |
| `[data-case="keep"]` | Anything else that says so.                                                                                   |

That last one exists because `US$12.94` set lowercase reads `us$12.94`, which is not a
quieter way of writing the same thing — it is a currency mark spelled wrong. Nor is
`europe/london` a quieter `Europe/London`; it is a zone name that no longer resolves.
CSS cannot tell those from ordinary words, so the component has to say. `Combobox` takes
a `keepCase` prop for when its labels are identifiers rather than wording.

Two things to know when marking something. **Wrap the whole figure, not just the mark** —
kerning does not cross an element boundary, so splitting `US$12.94` after the `$` moves
the digits a fraction, which the gate caught at 0.001%. Digits have no case, so taking
them inside costs nothing. And **watch for flex parents**: `Badge` is an `inline-flex`
with `gap-1`, so marking part of its text turns the rest into a sibling flex item and the
gap opens a second space beside the real one. Wrap the whole run in one element instead.

Running text is the one place where case is a real risk rather than a flourish. UPPER
costs roughly a third of reading speed over a paragraph, because word shape is what the
eye matches and caps throw it away; **lower** keeps the shapes and only drops the
capitals, which is why the all-lowercase house style is the one that survives at length.
The axis offers all five and the picker says which is which — and the shuffle reaches
for body case a tenth as often as the other two, and never for UPPER.

**As written emits no CSS at all.** That matters more than it sounds: the eyebrow is
`uppercase` by design in `ui.tsx`, and a rule setting `text-transform: none` would
outrank that utility and quietly undo it. Emitting nothing leaves every component's own
casing alone, and the visual gate passed unchanged at zero tolerance for exactly that
reason.

## Size

The type scale sets one base and one ratio for the whole page. That is the right shape
for a scale and the wrong shape for an argument about whether the labels are too big, so
there is a nudge on top: **Smaller / Small / Default / Large / Larger**, per group.

It does not work the way the case axis does, and the first attempt that did was wrong.
`font-size: calc(1em * k)` looks like "whatever you are, times k", but `em` in
`font-size` resolves against the _parent_ — so it replaces the element's own size instead
of scaling it. A 12px badge inside a 16px card came out at 13.6px, larger than it
started, and every heading inside one parent would have collapsed to a single size.

So the multiplier lands on the scale's own steps, in JS, where each group keeps its
internal ratios and nothing compounds. The groups are steps, not selectors:

|             |                             |
| ----------- | --------------------------- |
| **heading** | `lg` `xl` `2xl` `3xl` `4xl` |
| **body**    | `base` `sm`                 |
| **label**   | `xs`                        |

`sm` is the seam: a label set in `text-sm` moves with the body rather than with the
labels, which is the price of mapping three groups onto one scale.

Anything that opted out of the scale does not move with it. The card title is the one
that matters — it carries no size class at all, so it sits at the root `1rem` — and it
gets one extra rule pinning it to `calc(1rem * k)`, in `rem` so it cannot compound, and
emitted only when the axis is off Default so the rendering is untouched otherwise. An
element with an arbitrary size like `text-[11px]` stays outside all of this, which is
what picking a literal pixel value means.

One knock-on: **the type scale now exports.** It never did — the exported `:root` carried
colours, radius, spacing and fonts but not a single `--type-*` — which did not show while
the scale was one axis you could re-pick by hand. These axes live entirely in those
variables, so they travel now, emitted whenever the scale or any size group is off
Default.

## Mobile

The kit had no mobile contract at all — one `sm:` and one `lg:` in 2,373 lines of
components — and the measurements said so: **1,383** clipped elements on the remixer at
375px, **23** on the Design Kit page, and a 36px default button under every published
touch floor.

These are rules, and they ship _with the theme_ rather than living in this app. A
consumer who installs the kit gets them, because "works on mobile" is a property of the
system and not of the page that happens to be showing it.

|                                   |                                                                                                                                                                                                                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Touch targets**                 | 44px on coarse pointers, grown with a pseudo-element so the control keeps the size it was designed at. Apple asks 44pt, Material 48dp, WCAG 2.5.8 a hard 24px — and fattening every button on desktop to fix an input problem desktop does not have would be trading one design for another. |
| **Rows scroll, they do not clip** | Tabs, button groups, toggle groups and pagination. A strip at 375px either scrolls or silently loses its last option, and losing it is not a trade anyone chose.                                                                                                                             |
| **Tables scroll**                 | The one thing that genuinely cannot reflow: a column dropped to make it fit is data removed from the page. The wrapper takes no prop, because a table that scrolls when someone remembers to ask is a table that does not scroll.                                                            |
| **Long tokens wrap**              | `overflow-wrap: anywhere` on code. One file path in a paragraph was pushing a whole column 30px past the screen.                                                                                                                                                                             |
| **Dialogs come from the bottom**  | Below 640px. A centred box with a margin is a desktop shape; on a phone it wastes the width it has and puts the actions out of thumb reach.                                                                                                                                                  |
| **Minimum width**                 | 360px. Stated, so it can be argued with.                                                                                                                                                                                                                                                     |

Two traps worth knowing, because both cost an hour here and look identical from the
outside — content overhanging a container that will not shrink:

- A **flex** item's automatic minimum is its content, so `flex-1` alone refuses to
  shrink and `overflow-x-auto` puts a scrollbar on a box that is already too wide to
  see. It needs `min-w-0`.
- A **grid** item has the same automatic minimum, so a column overhangs its own track.
  `[&>*]:min-w-0` on the grid.

`npm run film:mobile` films the set at 390×844; baselines carry the width in their
filename, so a phone run cannot overwrite a desktop one.

### Why the gate caches fonts

It compares pixels at zero tolerance while fetching webfaces over the internet, which is
a race it loses often enough to be ignored — a frame shot before a face lands renders in
fallback metrics and comes back as a few hundred scattered text bands. Five waiting
strategies each failed differently, because the problem is not _when to look_: it is that
the answer arrives at a time nobody controls.

So the faces are cached to `film/fonts-cache` and served from disk. The first run on a
machine still fetches and is still racy; every run after is local. CI caches the folder
and warms it before gating. Measured over ten runs: eight clean, two not — much better
than it was, and not yet deterministic. The remaining fix is to inline the faces as data
URIs for the gate build, so there is no fetch at all.

**The remixer is exempt and says so.** It is a two-pane tool whose rail alone is 280px
of a 375px screen, and no amount of stacking makes that worth using. Below `lg` it shows
a line saying the screen is too narrow and links to the three pages that do read on a
phone. That is better than rendering it anyway and letting the canvas become a sliver,
and better than hiding it, because someone on a phone still wants to see what the kit
produces.

## Behaviour

Motion said how long a change took; nothing said what actually moved.

**Interaction** adds the part that carries character — whether a control rises, shrinks,
sinks like a physical key, or blooms a ring. It composes as transform and shadow on top
of the colour hovers each component already has, so nothing had to be rewritten per
component. Cards are deliberately excluded: a card that lifts under the pointer reads as
clickable, and most are not.

**Entrance** is keyframes rather than transitions, because an element entering the DOM
has no previous state to transition from. Timing comes from the motion axis so the two
cannot disagree about how fast this theme moves. Sheets and drawers always come from
their own edge whatever the entrance — a sheet that fades in from the centre is not a
sheet.

**Elevation** is a ladder of four rungs, not one shadow. Each rung is two layers — a
tight key shadow for the contact edge, a wide ambient one for the room — and the colour
is tinted toward the page rather than pure black, which over a warm background reads as
dirt. `Default` leaves the style preset's own shadow alone, so Mira keeps its hard
offset.

## Type scale

Every step comes from one base and one ratio, so the scale stays in proportion instead
of being eight hand-picked numbers that drift. It maps onto Tailwind's `text-*`
utilities through `@theme inline`, paired line-heights included — large steps need
proportionally less leading than small ones. Compact's `2xl` is 1.246rem; Editorial's is
2.369rem, from the same utility.

**Prose**, **DoubleRule** and **Eyebrow** fill the last gap from the broadsheet study:
multi-column text with a column rule, justification with hyphenation (the two always
travel together — without hyphens, justified text turns into rivers), a drop cap sized
in lines rather than points so it stays aligned whatever the scale does, and the
wide-tracked uppercase label that stat strips and datelines are built from.

## Command palette

`⌘K` for everything: styles, theme and base colours, radius, fonts, type scale,
textures, outlines, elevation, motion, interaction, entrances, glass depth, shuffle,
reset, copy the CSS, flip modes.

The sidebar groups into **Colour, Type, Shape, Surface and Motion**, collapsible and
remembered — twenty-eight controls in one scroll was an endurance test.

Your last theme is kept in local storage, so a reload does not throw it away. **Reset**
puts everything back to the default. There is no share link — a theme travels as the CSS
from **Get Code**, not as a code in the URL.

## Getting the theme out

**Get Code** has three tabs, as the original does:

- **New Project** — scaffold command for your template, then `shadcn init` / `add`, then
  the theme to paste.
- **Existing Project** — just the `add` command and the CSS.
- **Theme** — the `:root` / `.dark` block on its own, in shadcn's format (oklch, same
  token names).

The components in `src/components/ui.tsx` are hand-rolled to the same token contract,
which is why the preview is honest: paste the CSS into a real project and the real
components land in the same place. The `add` command in those tabs names exactly what
the canvas puts on screen, so what you see is what you install.

## What the canvas covers

Fifty-three of the registry's sixty-one components, hand-rolled against the token
contract:

|                |                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Layout**     | card, separator, aspect-ratio, scroll-area, resizable, item, item-group, empty, skeleton                                             |
| **Forms**      | input, textarea, label, field, input-group, input-otp, select, combobox, checkbox, radio-group, switch, slider, toggle, toggle-group |
| **Buttons**    | button, button-group, badge, kbd, spinner                                                                                            |
| **Navigation** | tabs, breadcrumb, pagination, accordion, collapsible, menubar, navigation-menu, sidebar                                              |
| **Overlays**   | dialog, alert-dialog, sheet, drawer, popover, tooltip, hover-card, dropdown-menu, context-menu, command, sonner                      |
| **Data**       | table, progress, chart, calendar, carousel, avatar, alert                                                                            |
| **Chat**       | message, bubble, attachment, marker, message-scroller                                                                                |

The eight left out: `form` is react-hook-form glue rather than surface, `direction` is
an RTL provider, `native-select` is what the Select here already is, and `data-table`,
`toast`, `typography`, `use-mobile` and `utils` are not components at all.

It is one scrolling canvas, in four labelled sections: Dashboard, Billing & settings,
Components, App chrome. Everything real works — drag the pane divider, right-click the
file list, pick a date, fire a toast, open the drawer. The only thing behind a click is
the dashboard's own tab strip, which is a component in its own right.

## Layout

```
src/
  lib/color.ts        sRGB ↔ OKLab/OKLCH, contrast, mixing
  lib/scales.ts       named base / theme / chart scales, radius options
  lib/styles.ts       the eight style presets
  lib/textures.ts     the texture generators
  lib/tilt.ts         the off-axis sequence
  lib/backdrop.ts     image sources and the duotone filter
  lib/motion.ts       duration and easing presets
  lib/type.ts         the type scale
  lib/elevation.ts    the shadow ladder
  lib/interact.ts     hover and press behaviour
  lib/entrances.ts    overlay keyframes
  lib/outline.ts      stroke treatments, one source for app and export
  lib/glass.ts        blur and fill depths
  lib/shaders.ts      GLSL programs and the sRGB round trip
  lib/fonts.ts        the type lists, mono stacks and self-hosted faces
scripts/
  film.mjs            visual gate and shader motion check
public/
  fonts/              Paper Mono (SIL OFL 1.1) and its licence
  lib/config.ts       the config model and scale matching
  lib/extract.ts      screenshot → config, in the browser
  lib/theme.ts        config → full token set, dark counterpart, CSS export
  components/ui.tsx   shadcn-shaped primitives (no Radix, no CLI)
  components/preview/ the five boards of one scrolling canvas
  components/         Sidebar, Dropzone, CodeDialog, CommandPalette, ShaderBackdrop
  studies/            one file per study, globbed like kits
server/
  vision-plugin.ts    dev-only POST /api/read-theme and /api/read-url
  capture.ts          URL → screenshot + the page's own computed styles
  measured.ts         what a captured page is allowed to say to the model
```

## Filming

Typecheck cannot see a texture that stopped tiling, a glass card that went opaque or a
shader that froze — which are exactly the bugs that reached a screenshot here before
anyone noticed. `scripts/film.mjs` captures the canvas under six named themes and gates
on what moved.

```bash
npm run dev            # in one terminal
npm run film:update    # write baselines
npm run film -- --gate # fail if anything moved
npm run film:motion    # prove the shaders are time-dependent
```

The gate is **strict by default**. Headless rendering here is deterministic — repeat
runs come back at exactly 0.000% — and the changes this kit makes are fine: doubling a
bracket arm moved 0.029% of a 7.4M-pixel frame, which any tolerance would have hidden.
Failures write a diff image to `film/diff/`.

**Motion is not filmed, and cannot be.** A WebGL canvas with
`preserveDrawingBuffer: false` does not hand live frames to a screenshot — the capture
falls outside the compositing frame and returns identical bytes whatever the shader is
doing, which reads as "frozen". So `--motion` renders each shader program offscreen at
two timestamps and compares, and separately checks the live canvas got past context
creation. Those are the two failures this project has actually had.

The approach and the `--select` / `--width` / `--gate` shape are adapted from
[Stageshow](https://github.com/benjitaylor/skills)'s `film.mjs` by Benji Taylor (MIT).
Theirs is built around that kit's own `.ss-stage` contract, so this is a
reimplementation rather than a copy.

## Known edges

- The vision endpoint is Vite dev middleware, so it does not exist in `npm run build`
  output. A static build falls back to local extraction.
- Local extraction reads colour only. Radius and typeface need the Claude path, and
  neither path reads texture off a screenshot — you pick that yourself.
- Screenshots with large photos or gradients can pull the background from the image
  rather than the page chrome; nudge it with the colour swatches.
- No icon-library switch: everything here is Lucide.
- Themes live in local storage only. There is no share link; export the CSS instead.
- A shader backdrop needs WebGL. Without it the canvas renders nothing and the page
  keeps whatever page texture it had.
- Duotone rasterises a 1200x800 turbulence once per theme change. Free to scroll,
  briefly expensive to switch.
