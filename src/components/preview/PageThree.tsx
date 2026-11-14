import {
  Bold,
  Calendar as CalendarIcon,
  CreditCard,
  FileText,
  Folder,
  Italic,
  Image,
  Search,
  Trash2,
  Underline,
  Upload,
} from "../icons";
import * as React from "react";
import {
  Accordion,
  AlertDialog,
  AspectRatio,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  Collapsible,
  Combobox,
  ContextMenu,
  Empty,
  Field,
  FieldDescription,
  FieldError,
  FieldSet,
  HoverCard,
  Input,
  InputGroup,
  InputGroupAddon,
  InputOTP,
  Item,
  ItemGroup,
  Kbd,
  Label,
  Slider,
  Table,
  Td,
  Th,
  Pagination,
  Popover,
  RadioGroup,
  ScrollArea,
  Sheet,
  Skeleton,
  Spinner,
  Toaster,
  Toggle,
  ToggleGroup,
  Tooltip,
  toast,
} from "../ui";

/* IANA identifiers, so their case is not a style: "europe/london" is not a
   quieter Europe/London, it is a zone name that no longer resolves. They opt
   out of the case axis the same way a currency mark does. */
const TIMEZONES = [
  { value: "utc", label: "UTC" },
  { value: "lon", label: "Europe/London" },
  { value: "ber", label: "Europe/Berlin" },
  { value: "nyc", label: "America/New_York" },
  { value: "la", label: "America/Los_Angeles" },
  { value: "tok", label: "Asia/Tokyo" },
  { value: "syd", label: "Australia/Sydney" },
];

const PLANS = [
  { value: "hobby", label: "Hobby", description: "One project, community support." },
  { value: "pro", label: "Pro", description: "Unlimited projects and a staging URL." },
  { value: "team", label: "Team", description: "Shared billing and audit logs." },
];

const FAQ = [
  {
    value: "tokens",
    title: "Which tokens does a style change?",
    content:
      "Radius, spacing, border width, shadows and heading tracking — colour is a separate axis.",
  },
  {
    value: "export",
    title: "Does this paste into a real project?",
    content: "Yes. The export is the same :root and .dark block shadcn/ui expects, in oklch.",
  },
  {
    value: "presets",
    title: "What is in a preset code?",
    content:
      "The whole sidebar, in 38 URL-safe characters — style, scales, fonts, mode and colours.",
  },
];

const FILES = [
  { icon: FileText, title: "brief.md", description: "Edited 2 hours ago · 4 KB" },
  { icon: Image, title: "hero@2x.png", description: "Edited yesterday · 1.2 MB" },
  { icon: Folder, title: "exports", description: "12 items" },
];

const INVOICES = [
  { id: "INV-0042", date: "1 Nov", amount: "$120.00", state: "Paid" },
  { id: "INV-0041", date: "1 Oct", amount: "$120.00", state: "Paid" },
  { id: "INV-0040", date: "1 Sep", amount: "$96.00", state: "Refunded" },
];

export function PageThree() {
  const [marks, setMarks] = React.useState<string[]>(["bold"]);
  const [starred, setStarred] = React.useState(false);
  const [zone, setZone] = React.useState<string | null>("lon");
  const [plan, setPlan] = React.useState("pro");
  const [otp, setOtp] = React.useState("");
  const [day, setDay] = React.useState<Date | null>(new Date());
  const [page, setPage] = React.useState(2);
  const [sheet, setSheet] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [budget, setBudget] = React.useState(58);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[{ label: "Workspace" }, { label: "Design Kit" }, { label: "Components" }]}
        />
        <h1 className="font-heading text-2xl font-semibold tracking-tight">The rest of the set</h1>
        <p className="text-muted-foreground text-sm">
          Everything else from the shadcn/ui registry, on the same tokens.
        </p>
      </div>

      {/* Row 1: inputs ------------------------------------------------ */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fields</CardTitle>
            <CardDescription>Field, input group, combobox, OTP.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <Field>
                <Label htmlFor="site">Site</Label>
                <InputGroup>
                  <InputGroupAddon>https://</InputGroupAddon>
                  <input id="site" placeholder="acme.com" />
                  <InputGroupAddon>.dev</InputGroupAddon>
                </InputGroup>
                <FieldDescription>We'll issue a certificate automatically.</FieldDescription>
              </Field>

              <Field>
                <Label>Timezone</Label>
                <Combobox options={TIMEZONES} value={zone} onValueChange={setZone} keepCase />
              </Field>

              <Field>
                <Label htmlFor="seats">Seats</Label>
                <Input id="seats" defaultValue="0" aria-invalid />
                <FieldError>Pick at least one seat.</FieldError>
              </Field>

              <Field>
                <Label>Verification code</Label>
                <InputOTP value={otp} onValueChange={setOtp} />
                <FieldDescription>
                  Six digits from your authenticator app. Press <Kbd>⌘</Kbd> <Kbd>V</Kbd> to paste.
                </FieldDescription>
              </Field>
            </FieldSet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Choices</CardTitle>
            <CardDescription>Radio group, toggles, button group.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <RadioGroup name="plan" options={PLANS} value={plan} onValueChange={setPlan} />

            <div className="flex flex-col gap-2">
              <Label>Formatting</Label>
              <div className="flex items-center gap-2">
                <ToggleGroup
                  value={marks}
                  onValueChange={setMarks}
                  items={[
                    { value: "bold", label: <Bold />, "aria-label": "Bold" },
                    { value: "italic", label: <Italic />, "aria-label": "Italic" },
                    { value: "underline", label: <Underline />, "aria-label": "Underline" },
                  ]}
                />
                <Toggle pressed={starred} onPressedChange={setStarred}>
                  {starred ? "Starred" : "Star"}
                </Toggle>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Export</Label>
              <ButtonGroup>
                <Button variant="outline">CSS</Button>
                <Button variant="outline">JSON</Button>
                <Button variant="outline">Figma</Button>
              </ButtonGroup>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Tooltip content="Adds a row to the table">
                <Button variant="secondary">Hover me</Button>
              </Tooltip>
              <Popover
                align="start"
                trigger={({ toggle }) => (
                  <Button variant="outline" onClick={toggle}>
                    Popover
                  </Button>
                )}
              >
                {(close) => (
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-sm font-medium">Rename project</p>
                      <p className="text-muted-foreground text-xs">This is visible to the team.</p>
                    </div>
                    <Input defaultValue="Design Kit" />
                    <Button size="sm" onClick={close}>
                      Save
                    </Button>
                  </div>
                )}
              </Popover>
              <HoverCard
                card={
                  <div className="flex gap-3">
                    <Avatar fallback="AL" />
                    <div>
                      <p className="text-sm font-medium">Ada Lovelace</p>
                      <p className="text-muted-foreground text-xs">
                        Joined in 1843. Writes the notes everyone cites.
                      </p>
                    </div>
                  </div>
                }
              >
                <Button variant="link">@ada</Button>
              </HoverCard>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: calendar, list, accordion ----------------------------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Primary marks the selection.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Calendar selected={day} onSelect={setDay} className="w-full" />
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <CalendarIcon className="size-3.5" />
              {day ? day.toDateString() : "Nothing picked"}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>
              Items in a scroll area. Right-click a row for the context menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ContextMenu
              items={[
                { label: "Open" },
                { label: "Duplicate" },
                { label: "Delete", destructive: true },
              ]}
            >
              <ItemGroup>
                {FILES.map((f) => (
                  <Item
                    key={f.title}
                    icon={f.icon}
                    title={f.title}
                    description={f.description}
                    action={<Badge variant="outline">Synced</Badge>}
                  />
                ))}
              </ItemGroup>
            </ContextMenu>

            <ScrollArea className="h-32 rounded-md border p-3">
              <div className="flex flex-col gap-2 text-sm">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span>Build #{420 - i}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {(1.2 + i * 0.3).toFixed(1)}s
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Pagination page={page} pages={5} onPageChange={setPage} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: carousel, accordion, empty ---------------------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Carousel</CardTitle>
            <CardDescription>Aspect ratio holds each slide.</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel
              slides={[1, 2, 3].map((n) => (
                <AspectRatio
                  key={n}
                  ratio={16 / 7}
                  className="flex items-center justify-center"
                  style={{ background: `var(--chart-${n})` }}
                >
                  <span className="font-heading text-background text-xl font-semibold">
                    chart-{n}
                  </span>
                </AspectRatio>
              ))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>Accordion and collapsible.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Accordion items={FAQ} />
            <Collapsible label="Advanced">
              <p className="text-muted-foreground">
                Surface, chart spread and the radius override all live in the sidebar.
              </p>
            </Collapsible>
          </CardContent>
        </Card>
      </div>

      {/* Row 3b: table and slider ------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="gap-0 overflow-hidden py-0 lg:col-span-2">
          <CardHeader className="py-5">
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Table, against the border token.</CardDescription>
          </CardHeader>
          <div className="px-3 pb-3">
            <Table>
              <thead>
                <tr className="border-b">
                  <Th>Invoice</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Amount</Th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <Td className="font-mono text-xs">{r.id}</Td>
                    <Td className="text-muted-foreground">{r.date}</Td>
                    <Td>
                      <Badge variant={r.state === "Paid" ? "default" : "secondary"}>
                        {r.state}
                      </Badge>
                    </Td>
                    <Td className="text-right tabular-nums">{r.amount}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spend cap</CardTitle>
            <CardDescription>Slider, tracking the primary token.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Monthly cap</Label>
              <span className="text-muted-foreground text-sm tabular-nums">${budget * 10}</span>
            </div>
            <Slider value={budget} onValueChange={setBudget} />
            <p className="text-muted-foreground text-xs">
              We'll pause rendering when you reach it.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: states ------------------------------------------------ */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loading and empty</CardTitle>
            <CardDescription>Skeleton, spinner, empty state.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <Empty
              icon={Upload}
              title="No exports yet"
              description="Themes you export will show up here."
              action={
                <Button size="sm" variant="outline">
                  <Upload /> Export theme
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overlays</CardTitle>
            <CardDescription>Sheet, alert dialog, toast.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setSheet(true)}>
              <Search /> Open sheet
            </Button>
            <Button variant="destructive" onClick={() => setConfirm(true)}>
              <Trash2 /> Delete project
            </Button>
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  toast({ title: "Theme saved", description: "Preset copied to your clipboard." });
                }, 900);
              }}
            >
              {loading ? <Spinner /> : <CreditCard />}
              {loading ? "Saving…" : "Save and toast"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {sheet && (
        <Sheet
          title="Billing"
          description="Everything on one card."
          onClose={() => setSheet(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setSheet(false)}>
                Cancel
              </Button>
              <Button onClick={() => setSheet(false)}>Save</Button>
            </>
          }
        >
          <FieldSet>
            <Field>
              <Label htmlFor="card">Card number</Label>
              <InputGroup>
                <InputGroupAddon>
                  <CreditCard className="size-4" />
                </InputGroupAddon>
                <input id="card" placeholder="4242 4242 4242 4242" />
              </InputGroup>
            </Field>
            <Field>
              <Label>Plan</Label>
              <RadioGroup name="sheet-plan" options={PLANS} value={plan} onValueChange={setPlan} />
            </Field>
          </FieldSet>
        </Sheet>
      )}

      {confirm && (
        <AlertDialog
          destructive
          title="Delete this project?"
          description="Every preset and export in it goes too. This cannot be undone."
          confirmLabel="Delete"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            setConfirm(false);
            toast({
              title: "Project deleted",
              description: "You can restore it for 30 days.",
              variant: "destructive",
            });
          }}
        />
      )}

      {/* Lifted clear of the preview pager in the corner below. */}
      <Toaster className="bottom-20" />
    </div>
  );
}
