import { BarChart3, Bell, Boxes, CreditCard, Home, Settings2, Users, Wrench } from "../icons";
import * as React from "react";
import {
  AppSidebar,
  Attachment,
  Avatar,
  Badge,
  Bubble,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  Drawer,
  Input,
  Marker,
  Menubar,
  Message,
  MessageScroller,
  NavigationMenu,
  Resizable,
  Separator,
  Spinner,
  type ChartSeries,
} from "../ui";

const SERIES: ChartSeries[] = [
  { key: "web", label: "Web", token: "--chart-1" },
  { key: "api", label: "API", token: "--chart-2" },
  { key: "jobs", label: "Jobs", token: "--chart-3" },
];

const DATA = [
  { label: "Mon", values: [48, 31, 12] },
  { label: "Tue", values: [62, 44, 19] },
  { label: "Wed", values: [41, 28, 24] },
  { label: "Thu", values: [78, 52, 16] },
  { label: "Fri", values: [66, 39, 29] },
  { label: "Sat", values: [24, 18, 9] },
  { label: "Sun", values: [19, 12, 7] },
];

const NAV = [
  {
    label: "Product",
    links: [
      { title: "Theme builder", blurb: "Colour and shape on separate axes." },
      { title: "Palettes", blurb: "Saved colour sets, one click each." },
      { title: "Presets", blurb: "The whole sidebar in 46 characters." },
    ],
  },
  {
    label: "Developers",
    links: [
      { title: "Token contract", blurb: "The same names real shadcn/ui components read." },
      { title: "Export", blurb: ":root and .dark, in oklch." },
    ],
  },
];

const MENUS = [
  { label: "File", items: ["New preset", "Open preset…", "-", "Export CSS", "Copy code"] },
  { label: "Edit", items: ["Undo", "Redo", "-", "Shuffle"] },
  { label: "View", items: ["Light", "Dark", "-", "Page 01", "Page 02"] },
];

const GROUPS = [
  {
    label: "Workspace",
    items: [
      { value: "home", label: "Overview", icon: Home },
      { value: "usage", label: "Usage", icon: BarChart3 },
      { value: "team", label: "Team", icon: Users },
    ],
  },
  {
    label: "Settings",
    items: [
      { value: "billing", label: "Billing", icon: CreditCard },
      { value: "integrations", label: "Integrations", icon: Boxes },
      { value: "advanced", label: "Advanced", icon: Settings2 },
    ],
  },
];

const THREAD = [
  { from: "user" as const, text: "Can you read the theme off this screenshot?" },
  {
    from: "assistant" as const,
    text: "Yes — background, text, brand and the corner radius. I'll map the radius onto the nearest style.",
  },
  { from: "user" as const, text: "And the shadows?" },
  {
    from: "assistant" as const,
    text: "Those come from the style preset. A screenshot can't tell a blur from a spread.",
  },
];

export function PageFour() {
  const [nav, setNav] = React.useState("usage");
  const [drawer, setDrawer] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">App chrome</h1>
        <p className="text-muted-foreground text-sm">
          Menubar, navigation, panes, charts and the chat set.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Menubar menus={MENUS} />
        <NavigationMenu items={NAV} />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex min-h-72">
          <AppSidebar
            groups={GROUPS}
            active={nav}
            onSelect={setNav}
            footer={
              <div className="flex items-center gap-2">
                <Avatar fallback="TL" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">Theo</div>
                  <div className="text-muted-foreground truncate text-[11px]">Pro plan</div>
                </div>
                <Bell className="text-muted-foreground size-4 shrink-0" />
              </div>
            }
          />
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-base font-semibold">Requests this week</h2>
                <p className="text-muted-foreground text-xs">Hover a day for the breakdown.</p>
              </div>
              <Badge variant="secondary">+12.4%</Badge>
            </div>
            <ChartContainer series={SERIES} data={DATA} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Panes</CardTitle>
            <CardDescription>Drag the divider, or focus it and use the arrows.</CardDescription>
          </CardHeader>
          <CardContent>
            <Resizable
              className="h-44"
              start={
                <div className="flex h-full flex-col gap-2 text-sm">
                  <span className="font-medium">globals.css</span>
                  <code className="text-muted-foreground font-mono text-[11px] leading-relaxed">
                    :root &#123;
                    <br />
                    &nbsp;&nbsp;--radius: 0.625rem;
                    <br />
                    &nbsp;&nbsp;--spacing: 0.25rem;
                    <br />
                    &#125;
                  </code>
                </div>
              }
              end={
                <div className="flex h-full flex-col gap-2 text-sm">
                  <span className="font-medium">Preview</span>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Primary</Button>
                    <Button size="sm" variant="outline">
                      Outline
                    </Button>
                  </div>
                </div>
              }
            />
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="py-4">
            <CardTitle>Thread</CardTitle>
            <CardDescription>Message, bubble, marker, attachment.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col gap-3 py-4">
            <MessageScroller className="max-h-44 pr-1">
              <Marker>Today</Marker>
              {THREAD.map((m, i) => (
                <Message key={i} from={m.from}>
                  {m.from === "assistant" && <Avatar fallback="DK" />}
                  <Bubble from={m.from}>{m.text}</Bubble>
                </Message>
              ))}
              <Message from="assistant">
                <Avatar fallback="DK" />
                <Bubble>
                  <span className="flex items-center gap-2">
                    <Spinner className="size-3" /> Reading the palette…
                  </span>
                </Bubble>
              </Message>
            </MessageScroller>
            <Attachment name="dashboard.png" meta="248 KB" onRemove={() => {}} />
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Send a message…"
              />
              <Button onClick={() => setDraft("")}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drawer</CardTitle>
          <CardDescription>A sheet from the bottom, with a grab handle.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setDrawer(true)}>
            <Wrench /> Open drawer
          </Button>
        </CardContent>
      </Card>

      {drawer && (
        <Drawer
          title="Quick settings"
          description="The things you change most often."
          onClose={() => setDrawer(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDrawer(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDrawer(false)}>Apply</Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <Attachment name="brand-guidelines.pdf" meta="1.1 MB" />
            <Attachment name="palette.json" meta="4 KB" />
          </div>
        </Drawer>
      )}
    </div>
  );
}
