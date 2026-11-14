import * as React from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  Field,
  FieldDescription,
  FieldError,
  Input,
  InputGroup,
  InputGroupAddon,
  Item,
  ItemGroup,
  Kbd,
  Label,
  Menu,
  MenuItem,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Td,
  Textarea,
  Th,
  Toggle,
  ToggleGroup,
  Tooltip,
} from "../ui";
import {
  Bold,
  Icon,
  IconDefs,
  ICON_NAMES,
  Italic,
  Search as SearchIcon,
  Underline,
} from "../icons";
import { Compositions } from "./Compositions";

/* A specimen sheet, not a demo. Every control appears in each of its variants
   and states side by side, because that is the only way to judge whether a
   theme holds up — a design looks fine in one happy-path screen and falls over
   on the disabled, invalid and empty states nobody draws. */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <h2 className="font-heading text-[11px] font-semibold tracking-[0.1em] uppercase">
          {title}
        </h2>
        <span className="bg-border h-px flex-1" />
        {note && <span className="text-muted-foreground text-[11px]">{note}</span>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

/** A labelled row. The label sits in a fixed gutter so every row lines up. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
      <span className="text-muted-foreground w-24 shrink-0 pt-2 text-[11px]">{label}</span>
      <div className="flex flex-1 flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

/** One specimen with its name under it, for things worth naming individually. */
function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {children}
      <span className="text-muted-foreground text-[10px]">{label}</span>
    </div>
  );
}

const SWATCHES = [
  "background",
  "card",
  "muted",
  "accent",
  "border",
  "primary",
  "secondary",
  "destructive",
  "ring",
] as const;

const PLANS = [
  { value: "hobby", label: "Hobby" },
  { value: "pro", label: "Pro", description: "Unlimited projects." },
];

export function Specimens() {
  const [checks, setChecks] = React.useState({ a: true, b: false, c: true });
  const [on, setOn] = React.useState(true);
  const [tab, setTab] = React.useState("overview");
  const [plan, setPlan] = React.useState("pro");
  const [marks, setMarks] = React.useState<string[]>(["bold"]);
  const [pressed, setPressed] = React.useState(true);
  const [value, setValue] = React.useState(62);
  const [page, setPage] = React.useState(2);
  const [open, setOpen] = React.useState(false);
  const [iconSize, setIconSize] = React.useState(24);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 p-6 sm:p-8">
      <IconDefs />

      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Specimens</h1>
        <p className="text-muted-foreground text-sm">
          The core set, every variant and state at once — the sheet to iterate against.
        </p>
      </div>

      {/* -------------------------------------------------- Compositions */}
      {/* First, because this is what gets iterated on. The loose parts below
          are the reference you drop to when a composition looks wrong. */}
      <Section title="Compositions" note="the whole set, assembled">
        <Compositions />
      </Section>

      {/* ---------------------------------------------------------- Type */}
      <Section title="Type" note="one base, one ratio">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">Heading one</h1>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Heading two</h2>
          <h3 className="font-heading text-lg font-semibold">Heading three</h3>
        </div>
        <p className="max-w-prose text-sm">
          Body copy at the base step. The quick brown fox jumps over the lazy dog, and the paragraph
          runs long enough to show how the line-height and measure behave together.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">Muted</span>
          <a href="#type" className="text-primary underline underline-offset-4">
            A link
          </a>
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">inline code</code>
          <span className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </div>
      </Section>

      {/* -------------------------------------------------------- Colour */}
      <Section title="Colour" note="the tokens everything reads">
        <div className="flex flex-wrap gap-2.5">
          {SWATCHES.map((name) => (
            <Spec key={name} label={name}>
              <div
                className="size-14 rounded-md border"
                style={{ backgroundColor: `var(--${name})` }}
              />
            </Spec>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Spec key={n} label={`chart-${n}`}>
              <div
                className="size-14 rounded-md border"
                style={{ backgroundColor: `var(--chart-${n})` }}
              />
            </Spec>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------- Buttons */}
      <Section title="Buttons" note="6 variants · 4 sizes">
        <Row label="Variant">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Row>
        <Row label="Size">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Search">
            <Icon name="search" size={16} />
          </Button>
        </Row>
        <Row label="With icon">
          <Button>
            <Icon name="plus" size={16} />
            New project
          </Button>
          <Button variant="outline">
            Continue
            <Icon name="arrow" size={16} />
          </Button>
          <Button variant="secondary">
            <Spinner />
            Saving
          </Button>
        </Row>
        <Row label="State">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
          <ButtonGroup>
            <Button variant="outline">Day</Button>
            <Button variant="outline">Week</Button>
            <Button variant="outline">Month</Button>
          </ButtonGroup>
        </Row>
      </Section>

      {/* -------------------------------------------------------- Badges */}
      <Section title="Badges">
        <Row label="Variant">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
        </Row>
        <Row label="With mark">
          <Badge variant="outline">
            <span className="bg-primary size-1.5 rounded-full" />
            Live
          </Badge>
          <Badge variant="secondary">
            <Icon name="check" size={12} />
            Paid
          </Badge>
          <Badge variant="outline">12</Badge>
        </Row>
      </Section>

      {/* -------------------------------------------------------- Fields */}
      <Section title="Fields">
        <Row label="Input">
          <Input className="w-52" placeholder="Placeholder" />
          <Input className="w-52" defaultValue="With a value" />
          <Input className="w-52" placeholder="Disabled" disabled />
        </Row>
        <Row label="Composed">
          <InputGroup className="w-56">
            <InputGroupAddon>
              <SearchIcon className="size-3.5" />
            </InputGroupAddon>
            <input placeholder="Search" />
          </InputGroup>
          <Select className="w-44" defaultValue="pro">
            <option value="hobby">Hobby</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
          </Select>
          <Textarea className="w-56" rows={2} placeholder="Tell us more" />
        </Row>
        <Row label="Validation">
          <Field className="w-56">
            <Label htmlFor="spec-email">Email</Label>
            <Input id="spec-email" defaultValue="theo@" aria-invalid />
            <FieldError>That address looks incomplete.</FieldError>
          </Field>
          <Field className="w-56">
            <Label htmlFor="spec-slug">Slug</Label>
            <Input id="spec-slug" defaultValue="design-kit" />
            <FieldDescription>Lowercase, no spaces.</FieldDescription>
          </Field>
        </Row>
      </Section>

      {/* ----------------------------------------------------- Selection */}
      <Section title="Selection">
        <Row label="Checkbox">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={checks.a}
              onCheckedChange={(v) => setChecks((c) => ({ ...c, a: v }))}
            />
            Checked
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={checks.b}
              onCheckedChange={(v) => setChecks((c) => ({ ...c, b: v }))}
            />
            Unchecked
          </label>
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            <Checkbox checked={checks.c} disabled />
            Disabled
          </label>
        </Row>
        <Row label="Switch">
          <Switch checked={on} onCheckedChange={setOn} />
          <Switch checked={!on} onCheckedChange={(v) => setOn(!v)} />
          <Switch checked disabled />
          <Switch checked={false} disabled />
        </Row>
        <Row label="Radio">
          <RadioGroup
            name="spec-plan"
            options={PLANS}
            value={plan}
            onValueChange={setPlan}
            className="flex-row gap-3"
          />
        </Row>
        <Row label="Toggle">
          <ToggleGroup
            value={marks}
            onValueChange={setMarks}
            items={[
              { value: "bold", label: <Bold />, "aria-label": "Bold" },
              { value: "italic", label: <Italic />, "aria-label": "Italic" },
              { value: "underline", label: <Underline />, "aria-label": "Underline" },
            ]}
          />
          <Toggle pressed={pressed} onPressedChange={setPressed}>
            <Icon name="star" size={16} />
            Starred
          </Toggle>
        </Row>
        <Row label="Range">
          <Slider className="w-56" value={value} onValueChange={setValue} />
          <span className="text-muted-foreground font-mono text-xs">{value}</span>
        </Row>
      </Section>

      {/* ------------------------------------------------------ Feedback */}
      <Section title="Feedback">
        <Row label="Alert">
          <div className="flex w-full flex-col gap-2">
            <Alert>
              <Icon name="info" size={16} />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                This alert uses the card and muted-foreground tokens.
              </AlertDescription>
            </Alert>
            <Alert className="border-destructive/40 text-destructive">
              <Icon name="warning" size={16} />
              <AlertTitle>Payment failed</AlertTitle>
              <AlertDescription className="text-destructive/80">
                And this one leans on the destructive token.
              </AlertDescription>
            </Alert>
          </div>
        </Row>
        <Row label="Progress">
          <Progress value={28} className="w-40" />
          <Progress value={62} className="w-40" />
          <Progress value={100} className="w-40" />
        </Row>
        <Row label="Pending">
          <Spinner />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="size-9 rounded-full" />
        </Row>
      </Section>

      {/* ---------------------------------------------------- Navigation */}
      <Section title="Navigation">
        <Row label="Tabs">
          <Tabs
            idBase="spec-tabs"
            value={tab}
            onValueChange={setTab}
            tabs={[
              { value: "overview", label: "Overview" },
              { value: "members", label: "Members" },
              { value: "settings", label: "Settings" },
            ]}
          />
        </Row>
        <Row label="Breadcrumb">
          <Breadcrumb items={[{ label: "Workspace" }, { label: "Projects" }, { label: "Kit" }]} />
        </Row>
        <Row label="Pagination">
          <Pagination page={page} pages={8} onPageChange={setPage} />
        </Row>
      </Section>

      {/* ------------------------------------------------------ Surfaces */}
      <Section title="Surfaces" note="click the triggers">
        <Row label="Card">
          <Card className="w-72">
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>A short supporting line.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Content sits on the card token, one step off the page.
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Save</Button>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </Row>
        <Row label="Overlays">
          <Menu
            trigger={({ toggle }) => (
              <Button variant="outline" onClick={toggle}>
                Menu
              </Button>
            )}
          >
            {(close) => (
              <>
                <MenuItem onClick={close}>Rename</MenuItem>
                <MenuItem onClick={close}>Duplicate</MenuItem>
                <MenuItem onClick={close}>Delete</MenuItem>
              </>
            )}
          </Menu>
          <Popover
            trigger={({ toggle }) => (
              <Button variant="outline" onClick={toggle}>
                Popover
              </Button>
            )}
          >
            {() => (
              <div className="flex flex-col gap-1.5 p-3 text-sm">
                <span className="font-medium">Dimensions</span>
                <span className="text-muted-foreground">Set the width and height.</span>
              </div>
            )}
          </Popover>
          <Tooltip content="On the popover token">
            <Button variant="outline">Tooltip</Button>
          </Tooltip>
          <Button variant="outline" onClick={() => setOpen(true)}>
            Dialog
          </Button>
          {open && (
            <Dialog
              title="Delete project"
              description="This cannot be undone."
              onClose={() => setOpen(false)}
              footer={
                <>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => setOpen(false)}>
                    Delete
                  </Button>
                </>
              }
            >
              <p className="text-muted-foreground text-sm">
                Everything in the project is removed immediately.
              </p>
            </Dialog>
          )}
        </Row>
      </Section>

      {/* ---------------------------------------------------------- Data */}
      <Section title="Data">
        <Row label="Table">
          <Table>
            <thead>
              <tr>
                <Th>Invoice</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              {[
                ["INV-0042", "1 Nov", "Paid", "$120.00"],
                ["INV-0041", "1 Oct", "Paid", "$120.00"],
                ["INV-0040", "1 Sep", "Refunded", "$96.00"],
              ].map(([id, date, state, amount]) => (
                <tr key={id}>
                  <Td className="font-medium">{id}</Td>
                  <Td className="text-muted-foreground">{date}</Td>
                  <Td>
                    <Badge variant={state === "Paid" ? "secondary" : "outline"}>{state}</Badge>
                  </Td>
                  <Td className="text-right font-mono">{amount}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Row>
        <Row label="People">
          <div className="flex -space-x-2">
            {["TL", "AM", "RK", "JP"].map((f) => (
              <Avatar key={f} fallback={f} className="ring-background ring-2" />
            ))}
          </div>
          <Separator className="mx-2 h-8 w-px" />
          <ItemGroup className="w-72">
            <Item title="brief.md" description="Edited 2 hours ago" />
            <Item title="exports" description="12 items" />
          </ItemGroup>
        </Row>
      </Section>

      {/* -------------------------------------------------------- Icons */}
      <Section title="Iconography" note={`${ICON_NAMES.length} drawn · loose line`}>
        <Row label="The set">
          <div className="flex flex-wrap gap-x-5 gap-y-4">
            {ICON_NAMES.map((name) => (
              <Spec key={name} label={name}>
                <span className="flex h-7 items-center">
                  <Icon name={name} size={iconSize} />
                </span>
              </Spec>
            ))}
          </div>
        </Row>
        <Row label="Size">
          {[16, 20, 24, 32, 44].map((s) => (
            <Spec key={s} label={`${s}px`}>
              <span className="flex h-11 items-center">
                <Icon name="bell" size={s} />
              </span>
            </Spec>
          ))}
          <Slider
            className="ml-2 w-32"
            value={iconSize}
            min={14}
            max={40}
            onValueChange={setIconSize}
          />
        </Row>
        <Row label="Weight">
          {[1.25, 1.5, 1.75, 2.25].map((w) => (
            <Spec key={w} label={String(w)}>
              <Icon name="settings" size={28} weight={w} />
            </Spec>
          ))}
        </Row>
        <Row label="Wobble">
          <Spec label="on">
            <Icon name="star" size={28} />
          </Spec>
          <Spec label="off">
            <Icon name="star" size={28} wobble={false} />
          </Spec>
          <Spec label="in a button">
            <Button variant="outline" size="sm">
              <Icon name="download" size={16} />
              Export
            </Button>
          </Spec>
          <Spec label="on the brand">
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
              <Icon name="heart" size={18} />
            </span>
          </Spec>
        </Row>
      </Section>
    </div>
  );
}
