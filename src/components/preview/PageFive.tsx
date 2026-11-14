import { Badge, Button, DoubleRule, Eyebrow, Prose, Separator } from "../ui";

const STATS = [
  { label: "Moon, lit", value: "77%" },
  { label: "Lines set", value: "239" },
  { label: "Soft hyphens", value: "20" },
  { label: "Inks on press", value: "2" },
  { label: "Since printing", value: "00:03" },
];

export function PageFive() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
      <DoubleRule />

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <Eyebrow>Vol. I · No. 1 — printed in two inks</Eyebrow>
        <Eyebrow>Type scale, columns, rules</Eyebrow>
      </div>

      <h1 className="font-heading text-4xl leading-[0.95] font-semibold tracking-tight">
        Setting a paragraph, at last
      </h1>

      <Separator />

      {/* The stat strip: boxed, ruled between, mono labels. */}
      <div className="grid grid-cols-2 divide-x divide-y border sm:grid-cols-5 sm:divide-y-0">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 p-3">
            <Eyebrow>{s.label}</Eyebrow>
            <span className="font-mono text-sm tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Three columns, justified, with a cap
          </h2>
          <Eyebrow>By the night desk</Eyebrow>
          <Prose columns={3} justify dropCap>
            <p>
              The type scale is built from one base and one ratio, so every step stays in proportion
              rather than being eight hand-picked numbers that drift apart as a design grows. Change
              the ratio and the whole page re-proportions at once.
            </p>
            <p>
              Justification is only half the job. Without hyphenation the rag turns into rivers of
              white, which is why the two travel together here and why the column rule exists at all
              — a rule between columns is what stops multi-column text reading as a mistake.
            </p>
            <p>
              The capital is sized in lines rather than points, so it stays aligned to the text
              beside it however the scale moves. Editorial does what you would expect: a larger
              base, a wider ratio, and a little negative tracking.
            </p>
          </Prose>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 border p-4">
            <Eyebrow>Elevation</Eyebrow>
            <p className="text-sm">Four rungs, two layers each, tinted by the page.</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card h-12 rounded-md border"
                  style={{ boxShadow: `var(--elevation-${i}, var(--shadow-card))` }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border p-4">
            <Eyebrow>Interaction</Eyebrow>
            <p className="text-sm">Hover and press these — the axis is in the sidebar.</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 border p-4">
            <Eyebrow>Two columns</Eyebrow>
            <Prose columns={2} className="text-xs">
              <p>
                A narrower measure wants a smaller step. The scale handles that; the column count is
                the component's business.
              </p>
              <p>
                Breaks inside a paragraph are avoided, so a column never ends mid-thought where it
                can be helped.
              </p>
            </Prose>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">Prose</Badge>
            <Badge variant="outline">DoubleRule</Badge>
            <Badge variant="outline">Eyebrow</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
