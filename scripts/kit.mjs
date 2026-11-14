import { chromium } from "playwright-core";
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/* Write a kit out as a stylesheet you can drop into another project.
 *
 *  The generators that produce it are TypeScript with extensionless imports,
 *  which node will not load, so this drives the real app the way the visual
 *  gate does: open the dev server in Chrome, call the same toCss the export
 *  dialog calls, and save what comes back. Nothing is reimplemented here, so
 *  the file on disk cannot drift from what the tool shows you. */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};

const URL_BASE = value("url", "http://localhost:5173");
const OUT = resolve(ROOT, value("out", "kit"));

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (existsSync(mac)) return mac;
  return null;
}

const exe = chromePath();
if (!exe) {
  console.error("kit: no Chrome found. Set CHROME_PATH to a Chrome or Chromium binary.");
  process.exit(2);
}
const res = await fetch(URL_BASE).catch(() => null);
if (!res?.ok) {
  console.error(`kit: nothing serving at ${URL_BASE}. Start it with \`npm run dev\`.`);
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage();
await page.goto(URL_BASE, { waitUntil: "networkidle" });

const id = value("kit", null);
const data = await page.evaluate(async (wanted) => {
  const kits = await import("/src/kits/index.ts");
  const theme = await import("/src/lib/theme.ts");
  const fonts = await import("/src/lib/fonts.ts");
  const outline = await import("/src/lib/outline.ts");
  const wording = await import("/src/lib/wording.ts");
  const motion = await import("/src/lib/motion.ts");
  const kit = kits.kitById(wanted ?? kits.DEFAULT_KIT);
  const c = kit.config;
  const names = [c.fontSans, c.fontHeading, c.fontMono];
  const built = theme.buildTheme(c);

  /* The stylesheet is one string; a registry item wants the same thing taken
     apart, because shadcn merges variables into the consumer's own file
     rather than appending a sheet. themeVars gives every variable for a
     mode, and TOKENS says which of them are the colour contract — so the
     split is "is this name a token" and nothing is hand-listed. */
  const tokenNames = new Set(theme.TOKENS);

  /* The kit emits Tailwind's own names now, so nothing is translated here.
     It used to: --font-mono was --mono and every --text-* was a --type-*,
     mapped in an `@theme inline` block that only this app has. Fixing it at
     source removed a whole class of bug — a translation table in a build
     script is a place for names to drift apart. */
  const UTILITY = (bare) =>
    bare === "radius" || bare === "spacing" || bare.startsWith("font-") || bare.startsWith("text-");

  const split = (mode) => {
    const all = theme.themeVars(built, mode);
    const colour = {};
    const utility = {};
    const root = {};

    for (const [k, v] of Object.entries(all)) {
      if (!k.startsWith("--")) continue; // colorScheme is not a variable
      const bare = k.slice(2);
      if (tokenNames.has(bare)) colour[bare] = String(v);
      else if (UTILITY(bare)) utility[bare] = String(v);
      else root[bare] = String(v);
    }

    return { colour, utility, root };
  };
  const light = split("light");
  const dark = split("dark");

  /* The rules the axes generate, unscoped — the same ones toCss emits, plus
     the motion rule, which toCss leaves out when the motion is Smooth
     because that is the app's own default. A package cannot assume the
     consumer has one, so it always carries it. */
  const rules = [
    c.outline !== "Default" ? outline.outlineCss(c.outline) : "",
    c.buttonOutline !== "Default" ? outline.buttonOutlineCss(c.buttonOutline) : "",
    wording.caseCss({ heading: c.headingCase, label: c.labelCase, body: c.bodyCase }),
    wording.headingSizeCss(c.headingSize),
    motion.MOTION_RULE,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    id: kit.id,
    name: kit.name,
    note: kit.note,
    css: theme.toCss(built),
    version: (await import("/src/lib/version.ts")).KIT_VERSION,
    faces: fonts.selfHostedCss(names),
    links: fonts.fontLinkTags(names),
    families: { sans: c.fontSans, heading: c.fontHeading, mono: c.fontMono },
    vars: { theme: light.utility, light: light.colour, dark: dark.colour },
    rootVars: { light: light.root, dark: dark.root },
    rules,
  };
}, id);

await browser.close();

/* The app serves its own faces from /fonts. A folder you copy somewhere else
   cannot keep an absolute path, so the URLs are rewritten to sit beside the
   stylesheet and the files travel with it. */
const used = [...data.faces.matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map((m) => m[1]);
const faces = data.faces.replaceAll('url("/fonts/', 'url("./fonts/');

/* The folder is output: wiped and rebuilt every run. Nothing in it is a
   source of truth any more, including the version — that lives in
   src/lib/version.ts, where git can see it change. */
const pkgPath = join(OUT, "package.json");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "fonts"), { recursive: true });

for (const file of used) {
  const from = join(ROOT, "public/fonts", file);
  if (!existsSync(from)) {
    console.error(`kit: ${file} is declared but not in public/fonts.`);
    process.exit(1);
  }
  copyFileSync(from, join(OUT, "fonts", file));
  // Licences travel with the faces they cover, or the copy is not legal.
  for (const suffix of ["-LICENSE.txt", "-AUTHORS.txt"]) {
    /* GeistSerifVF.woff2 carries no hyphen before its suffix, so a pattern
       that assumes one leaves the stem as "GeistSerifVF" and the licence is
       silently left behind — which for an OFL face is not a cosmetic miss. */
    const stem = file
      .replace(/\.woff2$/, "")
      .replace(/[-_]?(VariableVF|Variable|VF|Regular|Thin|Italic)$/, "");
    const lic = join(ROOT, "public/fonts", `${stem}${suffix}`);
    if (existsSync(lic)) copyFileSync(lic, join(OUT, "fonts", `${stem}${suffix}`));
  }
}

/* shadcn merges a registry item into the consumer's own stylesheet, so it
   wants CSS as structured data rather than a blob. The generators only ever
   emit flat blocks — `selector { prop: value; … }`, and one level of @media
   around the same — so this is a scanner over that shape, not a CSS parser.
   Anything it does not recognise throws rather than being quietly dropped,
   because a rule missing from a theme is invisible until it is wrong. */
function cssToObject(css) {
  const out = {};
  let i = 0;
  const n = css.length;

  while (i < n) {
    while (i < n && /\s/.test(css[i])) i++;
    if (i >= n) break;
    if (css.startsWith("/*", i)) {
      const end = css.indexOf("*/", i);
      if (end < 0) break;
      i = end + 2;
      continue;
    }

    const open = css.indexOf("{", i);
    if (open < 0) throw new Error(`kit: trailing text in generated CSS: ${css.slice(i, i + 40)}`);
    const prelude = css
      .slice(i, open)
      .trim()
      .replace(/\s*\n\s*/g, " ");

    let depth = 1;
    let j = open + 1;
    while (j < n && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    if (depth !== 0) throw new Error("kit: unbalanced braces in generated CSS");
    const body = css.slice(open + 1, j - 1);
    i = j;

    out[prelude] = prelude.startsWith("@media") ? cssToObject(body) : declarations(body);
  }
  return out;
}

function declarations(body) {
  const out = {};
  for (const part of body.split(";")) {
    const line = part.replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (!line) continue;
    const at = line.indexOf(":");
    if (at < 0) throw new Error(`kit: not a declaration: ${line}`);
    out[line.slice(0, at).trim()] = line
      .slice(at + 1)
      .trim()
      .replace(/\s*\n\s*/g, " ");
  }
  return out;
}

const sheet = [
  `/* ${data.name} — ${data.note}`,
  `   Generated by \`npm run kit\` from src/kits/${data.id}.ts. Do not edit by`,
  `   hand: edit the kit and run it again. */`,
  "",
  faces,
  "",
  data.css,
].join("\n");

writeFileSync(join(OUT, `${data.id}.css`), sheet + "\n", "utf8");

/* The body case axis is the only rule here that is not scoped to a
   data-slot: unscoped it compiles to `:root, *`, so it recases the whole
   consuming app and not just this kit's components. */
const caseWarning = /:root,\s*\*/.test(data.rules)
  ? "Note: this kit sets a text-transform on every element, so installing it recases your" +
    ' whole app. input, textarea, code, pre, abbr and [data-case="keep"] are exempt.'
  : "";

const darkOnly = Object.fromEntries(
  Object.entries(data.rootVars.dark).filter(([k, v]) => data.rootVars.light[k] !== v),
);

/* cssVars takes bare names because shadcn adds the dashes; css is raw CSS
   and does not. Mixing the two conventions writes `shadow-card: …` into a
   stylesheet, which is not a declaration at all — it is a property nothing
   has ever heard of, and it fails silently. */
const dashed = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [`--${k}`, v]));

/* The generated rules carry their own :root and .dark blocks — the Offset
   treatment defines --shadow-button there. Spreading them next to mine made
   the later key win and quietly replace every variable in the block, which
   is how a theme ships with no shadows and no inks. Merge, do not spread. */
const ruleBlocks = cssToObject(data.rules);
const rootFromRules = ruleBlocks[":root"] ?? {};
const darkFromRules = ruleBlocks[".dark"] ?? {};
delete ruleBlocks[":root"];
delete ruleBlocks[".dark"];

const darkBlock = { ...dashed(darkOnly), ...darkFromRules };

/* ------------------------------------------------- the registry item */

mkdirSync(join(OUT, "registry"), { recursive: true });

const item = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: data.id,
  type: "registry:theme",
  title: data.name,
  description: data.note,
  version: data.version,
  registryDependencies: [`./${data.id}-components.json`],
  cssVars: data.vars,
  /* Everything the kit invented for its own rules — stroke widths, shadow
     ladders, the motion pair, the Offset inks — belongs on :root rather than
     in @theme, because @theme is for tokens that generate utilities and
     these generate nothing. The rules below read them from there. A dark
     entry only appears when it actually differs from the light one. */
  css: {
    ":root": { ...dashed(data.rootVars.light), ...rootFromRules },
    ...(Object.keys(darkBlock).length ? { ".dark": darkBlock } : {}),
    ...ruleBlocks,
  },
  docs: [
    `${data.name} sets ${data.families.heading} for headings, ${data.families.sans} for body`,
    `and ${data.families.mono} for code.`,
    used.length
      ? `${used.join(" and ")} ${used.length > 1 ? "are" : "is"} self-hosted: copy them from this` +
        ` package's fonts/ into your public/fonts/, or point the @font-face at your own path.` +
        ` A registry item carries CSS, not binaries, so the faces cannot travel in it.`
      : "Every face it uses comes from Google Fonts.",
    /* Said here because it is the one rule that reaches past the kit's own
       components. In the app it is scoped to the canvas; installed, it is
       not, and someone should know that before their whole app changes. */
    caseWarning,
  ]
    .filter(Boolean)
    .join(" "),
};

writeFileSync(
  join(OUT, "registry", `${data.id}.json`),
  JSON.stringify(item, null, 2) + "\n",
  "utf8",
);

/* ------------------------------------------- the components item */

/* The theme item above is CSS, and CSS cannot carry a sliding tab indicator,
   a panel that opens at its own height, or a table that scrolls. Those are
   component code, and a shadcn consumer owns their copy of every component —
   so without this item, every change to ui.tsx is stranded in this repo.
   
   It ships the files whole rather than one component per item. That is the
   honest shape of what exists: ui.tsx is a single 2,300-line module, and
   splitting it is worth doing for its own sake, not as a prerequisite for
   shipping it. */
const COMPONENT_FILES = [
  { path: "src/components/ui.tsx", target: "@components/ui.tsx" },
  { path: "src/components/icons.tsx", target: "@components/icons.tsx" },
  { path: "src/lib/utils.ts", target: "@lib/utils.ts" },
];

const components = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: `${data.id}-components`,
  type: "registry:ui",
  title: `${data.name} components`,
  description: "The primitives this kit is drawn against: shadcn-shaped, hand-rolled, no Radix.",
  version: data.version,
  dependencies: ["clsx", "tailwind-merge", "lucide-react"],
  files: COMPONENT_FILES.map(({ path, target }) => ({
    path,
    target,
    type: "registry:ui",
    content: readFileSync(join(ROOT, path), "utf8"),
  })),
  docs:
    `Pair with the ${data.id} theme item, which carries the tokens and the rules. ` +
    "These components read them through data-slot attributes; on their own they are " +
    "unstyled shadcn shapes.",
};

writeFileSync(
  join(OUT, "registry", `${data.id}-components.json`),
  JSON.stringify(components, null, 2) + "\n",
  "utf8",
);

/* ------------------------------------------------------ the package */

const pkg = {
  name: `${data.id}-design-kit`,
  version: data.version,
  description: data.note,
  license: "MIT",
  /* The fonts are not MIT and their licences travel beside them in fonts/.
     A package that claims one licence for everything inside it is wrong in
     the way that matters. */
  repository: { type: "git", url: "git+https://github.com/REPLACE-ME/design-kit.git" },
  /* No main and no types: this ships CSS and font files, and a package that
     claims a JS entry point it does not have breaks bundlers that believe
     it. Everything is reached through exports by its own name. */
  type: "module",
  files: [`${data.id}.css`, "fonts", "registry", "README.md", "LICENSE"],
  exports: {
    "./theme.css": `./${data.id}.css`,
    [`./registry/${data.id}.json`]: `./registry/${data.id}.json`,
    [`./registry/${data.id}-components.json`]: `./registry/${data.id}-components.json`,
    "./fonts/*": "./fonts/*",
    "./package.json": "./package.json",
  },
  sideEffects: ["*.css"],
};

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
copyFileSync(join(ROOT, "LICENSE"), join(OUT, "LICENSE"));

const readme = `# ${data.name}

${data.note}

Generated by \`npm run kit\` from \`src/kits/${data.id}.ts\`. Regenerate rather than
editing: the stylesheet is output, the kit is the source.

## Install

Three ways in, in the order you probably want them.

**As a registry item.** The idiomatic route for a shadcn project: the tokens are merged
into your own \`globals.css\` rather than appended as a sheet, so they sit alongside
everything else you have.

\`\`\`bash
npx shadcn@latest add <url-to>/registry/${data.id}.json
\`\`\`

**As a package.** Install it, then import the stylesheet after Tailwind:

\`\`\`bash
npm i ${data.id}-design-kit
\`\`\`

\`\`\`css
@import "tailwindcss";
@import "${data.id}-design-kit/theme.css";
\`\`\`

**By copying.** Drop this folder into the project and import it by path:

\`\`\`css
@import "tailwindcss";
@import "./kit/${data.id}.css";
\`\`\`

${
  data.links
    ? `${data.families.sans === data.families.heading ? "One family comes" : "Some families come"} from Google Fonts, so add this to your document head:

\`\`\`html
${data.links}
\`\`\`
`
    : "Every face it uses ships in `fonts/`, so there is nothing to fetch.\n"
}
${used.length ? `The faces in \`fonts/\` are referenced relatively, so keep them beside the stylesheet. Their licences are in the same folder.\n` : ""}
## What it needs from the project

The stylesheet has two halves, and they have different requirements.

The \`:root\` and \`.dark\` blocks are variables. They apply anywhere, to anything that
reads them — colours, type scale, radius, spacing, the shadow ladder.

The rules underneath target \`[data-slot="…"]\`, which is the seam real shadcn/ui
components expose. In a project with shadcn components they style buttons, cards, inputs
and the rest without anything being imported. In a project without them they match
nothing and do nothing — you get the tokens and none of the stroke, case or motion
treatments. If that is where you are, copy this project's \`src/components/ui.tsx\` too:
it is the same contract, hand-rolled and dependency-free.

## What is in it

The token contract real shadcn/ui components already read — \`--background\`,
\`--foreground\`, \`--primary\`, \`--border\`, \`--chart-1..5\` and the rest — in both
light and dark, plus the rules this kit's own axes generate: its stroke treatment,
its casing, and its type scale.

Type: ${data.families.heading} for headings, ${data.families.sans} for body, ${data.families.mono} for code.

## Using it

Nothing here needs a wrapper element. The variables are on \`:root\` and \`.dark\`,
so components pick them up the moment the sheet is imported.
`;

writeFileSync(join(OUT, "README.md"), readme, "utf8");

const rel = OUT.replace(ROOT + "/", "");
console.log(`kit: wrote ${rel}/${data.id}.css (${data.name})`);
console.log(`kit: ${used.length} font file(s) in ${rel}/fonts`);
