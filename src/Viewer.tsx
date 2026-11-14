import * as React from "react";
import { KITS, kitById, DEFAULT_KIT } from "@/kits";
import { Specimens } from "@/components/preview/Specimens";
import { ThemedCanvas } from "@/components/ThemedCanvas";
import { SiteNav } from "@/components/SiteNav";
import { useKit } from "@/lib/use-kit";
import { cn } from "@/lib/utils";

/* The second product: the specimen sheet and nothing else.
   There are no controls because a kit is not tuned here — it is edited in
   src/kits/index.ts and this shows the result. The only thing to decide on
   screen is which kit you are looking at. */

export default function Viewer() {
  const [id, setId] = useKit();
  const kit = kitById(id);

  // Left and right step through the kits, so you can flick between them and
  // watch one component change rather than hunting for it twice.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      e.preventDefault();
      const i = KITS.findIndex((k) => k.id === id);
      const next = (i + (e.key === "ArrowRight" ? 1 : KITS.length - 1)) % KITS.length;
      setId(KITS[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, setId]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Deliberately outside the themed canvas: the picker should not restyle
          itself with the kit, or you cannot tell the chrome from the work. */}
      <header className="bg-sidebar flex shrink-0 flex-col gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SiteNav className="-ml-2" />
          <span className="text-muted-foreground ml-auto hidden text-[11px] sm:inline">
            ← → to step through
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {KITS.map((k) => (
            <button
              key={k.id}
              onClick={() => setId(k.id)}
              aria-current={k.id === id}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm transition-colors",
                k.id === id ? "bg-foreground text-background font-medium" : "hover:bg-accent",
              )}
            >
              {k.name}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">{kit.note}</p>
      </header>

      <main className="bg-muted/50 flex-1 overflow-y-auto">
        {/* No key on purpose. Keying this on the kit remounts the whole
            canvas, and a remount cannot animate: the old cards are destroyed
            and new ones appear already in their final colours. Letting React
            update the same elements means switching kits *morphs* — which is
            the comparison this page is for. */}
        <ThemedCanvas config={kit.config} className="min-h-full">
          <Specimens />
        </ThemedCanvas>
      </main>
    </div>
  );
}
