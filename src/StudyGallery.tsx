import * as React from "react";
import { KITS, kitById } from "@/kits";
import { STUDIES, DEFAULT_STUDY, studyById } from "@/studies";
import { ThemedCanvas } from "@/components/ThemedCanvas";
import { SiteNav } from "@/components/SiteNav";
import { CodeBlock } from "@/components/CodeBlock";
import { useKit } from "@/lib/use-kit";
import { cn } from "@/lib/utils";

/* The third product: a sandbox.
   The remixer tunes a theme and the specimen sheet proves it on the standard
   set. Neither is anywhere to try something that is not a shadcn component
   yet. A study is that — small, self-contained, running in whichever kit you
   pick, and sitting next to the file that drew it, so it can leave here as
   code rather than as a screenshot to rebuild from.

   Named StudyGallery, not Studies, because macOS matches filenames without
   case: a page at src/Studies.tsx and a folder at src/studies/ are one path
   as far as the resolver is concerned, and "@/studies" then lands on the
   page importing itself. */

const STORE_KEY = "design-kit.study";

function useStudy() {
  const [id, setId] = React.useState(() => {
    const fromUrl = new URLSearchParams(location.search).get("study");
    if (fromUrl && STUDIES.some((s) => s.id === fromUrl)) return fromUrl;
    try {
      return localStorage.getItem(STORE_KEY) ?? DEFAULT_STUDY;
    } catch {
      return DEFAULT_STUDY;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, id);
    } catch {
      /* private browsing */
    }
    const url = new URL(location.href);
    url.searchParams.set("study", id);
    history.replaceState(null, "", url);
  }, [id]);

  return [id, setId] as const;
}

export default function StudyGallery() {
  const [kitId, setKitId] = useKit();
  const [studyId, setStudyId] = useStudy();
  const [showCode, setShowCode] = React.useState(true);

  const kit = kitById(kitId);
  const study = studyById(studyId);

  /* Arrows step between studies — but a study is allowed to want its own
     arrow keys, and two of them do. So the stage keeps them: anything that
     already handled the press, and anything focused inside the canvas, is
     left alone. Without this, arrowing a slider inside a study silently
     changes which study you are looking at. */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.closest("[data-stage]")) return;
      e.preventDefault();
      const i = STUDIES.findIndex((s) => s.id === studyId);
      const next = (i + (e.key === "ArrowRight" ? 1 : STUDIES.length - 1)) % STUDIES.length;
      setStudyId(STUDIES[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studyId, setStudyId]);

  if (!study) {
    return <p className="p-6 text-sm">No studies yet — add a .tsx to src/studies.</p>;
  }

  const { Component } = study;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* App chrome, deliberately outside the canvas: the picker must not
          restyle itself with the kit or you cannot tell tool from work. */}
      <header className="bg-sidebar flex shrink-0 flex-col gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SiteNav className="-ml-2" />
          <label className="text-muted-foreground ml-auto flex items-center gap-1.5 text-[11px]">
            Kit
            <select
              value={kitId}
              onChange={(e) => setKitId(e.target.value)}
              className="border-input bg-background text-foreground h-7 rounded-md border px-1.5 text-xs"
            >
              {KITS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => setShowCode((v) => !v)}
            aria-pressed={showCode}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors",
              showCode ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent",
            )}
          >
            Code
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {STUDIES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStudyId(s.id)}
              aria-current={s.id === studyId}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm transition-colors",
                s.id === studyId ? "bg-foreground text-background font-medium" : "hover:bg-accent",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">{study.note}</p>
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Keyed on both ids, so switching either one remounts the study
            rather than handing it a half-changed theme. */}
        <div data-stage className="bg-muted/50 min-h-0 flex-1 overflow-y-auto">
          <ThemedCanvas
            key={`${kit.id}:${study.id}`}
            config={kit.config}
            className="flex min-h-full items-center justify-center p-8"
          >
            <Component />
          </ThemedCanvas>
        </div>

        {showCode && (
          <aside className="bg-sidebar flex min-h-0 shrink-0 flex-col gap-2 border-t p-3 lg:w-[30rem] lg:border-t-0 lg:border-l">
            <p className="text-muted-foreground text-[11px]">
              The file that drew what you are looking at, minus its metadata.
            </p>
            <CodeBlock
              filename={`${study.id}.tsx`}
              code={study.source}
              bodyClassName="max-h-[16rem] lg:max-h-none lg:flex-1"
            />
          </aside>
        )}
      </main>
    </div>
  );
}
