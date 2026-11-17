import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  GripVertical,
  Inbox,
  LoaderCircle,
  Minus,
  Paperclip,
  X,
} from "./icons";
import * as React from "react";
import { cn } from "@/lib/utils";

/* Hand-rolled shadcn-shaped primitives. They read the same CSS variables as
   real shadcn/ui components, so the theme you build here transfers as-is. */

const focus =
  "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring";

/* ---------------------------------------------------------------- Button */

const buttonVariants = {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
  outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
  link: "text-primary underline-offset-4 hover:underline",
} as const;

const buttonSizes = {
  sm: "h-8 gap-1.5 px-3 text-sm has-[>svg]:px-2.5",
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  lg: "h-10 px-6 has-[>svg]:px-4",
  icon: "size-9",
} as const;

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        focus,
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------------------------------------- Badge */

const badgeVariants = {
  default: "bg-primary text-primary-foreground border-transparent",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  outline: "text-foreground",
  destructive: "bg-destructive text-destructive-foreground border-transparent",
  /* The three states shadcn does not ship. They are the reason a system
     gets four different greens: without them every product picks its own. */
  success: "bg-success text-success-foreground border-transparent",
  warning: "bg-warning text-warning-foreground border-transparent",
  info: "bg-info text-info-foreground border-transparent",
} as const;

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: keyof typeof badgeVariants }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ Card */

export const Card = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div
    data-slot="card"
    className={cn(
      "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
      className,
    )}
    {...p}
  />
);
export const CardHeader = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div data-slot="card-header" className={cn("flex flex-col gap-1.5 px-6", className)} {...p} />
);
export const CardTitle = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div
    data-slot="card-title"
    className={cn("font-heading leading-none font-semibold", className)}
    {...p}
  />
);
export const CardDescription = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div
    data-slot="card-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...p}
  />
);
export const CardContent = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div data-slot="card-content" className={cn("px-6", className)} {...p} />
);
/* The gap is a deviation from shadcn, which ships this row with none and
   expects you to add one. Flat buttons touching look tight; stamped ones
   look broken. Every button here casts a 3px hard drop to its right, so at
   zero gap the first one's drop is painted underneath the second and the two
   strokes merge into a single dark seam — the identical failure the Offset
   treatment already names and fixes for button groups, arriving by the other
   door because a footer is a row of buttons that nobody wrapped in a group.
   A theme that makes zero gap wrong is a theme that has to supply one. */
export const CardFooter = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div data-slot="card-footer" className={cn("flex items-center gap-2 px-6", className)} {...p} />
);

/* ----------------------------------------------------------------- Input */

export const Input = ({ className, ...p }: React.ComponentProps<"input">) => (
  <input
    data-slot="input"
    className={cn(
      "border-input bg-background text-foreground placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] disabled:opacity-50",
      focus,
      className,
    )}
    {...p}
  />
);

export const Textarea = ({ className, ...p }: React.ComponentProps<"textarea">) => (
  <textarea
    data-slot="textarea"
    className={cn(
      "border-input bg-background text-foreground placeholder:text-muted-foreground field-sizing-content flex min-h-16 w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] disabled:opacity-50",
      focus,
      className,
    )}
    {...p}
  />
);

export const Label = ({ className, ...p }: React.ComponentProps<"label">) => (
  <label
    data-slot="label"
    className={cn(
      "flex items-center gap-2 text-sm leading-none font-medium select-none",
      className,
    )}
    {...p}
  />
);

export function Select({ className, children, ...p }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          /* A long option is cut dead by a native select. Ellipsis degrades it
             instead, which matters most under a wide face: Paper Mono sets about
             15% wider than a proportional one at the same size, so a value that
             fits in Inter will not fit here. */
          "border-input bg-background text-foreground h-9 w-full appearance-none overflow-hidden rounded-md border px-3 pr-8 text-sm text-ellipsis whitespace-nowrap shadow-xs transition-[color,box-shadow]",
          focus,
          className,
        )}
        {...p}
      >
        {children}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2" />
    </div>
  );
}

/* --------------------------------------------------- Switch and Checkbox */

export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange" | "checked"> & {
  checked: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      data-slot="switch"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
      className={cn(
        "inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-all",
        // A disabled control has to look unavailable, not merely ignore clicks.
        "disabled:pointer-events-none disabled:opacity-50",
        focus,
        checked ? "bg-primary" : "bg-input border-border",
        className,
      )}
    >
      <span
        className={cn(
          "bg-background pointer-events-none block size-4 rounded-full ring-0 shadow-sm transition-transform",
          checked ? "translate-x-4.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function Checkbox({
  checked,
  onCheckedChange,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange" | "checked"> & {
  checked: boolean;
  /** Left off when the box only pictures state that something else owns. */
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      data-slot="checkbox"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-shadow",
        "disabled:pointer-events-none disabled:opacity-50",
        focus,
        checked ? "bg-primary border-primary text-primary-foreground" : "bg-background",
        className,
      )}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  );
}

/* ---------------------------------------------- Separator, Avatar, Alert */

export const Separator = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div data-slot="separator" className={cn("bg-border h-px w-full shrink-0", className)} {...p} />
);

export function Avatar({ fallback, className }: { fallback: string; className?: string }) {
  return (
    <span
      className={cn(
        "bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium select-none",
        className,
      )}
    >
      {fallback}
    </span>
  );
}

export const Alert = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div
    data-slot="alert"
    className={cn(
      "bg-card text-card-foreground grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 rounded-lg border px-4 py-3 text-sm [&_svg]:size-4 [&_svg]:translate-y-0.5",
      className,
    )}
    {...p}
  />
);
export const AlertTitle = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div className={cn("font-medium", className)} {...p} />
);
export const AlertDescription = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div className={cn("text-muted-foreground col-start-2 text-sm", className)} {...p} />
);

/* ------------------------------------------------- Progress, Slider, Tabs */

export const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div
    data-slot="progress"
    className={cn("bg-muted relative h-2 w-full overflow-hidden rounded-full", className)}
  >
    <div
      className="bg-primary h-full rounded-full transition-[width]"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "min" | "max" | "step" | "onChange"> & {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onValueChange(Number(e.target.value))}
      className={cn(
        "ui-slider h-4 w-full cursor-pointer appearance-none bg-transparent",
        focus,
        className,
      )}
      style={{ "--pct": `${pct}%` } as React.CSSProperties}
      {...props}
    />
  );
}

export function Tabs({
  tabs,
  value,
  onValueChange,
  idBase = "tabs",
  className,
}: {
  tabs: { value: string; label: string }[];
  value: string;
  onValueChange: (v: string) => void;
  idBase?: string;
  className?: string;
}) {
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const listRef = React.useRef<HTMLDivElement>(null);

  /* The selected pill is one element that moves, not a background that
     appears on a different button. A cross-fade between two boxes reads as
     two things; sliding one reads as the same thing going somewhere, which
     is the whole point of a tab strip.
     
     It animates left and width rather than a transform. A transform is
     cheaper, but scaling a bordered, rounded pill stretches its corners and
     its stroke — and this one has both. */
  const [pill, setPill] = React.useState<{ left: number; width: number } | null>(null);

  React.useLayoutEffect(() => {
    const el = refs.current[value];
    const list = listRef.current;
    if (!el || !list) return;
    const move = () => setPill({ left: el.offsetLeft, width: el.offsetWidth });
    move();
    /* Labels reflow and the strip can be resized, and a pill left behind at
       a stale width is worse than no pill at all. */
    const ro = new ResizeObserver(move);
    ro.observe(list);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value, tabs.length]);

  /* Arrow keys move and select in one go, and only the active tab is in the
     tab order — the WAI-ARIA tabs pattern, which is what Radix gives you in
     a real shadcn/ui project. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const at = tabs.findIndex((t) => t.value === value);
    const to =
      e.key === "ArrowRight"
        ? (at + 1) % tabs.length
        : e.key === "ArrowLeft"
          ? (at - 1 + tabs.length) % tabs.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? tabs.length - 1
              : -1;
    if (to < 0) return;
    e.preventDefault();
    onValueChange(tabs[to].value);
    refs.current[tabs[to].value]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      data-slot="tabs-list"
      onKeyDown={onKeyDown}
      className={cn(
        "bg-muted text-muted-foreground relative inline-flex h-9 w-fit items-center rounded-lg p-[3px]",
        className,
      )}
    >
      {/* Mounted only once a position is known, so it appears where it
          belongs instead of sliding in from the left edge on first paint. */}
      {pill && (
        <span
          aria-hidden
          data-slot="tabs-indicator"
          className="bg-background absolute top-[3px] bottom-[3px] rounded-md border shadow-sm transition-[left,width]"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[t.value] = el;
            }}
            role="tab"
            id={`${idBase}-tab-${t.value}`}
            aria-selected={active}
            aria-controls={`${idBase}-panel-${t.value}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(t.value)}
            className={cn(
              "relative z-10 inline-flex h-full items-center justify-center rounded-md px-3",
              "text-sm font-medium transition-colors",
              focus,
              active ? "text-foreground" : "hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/** The region a tab reveals. Renders nothing unless its tab is the active one. */
export function TabPanel({
  value,
  active,
  idBase = "tabs",
  className,
  children,
}: {
  value: string;
  active: string;
  idBase?: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (value !== active) return null;
  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${value}`}
      aria-labelledby={`${idBase}-tab-${value}`}
      tabIndex={0}
      className={cn("flex flex-col gap-6 outline-none", className)}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- Table */

/** A table, in a scroller.
 *
 *  Tables are the one thing that genuinely cannot reflow on a phone: a
 *  column dropped to make it fit is data removed from the page, and a table
 *  that merely clips loses its last column without saying so. The wrapper
 *  is not optional and takes no prop, because a table that scrolls only
 *  when someone remembers to ask is a table that does not scroll. */
export const Table = ({ className, ...p }: React.ComponentProps<"table">) => (
  <div data-slot="table-scroll">
    <table className={cn("w-full caption-bottom text-sm", className)} {...p} />
  </div>
);
export const Th = ({ className, ...p }: React.ComponentProps<"th">) => (
  <th
    className={cn(
      "text-muted-foreground h-9 px-3 text-left align-middle text-xs font-medium",
      className,
    )}
    {...p}
  />
);
export const Td = ({ className, ...p }: React.ComponentProps<"td">) => (
  <td className={cn("px-3 py-2.5 align-middle", className)} {...p} />
);

/* ------------------------------------------------------------------ Menu */

/** Small floating menu: closes on outside click, Escape, or selection. */
export function Menu({
  trigger,
  children,
  align = "start",
  className,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          role="menu"
          className={cn(
            "bg-popover text-popover-foreground absolute z-40 mt-1 max-h-72 min-w-44 overflow-y-auto rounded-md border p-1 shadow-lg",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  selected,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      data-slot="menu-item"
      role="menuitemradio"
      aria-checked={selected}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
        className,
      )}
      {...props}
    >
      <span className="flex-1 truncate">{children}</span>
      {selected && <Check className="size-3.5 shrink-0" />}
    </button>
  );
}

/* ---------------------------------------------------------------- Dialog */

export function Dialog({
  title,
  description,
  onClose,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-foreground/25 absolute inset-0 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "bg-popover text-popover-foreground relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-xl border shadow-2xl",
          className,
        )}
      >
        <div className="flex items-start gap-2 border-b px-5 py-4">
          <div className="flex-1">
            <h2 className="font-heading font-semibold">{title}</h2>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t p-4">{footer}</div>}
      </div>
    </div>
  );
}

/* =================================================================
   More of the shadcn/ui set. Same contract as everything above: no
   Radix, no CLI, just the token names a real project would use.
   ================================================================= */

/* --------------------------------------------------------------- Spinner */

export function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderCircle
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------- Skeleton */

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------- Kbd */

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center justify-center",
        "rounded-sm border px-1.5 font-mono text-[11px] font-medium select-none",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------------------------------------------------- Aspect ratio */

export function AspectRatio({
  ratio = 16 / 9,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { ratio?: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{ aspectRatio: String(ratio), ...style }}
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------ Scroll area */

export function ScrollArea({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="scroll-area"
      className={cn("ui-scroll relative overflow-y-auto overscroll-contain", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- Toggle */

export function Toggle({
  pressed,
  onPressedChange,
  size = "default",
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  pressed?: boolean;
  onPressedChange?: (v: boolean) => void;
  size?: "sm" | "default";
}) {
  return (
    <button
      type="button"
      data-slot="toggle"
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
        "hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        size === "sm" ? "h-8 min-w-8 px-1.5" : "h-9 min-w-9 px-2.5",
        pressed && "bg-accent text-accent-foreground",
        focus,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Single- or multi-select group of toggles, joined into one control. */
export function ToggleGroup({
  items,
  value,
  onValueChange,
  className,
}: {
  items: { value: string; label: React.ReactNode; "aria-label"?: string }[];
  value: string[];
  onValueChange: (v: string[]) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      data-slot="toggle-group"
      className={cn("flex w-fit items-center gap-0 rounded-md border p-0.5", className)}
    >
      {items.map((it) => {
        const on = value.includes(it.value);
        return (
          <Toggle
            key={it.value}
            size="sm"
            pressed={on}
            aria-label={it["aria-label"]}
            onPressedChange={() =>
              onValueChange(on ? value.filter((v) => v !== it.value) : [...value, it.value])
            }
          >
            {it.label}
          </Toggle>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- Button group */

export function ButtonGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="button-group"
      className={cn(
        "flex w-fit items-stretch",
        "[&>*]:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md",
        "[&>*+*]:-ml-px [&>*]:focus-visible:z-10",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------ Input group */

/** An input with something welded to one end — a prefix, a unit, a button. */
export function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "border-input bg-background flex h-9 w-full items-center overflow-hidden rounded-md border",
        "focus-within:ring-ring/50 focus-within:border-ring focus-within:ring-[3px]",
        "[&>input]:h-full [&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent",
        "[&>input]:px-3 [&>input]:text-sm [&>input]:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function InputGroupAddon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-addon"
      className={cn(
        "text-muted-foreground bg-muted flex h-full items-center px-3 text-sm whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------------------------------------- Field */

export const FieldSet = ({ className, ...p }: React.ComponentProps<"fieldset">) => (
  <fieldset data-slot="field-set" className={cn("flex flex-col gap-4", className)} {...p} />
);
export const Field = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div data-slot="field" className={cn("flex flex-col gap-2", className)} {...p} />
);
export const FieldDescription = ({ className, ...p }: React.ComponentProps<"p">) => (
  <p
    data-slot="field-description"
    className={cn("text-muted-foreground text-xs", className)}
    {...p}
  />
);
export const FieldError = ({ className, ...p }: React.ComponentProps<"p">) => (
  <p data-slot="field-error" className={cn("text-destructive text-xs", className)} {...p} />
);

/* ------------------------------------------------------------ Radio group */

export function RadioGroup({
  options,
  value,
  onValueChange,
  name,
  className,
}: {
  options: { value: string; label: string; description?: string }[];
  value: string;
  onValueChange: (v: string) => void;
  name: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" data-slot="radio-group" className={cn("flex flex-col gap-2", className)}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <label
            key={o.value}
            data-slot="radio-card"
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
              on ? "border-ring bg-accent/40" : "hover:bg-accent/30",
            )}
          >
            <input
              type="radio"
              name={name}
              checked={on}
              onChange={() => onValueChange(o.value)}
              className="sr-only"
            />
            <span
              data-slot="radio-group-item"
              aria-hidden
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                on ? "border-primary text-primary" : "border-input",
              )}
            >
              {on && <Circle className="size-2 fill-current" />}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm leading-none font-medium">{o.label}</span>
              {o.description && (
                <span className="text-muted-foreground text-xs">{o.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------- Input OTP */

export function InputOTP({
  length = 6,
  value,
  onValueChange,
  className,
}: {
  length?: number;
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
}) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const put = (i: number, char: string) => {
    const next = (value.padEnd(length, " ").slice(0, i) + char + value.slice(i + 1))
      .slice(0, length)
      .trimEnd();
    onValueChange(next);
    if (char) refs.current[Math.min(i + 1, length - 1)]?.focus();
  };

  return (
    <div data-slot="input-otp" className={cn("flex items-center gap-2", className)}>
      {Array.from({ length }).map((_, i) => (
        <React.Fragment key={i}>
          {i === length / 2 && <Minus className="text-muted-foreground size-3" />}
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            value={value[i] ?? ""}
            onChange={(e) => put(i, e.target.value.replace(/\D/g, "").slice(-1))}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !value[i]) refs.current[Math.max(i - 1, 0)]?.focus();
            }}
            className={cn(
              "border-input bg-background size-10 rounded-md border text-center font-mono text-sm",
              focus,
            )}
            data-slot="input-otp-slot"
          />
        </React.Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Breadcrumb */

export function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" data-slot="breadcrumb" className={cn("text-sm", className)}>
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.label} className="flex items-center gap-1.5">
              {last ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {it.label}
                </span>
              ) : (
                <a href={it.href ?? "#"} className="hover:text-foreground transition-colors">
                  {it.label}
                </a>
              )}
              {!last && <ChevronRight className="size-3.5" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------ Pagination */

export function Pagination({
  page,
  pages,
  onPageChange,
  className,
}: {
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
  className?: string;
}) {
  const go = (p: number) => onPageChange(Math.min(Math.max(p, 1), pages));
  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn("flex items-center gap-1", className)}
    >
      <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => go(page - 1)}>
        <ChevronLeft /> Previous
      </Button>
      {Array.from({ length: pages }).map((_, i) => (
        <Button
          key={i}
          size="icon"
          variant={page === i + 1 ? "outline" : "ghost"}
          aria-current={page === i + 1 ? "page" : undefined}
          className="size-8"
          onClick={() => go(i + 1)}
        >
          {i + 1}
        </Button>
      ))}
      <Button variant="ghost" size="sm" disabled={page === pages} onClick={() => go(page + 1)}>
        Next <ChevronRight />
      </Button>
    </nav>
  );
}

/* ----------------------------------------------------------------- Empty */

export function Empty({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center",
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-heading font-medium">{title}</p>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ Item */

export const ItemGroup = ({ className, ...p }: React.ComponentProps<"div">) => (
  <div
    data-slot="item-group"
    className={cn("divide-y overflow-hidden rounded-lg border", className)}
    {...p}
  />
);

export function Item({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="item"
      className={cn("hover:bg-accent/40 flex items-center gap-3 p-3 transition-colors", className)}
    >
      {Icon && (
        <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
          <Icon className="size-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        {description && <div className="text-muted-foreground truncate text-xs">{description}</div>}
      </div>
      {action}
    </div>
  );
}

/* --------------------------------------------------------------- Dismiss */

/** Outside click + Escape, which every popover-ish thing below wants. */
function useDismiss(open: boolean, close: () => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

const panel = "bg-popover text-popover-foreground z-40 rounded-md border shadow-lg outline-none";

/* --------------------------------------------------------------- Popover */

export function Popover({
  trigger,
  children,
  align = "start",
  className,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);

  return (
    <div ref={ref} className="relative w-fit">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          data-slot="popover-content"
          className={cn(
            panel,
            "absolute mt-1.5 w-72 p-4",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- Tooltip */

export function Tooltip({
  content,
  side = "top",
  children,
}: {
  content: React.ReactNode;
  side?: "top" | "bottom";
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 180);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };
  React.useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span
      className="relative inline-flex w-fit"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          data-slot="tooltip-content"
          className={cn(
            "bg-primary text-primary-foreground pointer-events-none absolute left-1/2 z-50 -translate-x-1/2",
            "rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap shadow-md",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------ Hover card */

export function HoverCard({
  card,
  children,
  className,
}: {
  card: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 240);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 120);
  };
  React.useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span className="relative inline-flex w-fit" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {open && (
        <div
          data-slot="hover-card-content"
          className={cn(panel, "absolute top-full left-0 mt-2 w-64 p-4", className)}
        >
          {card}
        </div>
      )}
    </span>
  );
}

/* ----------------------------------------------------------------- Sheet */

export function Sheet({
  title,
  description,
  side = "right",
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  side?: "right" | "left";
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="bg-foreground/25 absolute inset-0 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-slot="sheet-content"
        className={cn(
          "bg-popover text-popover-foreground absolute inset-y-0 flex w-full max-w-sm flex-col border shadow-2xl",
          side === "right" ? "right-0" : "left-0",
        )}
      >
        <div className="flex items-start gap-2 border-b px-5 py-4">
          <div className="flex-1">
            <h2 className="font-heading font-semibold">{title}</h2>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Alert dialog */

export function AlertDialog({
  title,
  description,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-foreground/25 absolute inset-0 backdrop-blur-[2px]" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        data-slot="alert-dialog-content"
        className="bg-popover text-popover-foreground relative w-full max-w-md rounded-xl border p-6 shadow-2xl"
      >
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Context menu */

export function ContextMenu({
  items,
  children,
  className,
}: {
  items: { label: string; destructive?: boolean }[];
  children: React.ReactNode;
  className?: string;
}) {
  const [at, setAt] = React.useState<{ x: number; y: number } | null>(null);
  const close = React.useCallback(() => setAt(null), []);
  const ref = useDismiss(at !== null, close);

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      onContextMenu={(e) => {
        e.preventDefault();
        const box = e.currentTarget.getBoundingClientRect();
        setAt({ x: e.clientX - box.left, y: e.clientY - box.top });
      }}
    >
      {children}
      {at && (
        <div
          role="menu"
          data-slot="context-menu-content"
          style={{ left: at.x, top: at.y }}
          className={cn(panel, "absolute min-w-40 p-1")}
        >
          {items.map((it) => (
            <button
              key={it.label}
              role="menuitem"
              onClick={close}
              className={cn(
                "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                it.destructive
                  ? "text-destructive hover:bg-destructive/10"
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Reveal */

/** Open and close at the content's own height, without measuring it.
 *
 *  A grid row going 0fr → 1fr is the one thing CSS can interpolate that means
 *  "whatever height this turns out to be". The alternatives are worse: a
 *  max-height guess animates at the wrong speed whenever the guess is off,
 *  and measuring in JS means a layout read on every open and a stale number
 *  the moment the text reflows.
 *
 *  The content stays mounted so there is something to animate, which is why
 *  it goes `inert` when closed — otherwise a collapsed panel keeps its tab
 *  stops and its text keeps turning up in find-in-page. */
function Reveal({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      data-slot="reveal"
      inert={!open}
      className="grid transition-[grid-template-rows]"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------- Combobox */

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  /** Set when the labels are identifiers rather than wording — timezone
   *  names, currency codes, SKUs. They then opt out of the theme's case
   *  axis, because "europe/london" is not a quieter Europe/London, it is a
   *  zone name that no longer resolves. */
  keepCase = false,
  className,
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onValueChange: (v: string) => void;
  placeholder?: string;
  keepCase?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  const ref = useDismiss(open, close);

  const shown = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));
  const label = options.find((o) => o.value === value)?.label;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        data-slot="combobox-trigger"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "border-input bg-background flex h-9 w-full items-center justify-between gap-2 rounded-md",
          "border px-3 text-sm transition-colors",
          focus,
          !label && "text-muted-foreground",
        )}
      >
        <span className="truncate" data-case={keepCase ? "keep" : undefined}>
          {label ?? placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>
      {open && (
        <div className={cn(panel, "absolute top-full right-0 left-0 mt-1.5 overflow-hidden")}>
          <div className="border-b p-1">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-8 w-full bg-transparent px-2 text-sm outline-none"
            />
          </div>
          <div className="ui-scroll max-h-52 overflow-y-auto p-1">
            {shown.length === 0 && (
              <p className="text-muted-foreground px-2 py-3 text-center text-sm">No match.</p>
            )}
            {shown.map((o) => (
              <MenuItem
                key={o.value}
                selected={o.value === value}
                onClick={() => {
                  onValueChange(o.value);
                  close();
                }}
              >
                <span data-case={keepCase ? "keep" : undefined}>{o.label}</span>
              </MenuItem>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------- Collapsible bits */

export function Collapsible({
  label,
  defaultOpen,
  children,
  className,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(Boolean(defaultOpen));
  return (
    <div data-slot="collapsible" className={cn("rounded-md border", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "hover:bg-accent/40 flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          focus,
        )}
      >
        {label}
        {/* One chevron that turns, not two that swap. A swap is a cut; the
            turn is the same information with the state change shown. */}
        <ChevronDown
          className={cn("size-4 opacity-60 transition-transform", open && "rotate-180")}
        />
      </button>
      <Reveal open={open}>
        <div className="border-t px-3 py-2.5 text-sm">{children}</div>
      </Reveal>
    </div>
  );
}

export function Accordion({
  items,
  className,
}: {
  items: { value: string; title: string; content: React.ReactNode }[];
  className?: string;
}) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.value ?? null);
  return (
    <div data-slot="accordion" className={cn("divide-y border-y", className)}>
      {items.map((it) => {
        const on = open === it.value;
        return (
          <div key={it.value} data-slot="accordion-item">
            <h3>
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : it.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 py-3.5 text-left text-sm font-medium",
                  "hover:underline",
                  focus,
                )}
              >
                {it.title}
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 opacity-60 transition-transform",
                    on && "rotate-180",
                  )}
                />
              </button>
            </h3>
            <Reveal open={on}>
              <div className="text-muted-foreground pb-4 text-sm">{it.content}</div>
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------- Carousel */

export function Carousel({ slides, className }: { slides: React.ReactNode[]; className?: string }) {
  const [i, setI] = React.useState(0);
  const go = (n: number) => setI((n + slides.length) % slides.length);

  return (
    <div data-slot="carousel" className={cn("flex flex-col gap-3", className)}>
      <div className="relative overflow-hidden rounded-lg border">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {slides.map((s, n) => (
            <div key={n} className="w-full shrink-0" aria-hidden={n !== i}>
              {s}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {slides.map((_, n) => (
            <button
              key={n}
              aria-label={`Slide ${n + 1}`}
              onClick={() => setI(n)}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                n === i ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>
        <ButtonGroup>
          <Button variant="outline" size="icon" aria-label="Previous" onClick={() => go(i - 1)}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next" onClick={() => go(i + 1)}>
            <ChevronRight />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Calendar */

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function Calendar({
  selected,
  onSelect,
  className,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  className?: string;
}) {
  const [cursor, setCursor] = React.useState(() => selected ?? new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = new Date();

  const days = new Date(year, month + 1, 0).getDate();
  // Monday-first, so shift Sunday (0) to the end of the week.
  const blanks = (new Date(year, month, 1).getDay() + 6) % 7;

  return (
    <div data-slot="calendar" className={cn("w-fit rounded-lg border p-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          aria-label="Previous month"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium">
          {cursor.toLocaleString("en", { month: "long" })} {year}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          aria-label="Next month"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="text-muted-foreground grid grid-cols-7 gap-0.5 text-center text-[11px]">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: blanks }).map((_, i) => (
          <span key={`b${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const date = new Date(year, month, i + 1);
          const on = selected ? sameDay(date, selected) : false;
          return (
            <button
              key={i}
              onClick={() => onSelect(date)}
              aria-pressed={on}
              className={cn(
                "size-8 rounded-md text-sm transition-colors",
                focus,
                on
                  ? "bg-primary text-primary-foreground"
                  : sameDay(date, today)
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/60",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Toast */

export type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

let toasts: ToastItem[] = [];
const toastSubs = new Set<() => void>();
const emitToasts = () => toastSubs.forEach((f) => f());

/** Sonner's shape, minus sonner: call it from anywhere, <Toaster/> renders it. */
export function toast(t: Omit<ToastItem, "id">) {
  const id = Date.now() + Math.random();
  toasts = [...toasts, { ...t, id }];
  emitToasts();
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== id);
    emitToasts();
  }, 3500);
}

export function Toaster({ className }: { className?: string }) {
  const list = React.useSyncExternalStore(
    (cb) => {
      toastSubs.add(cb);
      return () => {
        toastSubs.delete(cb);
      };
    },
    () => toasts,
    () => toasts,
  );

  if (list.length === 0) return null;
  return (
    <div
      data-slot="toaster"
      className={cn(
        "pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col gap-2",
        className,
      )}
    >
      {list.map((t) => (
        <div
          key={t.id}
          role="status"
          data-slot="toast"
          className={cn(
            "bg-popover text-popover-foreground pointer-events-auto w-72 rounded-lg border p-3 shadow-lg",
            t.variant === "destructive" && "border-destructive/40",
          )}
        >
          <p
            className={cn("text-sm font-medium", t.variant === "destructive" && "text-destructive")}
          >
            {t.title}
          </p>
          {t.description && <p className="text-muted-foreground mt-0.5 text-xs">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}

/* =================================================================
   The rest of the registry: app chrome, panes, charts and the chat
   set. Same contract — no Radix, no CLI, the same token names.
   ================================================================= */

/* ---------------------------------------------------------------- Drawer */

/** A sheet that comes up from the bottom, with a grab handle. */
export function Drawer({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-50">
      <div className="bg-foreground/25 absolute inset-0 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-slot="drawer-content"
        className="bg-popover text-popover-foreground absolute inset-x-0 bottom-0 mx-auto flex max-h-[80%] w-full max-w-2xl flex-col rounded-t-xl border shadow-2xl"
      >
        <div className="flex flex-col items-center gap-2 px-5 pt-3 pb-4">
          <div className="bg-border h-1.5 w-10 shrink-0 rounded-full" />
          <div className="w-full text-center">
            <h2 className="font-heading font-semibold">{title}</h2>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto border-t p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Menubar */

export function Menubar({
  menus,
  className,
}: {
  menus: { label: string; items: (string | "-")[] }[];
  className?: string;
}) {
  const [open, setOpen] = React.useState<string | null>(null);
  const close = React.useCallback(() => setOpen(null), []);
  const ref = useDismiss(open !== null, close);

  return (
    <div
      ref={ref}
      role="menubar"
      data-slot="menubar"
      className={cn("flex w-fit items-center gap-0.5 rounded-md border p-1", className)}
    >
      {menus.map((m) => (
        <div key={m.label} className="relative">
          <button
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={open === m.label}
            onClick={() => setOpen((v) => (v === m.label ? null : m.label))}
            onMouseEnter={() => setOpen((v) => (v === null ? v : m.label))}
            className={cn(
              "rounded-sm px-2.5 py-1 text-sm font-medium transition-colors",
              focus,
              open === m.label ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
            )}
          >
            {m.label}
          </button>
          {open === m.label && (
            <div role="menu" className={cn(panel, "absolute top-full left-0 mt-1 min-w-44 p-1")}>
              {m.items.map((it, i) =>
                it === "-" ? (
                  <Separator key={i} className="my-1" />
                ) : (
                  <button
                    key={it}
                    role="menuitem"
                    onClick={close}
                    className="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors"
                  >
                    {it}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- Navigation menu */

export function NavigationMenu({
  items,
  className,
}: {
  items: { label: string; links: { title: string; blurb: string }[] }[];
  className?: string;
}) {
  const [open, setOpen] = React.useState<string | null>(null);
  const close = React.useCallback(() => setOpen(null), []);
  const ref = useDismiss(open !== null, close);

  return (
    <nav ref={ref} data-slot="navigation-menu" className={cn("relative w-fit", className)}>
      <ul className="flex items-center gap-1">
        {items.map((it) => (
          <li key={it.label}>
            <button
              aria-expanded={open === it.label}
              onClick={() => setOpen((v) => (v === it.label ? null : it.label))}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                focus,
                open === it.label ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
              )}
            >
              {it.label}
              <ChevronDown
                className={cn(
                  "size-3.5 opacity-60 transition-transform",
                  open === it.label && "rotate-180",
                )}
              />
            </button>
          </li>
        ))}
      </ul>
      {open && (
        <div className={cn(panel, "absolute top-full left-0 z-40 mt-1.5 w-[22rem] p-2")}>
          <ul className="grid gap-1">
            {items
              .find((i) => i.label === open)!
              .links.map((l) => (
                <li key={l.title}>
                  <button
                    onClick={close}
                    className="hover:bg-accent hover:text-accent-foreground w-full rounded-md p-2.5 text-left transition-colors"
                  >
                    <div className="text-sm font-medium">{l.title}</div>
                    <div className="text-muted-foreground text-xs">{l.blurb}</div>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------- Resizable */

/** Two panes and a draggable divider. Percentage-based, so it reflows. */
export function Resizable({
  start,
  end,
  defaultSplit = 50,
  min = 20,
  className,
}: {
  start: React.ReactNode;
  end: React.ReactNode;
  defaultSplit?: number;
  min?: number;
  className?: string;
}) {
  const [split, setSplit] = React.useState(defaultSplit);
  const box = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const to = React.useCallback(
    (clientX: number) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      setSplit(Math.min(Math.max(((clientX - r.left) / r.width) * 100, min), 100 - min));
    },
    [min],
  );

  React.useEffect(() => {
    const move = (e: PointerEvent) => dragging.current && to(e.clientX);
    const up = () => (dragging.current = false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [to]);

  return (
    <div
      ref={box}
      data-slot="resizable"
      className={cn("flex w-full overflow-hidden rounded-lg border", className)}
    >
      <div style={{ width: `${split}%` }} className="min-w-0 p-4">
        {start}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(split)}
        tabIndex={0}
        onPointerDown={() => (dragging.current = true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setSplit((v) => Math.max(v - 2, min));
          if (e.key === "ArrowRight") setSplit((v) => Math.min(v + 2, 100 - min));
        }}
        className={cn(
          "bg-border hover:bg-ring relative w-px shrink-0 cursor-col-resize transition-colors",
          focus,
        )}
      >
        <GripVertical className="text-muted-foreground absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div style={{ width: `${100 - split}%` }} className="min-w-0 p-4">
        {end}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Sidebar */

export function AppSidebar({
  groups,
  active,
  onSelect,
  footer,
  className,
}: {
  groups: { label: string; items: { value: string; label: string; icon?: React.ElementType }[] }[];
  active: string;
  onSelect: (v: string) => void;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="sidebar"
      className={cn(
        "bg-sidebar text-sidebar-foreground flex w-56 shrink-0 flex-col gap-4 border-r p-3",
        className,
      )}
    >
      {groups.map((g) => (
        <div key={g.label} className="flex flex-col gap-1">
          <span className="text-muted-foreground px-2 text-[11px] font-medium">{g.label}</span>
          {g.items.map((it) => (
            <button
              key={it.value}
              onClick={() => onSelect(it.value)}
              aria-current={active === it.value ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                focus,
                active === it.value
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/50",
              )}
            >
              {it.icon && <it.icon className="size-4 shrink-0 opacity-70" />}
              <span className="truncate">{it.label}</span>
            </button>
          ))}
        </div>
      ))}
      {footer && <div className="mt-auto border-t pt-3">{footer}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------- Chart */

export type ChartSeries = { key: string; label: string; token: string };

/** The container shadcn's chart gives you: a framed plot, legend and tooltip
 *  that read the --chart-* tokens rather than hard-coded colours. */
export function ChartContainer({
  series,
  data,
  className,
}: {
  series: ChartSeries[];
  data: { label: string; values: number[] }[];
  className?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = Math.max(...data.flatMap((d) => d.values), 1);

  return (
    <div data-slot="chart" className={cn("flex flex-col gap-3", className)}>
      <div className="relative flex h-44 items-end gap-2">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="flex h-full flex-1 flex-col justify-end gap-1"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="flex h-full items-end gap-0.5">
              {d.values.map((v, j) => (
                <div
                  key={j}
                  className="flex-1 rounded-t-sm transition-opacity"
                  style={{
                    height: `${(v / max) * 100}%`,
                    background: `var(${series[j].token})`,
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-center text-[11px]">{d.label}</span>
          </div>
        ))}
        {hover !== null && (
          <div
            data-slot="chart-tooltip"
            className={cn(panel, "pointer-events-none absolute top-0 right-0 p-2.5")}
          >
            <div className="mb-1 text-xs font-medium">{data[hover].label}</div>
            {series.map((s, j) => (
              <div key={s.key} className="flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="size-2 rounded-[2px]" style={{ background: `var(${s.token})` }} />
                <span className="text-muted-foreground">{s.label}</span>
                <span className="ml-auto font-medium tabular-nums">{data[hover].values[j]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div data-slot="chart-legend" className="flex flex-wrap gap-x-4 gap-y-1">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs">
            <span className="size-2.5 rounded-full" style={{ background: `var(${s.token})` }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Chat parts */

export function Message({
  from = "assistant",
  children,
  className,
}: {
  from?: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="message"
      data-from={from}
      className={cn("flex w-full gap-3", from === "user" && "flex-row-reverse", className)}
    >
      {children}
    </div>
  );
}

export function Bubble({
  from = "assistant",
  children,
  className,
}: {
  from?: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="bubble"
      className={cn(
        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
        from === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Attachment({
  name,
  meta,
  onRemove,
  className,
}: {
  name: string;
  meta?: string;
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <div
      data-slot="attachment"
      className={cn(
        "bg-background flex w-fit max-w-full items-center gap-2 rounded-md border px-2 py-1.5",
        className,
      )}
    >
      <Paperclip className="text-muted-foreground size-3.5 shrink-0" />
      <span className="truncate text-xs font-medium">{name}</span>
      {meta && <span className="text-muted-foreground shrink-0 text-[11px]">{meta}</span>}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className={cn("text-muted-foreground hover:text-foreground rounded-sm", focus)}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** A labelled point in a transcript — "new messages", a date, a tool call. */
export function Marker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-slot="marker"
      className={cn("text-muted-foreground flex items-center gap-3 text-[11px]", className)}
    >
      <span className="bg-border h-px flex-1" />
      <span className="shrink-0 whitespace-nowrap">{children}</span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}

/** Scrolls to the newest message unless you have scrolled away from the end. */
export function MessageScroller({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const box = React.useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = React.useState(true);

  React.useEffect(() => {
    if (pinned && box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [children, pinned]);

  return (
    <div
      ref={box}
      data-slot="message-scroller"
      onScroll={(e) => {
        const el = e.currentTarget;
        setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
      }}
      className={cn("ui-scroll flex flex-col gap-3 overflow-y-auto", className)}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- Prose */

/* Setting a paragraph properly, which nothing in the kit could do. Columns,
   justification with hyphenation, and a drop cap are the backbone of any
   editorial layout and none of them are reachable from a token. */

export function Prose({
  columns = 1,
  justify,
  dropCap,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  columns?: 1 | 2 | 3;
  justify?: boolean;
  dropCap?: boolean;
}) {
  return (
    <div
      data-slot="prose"
      data-columns={columns}
      style={{
        columnCount: columns,
        columnGap: "calc(var(--spacing) * 8)",
        /* A rule between columns is what stops multi-column text reading as a
           mistake. It borrows the border token so it follows the theme. */
        columnRule: columns > 1 ? "1px solid var(--border)" : undefined,
      }}
      className={cn(
        "text-sm",
        justify && "text-justify hyphens-auto",
        /* The cap is sized in lines, not points, so it stays aligned to the
           baseline grid whatever the type scale does. */
        dropCap &&
          "[&>p:first-of-type::first-letter]:font-heading [&>p:first-of-type::first-letter]:float-left [&>p:first-of-type::first-letter]:mr-2 [&>p:first-of-type::first-letter]:text-[3.25em] [&>p:first-of-type::first-letter]:leading-[0.82] [&>p:first-of-type::first-letter]:font-semibold",
        "[&>p+p]:mt-0 [&>p+p]:indent-6",
        "[&>p]:break-inside-avoid-column",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** The rule above a masthead or a section: thick over thin, as a paper sets it. */
export function DoubleRule({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="double-rule"
      className={cn("border-foreground border-t-[3px] border-b pb-[3px]", className)}
      {...props}
    />
  );
}

/** Wide-tracked uppercase label — the stat strip and dateline register. */
export function Eyebrow({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="eyebrow"
      className={cn(
        "text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase",
        className,
      )}
      {...props}
    />
  );
}
