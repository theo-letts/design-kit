import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/* A named block of code with a copy button. Shared by the export dialog and
   the studies page, because "here is the code" should look and behave the
   same whether the code was generated or written. */
export function CodeBlock({
  filename,
  code,
  bodyClassName,
}: {
  filename: string;
  code: string;
  /** Overrides the default height cap, for panels with room to spare. */
  bodyClassName?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border">
      <div className="bg-muted/60 flex shrink-0 items-center gap-2 border-b px-3 py-1.5">
        <span className="text-muted-foreground flex-1 font-mono text-xs">{filename}</span>
        <button
          onClick={copy}
          aria-label={`Copy ${filename}`}
          className="hover:text-foreground text-muted-foreground"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre
        className={cn(
          "overflow-auto p-3 font-mono text-xs leading-relaxed",
          bodyClassName ?? "max-h-64",
        )}
      >
        {code}
      </pre>
    </div>
  );
}
