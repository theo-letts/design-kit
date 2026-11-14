import * as React from "react";
import { Check, Copy } from "lucide-react";
import { type Config } from "@/lib/config";
import { fontLinkTags, selfHostedCss } from "@/lib/fonts";
import { toCss, type Theme, toBackdropSvg, toBackdropShader } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { Button, Dialog, TabPanel, Tabs } from "./ui";

const TEMPLATES = {
  "Next.js": "npx create-next-app@latest my-app",
  Vite: "npm create vite@latest my-app -- --template react-ts",
  Astro: "npm create astro@latest my-app",
  "React Router": "npx create-react-router@latest my-app",
} as const;

type TemplateName = keyof typeof TEMPLATES;

const MANAGERS = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
} as const;
type Manager = keyof typeof MANAGERS;

/* Everything the canvas puts on screen, so the command matches the preview. */
const COMPONENTS = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "button-group",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "empty",
  "field",
  "hover-card",
  "input",
  "input-group",
  "input-otp",
  "item",
  "kbd",
  "label",
  "menubar",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "sonner",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toggle",
  "toggle-group",
  "tooltip",
].join(" ");

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="bg-muted text-muted-foreground flex size-5 items-center justify-center rounded-full text-[11px] font-medium">
          {n}
        </span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="pl-7">{children}</div>
    </div>
  );
}

export function CodeDialog({
  theme,
  config,
  onClose,
}: {
  theme: Theme;
  config: Config;
  onClose: () => void;
}) {
  const [tab, setTab] = React.useState("new");
  const [template, setTemplate] = React.useState<TemplateName>("Next.js");
  const [manager, setManager] = React.useState<Manager>("npm");

  const css = toCss(theme);
  // The duotone filter is markup, not CSS, so it needs a step of its own.
  const duotone = toBackdropSvg(theme, config.mode);
  // A shader is a program, not a value, so it never rides in the CSS.
  const shader = toBackdropShader(theme);
  /* A CDN font needs a link you already have; a self-hosted one needs its
     @font-face and the file itself, so it gets handed over explicitly. */
  /* Any shipped face in use, not just the mono slot: a kit can set a self-hosted
     family for headings too, and exporting the theme without it loses the type. */
  const fontFace = selfHostedCss([config.fontSans, config.fontHeading, config.fontMono]);
  /* The CDN faces the theme points at. Pasting the CSS without these gets you the
     right tokens set in whatever the OS calls sans-serif. */
  const fontLinks = fontLinkTags([config.fontSans, config.fontHeading, config.fontMono]);
  const runner = MANAGERS[manager];

  /* Shared by the two install tabs, so it lives in both panels rather than
     floating between the tablist and the panel it belongs to. */
  const managerRow = (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-muted-foreground mr-1 text-xs">Package manager</span>
      {(Object.keys(MANAGERS) as Manager[]).map((m) => (
        <button
          key={m}
          onClick={() => setManager(m)}
          className={cn(
            "rounded-md px-2 py-1 font-mono text-xs transition-colors",
            manager === m ? "bg-primary text-primary-foreground" : "hover:bg-accent",
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );

  return (
    <Dialog
      title="Get Code"
      description="Everything this theme needs, in the order you need it."
      onClose={onClose}
      className="max-w-2xl"
    >
      <div className="flex flex-col gap-5 p-5">
        <Tabs
          idBase="get-code"
          value={tab}
          onValueChange={setTab}
          tabs={[
            { value: "new", label: "New Project" },
            { value: "existing", label: "Existing Project" },
            { value: "theme", label: "Theme" },
          ]}
        />

        <TabPanel idBase="get-code" value="new" active={tab} className="gap-5">
          {managerRow}
          <Step n={1} title="Scaffold the app">
            <div className="mb-2 flex flex-wrap gap-1">
              {(Object.keys(TEMPLATES) as TemplateName[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs transition-colors",
                    template === t ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <CodeBlock filename="terminal" code={TEMPLATES[template]} />
          </Step>
          <Step n={2} title="Add shadcn/ui and the components">
            <CodeBlock
              filename="terminal"
              code={`${runner} shadcn@latest init\n${runner} shadcn@latest add ${COMPONENTS}`}
            />
          </Step>
          <Step n={3} title="Paste the theme into globals.css">
            <CodeBlock filename="app/globals.css" code={css} />
          </Step>
          {fontLinks && (
            <Step n={4} title="Load the typefaces">
              <CodeBlock filename="app/layout.tsx" code={fontLinks} />
            </Step>
          )}
          {duotone && (
            <Step n={4 + (fontLinks ? 1 : 0)} title="Add the duotone filter to your layout">
              <CodeBlock filename="app/layout.tsx" code={duotone} />
            </Step>
          )}
          {shader && (
            <Step n={4 + (fontLinks ? 1 : 0) + (duotone ? 1 : 0)} title="Mount the backdrop shader">
              <CodeBlock filename="backdrop.frag" code={shader} />
            </Step>
          )}
          {fontFace && (
            <Step
              n={4 + (fontLinks ? 1 : 0) + (duotone ? 1 : 0) + (shader ? 1 : 0)}
              title="Ship the self-hosted faces"
            >
              <CodeBlock filename="app/globals.css" code={fontFace} />
            </Step>
          )}
        </TabPanel>

        <TabPanel idBase="get-code" value="existing" active={tab} className="gap-5">
          {managerRow}
          <Step n={1} title="Add any components you're missing">
            <CodeBlock filename="terminal" code={`${runner} shadcn@latest add ${COMPONENTS}`} />
          </Step>
          <Step n={2} title="Replace your :root and .dark blocks">
            <CodeBlock filename="app/globals.css" code={css} />
          </Step>
          {fontLinks && (
            <Step n={3} title="Load the typefaces">
              <CodeBlock filename="app/layout.tsx" code={fontLinks} />
            </Step>
          )}
          <p className="text-muted-foreground text-sm">
            Components already using the token names pick this up with no further changes.
          </p>
        </TabPanel>

        <TabPanel idBase="get-code" value="theme" active={tab} className="gap-3">
          <CodeBlock filename="globals.css" code={css} />
          {fontLinks && (
            <>
              <p className="text-muted-foreground text-sm">
                The theme names its faces but cannot fetch them. These go in the document head.
              </p>
              <CodeBlock filename="index.html" code={fontLinks} />
            </>
          )}
          {duotone && (
            <>
              <p className="text-muted-foreground text-sm">
                The duotone backdrop is an SVG filter, so it has to be in the document — CSS can
                only point at it. Drop this anywhere in your layout.
              </p>
              <CodeBlock filename="app/layout.tsx" code={duotone} />
            </>
          )}
          {shader && (
            <>
              <p className="text-muted-foreground text-sm">
                A shader backdrop is a program, not a value — it cannot ride in the CSS. This is the
                fragment shader; mount it on a canvas behind your content.
              </p>
              <CodeBlock filename="backdrop.frag" code={shader} />
            </>
          )}
          {fontFace && (
            <>
              <p className="text-muted-foreground text-sm">
                These faces are shipped rather than fetched, so there is no CDN line for them. Add
                this and copy the matching <code className="font-mono">.woff2</code> files into your
                public folder.
              </p>
              <CodeBlock filename="app/globals.css" code={fontFace} />
            </>
          )}
        </TabPanel>
      </div>
    </Dialog>
  );
}
