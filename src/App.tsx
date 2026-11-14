import * as React from "react";
import { hexToOklch } from "@/lib/color";
import { applyBase, applyThemeColor, DEFAULT_CONFIG, type Config } from "@/lib/config";
import { houseConfig } from "@/kits";
import { extractConfig } from "@/lib/extract";
import { FONTS } from "@/lib/fonts";
import {
  BASE_NAMES,
  CHART_SPREAD_NAMES,
  RADII,
  RADIUS_NAMES,
  SURFACE_NAMES,
  THEME_NAMES,
} from "@/lib/scales";
import { STYLE_NAMES, STYLES } from "@/lib/styles";
import { applyPalette, PALETTES } from "@/lib/palettes";
import { TILT_NAMES } from "@/lib/tilt";
import { MOTION_NAMES } from "@/lib/motion";
import { BORDER_NAMES, BORDER_TINT_NAMES } from "@/lib/border";
import { BUTTON_OUTLINE_NAMES, OUTLINE_NAMES } from "@/lib/outline";
import { CASE_NAMES, SIZE_NAMES } from "@/lib/wording";
import { INTERACT_NAMES } from "@/lib/interact";
import { ENTRANCE_NAMES } from "@/lib/entrances";
import { ELEVATION_NAMES } from "@/lib/elevation";
import { TYPE_SCALE_NAMES } from "@/lib/type";
import { DEPTH_NAMES } from "@/lib/glass";
import { buildTheme, themeVars, toBackdropSvg, toCss } from "@/lib/theme";
import { CodeDialog } from "@/components/CodeDialog";
import { SaveKitDialog } from "@/components/SaveKitDialog";
import { CommandPalette, type Command } from "@/components/CommandPalette";
import { Preview } from "@/components/preview";
import { ThemedCanvas } from "@/components/ThemedCanvas";
import { Sidebar } from "@/components/Sidebar";

type Status = { text: string; tone: "muted" | "good" | "warn" };
type Overlay = "code" | "palette" | "save-kit" | null;

const STORE_KEY = "design-kit.config.v3";

/** The axes that are switched off across the kit, forced on every read. */
const OFF = {
  pageTexture: "None",
  pageGrain: "None",
  cardTexture: "None",
  backdrop: "None",
} as const;

/** Whatever you had last, then the default. */
function initialConfig(): Config {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Stored shapes go stale as axes are added; one missing key and the
      // canvas renders undefined. Fill from the default rather than trusting it.
      if (parsed && typeof parsed === "object" && parsed.colors) {
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          /* Textures and backdrops are off for now and have no control left,
             so a config stored while they existed must not restore one — it
             would be unturnoffable. Drop these two lines to switch them on. */
          ...OFF,
          colors: { ...DEFAULT_CONFIG.colors, ...parsed.colors },
        };
      }
    }
  } catch {
    /* private browsing, or something we no longer understand */
  }
  /* Nothing stored: start on the house kit rather than bare shadcn. The
     merge base above stays DEFAULT_CONFIG on purpose — it is filling keys a
     stored config predates, and filling those from the house kit would apply
     house styling to a theme that never asked for it. */
  return houseConfig();
}

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

export default function App() {
  const [config, setConfig] = React.useState<Config>(initialConfig);
  const [shot, setShot] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<Status | null>(null);
  const [overlay, setOverlay] = React.useState<Overlay>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const theme = React.useMemo(() => buildTheme(config), [config]);
  // Remember the last theme, so a reload does not throw your work away.
  React.useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(config));
    } catch {
      /* private browsing */
    }
  }, [config]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOverlay((o) => (o === "palette" ? null : "palette"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Ask Claude first; fall back to reading the pixels here. */
  const readScreenshot = React.useCallback(
    async (dataUrl: string) => {
      setShot(dataUrl);
      setSource(null);
      setBusy(true);
      setStatus({ text: "Reading the screenshot…", tone: "muted" });
      const base = config;

      try {
        const res = await fetch("/api/read-theme", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        if (res.ok) {
          const read = await res.json();
          setConfig(applyRead(read, base));
          setStatus({ text: read.notes || "Read by Claude.", tone: "good" });
          return;
        }
        const why = await res.json().catch(() => ({}));
        const noKey = why?.error === "no-key";
        setConfig(await extractConfig(dataUrl, base));
        setStatus({
          text: noKey
            ? "Colors sampled locally. Set ANTHROPIC_API_KEY to read radius and type too."
            : (why?.message ?? `Claude could not read it (${res.status}).`),
          tone: noKey ? "muted" : "warn",
        });
      } catch (err: any) {
        try {
          setConfig(await extractConfig(dataUrl, base));
          setStatus({ text: "Colors sampled locally.", tone: "warn" });
        } catch {
          setStatus({ text: err?.message ?? "Could not read that image.", tone: "warn" });
        }
      } finally {
        setBusy(false);
      }
    },
    [config],
  );

  /** Same idea, one step earlier: Chrome renders the page, so the reading has the
   *  site's real computed styles behind it and not just an impression of a picture. */
  const readUrl = React.useCallback(
    async (raw: string) => {
      const url = raw.trim();
      if (!url) return;
      setShot(null);
      setSource(url);
      setBusy(true);
      setStatus({ text: "Opening the page…", tone: "muted" });
      const base = config;

      try {
        const res = await fetch("/api/read-url", {
          method: "POST",
          headers: { "content-type": "application/json" },
          // Match the side you're looking at: a site that only goes dark behind a
          // media query would otherwise always be captured light.
          body: JSON.stringify({ url, scheme: base.mode }),
        });
        const read = await res.json().catch(() => ({}) as any);
        // The capture comes back even when the reading failed, so show it either way.
        if (typeof read?.dataUrl === "string") setShot(read.dataUrl);
        if (typeof read?.url === "string") setSource(read.url);

        if (res.ok) {
          setConfig(applyRead(read, base));
          setStatus({ text: read.notes || `Matched ${read.title || url}.`, tone: "good" });
          return;
        }
        if (typeof read?.dataUrl === "string") {
          setConfig(await extractConfig(read.dataUrl, base));
          setStatus({
            text:
              read?.error === "no-key"
                ? "Colors sampled from the capture. Set ANTHROPIC_API_KEY to read type and radius too."
                : (read?.message ?? `Captured it, but the reading failed (${res.status}).`),
            tone: read?.error === "no-key" ? "muted" : "warn",
          });
          return;
        }
        setSource(null);
        setStatus({
          text: read?.message ?? `Could not load that page (${res.status}).`,
          tone: "warn",
        });
      } catch (err: any) {
        setSource(null);
        setStatus({ text: err?.message ?? "Could not reach that page.", tone: "warn" });
      } finally {
        setBusy(false);
      }
    },
    [config],
  );

  /** Hand the current config to the dev server, which writes src/kits/<id>.ts. */
  const saveKit = React.useCallback(
    async (name: string, note: string) => {
      setSaving(true);
      setSaveError(null);
      try {
        const res = await fetch("/api/save-kit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, note, config }),
        });
        const out = await res.json().catch(() => ({}) as any);
        if (!res.ok) {
          setSaveError(out?.message ?? `Could not save it (${res.status}).`);
          return;
        }
        setOverlay(null);
        setStatus({
          text: `${out.replaced ? "Updated" : "Saved"} ${out.path} — open /specimens.html to see it.`,
          tone: "good",
        });
      } catch (err: any) {
        setSaveError(err?.message ?? "Could not reach the dev server.");
      } finally {
        setSaving(false);
      }
    },
    [config],
  );

  const shuffle = React.useCallback(() => {
    setConfig((c) => {
      const mode = Math.random() < 0.35 ? "dark" : "light";
      const next: Config = {
        ...c,
        mode,
        style: pick(STYLE_NAMES),
        radius: pick(RADIUS_NAMES),
        chart: pick(CHART_SPREAD_NAMES),
        surface: pick(SURFACE_NAMES),
        fontSans: pick(FONTS),
        fontHeading: Math.random() < 0.5 ? pick(FONTS) : c.fontSans,
        glassDepth: pick(DEPTH_NAMES),
        tilt: Math.random() < 0.2 ? pick(TILT_NAMES) : "None",
        motion: pick(MOTION_NAMES),
        interact: pick(INTERACT_NAMES),
        entrance: pick(ENTRANCE_NAMES),
        elevation: pick(ELEVATION_NAMES),
        typeScale: pick(TYPE_SCALE_NAMES),
        headingCase: Math.random() < 0.3 ? pick(CASE_NAMES) : "As written",
        labelCase: Math.random() < 0.3 ? pick(CASE_NAMES) : "As written",
        /* Body is rarer on purpose: it is the one that can make a page
           genuinely harder to read. */
        bodyCase:
          Math.random() < 0.12 ? pick(["Title", "lower", "Small Caps"] as const) : "As written",
        headingSize: Math.random() < 0.3 ? pick(SIZE_NAMES) : "Default",
        labelSize: Math.random() < 0.25 ? pick(SIZE_NAMES) : "Default",
        bodySize: Math.random() < 0.2 ? pick(["Small", "Default", "Large"] as const) : "Default",
        outline: pick(OUTLINE_NAMES),
        border: Math.random() < 0.35 ? pick(BORDER_NAMES) : "Auto",
        borderTint: Math.random() < 0.3 ? pick(BORDER_TINT_NAMES) : "Neutral",
        buttonOutline: pick(BUTTON_OUTLINE_NAMES),
      };
      return applyThemeColor(applyBase(next, pick(BASE_NAMES)), pick(THEME_NAMES));
    });
    setStatus(null);
  }, []);

  const commands = React.useMemo<Command[]>(() => {
    const list: Command[] = [
      { id: "shuffle", group: "Actions", label: "Shuffle everything", run: shuffle },
      {
        id: "mode",
        group: "Actions",
        label: config.mode === "light" ? "Switch to dark mode" : "Switch to light mode",
        run: () => setConfig((c) => ({ ...c, mode: c.mode === "light" ? "dark" : "light" })),
      },
      { id: "code", group: "Actions", label: "Get code", run: () => setOverlay("code") },
      {
        id: "reset",
        group: "Actions",
        label: "Reset to defaults",
        run: () => setConfig(houseConfig()),
      },
      {
        id: "copy-css",
        group: "Actions",
        label: "Copy theme CSS",
        run: () => void navigator.clipboard.writeText(toCss(theme)).catch(() => {}),
      },
    ];
    for (const s of STYLE_NAMES)
      list.push({
        id: `style-${s}`,
        group: "Style",
        label: s,
        run: () => setConfig((c) => ({ ...c, style: s })),
      });
    for (const t of THEME_NAMES)
      list.push({
        id: `theme-${t}`,
        group: "Theme color",
        label: t,
        run: () => setConfig((c) => applyThemeColor(c, t)),
      });
    for (const b of BASE_NAMES)
      list.push({
        id: `base-${b}`,
        group: "Base color",
        label: b,
        run: () => setConfig((c) => applyBase(c, b)),
      });
    for (const r of RADIUS_NAMES)
      list.push({
        id: `radius-${r}`,
        group: "Radius",
        label: r,
        run: () => setConfig((c) => ({ ...c, radius: r })),
      });
    for (const d of DEPTH_NAMES)
      list.push({
        id: `depth-${d}`,
        group: "Glass depth",
        label: d,
        run: () => setConfig((c) => ({ ...c, surface: "Glass", glassDepth: d })),
      });
    for (const o of OUTLINE_NAMES)
      list.push({
        id: `outline-${o}`,
        group: "Outline",
        label: o,
        run: () => setConfig((c) => ({ ...c, outline: o })),
      });
    for (const b of BORDER_NAMES)
      list.push({
        id: `border-${b}`,
        group: "Border",
        label: b,
        run: () => setConfig((c) => ({ ...c, border: b })),
      });
    for (const b of BORDER_TINT_NAMES)
      list.push({
        id: `border-tint-${b}`,
        group: "Border tint",
        label: b,
        run: () => setConfig((c) => ({ ...c, borderTint: b })),
      });
    for (const o of BUTTON_OUTLINE_NAMES)
      list.push({
        id: `button-outline-${o}`,
        group: "Button outline",
        label: o,
        run: () => setConfig((c) => ({ ...c, buttonOutline: o })),
      });
    for (const c0 of CASE_NAMES)
      list.push({
        id: `heading-case-${c0}`,
        group: "Heading case",
        label: c0,
        run: () => setConfig((c) => ({ ...c, headingCase: c0 })),
      });
    for (const c0 of CASE_NAMES)
      list.push({
        id: `label-case-${c0}`,
        group: "Label case",
        label: c0,
        run: () => setConfig((c) => ({ ...c, labelCase: c0 })),
      });
    for (const c0 of CASE_NAMES)
      list.push({
        id: `body-case-${c0}`,
        group: "Body case",
        label: c0,
        run: () => setConfig((c) => ({ ...c, bodyCase: c0 })),
      });
    for (const z of SIZE_NAMES)
      list.push({
        id: `headingSize-${z}`,
        group: "Heading size",
        label: z,
        run: () => setConfig((c) => ({ ...c, headingSize: z })),
      });
    for (const z of SIZE_NAMES)
      list.push({
        id: `labelSize-${z}`,
        group: "Label size",
        label: z,
        run: () => setConfig((c) => ({ ...c, labelSize: z })),
      });
    for (const z of SIZE_NAMES)
      list.push({
        id: `bodySize-${z}`,
        group: "Body size",
        label: z,
        run: () => setConfig((c) => ({ ...c, bodySize: z })),
      });
    for (const i of INTERACT_NAMES)
      list.push({
        id: `interact-${i}`,
        group: "Interaction",
        label: i,
        run: () => setConfig((c) => ({ ...c, interact: i })),
      });
    for (const e of ENTRANCE_NAMES)
      list.push({
        id: `entrance-${e}`,
        group: "Entrance",
        label: e,
        run: () => setConfig((c) => ({ ...c, entrance: e })),
      });
    for (const e of ELEVATION_NAMES)
      list.push({
        id: `elevation-${e}`,
        group: "Elevation",
        label: e,
        run: () => setConfig((c) => ({ ...c, elevation: e })),
      });
    for (const t of TYPE_SCALE_NAMES)
      list.push({
        id: `type-${t}`,
        group: "Type scale",
        label: t,
        run: () => setConfig((c) => ({ ...c, typeScale: t })),
      });
    for (const p of PALETTES)
      list.push({
        id: `palette-${p.id}`,
        group: "Palette",
        label: p.name,
        run: () => setConfig((c) => applyPalette(c, p)),
      });
    for (const m of MOTION_NAMES)
      list.push({
        id: `motion-${m}`,
        group: "Motion",
        label: m,
        run: () => setConfig((c) => ({ ...c, motion: m })),
      });
    for (const t of TILT_NAMES)
      list.push({
        id: `tilt-${t}`,
        group: "Tilt",
        label: t,
        run: () => setConfig((c) => ({ ...c, tilt: t })),
      });
    for (const f of FONTS)
      list.push({
        id: `font-${f}`,
        group: "Font",
        label: f,
        run: () => setConfig((c) => ({ ...c, fontSans: f, fontHeading: f })),
      });
    return list;
  }, [config.mode, shuffle, theme]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden lg:flex-row">
      {/* The remixer is a two-pane tool and it does not fit a phone: the rail
          alone is 17.5rem of a 23.4rem screen. Saying so is better than
          rendering it anyway and letting the canvas become a sliver — and
          better than hiding it, because someone on a phone still wants to
          look at what the kit produces. The other three pages do fit. */}
      <div className="bg-sidebar flex shrink-0 flex-col gap-1 border-b px-4 py-3 text-sm lg:hidden">
        <p className="font-medium">The remixer wants a wider screen.</p>
        <p className="text-muted-foreground text-xs">
          Its sidebar is 280px of controls beside a live canvas, which needs room to be worth
          anything. These three read fine on a phone:{" "}
          <a className="underline underline-offset-2" href="/kit.html">
            Design Kit
          </a>
          ,{" "}
          <a className="underline underline-offset-2" href="/specimens.html">
            Specimens
          </a>
          ,{" "}
          <a className="underline underline-offset-2" href="/studies.html">
            Studies
          </a>
          .
        </p>
      </div>

      <Sidebar
        config={config}
        onConfig={setConfig}
        shot={shot}
        source={source}
        busy={busy}
        status={status}
        onImage={(d) => void readScreenshot(d)}
        onUrl={(u) => void readUrl(u)}
        onClear={() => {
          setShot(null);
          setSource(null);
          setStatus(null);
        }}
        onShuffle={shuffle}
        onShowCode={() => setOverlay("code")}
        onReset={() => setConfig(houseConfig())}
        onSaveKit={() => {
          setSaveError(null);
          setOverlay("save-kit");
        }}
      />

      <main className="bg-muted/50 relative flex-1 overflow-y-auto p-4 sm:p-6">
        <ThemedCanvas config={config} className="min-h-full rounded-xl border shadow-sm">
          <Preview />
        </ThemedCanvas>
      </main>

      {overlay === "code" && (
        <CodeDialog theme={theme} config={config} onClose={() => setOverlay(null)} />
      )}
      {overlay === "save-kit" && (
        <SaveKitDialog
          busy={saving}
          error={saveError}
          onSave={(name, note) => void saveKit(name, note)}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "palette" && (
        <CommandPalette commands={commands} onClose={() => setOverlay(null)} />
      )}
    </div>
  );
}

/** Fold a reading — from a screenshot or from a captured page — onto a config.
 *  Unknown font names fall back rather than writing a value no picker can show. */
function applyRead(read: any, base: Config): Config {
  const font = (v: unknown) =>
    (FONTS.includes(v as (typeof FONTS)[number])
      ? (v as string)
      : base.fontSans) as Config["fontSans"];
  const one = <T extends readonly string[]>(names: T, v: unknown, fallback: T[number]) =>
    (names.includes(v as string) ? (v as string) : fallback) as T[number];

  /* A style carries corner, border weight and shadow together, so take it whole
     when the reading has one; only fall back to inferring it from the radius. */
  const style = read.style
    ? one(STYLE_NAMES, read.style, base.style)
    : nearestStyle(Number(read.radius) || 0);
  /* The radius axis is an override, so set it only where the page departs from
     the shape language it otherwise matches. */
  const wanted = Number(read.radius);
  const radius =
    Number.isFinite(wanted) && Math.abs(wanted - STYLES[style].radius) > 0.12
      ? nearestRadius(wanted)
      : "Default";

  return {
    ...base,
    mode: read.mode === "dark" ? "dark" : "light",
    radius,
    style,
    elevation: one(ELEVATION_NAMES, read.elevation, "Default"),
    /* Textures and backdrops are off across the kit for now, so a page that
       has one does not bring it over. */
    pageTexture: "None",
    pageGrain: "None",
    fontSans: font(read.fontSans),
    fontHeading: font(read.fontHeading),
    colors: {
      background: hexToOklch(read.background),
      foreground: hexToOklch(read.foreground),
      primary: hexToOklch(read.primary),
      accent: hexToOklch(read.accent),
      destructive: hexToOklch(read.destructive),
    },
  };
}

/** The closest named rung on the radius scale. Default is not a size, so it is out. */
function nearestRadius(rem: number): Config["radius"] {
  const sized = (Object.entries(RADII) as [Config["radius"], number | null][]).filter(
    (e): e is [Config["radius"], number] => e[1] !== null,
  );
  return sized.reduce((best, cur) =>
    Math.abs(cur[1] - rem) < Math.abs(best[1] - rem) ? cur : best,
  )[0];
}

/** Map a radius Claude read off a screenshot onto the closest style. */
function nearestStyle(radiusRem: number): Config["style"] {
  const table: [Config["style"], number][] = [
    ["Vega", 0],
    ["Sera", 0.125],
    ["Lyra", 0.25],
    ["Nova", 0.625],
    ["Luma", 0.75],
    ["Maia", 1],
    ["Rhea", 1.5],
  ];
  return table.reduce((best, cur) =>
    Math.abs(cur[1] - radiusRem) < Math.abs(best[1] - radiusRem) ? cur : best,
  )[0];
}
