import * as React from "react";
import {
  ChevronRight,
  ChevronsUpDown,
  Code2,
  Moon,
  RotateCcw,
  Shuffle,
  Sparkles,
  SquareDashed,
  Sun,
  Type,
} from "lucide-react";
import { hexToOklch, oklchToHex } from "@/lib/color";
import {
  applyBase,
  applyThemeColor,
  detectBase,
  detectThemeColor,
  effectiveRadius,
  type Config,
} from "@/lib/config";
import { ALL_FONTS_URL, FONT_GROUPS, loadFontCss, MONO_FONTS } from "@/lib/fonts";
import { TILT_NAMES } from "@/lib/tilt";
import { MOTION_NAMES } from "@/lib/motion";
import { BORDER_BLURBS, BORDER_NAMES, BORDER_TINT_BLURBS, BORDER_TINT_NAMES } from "@/lib/border";
import { CASE_BLURBS, CASE_NAMES, SIZE_BLURBS, SIZE_NAMES } from "@/lib/wording";
import {
  BUTTON_OUTLINE_BLURBS,
  BUTTON_OUTLINE_NAMES,
  OUTLINE_BLURBS,
  OUTLINE_NAMES,
} from "@/lib/outline";
import { HEADING_WEIGHT_NAMES, TYPE_SCALE_NAMES } from "@/lib/type";
import { ELEVATION_NAMES } from "@/lib/elevation";
import { INTERACT_BLURBS, INTERACT_NAMES } from "@/lib/interact";
import { ENTRANCE_BLURBS, ENTRANCE_NAMES } from "@/lib/entrances";
import { DEPTH_NAMES } from "@/lib/glass";
import {
  BASE_NAMES,
  CHART_SPREAD_NAMES,
  RADIUS_NAMES,
  SURFACE_NAMES,
  THEME_NAMES,
  THEME_SCALES,
} from "@/lib/scales";
import { STYLES, STYLE_NAMES } from "@/lib/styles";
import { applyPalette, PALETTES } from "@/lib/palettes";
import { cn } from "@/lib/utils";
import { Button, Menu, MenuItem, Separator } from "./ui";
import { Dropzone } from "./Dropzone";
import { SiteNav } from "./SiteNav";

/** One sidebar row: quiet label, loud value, something on the right. */
/* Twenty-eight controls in one scroll is an endurance test. Sections collapse,
   and which ones you closed is remembered — the axes you are not working on
   should stay out of the way between sessions. */
const GROUPS_KEY = "design-kit.groups";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(GROUPS_KEY) ?? "{}")[title] !== false;
    } catch {
      return true;
    }
  });

  const toggle = () => {
    setOpen((v) => {
      try {
        const all = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? "{}");
        localStorage.setItem(GROUPS_KEY, JSON.stringify({ ...all, [title]: !v }));
      } catch {
        /* private browsing */
      }
      return !v;
    });
  };

  return (
    <div className="mb-0.5">
      <button
        onClick={toggle}
        aria-expanded={open}
        className="text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 rounded-md px-2 py-2 text-[11px] font-medium tracking-[0.08em] uppercase transition-colors"
      >
        <ChevronRight className={cn("size-3 shrink-0 transition-transform", open && "rotate-90")} />
        {title}
      </button>
      {open && <div className="flex flex-col gap-0.5 pb-1">{children}</div>}
    </div>
  );
}

function Row({
  label,
  value,
  adornment,
  children,
}: {
  label: string;
  value: string;
  adornment?: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  return (
    <Menu
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="hover:bg-accent/60 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
        >
          <span className="min-w-0 flex-1">
            <span className="text-muted-foreground block text-[11px] leading-tight">{label}</span>
            <span className="block truncate text-sm font-medium">{value}</span>
          </span>
          {adornment ?? <ChevronsUpDown className="text-muted-foreground size-3.5 shrink-0" />}
        </button>
      )}
    >
      {children}
    </Menu>
  );
}

/** The font menus show every name in its own face, which means the whole library
 *  has to be present — but only once someone actually opens a picker. */
const loadAllFonts = () => loadFontCss(ALL_FONTS_URL, "dk-fonts-all");

function FontMenu({
  value,
  onPick,
  close,
}: {
  value: string;
  onPick: (name: string) => void;
  close: () => void;
}) {
  React.useEffect(loadAllFonts, []);
  return (
    <>
      {FONT_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="text-muted-foreground px-2 pt-2 pb-1 text-[10px] font-medium tracking-[0.08em] uppercase">
            {group.label}
          </div>
          {group.fonts.map((f) => (
            <MenuItem
              key={f.name}
              selected={value === f.name}
              style={{
                fontFamily: `"${f.name}", ${group.kind === "mono" ? "monospace" : group.kind}`,
              }}
              onClick={() => {
                onPick(f.name);
                close();
              }}
            >
              {f.name}
            </MenuItem>
          ))}
        </div>
      ))}
    </>
  );
}

const Dot = ({ color }: { color: string }) => (
  <span className="size-3.5 shrink-0 rounded-full border" style={{ background: color }} />
);

const SWATCHES = [
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent" },
  { key: "destructive", label: "Destructive" },
] as const;

/* Every distinct colour across the collected palettes, kept in palette order
   and de-duplicated — Vanilla Custard and Black appear in three palettes each,
   and a saved-colour strip that repeats them is just harder to scan. */
const SAVED_COLORS = (() => {
  const seen = new Map<string, string>();
  for (const p of PALETTES)
    for (const sw of p.swatches) if (!seen.has(sw.hex)) seen.set(sw.hex, sw.name);
  return [...seen].map(([hex, name]) => ({ hex, name }));
})();

/** The five custom-colour slots, with the collected colours underneath.
 *  The panel is anchored to the row rather than to a swatch: a 15rem panel
 *  hanging off a 1.75rem swatch inside a 17.5rem rail clips on one side or the
 *  other whichever way it is aligned, and the row is the full width. */
function CustomColors({
  colors,
  onPick,
}: {
  colors: Config["colors"];
  onPick: (key: keyof Config["colors"], hex: string) => void;
}) {
  const [open, setOpen] = React.useState<keyof Config["colors"] | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = open ? oklchToHex(colors[open]) : "#000000";

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-1.5">
        {SWATCHES.map(({ key, label }) => {
          const hex = oklchToHex(colors[key]);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setOpen((v) => (v === key ? null : key))}
              aria-expanded={open === key}
              title={`${label} · ${hex}`}
              aria-label={`${label}, ${hex}`}
              className={cn(
                "relative h-7 flex-1 cursor-pointer overflow-hidden rounded-md border",
                open === key && "ring-ring ring-2",
              )}
            >
              <span className="absolute inset-0" style={{ background: hex }} />
            </button>
          );
        })}
      </div>

      {open && (
        <div className="bg-popover text-popover-foreground absolute top-full right-0 left-0 z-40 mt-1.5 flex flex-col gap-2.5 rounded-md border p-3 shadow-lg">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium">
              {SWATCHES.find((sw) => sw.key === open)?.label}
            </span>
            <span className="text-muted-foreground font-mono text-[10px] uppercase">{current}</span>
          </div>

          <div className="grid grid-cols-8 gap-1">
            {SAVED_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                title={`${c.name} ${c.hex}`}
                aria-label={c.name}
                onClick={() => {
                  onPick(open, c.hex);
                  setOpen(null);
                }}
                className={cn(
                  "aspect-square rounded-[4px] border transition-transform hover:scale-110",
                  c.hex.toLowerCase() === current.toLowerCase() && "ring-ring ring-2",
                )}
                style={{ background: c.hex }}
              />
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2 border-t pt-2.5 text-xs">
            <span
              className="size-5 shrink-0 rounded-[4px] border"
              style={{ background: current }}
            />
            <span className="text-muted-foreground">Custom…</span>
            <input
              type="color"
              value={current}
              onChange={(e) => onPick(open, e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  config,
  onConfig,
  shot,
  source,
  busy,
  status,
  onImage,
  onUrl,
  onClear,
  onShuffle,
  onShowCode,
  onReset,
  onSaveKit,
}: {
  config: Config;
  onConfig: (next: Config) => void;
  shot: string | null;
  source: string | null;
  busy: boolean;
  status: { text: string; tone: "muted" | "good" | "warn" } | null;
  onImage: (dataUrl: string) => void;
  onUrl: (url: string) => void;
  onClear: () => void;
  onShuffle: () => void;
  onShowCode: () => void;
  onReset: () => void;
  onSaveKit: () => void;
}) {
  const baseName = detectBase(config.colors);
  const themeName = detectThemeColor(config.colors);

  const set = <K extends keyof Config>(key: K, value: Config[K]) =>
    onConfig({ ...config, [key]: value });

  return (
    <aside className="bg-sidebar flex w-[17.5rem] shrink-0 flex-col border-r">
      <div className="flex items-center gap-2 px-3 py-3">
        <Sparkles className="ml-1 size-4 shrink-0" />
        <SiteNav />
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-7"
          aria-label={config.mode === "light" ? "Preview dark mode" : "Preview light mode"}
          onClick={() => set("mode", config.mode === "light" ? "dark" : "light")}
        >
          {config.mode === "light" ? <Moon /> : <Sun />}
        </Button>
      </div>
      <Separator />

      <div className="flex-1 overflow-y-auto p-2">
        <div className="px-2 pt-1 pb-2">
          <Dropzone
            shot={shot}
            source={source}
            busy={busy}
            onImage={onImage}
            onUrl={onUrl}
            onClear={onClear}
          />
          {status && (
            <p
              className={cn(
                "mt-1.5 text-xs",
                status.tone === "good" && "text-foreground",
                status.tone === "warn" && "text-destructive",
                status.tone === "muted" && "text-muted-foreground",
              )}
            >
              {status.text}
            </p>
          )}
        </div>

        <Separator className="my-1" />

        <Group title="Colour">
          <Row label="Palette" value="Pick">
            {(close) =>
              PALETTES.map((p) => (
                <MenuItem
                  key={p.id}
                  onClick={() => {
                    onConfig(applyPalette(config, p));
                    close();
                  }}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="flex shrink-0 overflow-hidden rounded-[3px]">
                      {p.swatches.map((sw) => (
                        <span
                          key={sw.hex}
                          className="size-3"
                          style={{ background: sw.hex }}
                          title={`${sw.name} ${sw.hex}`}
                        />
                      ))}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row
            label="Base Color"
            value={baseName}
            adornment={<Dot color={oklchToHex(config.colors.background)} />}
          >
            {(close) =>
              BASE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={baseName === name}
                  onClick={() => {
                    onConfig(applyBase(config, name));
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>

          <Row
            label="Theme"
            value={themeName}
            adornment={<Dot color={oklchToHex(config.colors.primary)} />}
          >
            {(close) =>
              THEME_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={themeName === name}
                  onClick={() => {
                    onConfig(applyThemeColor(config, name));
                    close();
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Dot color={oklchToHex(THEME_SCALES[name])} />
                    {name}
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Chart Color" value={config.chart} adornment={<Dot color="var(--chart-1)" />}>
            {(close) =>
              CHART_SPREAD_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.chart === name}
                  onClick={() => {
                    set("chart", name);
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>

          <div className="px-2 py-1.5">
            <span className="text-muted-foreground mb-1.5 block text-[11px]">Custom colors</span>
            <CustomColors
              colors={config.colors}
              onPick={(key, hex) =>
                onConfig({ ...config, colors: { ...config.colors, [key]: hexToOklch(hex) } })
              }
            />
          </div>
        </Group>

        <Group title="Type">
          <Row
            label="Heading"
            value={config.fontHeading}
            adornment={<Type className="text-muted-foreground size-3.5 shrink-0" />}
          >
            {(close) => (
              <FontMenu
                value={config.fontHeading}
                onPick={(f) => set("fontHeading", f as Config["fontHeading"])}
                close={close}
              />
            )}
          </Row>

          <Row label="Heading Weight" value={config.headingWeight}>
            {(close) =>
              HEADING_WEIGHT_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.headingWeight === name}
                  onClick={() => {
                    set("headingWeight", name);
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>

          <Row
            label="Font"
            value={config.fontSans}
            adornment={<Type className="text-muted-foreground size-3.5 shrink-0" />}
          >
            {(close) => (
              <FontMenu
                value={config.fontSans}
                onPick={(f) => set("fontSans", f as Config["fontSans"])}
                close={close}
              />
            )}
          </Row>

          <Row
            label="Mono"
            value={config.fontMono}
            adornment={<Type className="text-muted-foreground size-3.5 shrink-0" />}
          >
            {(close) =>
              MONO_FONTS.map((f) => (
                <MenuItem
                  key={f}
                  selected={config.fontMono === f}
                  style={{ fontFamily: f === "System" ? "monospace" : `"${f}", monospace` }}
                  onClick={() => {
                    set("fontMono", f);
                    close();
                  }}
                >
                  {f}
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Heading Case" value={config.headingCase}>
            {(close) =>
              CASE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.headingCase === name}
                  onClick={() => {
                    set("headingCase", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {CASE_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Label Case" value={config.labelCase}>
            {(close) =>
              CASE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.labelCase === name}
                  onClick={() => {
                    set("labelCase", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {CASE_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Body Case" value={config.bodyCase}>
            {(close) =>
              CASE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.bodyCase === name}
                  onClick={() => {
                    set("bodyCase", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {CASE_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Heading Size" value={config.headingSize}>
            {(close) =>
              SIZE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.headingSize === name}
                  onClick={() => {
                    set("headingSize", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {SIZE_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Label Size" value={config.labelSize}>
            {(close) =>
              SIZE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.labelSize === name}
                  onClick={() => {
                    set("labelSize", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {SIZE_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Body Size" value={config.bodySize}>
            {(close) =>
              SIZE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.bodySize === name}
                  onClick={() => {
                    set("bodySize", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {SIZE_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Type Scale" value={config.typeScale}>
            {(close) =>
              TYPE_SCALE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.typeScale === name}
                  onClick={() => {
                    set("typeScale", name);
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>
        </Group>

        <Group title="Shape">
          <Row
            label="Style"
            value={config.style}
            adornment={<SquareDashed className="text-muted-foreground size-3.5 shrink-0" />}
          >
            {(close) =>
              STYLE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.style === name}
                  onClick={() => {
                    set("style", name);
                    close();
                  }}
                  title={STYLES[name].blurb}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>

          <Row
            label="Radius"
            value={
              config.radius === "Default"
                ? `Default · ${effectiveRadius(config)}rem`
                : config.radius
            }
          >
            {(close) =>
              RADIUS_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.radius === name}
                  onClick={() => {
                    set("radius", name);
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Border" value={config.border}>
            {(close) =>
              BORDER_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.border === name}
                  onClick={() => {
                    set("border", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {BORDER_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Border Tint" value={config.borderTint}>
            {(close) =>
              BORDER_TINT_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.borderTint === name}
                  onClick={() => {
                    set("borderTint", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {BORDER_TINT_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Outline" value={config.outline}>
            {(close) =>
              OUTLINE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.outline === name}
                  onClick={() => {
                    set("outline", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {OUTLINE_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Button Outline" value={config.buttonOutline}>
            {(close) =>
              BUTTON_OUTLINE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.buttonOutline === name}
                  onClick={() => {
                    set("buttonOutline", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {BUTTON_OUTLINE_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Elevation" value={config.elevation}>
            {(close) =>
              ELEVATION_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.elevation === name}
                  onClick={() => {
                    set("elevation", name);
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>
        </Group>

        <Group title="Surface">
          <Row label="Surface" value={config.surface}>
            {(close) =>
              SURFACE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.surface === name}
                  onClick={() => {
                    set("surface", name);
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>

          {config.surface === "Glass" && (
            <Row label="Depth" value={config.glassDepth}>
              {(close) =>
                DEPTH_NAMES.map((name) => (
                  <MenuItem
                    key={name}
                    selected={config.glassDepth === name}
                    onClick={() => {
                      set("glassDepth", name);
                      close();
                    }}
                  >
                    {name}
                  </MenuItem>
                ))
              }
            </Row>
          )}
        </Group>

        <Group title="Motion">
          <Row label="Motion" value={config.motion}>
            {(close) =>
              MOTION_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.motion === name}
                  onClick={() => {
                    set("motion", name);
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Interaction" value={config.interact}>
            {(close) =>
              INTERACT_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.interact === name}
                  onClick={() => {
                    set("interact", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {INTERACT_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Entrance" value={config.entrance}>
            {(close) =>
              ENTRANCE_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.entrance === name}
                  onClick={() => {
                    set("entrance", name);
                    close();
                  }}
                >
                  <span className="flex flex-col gap-0.5 py-0.5">
                    <span>{name}</span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {ENTRANCE_BLURBS[name]}
                    </span>
                  </span>
                </MenuItem>
              ))
            }
          </Row>

          <Row label="Tilt" value={config.tilt}>
            {(close) =>
              TILT_NAMES.map((name) => (
                <MenuItem
                  key={name}
                  selected={config.tilt === name}
                  onClick={() => {
                    set("tilt", name);
                    close();
                  }}
                >
                  {name}
                </MenuItem>
              ))
            }
          </Row>
        </Group>
      </div>

      <Separator />
      <div className="flex flex-col gap-2 p-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onReset}>
            <RotateCcw /> Reset
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onShuffle}>
            <Shuffle /> Shuffle
          </Button>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={onSaveKit}>
          <SquareDashed /> Save as kit
        </Button>
        <Button className="w-full" onClick={onShowCode}>
          <Code2 /> Get Code
        </Button>
      </div>
    </aside>
  );
}
