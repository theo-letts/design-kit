import * as React from "react";
import {
  Accordion,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Empty,
  Input,
  InputGroup,
  InputGroupAddon,
  Item,
  ItemGroup,
  Label,
  Progress,
  Select,
  Separator,
  Slider,
  Switch,
  TabPanel,
  Tabs,
  Textarea,
} from "../ui";
import {
  Archive,
  ArrowUpRight,
  Bell,
  Calendar,
  CreditCard,
  Home,
  Icon,
  Lock,
  Search,
  Sparkles,
  TriangleAlert,
  Upload,
  Users,
  Zap,
} from "../icons";
import { cn } from "@/lib/utils";

/* Composed blocks, where the specimen sheet above is loose parts.

   A theme can pass every control in isolation and still fall apart the moment
   three of them share a card: the gap under a label stops matching the gap
   between rows, a heading at 1.25rem fights the number next to it, a border
   lands against a muted fill that is one step too close. These are the shapes
   that catch that — a form, a list, a figure, a settings page, a nav.

   Everything here reads tokens only. There is no hardcoded colour anywhere in
   this file, which is what lets the same markup sit under every kit. */

/** A money amount. shadcn ships no success token — only destructive — so
 *  colour cannot carry gain vs loss without inventing one. The sign does it
 *  instead, which survives every kit including the monochrome ones. */
function Amount({ value, className }: { value: string; className?: string }) {
  return <span className={cn("text-sm font-medium tabular-nums", className)}>{value}</span>;
}

/** A string whose case is part of its meaning rather than its styling.
 *  "US$" set lowercase is not a quieter way of writing the same thing, it is
 *  a currency mark spelled wrong — so it opts out of the case axis.
 *
 *  Wrap the whole figure, not just the mark. Kerning does not cross an
 *  element boundary, so splitting "US$12.94" after the "$" moves the digits
 *  a fraction — the visual gate caught it at 0.001%. Digits have no case, so
 *  taking them inside costs nothing and keeps the pair intact. */
function Mark({ children }: { children: React.ReactNode }) {
  return <span data-case="keep">{children}</span>;
}

/** Label on the left, value on the right — the summary row every form ends with. */
function Line({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={cn(strong ? "font-medium" : "text-muted-foreground")}>{label}</span>
      <span className={cn("tabular-nums", strong && "font-medium")}>{value}</span>
    </div>
  );
}

/** The dismiss affordance in the corner of a panel. */
function Close({ label = "Dismiss" }: { label?: string }) {
  return (
    <Button variant="ghost" size="icon" className="-mt-1 -mr-1 size-7" aria-label={label}>
      <Icon name="close" size={14} />
    </Button>
  );
}

/** Three dots. Not an icon in the set, and a glyph is honest about that. */
function More({ label }: { label: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 shrink-0"
      aria-label={label}
    >
      <span aria-hidden className="text-base leading-none">
        ···
      </span>
    </Button>
  );
}

/* ------------------------------------------------------------- the top */

/** An application bar: brand, primary nav, search, actions, account. The one
 *  piece of furniture every screen has and the specimen sheet had none of. */
function AppBar() {
  return (
    <header className="bg-card text-card-foreground flex flex-wrap items-center gap-3 rounded-xl border p-3 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
          <Sparkles className="size-4" />
        </span>
        <span className="font-heading text-sm font-semibold">Ledger</span>
      </div>

      <nav aria-label="Primary" className="text-muted-foreground flex items-center gap-1 text-sm">
        {["Overview", "Transactions", "Reports"].map((item, i) => (
          <a
            key={item}
            href="#"
            aria-current={i === 0 ? "page" : undefined}
            className={cn(
              "rounded-md px-2.5 py-1.5 transition-colors",
              i === 0 ? "bg-accent text-accent-foreground font-medium" : "hover:text-foreground",
            )}
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <InputGroup className="hidden w-52 md:flex">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <Input placeholder="Search" aria-label="Search" />
        </InputGroup>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-4" />
          <span className="bg-destructive absolute top-1.5 right-1.5 size-1.5 rounded-full" />
        </Button>
        <Avatar fallback="TL" />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------- figures */

const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const BARS = [52, 74, 46, 88, 38, 100];

/** A figure with its own stat tiles under it. Bars read --chart-1, so the
 *  chart spread axis is visible here and not only in the colour swatches. */
function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribution History</CardTitle>
        <CardDescription>Last 6 months of activity</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex h-32 items-end gap-2" role="img" aria-label="Monthly contributions">
          {BARS.map((h, i) => (
            <div
              key={MONTHS[i]}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <div
                className="bg-chart-1 w-full shrink-0 rounded-sm"
                style={{ height: `${h * 0.88}%` }}
                title={`${MONTHS[i]}: ${h}`}
              />
              <span className="text-muted-foreground text-[10px]">{MONTHS[i]}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 flex flex-col gap-0.5 rounded-lg border p-3">
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
              Upcoming
            </span>
            <span className="font-heading text-sm font-semibold">May 25, 2024</span>
            <span className="text-muted-foreground text-xs">$1,000 scheduled</span>
          </div>
          <div className="bg-muted/50 flex flex-col gap-0.5 rounded-lg border p-3">
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
              Auto-save
            </span>
            <span className="font-heading text-sm font-semibold">Accelerated</span>
            <span className="text-muted-foreground text-xs">Recurring weekly</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Full Report</Button>
      </CardFooter>
    </Card>
  );
}

const SPARK = [38, 52, 30, 64, 46, 58, 42, 70, 55, 78, 62, 96];
const SPARK_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/** The same figure at a twelfth the size. A chart has to survive this too. */
function SparkCard() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm">Yearly Activity</CardTitle>
        <Badge variant="secondary">
          {/* One flex item, not two: Badge is an inline-flex with gap-1, so
              marking part of its text would turn the rest into a sibling and
              the gap would open a second space beside the real one. */}
          <span>
            <Mark>+US$0.25</Mark> daily
          </span>
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex h-16 items-end gap-1" role="img" aria-label="Activity by month">
          {SPARK.map((h, i) => (
            <div
              key={SPARK_LABELS[i] + i}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <div
                className={cn(
                  "w-full shrink-0 rounded-[2px]",
                  i === SPARK.length - 1 ? "bg-foreground" : "bg-foreground/25",
                )}
                style={{ height: `${h * 0.82}%` }}
              />
              <span className="text-muted-foreground text-[9px]">{SPARK_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Two tiles side by side: the smallest composition that still has a hierarchy. */
function StatPair() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="gap-2 p-4">
        <span className="text-muted-foreground text-xs">Card Balance</span>
        <span className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
          <Mark>US$12.94</Mark>
        </span>
        <span className="text-muted-foreground text-xs">
          <Mark>US$11,337.06</Mark> available
        </span>
      </Card>
      <Card className="gap-2 p-4">
        <span className="text-muted-foreground text-xs">Payment Due</span>
        <span className="font-heading text-2xl font-semibold tracking-tight">1 Apr</span>
        <Button variant="outline" size="sm" className="mt-auto w-full">
          Pay Early
        </Button>
      </Card>
    </div>
  );
}

const GOALS = [
  { name: "Retirement", total: "$420,000", pct: 65, saved: "$273,000" },
  { name: "Real Estate", total: "$85,000", pct: 32, saved: "$27,200" },
];

/** Progress as the subject rather than an afterthought under a dialog. */
function GoalsCard() {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Savings Targets</CardTitle>
          <CardDescription>Active milestones for 2024</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          New Goal
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {GOALS.map((g) => (
          <div key={g.name} className="bg-muted/50 flex flex-col gap-2 rounded-lg border p-3">
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
              {g.name}
            </span>
            <span className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
              {g.total}
            </span>
            <Progress value={g.pct} />
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>{g.pct}% achieved</span>
              <span className="tabular-nums">{g.saved}</span>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-xs">
          You have not met your targets for this year.
        </p>
      </CardFooter>
    </Card>
  );
}

/* --------------------------------------------------------------- forms */

/** A settings form: select, slider with its own bounds, free text, one action.
 *  The slider's value is echoed large because a bare thumb tells you nothing. */
function ThresholdCard() {
  const [amount, setAmount] = React.useState(2500);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Payout Threshold</CardTitle>
          <CardDescription>
            Set the minimum balance required before a payout is triggered.
          </CardDescription>
        </div>
        <Close />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cmp-currency">Preferred Currency</Label>
          <Select id="cmp-currency" defaultValue="usd">
            <option value="usd" data-case="keep">
              USD — United States Dollar
            </option>
            <option value="gbp" data-case="keep">
              GBP — Pound Sterling
            </option>
            <option value="eur" data-case="keep">
              EUR — Euro
            </option>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="cmp-min">Minimum Payout Amount</Label>
            <span className="font-heading text-xl font-semibold tabular-nums">
              ${amount.toLocaleString()}.00
            </span>
          </div>
          <Slider
            id="cmp-min"
            value={amount}
            min={50}
            max={10000}
            step={50}
            onValueChange={setAmount}
          />
          <div className="text-muted-foreground flex justify-between text-[11px]">
            <span>$50 (min)</span>
            <span>$10,000 (max)</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="cmp-notes">Notes</Label>
          <Textarea id="cmp-notes" placeholder="Add any notes for this payout configuration…" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Save Threshold</Button>
      </CardFooter>
    </Card>
  );
}

/** A transactional form: input with a unit, a choice, consequences, commit. */
function OrderCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy Investment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cmp-amount">Amount to Invest</Label>
          <InputGroup>
            <InputGroupAddon>$</InputGroupAddon>
            <Input id="cmp-amount" defaultValue="1,000.00" inputMode="decimal" />
          </InputGroup>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="cmp-order">Order Type</Label>
          <Select id="cmp-order" defaultValue="market">
            <option value="market">Market Order</option>
            <option value="limit">Limit Order</option>
          </Select>
          <p className="text-muted-foreground text-xs">
            Market orders execute at the current price.
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Line label="Estimated Shares" value="1.95" />
          <Line label="Buying Power" value="$12,450.00" />
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <Button className="w-full">Review Order</Button>
        <p className="text-muted-foreground text-center text-xs">
          Trades are typically executed within minutes during market hours.
        </p>
      </CardFooter>
    </Card>
  );
}

/** Two accounts, an amount and a total — plus the destructive-free commit that
 *  still deserves to look like a commitment. */
function TransferCard() {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Transfer Funds</CardTitle>
          <CardDescription>Move money between your connected accounts.</CardDescription>
        </div>
        <Close />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cmp-transfer">Amount to Transfer</Label>
          <InputGroup>
            <InputGroupAddon>$</InputGroupAddon>
            <Input id="cmp-transfer" defaultValue="1,200.00" inputMode="decimal" />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cmp-from">From Account</Label>
          <Select id="cmp-from" defaultValue="checking">
            <option value="checking">Main Checking (··8402) — $12,450.00</option>
            <option value="savings">High Yield Savings (··1192) — $42,100.00</option>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cmp-to">To Account</Label>
          <Select id="cmp-to" defaultValue="savings">
            <option value="savings">High Yield Savings (··1192) — $42,100.00</option>
            <option value="checking">Main Checking (··8402) — $12,450.00</option>
          </Select>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Line label="Estimated arrival" value="Today, Apr 14" />
          <Line label="Transaction fee" value="$0.00" />
          <Line label="Total amount" value="$1,200.00" strong />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Confirm Transfer</Button>
      </CardFooter>
    </Card>
  );
}

/** Credentials, then the one route out of the product. The danger zone is the
 *  interesting part: destructive has to read as a warning without shouting
 *  louder than the primary action above it. */
function SecurityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Access</CardTitle>
        <CardDescription>Update your credentials or re-authenticate.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cmp-email">Email Address</Label>
          <Input id="cmp-email" type="email" defaultValue="artist@studio.inc" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="cmp-pw">Current Password</Label>
            <a href="#" className="text-muted-foreground hover:text-foreground text-[11px]">
              Forgot?
            </a>
          </div>
          <Input id="cmp-pw" type="password" defaultValue="supersecret" />
        </div>
        <Button className="w-full">
          <Lock className="size-4" />
          Update Security
        </Button>

        <div className="border-destructive/40 bg-destructive/5 flex items-center gap-3 rounded-lg border p-3">
          <TriangleAlert className="text-destructive size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Danger Zone</div>
            <div className="text-muted-foreground text-xs">Archive account and remove catalog</div>
          </div>
          <ArrowUpRight className="text-muted-foreground size-4 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

/** Preferences: the pattern where a switch row's label and description have to
 *  stay readable next to a control that is pinned right. */
function PreferencesCard() {
  const [stats, setStats] = React.useState(true);
  const [emails, setEmails] = React.useState(true);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your account settings and notifications.</CardDescription>
        </div>
        <Close />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cmp-default-currency">Default Currency</Label>
          <Select id="cmp-default-currency" defaultValue="usd">
            <option value="usd" data-case="keep">
              USD — United States Dollar
            </option>
            <option value="jpy" data-case="keep">
              JPY — Japanese Yen
            </option>
          </Select>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Public Statistics</span>
            <span className="text-muted-foreground text-xs">
              Allow others to see your total stream count and listening activity.
            </span>
          </div>
          <Switch checked={stats} onCheckedChange={setStats} aria-label="Public statistics" />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Email Notifications</span>
            <span className="text-muted-foreground text-xs">
              Monthly royalty reports and distribution updates.
            </span>
          </div>
          <Switch checked={emails} onCheckedChange={setEmails} aria-label="Email notifications" />
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost" size="sm">
          Reset
        </Button>
        <Button size="sm">Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}

/* --------------------------------------------------------------- lists */

const TX = [
  {
    name: "Blue Bottle Coffee",
    cat: "Food & Drink",
    when: "Today, 10:24",
    amt: "−$6.50",
    icon: "circle",
  },
  {
    name: "Whole Foods Market",
    cat: "Groceries",
    when: "Yesterday",
    amt: "−$142.30",
    icon: "boxes",
  },
  { name: "Stripe Payout", cat: "Income", when: "Oct 12", amt: "+$4,200.00", icon: "card" },
  { name: "Uber Technologies", cat: "Transport", when: "Oct 11", amt: "−$24.10", icon: "zap" },
  {
    name: "Netflix Subscription",
    cat: "Entertainment",
    when: "Oct 10",
    amt: "−$19.99",
    icon: "play",
  },
] as const;

/** The densest row in most products: icon, two lines, a date, a number and an
 *  overflow — five things competing for one baseline. */
function TransactionsCard() {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest account activity.</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="@container flex flex-col divide-y">
        {TX.map((t) => (
          <div key={t.name} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
              <Icon name={t.icon} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{t.name}</div>
              <div className="text-muted-foreground truncate text-xs">{t.cat}</div>
            </div>
            <span className="text-muted-foreground hidden shrink-0 text-xs @sm:inline">
              {t.when}
            </span>
            <Amount value={t.amt} />
            <More label={`Actions for ${t.name}`} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Money broken into its parts, ending in a total — and an empty state that is
 *  all zeroes rather than absent, which is the harder one to make look right. */
function BalanceCard() {
  return (
    <Card>
      <CardHeader className="gap-3">
        <CardDescription>Claimable Balance</CardDescription>
        <CardTitle className="font-heading text-4xl tracking-tight tabular-nums">$0.00</CardTitle>
        <Badge variant="secondary" className="gap-1.5">
          <span className="bg-chart-1 size-1.5 rounded-full" />
          Pending Setup
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 flex flex-col gap-2 rounded-lg border p-3">
          <Line label="Net Royalties" value="$0.00" />
          <Line label="Processing Fee" value="−$0.00" />
          <Separator />
          <Line
            label="Total Ready to Claim"
            value={
              <>
                <Mark>$0.00 USD</Mark>
              </>
            }
            strong
          />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-xs">
          Once your bank is connected, balances over $10.00 are automatically eligible for monthly
          distribution on the 15th of each month.
        </p>
      </CardFooter>
    </Card>
  );
}

/** Nothing here yet. The state most themes never get drawn in. */
function EmptyCard() {
  return (
    <Card className="p-2">
      <Empty
        icon={Upload}
        title="Distribute Track"
        description="Upload your first master to start reaching listeners on Spotify, Apple Music, and more."
        action={<Button size="sm">Create Release</Button>}
        className="border-0"
      />
    </Card>
  );
}

/* ------------------------------------------------------------ wayfinding */

const NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", icon: Home },
      { label: "Transactions", icon: CreditCard },
      { label: "Investments", icon: Zap },
      { label: "Accounts", icon: Users },
    ],
  },
  {
    group: "Planning",
    items: [
      { label: "Goals", icon: Sparkles },
      { label: "Budget", icon: Calendar },
      { label: "Documents", icon: Archive },
    ],
  },
];

/** A sidebar out of its sidebar. Nav is where a theme's hover, active and
 *  muted states all have to coexist in one short list. */
function NavCard() {
  const [active, setActive] = React.useState("Dashboard");
  return (
    <Card className="p-2">
      <nav aria-label="Sections" className="flex flex-col gap-3">
        {NAV.map((g) => (
          <div key={g.group} className="flex flex-col gap-0.5">
            <span className="text-muted-foreground px-2 py-1 text-[11px]">{g.group}</span>
            {g.items.map((it) => {
              const on = it.label === active;
              return (
                <button
                  key={it.label}
                  type="button"
                  aria-current={on ? "page" : undefined}
                  onClick={() => setActive(it.label)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    on ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50",
                  )}
                >
                  <it.icon className="text-muted-foreground size-4 shrink-0" />
                  {it.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </Card>
  );
}

/** Breadcrumb into a list of routes — the settings index shape, where every
 *  row is identical and the only hierarchy is type. */
function SettingsCard() {
  return (
    <Card>
      <CardHeader className="gap-3">
        <Breadcrumb items={[{ label: "Home" }, { label: "Settings" }, { label: "Payments" }]} />
      </CardHeader>
      <CardContent>
        <ItemGroup>
          <Item
            icon={Zap}
            title="Change transfer limit"
            description="Adjust how much you can send from your balance."
            action={<Icon name="chevron" size={16} className="text-muted-foreground" />}
          />
          <Item
            icon={Calendar}
            title="Scheduled transfers"
            description="Set up a transfer to send at a later date."
            action={<Icon name="chevron" size={16} className="text-muted-foreground" />}
          />
          <Item
            icon={CreditCard}
            title="Direct Debits"
            description="Set up and manage regular payments."
            action={<Icon name="chevron" size={16} className="text-muted-foreground" />}
          />
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

const FAQ = [
  {
    value: "security",
    title: "How secure is my financial data?",
    content:
      "Balances are read through a token that never touches our servers, and every transfer is confirmed on your device before it leaves.",
  },
  {
    value: "fees",
    title: "What fees apply to a transfer?",
    content: "Transfers between your own accounts are free. External transfers settle in one day.",
  },
  {
    value: "limits",
    title: "Can I raise my limits?",
    content: "Limits lift automatically after ninety days, or immediately once you verify ID.",
  },
];

/** Tabs over an accordion: two disclosure patterns stacked, which is where
 *  border and divider weights start arguing with each other. */
function FaqCard() {
  const [tab, setTab] = React.useState("general");
  return (
    <Card>
      <CardHeader>
        <Tabs
          idBase="cmp-faq"
          value={tab}
          onValueChange={setTab}
          tabs={[
            { value: "general", label: "General" },
            { value: "billing", label: "Billing" },
            { value: "goals", label: "Goals" },
          ]}
        />
      </CardHeader>
      <CardContent>
        <TabPanel idBase="cmp-faq" value="general" active={tab}>
          <Accordion items={FAQ} />
        </TabPanel>
        <TabPanel idBase="cmp-faq" value="billing" active={tab}>
          <p className="text-muted-foreground py-4 text-sm">
            Your plan renews on 1 April. Invoices are emailed the same morning.
          </p>
        </TabPanel>
        <TabPanel idBase="cmp-faq" value="goals" active={tab}>
          <p className="text-muted-foreground py-4 text-sm">
            Two goals are active. Contributions are split evenly between them.
          </p>
        </TabPanel>
      </CardContent>
    </Card>
  );
}

/* --------------------------------------------------------------- export */

export function Compositions() {
  return (
    <div className="flex flex-col gap-4">
      <AppBar />

      {/* Columns rather than a grid: real product cards are never the same
          height, and a grid would pad them all to the tallest and hide exactly
          the vertical-rhythm problems this section exists to expose. */}
      <div className="gap-4 md:columns-2 xl:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
        <ActivityCard />
        <ThresholdCard />
        <GoalsCard />
        <TransactionsCard />
        <SecurityCard />
        <BalanceCard />
        <OrderCard />
        <PreferencesCard />
        <NavCard />
        <TransferCard />
        <SettingsCard />
        <StatPair />
        <FaqCard />
        <SparkCard />
        <EmptyCard />
      </div>
    </div>
  );
}
