import { ArrowUpRight, Bell, CreditCard, Info, Search, TriangleAlert, Users } from "../icons";
import * as React from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Progress,
  Select,
  Separator,
  Slider,
  Switch,
  TabPanel,
  Table,
  Tabs,
  Td,
  Textarea,
  Th,
} from "../ui";

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;
const BADGE_VARIANTS = ["default", "secondary", "outline", "destructive"] as const;

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "members", label: "Members" },
  { value: "settings", label: "Settings" },
];

const STATS = [
  { label: "Revenue", value: "$42,120", delta: "+12.4%", icon: CreditCard },
  { label: "Active users", value: "2,350", delta: "+4.1%", icon: Users },
  { label: "Churn", value: "0.9%", delta: "−0.3%", icon: ArrowUpRight },
];

const ROWS = [
  {
    name: "Ada Lovelace",
    email: "ada@analytical.co",
    plan: "Pro",
    status: "Active",
    usage: 78,
  },
  {
    name: "Grace Hopper",
    email: "grace@navy.mil",
    plan: "Team",
    status: "Active",
    usage: 46,
  },
  {
    name: "Alan Turing",
    email: "alan@bletchley.uk",
    plan: "Free",
    status: "Invited",
    usage: 12,
  },
];

const BARS = [62, 88, 45, 97, 71, 54, 80];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const SURFACES = [
  ["background", "bg-background"],
  ["card", "bg-card"],
  ["muted", "bg-muted"],
  ["accent", "bg-accent"],
  ["primary", "bg-primary"],
  ["secondary", "bg-secondary"],
  ["destructive", "bg-destructive"],
  ["border", "bg-border"],
];

export function PageOne() {
  const [tab, setTab] = React.useState("overview");
  const [notify, setNotify] = React.useState(true);
  const [terms, setTerms] = React.useState(false);
  const [budget, setBudget] = React.useState(42);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
      {/* Top bar ---------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            A whole component set, wearing the theme you just made.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input placeholder="Search…" className="w-44 pl-8" />
          </div>
          <Button variant="outline" size="icon" aria-label="Notifications">
            <Bell />
          </Button>
          <Button>
            New project <ArrowUpRight />
          </Button>
        </div>
      </div>

      <Tabs idBase="page-one" value={tab} onValueChange={setTab} tabs={TABS} />

      {/* Overview ---------------------------------------------------- */}
      <TabPanel idBase="page-one" value="overview" active={tab}>
        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <Card key={s.label} className="gap-3 py-5">
              <CardHeader className="px-5">
                <div className="flex items-center justify-between">
                  <CardDescription>{s.label}</CardDescription>
                  <s.icon className="text-muted-foreground size-4" />
                </div>
                <CardTitle className="font-heading text-2xl">{s.value}</CardTitle>
              </CardHeader>
              <CardContent className="px-5">
                <Badge variant="secondary">{s.delta}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Weekly volume</CardTitle>
              <CardDescription>The five chart tokens, in order.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 gap-2">
                {BARS.map((h, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${h}%`,
                        background: `var(--chart-${(i % 5) + 1})`,
                      }}
                    />
                    <span className="text-muted-foreground text-center text-[11px]">{DAYS[i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-wrap gap-x-4 gap-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: `var(--chart-${i})` }}
                  />
                  Series {i}
                </span>
              ))}
            </CardFooter>
          </Card>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <Alert>
              <Info />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                This alert uses the card and muted-foreground tokens.
              </AlertDescription>
            </Alert>
            <Alert className="border-destructive/40 text-destructive">
              <TriangleAlert />
              <AlertTitle>Payment failed</AlertTitle>
              <AlertDescription className="text-destructive/80">
                And this one leans on the destructive token.
              </AlertDescription>
            </Alert>
            <Card className="gap-3 py-5">
              <CardHeader className="px-5">
                <CardTitle className="text-base">This month</CardTitle>
                <CardDescription>Seat usage across the plan.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 px-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="tabular-nums">17 / 25</span>
                </div>
                <Progress value={68} />
              </CardContent>
            </Card>
          </div>
        </div>
      </TabPanel>

      {/* Members ----------------------------------------------------- */}
      <TabPanel idBase="page-one" value="members" active={tab}>
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="gap-0 overflow-hidden py-0 lg:col-span-3">
            <CardHeader className="py-5">
              <CardTitle>Members</CardTitle>
              <CardDescription>Three people, one border token.</CardDescription>
            </CardHeader>
            <Separator />
            <div className="px-3 pb-3">
              <Table>
                <thead>
                  <tr className="border-b">
                    <Th>Person</Th>
                    <Th>Plan</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Usage</Th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.email} className="border-b last:border-0">
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar
                            fallback={r.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")}
                          />
                          <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-muted-foreground text-xs">{r.email}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Badge variant="outline">{r.plan}</Badge>
                      </Td>
                      <Td>
                        <Badge variant={r.status === "Active" ? "default" : "secondary"}>
                          {r.status}
                        </Badge>
                      </Td>
                      <Td className="w-32">
                        <Progress value={r.usage} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invite a teammate</CardTitle>
              <CardDescription>Input, select and textarea.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="name@company.com" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <Select id="role" defaultValue="editor">
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="note">Note</Label>
                <Textarea id="note" placeholder="Optional message…" />
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button className="flex-1">Send invite</Button>
              <Button variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
        </div>
      </TabPanel>

      {/* Settings ---------------------------------------------------- */}
      <TabPanel idBase="page-one" value="settings" active={tab}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Switch, slider and checkbox.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notify">Email notifications</Label>
                <Switch checked={notify} onCheckedChange={setNotify} />
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>Monthly budget</Label>
                  <span className="text-muted-foreground text-sm tabular-nums">${budget * 10}</span>
                </div>
                <Slider value={budget} onValueChange={setBudget} />
              </div>
              <Separator />
              <Label className="items-start">
                <Checkbox checked={terms} onCheckedChange={setTerms} />
                <span className="font-normal">
                  Everyone on the team agrees to the acceptable use policy.
                </span>
              </Label>
            </CardContent>
            <CardFooter className="gap-2">
              <Button className="flex-1">Save changes</Button>
              <Button variant="ghost">Reset</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Every variant and size.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {BUTTON_VARIANTS.map((v) => (
                  <Button key={v} variant={v}>
                    {v}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {BADGE_VARIANTS.map((v) => (
                  <Badge key={v} variant={v}>
                    {v}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="gap-3 py-5">
          <CardHeader className="px-5">
            <CardTitle className="text-base">Surface stack</CardTitle>
            <CardDescription>Every background token, side by side.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-2 px-5 sm:grid-cols-8">
            {SURFACES.map(([name, cls]) => (
              <div key={name} className="flex flex-col gap-1.5">
                <div className={`h-10 rounded-md border ${cls}`} />
                <span className="text-muted-foreground truncate text-[11px]">{name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabPanel>
    </div>
  );
}
