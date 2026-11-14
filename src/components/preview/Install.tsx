import * as React from "react";
import { Check, Copy } from "lucide-react";
import { fontLinkTags, selfHostedCss } from "@/lib/fonts";
import { buildTheme, toCss } from "@/lib/theme";
import type { Kit } from "@/kits";
import { Badge, Button } from "../ui";

/* How to get the kit, shown in the kit.
 *
 *  It renders inside the themed canvas on purpose. A handoff page that
 *  explains the design system in the host app's styles is quietly telling
 *  you the system does not apply to real content — these instructions are
 *  set in Geist Serif on the kit's own paper because they are the first
 *  thing anyone reads here.
 *
 *  Everything below is derived from the kit rather than written out, so it
 *  cannot drift: rename the kit and the commands rename themselves. */

/** Everything another agent needs to apply this kit, as one paste.
 *
 *  The three routes above are addresses: they tell a person where to go and
 *  assume they can get there. An agent in a different repository cannot —
 *  it has no path to this one, nothing is published yet, and a registry URL
 *  that does not exist is worse than no instruction at all. So this carries
 *  the stylesheet itself rather than pointing at it, and says plainly which
 *  parts it cannot carry.
 *
 *  Built from the same generators the export uses, so it cannot drift from
 *  what the page is showing. */
function agentBrief(kit: Kit): string {
  const c = kit.config;
  const css = toCss(buildTheme(c));
  const faces = selfHostedCss([c.fontSans, c.fontHeading, c.fontMono]);
  const links = fontLinkTags([c.fontSans, c.fontHeading, c.fontMono]);

  /* Named from the config rather than listed, so a kit that stops being
     lowercase stops claiming to be. */
  const effects = [
    c.bodyCase !== "As written"
      ? `Every element gets \`text-transform: ${c.bodyCase === "UPPER" ? "uppercase" : c.bodyCase.toLowerCase()}\`, so the whole app is recased. Exempt: input, textarea, code, pre, abbr, [data-case="keep"].`
      : "",
    c.outline === "Offset" || c.buttonOutline === "Offset"
      ? "Cards and buttons carry a hard offset shadow in the stroke colour. It replaces the usual elevation rather than adding to it."
      : "",
    c.motion !== "Smooth"
      ? `Motion is ${c.motion}: --motion-duration and --motion-ease drive every transition in the kit.`
      : "",
  ].filter(Boolean);

  const selfHosted = faces
    ? [c.fontHeading, c.fontMono, c.fontSans]
        .filter((n, i, a) => a.indexOf(n) === i && faces.includes(`"${n}"`))
        .join(" and ")
    : "";

  return `# Design kit: ${kit.name}

${kit.note}

Apply this to the current project. Everything needed is below — do not look for a
package or a registry URL, there is not one yet.

## 1. Add the stylesheet

Write this file as \`green-${""}3.css\` next to your global CSS, verbatim:

\`\`\`css
${faces ? faces + "\n\n" : ""}${css}\`\`\`

## 2. Import it after Tailwind

\`\`\`css
@import "tailwindcss";
@import "./${kit.id}.css";
\`\`\`

If the project already has a shadcn \`globals.css\` with its own \`:root\` and \`.dark\`
blocks, replace those blocks with the ones above rather than importing a second file —
two sets of the same variables is a cascade argument nobody wins.

## 3. Fonts${
    links
      ? `

Add to the document head:

\`\`\`html
${links}
\`\`\``
      : ""
  }${
    selfHosted
      ? `

${selfHosted} ${selfHosted.includes(" and ") ? "are" : "is"} self-hosted. The @font-face
blocks above expect the .woff2 files at /fonts/. You cannot generate a font file — copy
them from the design-kit repo's \`kit/fonts/\` into this project's \`public/fonts/\`. If
you do not have access to them, change \`--font-heading\` and \`--font-mono\` to families
this project already has, and say that you did.`
      : ""
  }

## What this styles

The \`:root\` and \`.dark\` blocks are variables and apply to anything that reads them.

The rules under them target \`[data-slot="…"]\`, which is the seam shadcn/ui components
expose. If this project uses shadcn components, they are styled with nothing further to
do. If it does not, those rules match nothing: you get the colours, type scale and
radii, and none of the stroke, case or motion treatments. Do not invent markup to make
them match — say so instead.

## What this does not carry

Components. CSS cannot carry a sliding tab indicator, a panel that opens at its own
height, or a table that scrolls, and a shadcn project owns its copy of every component —
so those stay where they are unless someone copies them across.

If this project has no shadcn components, or you want the ones this kit was drawn
against, ask for \`kit/registry/${kit.id}-components.json\` from the design-kit repo. It
carries \`ui.tsx\`, \`icons.tsx\` and \`utils.ts\` whole, with their npm dependencies
listed. Do not try to reconstruct them from this stylesheet.

${effects.length ? `## Effects worth knowing\n\n${effects.map((e) => `- ${e}`).join("\n")}\n` : ""}
## Type

${c.fontHeading} for headings, ${c.fontSans} for body, ${c.fontMono} for code.
`;
}

function Snippet({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  const pre = React.useRef<HTMLPreElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* The clipboard needs a focused document and a permission, and refuses
         in enough situations — an unfocused window, an insecure origin — to
         be worth a fallback. Selecting the text leaves the reader one ⌘C
         away instead of leaving a button that silently does nothing. */
      setCopied(false);
      const node = pre.current;
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  return (
    <div className="bg-muted/60 flex items-start gap-2 rounded-md border p-2.5">
      <pre
        ref={pre}
        /* min-w-0 is doing the work, not overflow-x-auto. A flex item's
           minimum size is its content, so flex-1 alone refuses to shrink and
           the box runs past the viewport on a phone — the scrollbar is on an
           element that is already too wide to see. */
        className="min-w-0 flex-1 overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre"
      >
        {code}
      </pre>
      <Button
        variant="ghost"
        size="icon"
        onClick={copy}
        aria-label={`Copy ${label ?? "snippet"}`}
        className="size-7 shrink-0"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}

function Route({
  n,
  title,
  blurb,
  children,
}: {
  n: number;
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-muted-foreground font-mono text-xs tabular-nums">{n}</span>
        <h3 className="font-heading text-base leading-none font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground text-sm">{blurb}</p>
      {children}
    </div>
  );
}

function AgentCopy({ kit }: { kit: Kit }) {
  const [copied, setCopied] = React.useState(false);
  const brief = React.useMemo(() => agentBrief(kit), [kit]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  const kb = Math.round(brief.length / 102.4) / 10;

  return (
    <div className="bg-muted/40 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-heading text-base leading-none font-semibold">hand it to an agent</h3>
        <p className="text-muted-foreground text-sm">
          The whole kit as one paste — the stylesheet inline, what to do with it, and the two things
          it cannot carry. Works in a repo that has no path to this one.
        </p>
      </div>
      <Button onClick={copy} className="shrink-0">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "copied" : `copy brief · ${kb} kB`}
      </Button>
    </div>
  );
}

export function Install({ kit }: { kit: Kit }) {
  const c = kit.config;
  const pkg = `${kit.id}-design-kit`;
  const links = fontLinkTags([c.fontSans, c.fontHeading, c.fontMono]);

  return (
    <section className="flex flex-col gap-6" aria-labelledby="install">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="install" className="font-heading text-2xl leading-none font-semibold">
            install
          </h2>
          <Badge variant="secondary">{pkg}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Run <code className="font-mono text-xs">npm run kit</code> in this repo to regenerate the
          package, then take one of these three routes.
        </p>
      </div>

      {/* Ahead of the three routes, because it is the only one that works
          from a repository that has no path to this one. */}
      <AgentCopy kit={kit} />

      {/* [&>*]:min-w-0 for the same reason the snippet needs it: a grid item's
          automatic minimum is its content, so a column refuses to shrink below
          whatever the longest unbreakable thing inside it is and quietly
          overhangs its own track. */}
      <div className="grid gap-6 [&>*]:min-w-0 md:grid-cols-3">
        <Route
          n={1}
          title="registry"
          blurb="The idiomatic route for a shadcn project: the tokens merge into your own globals.css instead of arriving as a second stylesheet."
        >
          <Snippet
            label="registry command"
            code={`npx shadcn@latest add \\\n  <your-host>/${kit.id}.json`}
          />
          <p className="text-muted-foreground text-xs">
            Needs a URL. Serve <code className="font-mono">kit/registry/{kit.id}.json</code> from
            anywhere public — a gist, a branch, your own site.
          </p>
        </Route>

        <Route
          n={2}
          title="package"
          blurb="Install it and import the stylesheet after Tailwind. Updating is npm update."
        >
          <Snippet label="install command" code={`npm i ${pkg}`} />
          <Snippet label="import" code={`@import "tailwindcss";\n@import "${pkg}/theme.css";`} />
        </Route>

        <Route
          n={3}
          title="copy"
          blurb="No publishing step. Drop the folder in and point at it — it drifts the moment the kit changes, which is the trade."
        >
          <Snippet
            label="import by path"
            code={'@import "tailwindcss";\n@import "./kit/' + kit.id + '.css";'}
          />
          <p className="text-muted-foreground text-xs">
            Keep <code className="font-mono">fonts/</code> beside the stylesheet: the faces are
            referenced relatively.
          </p>
        </Route>
      </div>

      {links && (
        <div className="flex flex-col gap-2">
          <h3 className="font-heading text-base leading-none font-semibold">fonts</h3>
          <p className="text-muted-foreground text-sm">
            {c.fontHeading} for headings, {c.fontSans} for body, {c.fontMono} for code. The
            self-hosted faces travel in <code className="font-mono text-xs">kit/fonts/</code> with
            their licences; the rest come from Google, so this goes in your head.
          </p>
          <Snippet label="font links" code={links} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-base leading-none font-semibold">what it needs</h3>
        <p className="text-muted-foreground text-sm">
          The <code className="font-mono text-xs">:root</code> and{" "}
          <code className="font-mono text-xs">.dark</code> blocks are variables and apply anywhere.
          The rules under them target <code className="font-mono text-xs">[data-slot]</code>, the
          seam shadcn/ui components expose — in a project without them you get the colours, type and
          shapes, and none of the stroke, case or motion treatments. Copy{" "}
          <code className="font-mono text-xs">src/components/ui.tsx</code> too if that is where you
          are.
        </p>
      </div>
    </section>
  );
}
