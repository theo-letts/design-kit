import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type Command = { id: string; group: string; label: string; run: () => void };

/** ⌘K list: type to filter, arrows to move, Enter to run. */
export function CommandPalette({
  commands,
  onClose,
}: {
  commands: Command[];
  onClose: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q));
  }, [commands, query]);

  React.useEffect(() => setActive(0), [query]);

  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(matches.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = matches[active];
      if (cmd) {
        cmd.run();
        onClose();
      }
    }
  };

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
      <div className="bg-foreground/25 absolute inset-0 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="bg-popover text-popover-foreground relative flex max-h-[60vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border shadow-2xl"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a command to run…"
            className="placeholder:text-muted-foreground h-11 flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="overflow-y-auto p-1.5">
          {matches.length === 0 && (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              Nothing matches “{query}”.
            </p>
          )}
          {matches.map((cmd, i) => {
            const header = cmd.group !== lastGroup ? cmd.group : null;
            lastGroup = cmd.group;
            return (
              <React.Fragment key={cmd.id}>
                {header && (
                  <div className="text-muted-foreground px-2 pt-2 pb-1 text-[11px] font-medium">
                    {header}
                  </div>
                )}
                <button
                  data-index={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    cmd.run();
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    i === active && "bg-accent text-accent-foreground",
                  )}
                >
                  {cmd.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
