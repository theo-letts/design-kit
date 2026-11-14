import {
  Archive,
  Check,
  Inbox,
  Lock,
  Mail,
  Paperclip,
  Sparkles,
  Star,
  Trash2,
  Zap,
} from "../icons";
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
  Switch,
  Textarea,
} from "../ui";

const PLANS = [
  {
    name: "Hobby",
    price: "$0",
    blurb: "For side projects.",
    features: ["1 project", "Community support"],
    cta: "Current plan",
    featured: false,
  },
  {
    name: "Pro",
    price: "$20",
    blurb: "For working teams.",
    features: ["Unlimited projects", "Priority support", "Custom domains"],
    cta: "Upgrade",
    featured: true,
  },
  {
    name: "Scale",
    price: "$80",
    blurb: "For whole orgs.",
    features: ["SSO & SAML", "Audit log", "Dedicated support"],
    cta: "Talk to us",
    featured: false,
  },
];

const MAIL = [
  { from: "Vercel", subject: "Your deployment is live", time: "09:14", unread: true },
  { from: "Linear", subject: "3 issues assigned to you", time: "08:02", unread: true },
  { from: "GitHub", subject: "Re: shadcn/ui — token naming", time: "Yesterday", unread: false },
  { from: "Figma", subject: "Weekly digest for Design Kit", time: "Tuesday", unread: false },
];

export function PageTwo() {
  const [plan, setPlan] = React.useState("Pro");
  const [twoFactor, setTwoFactor] = React.useState(true);
  const [selected, setSelected] = React.useState<string[]>(["Linear"]);

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Billing &amp; settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Denser blocks — pricing, auth, a list, and form states.
        </p>
      </div>

      {/* Pricing ------------------------------------------------------- */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <Card key={p.name} className={p.featured ? "ring-primary/40 relative ring-2" : undefined}>
            {p.featured && (
              <Badge className="absolute -top-2.5 left-6">
                <Sparkles /> Most popular
              </Badge>
            )}
            <CardHeader>
              <CardDescription>{p.name}</CardDescription>
              <CardTitle className="font-heading text-3xl">
                {p.price}
                <span className="text-muted-foreground text-sm font-normal"> /mo</span>
              </CardTitle>
              <CardDescription>{p.blurb}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {p.features.map((f) => (
                <span key={f} className="flex items-center gap-2 text-sm">
                  <Check className="text-primary size-4 shrink-0" />
                  {f}
                </span>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={p.featured ? "default" : "outline"}
                disabled={plan === p.name && !p.featured}
                onClick={() => setPlan(p.name)}
              >
                {plan === p.name && !p.featured ? "Current plan" : p.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Sign in ---------------------------------------------------- */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>A plain auth card, the most-copied block there is.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button variant="outline" className="w-full">
              <Mail /> Continue with email
            </Button>
            <div className="relative">
              <Separator />
              <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
                or
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user">Email</Label>
              <Input id="user" placeholder="you@company.com" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pw">Password</Label>
                <a href="#" className="text-primary text-xs underline-offset-4 hover:underline">
                  Forgot?
                </a>
              </div>
              <Input id="pw" type="password" defaultValue="hunter2hunter2" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="2fa" className="gap-2">
                <Lock className="size-3.5" /> Require 2FA
              </Label>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Sign in</Button>
          </CardFooter>
        </Card>

        {/* Inbox ------------------------------------------------------ */}
        <Card className="gap-0 overflow-hidden py-0 lg:col-span-3">
          <CardHeader className="flex-row items-center gap-2 py-4">
            <Inbox className="size-4" />
            <CardTitle className="flex-1">Inbox</CardTitle>
            <Badge variant="secondary">{selected.length} selected</Badge>
          </CardHeader>
          <Separator />
          <div className="flex items-center gap-1 px-3 py-2">
            <Button variant="ghost" size="sm" disabled={!selected.length}>
              <Archive /> Archive
            </Button>
            <Button variant="ghost" size="sm" disabled={!selected.length}>
              <Star /> Star
            </Button>
            <Button variant="ghost" size="sm" disabled={!selected.length}>
              <Trash2 /> Delete
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col">
            {MAIL.map((m) => (
              /* The whole row is the control, so the checkbox inside it is a
                 picture of the state — a button nested in a button is invalid
                 HTML and gives the row two tab stops. */
              <div
                key={m.from}
                role="button"
                tabIndex={0}
                aria-pressed={selected.includes(m.from)}
                onClick={() => toggle(m.from)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(m.from);
                  }
                }}
                className="hover:bg-accent/50 flex cursor-pointer items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-0"
              >
                <span aria-hidden className="pointer-events-none contents">
                  <Checkbox checked={selected.includes(m.from)} tabIndex={-1} />
                </span>
                <Avatar fallback={m.from.slice(0, 2)} />
                <span className="min-w-0 flex-1">
                  <span className={m.unread ? "block text-sm font-semibold" : "block text-sm"}>
                    {m.from}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">{m.subject}</span>
                </span>
                {m.unread && <span className="bg-primary size-1.5 shrink-0 rounded-full" />}
                <span className="text-muted-foreground shrink-0 text-xs">{m.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Usage ------------------------------------------------------ */}
        <Card>
          <CardHeader>
            <CardTitle>Usage this month</CardTitle>
            <CardDescription>Progress bars against the primary token.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              { label: "Bandwidth", used: "812 GB", of: "1 TB", pct: 81 },
              { label: "Builds", used: "240", of: "500", pct: 48 },
              { label: "Seats", used: "7", of: "25", pct: 28 },
            ].map((u) => (
              <div key={u.label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span>{u.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {u.used} <span className="opacity-60">/ {u.of}</span>
                  </span>
                </div>
                <Progress value={u.pct} />
              </div>
            ))}
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" size="sm">
              <Zap /> Increase limits
            </Button>
          </CardFooter>
        </Card>

        {/* Form states ------------------------------------------------ */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Support request</CardTitle>
              <CardDescription>Including an error state.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="topic">Topic</Label>
                <Select id="topic" defaultValue="billing">
                  <option value="billing">Billing</option>
                  <option value="bug">Bug report</option>
                  <option value="other">Something else</option>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="body" className="text-destructive">
                  Message
                </Label>
                <Textarea
                  id="body"
                  aria-invalid
                  className="border-destructive focus-visible:ring-destructive/30"
                  placeholder="Tell us what happened…"
                />
                <p className="text-destructive text-xs">A message is required.</p>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>
                <Paperclip /> Attach &amp; send
              </Button>
              <Button variant="ghost">Cancel</Button>
            </CardFooter>
          </Card>

          <Alert>
            <Sparkles />
            <AlertTitle>Theme applied</AlertTitle>
            <AlertDescription>
              Every block on this page reads the same tokens as page 01.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
