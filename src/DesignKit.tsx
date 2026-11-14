import { kitById, DEFAULT_KIT } from "@/kits";
import { Specimens } from "@/components/preview/Specimens";
import { Install } from "@/components/preview/Install";
import { ThemedCanvas } from "@/components/ThemedCanvas";
import { SiteNav } from "@/components/SiteNav";

/* The fourth product: the house kit, and nothing to turn.
 *
 *  The remixer tunes, the specimen sheet compares, the sandbox experiments.
 *  This one decides nothing — it is the finished kit on the full set, which
 *  is the page you send someone who asked what the design system looks like.
 *  There is deliberately no kit picker: a picker invites a comparison, and
 *  the point here is that this is the one.
 *
 *  Named DesignKit rather than Kit because src/kits/ is a folder and macOS
 *  matches filenames without case — @/kit and @/kits are one keystroke and
 *  one bad afternoon apart. */

export default function DesignKit() {
  const kit = kitById(DEFAULT_KIT);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* App chrome, outside the canvas: even here, the nav should not
          restyle itself with the kit or you cannot tell tool from work. */}
      <header className="bg-sidebar flex shrink-0 items-baseline gap-3 border-b px-4 py-3">
        <SiteNav className="-ml-2 self-center" />
        <div className="ml-auto flex items-baseline gap-2 text-right">
          <span className="text-sm font-medium">{kit.name}</span>
          <span className="text-muted-foreground hidden text-xs sm:inline">{kit.note}</span>
        </div>
      </header>

      <main className="bg-muted/50 flex-1 overflow-y-auto">
        <ThemedCanvas config={kit.config} className="min-h-full">
          {/* Install first, specimens after. This is the page you send
              someone, and the first question they have is how to get it —
              not what a badge looks like. Both are inside the canvas, so
              the instructions are themselves a specimen. */}
          <div className="flex flex-col gap-10 p-6 md:p-10">
            <Install kit={kit} />
            <div className="border-t" />
          </div>
          <Specimens />
        </ThemedCanvas>
      </main>
    </div>
  );
}
