import { cn } from "@/lib/utils";

/* The four products are four documents, not four routes, so this is plain
   anchors rather than a router: the whole point of specimens.html is that it
   boots without the remixer's sidebar and controls.

   It lives in app chrome, never inside ThemedCanvas — if the nav restyled
   itself with the kit you could not tell the tool from the work. */

type Page = { id: string; name: string; href: string };

export const PAGES: Page[] = [
  { id: "remix", name: "Remixer", href: "/index.html" },
  { id: "specimens", name: "Specimens", href: "/specimens.html" },
  { id: "studies", name: "Studies", href: "/studies.html" },
  { id: "kit", name: "Design Kit", href: "/kit.html" },
];

/** Which document is open. "/" and "" both mean index, which is how the dev
 *  server and a static host each serve the root. */
function currentId(): string {
  const path = location.pathname.replace(/\/+$/, "");
  const file = path.slice(path.lastIndexOf("/") + 1);
  if (file === "specimens.html") return "specimens";
  if (file === "studies.html") return "studies";
  if (file === "kit.html") return "kit";
  return "remix";
}

export function SiteNav({ className }: { className?: string }) {
  const here = currentId();

  return (
    <nav aria-label="Pages" className={cn("flex items-center gap-0.5", className)}>
      {PAGES.map((p) => {
        const active = p.id === here;
        return (
          <a
            key={p.id}
            href={p.href}
            /* The current page is still a link, so a click reloads it — which is
               the quickest way to drop a half-tuned state. aria-current is what
               tells a screen reader which one you are on. */
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors",
              "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent",
            )}
          >
            {p.name}
          </a>
        );
      })}
    </nav>
  );
}
