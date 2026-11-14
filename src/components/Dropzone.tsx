import * as React from "react";
import { ImageUp, Link2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

const MAX_BYTES = 10 * 1024 * 1024;

export const fileToDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("Could not read that file."));
    r.readAsDataURL(file);
  });

/** Just the bit worth reading back: "https://ui.shadcn.com/docs" -> "ui.shadcn.com". */
const label = (url: string) => {
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`);
    return u.host.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return url;
  }
};

export function Dropzone({
  shot,
  source,
  busy,
  onImage,
  onUrl,
  onClear,
}: {
  shot: string | null;
  source: string | null;
  busy: boolean;
  onImage: (dataUrl: string) => void;
  onUrl: (url: string) => void;
  onClear: () => void;
}) {
  const [over, setOver] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null);

  const accept = React.useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_BYTES) return;
      onImage(await fileToDataUrl(file));
    },
    [onImage],
  );

  const submit = () => {
    const v = url.trim();
    if (!v || busy) return;
    onUrl(v);
  };

  // Cmd-V anywhere in the app drops a screenshot straight in. A pasted *link* goes
  // to the URL field instead of the canvas — the clipboard says which it is.
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.isContentEditable) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      if (item) {
        e.preventDefault();
        void accept(item.getAsFile());
        return;
      }
      const text = e.clipboardData?.getData("text")?.trim() ?? "";
      if (/^https?:\/\/\S+$/i.test(text)) {
        e.preventDefault();
        setUrl(text);
        onUrl(text);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [accept, onUrl]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) return void accept(dropped);
        // Dragging a tab or a link onto the panel drops text, not a file.
        const text = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text");
        if (/^https?:\/\/\S+$/i.test(text.trim())) {
          setUrl(text.trim());
          onUrl(text.trim());
        }
      }}
      className={cn(
        "relative overflow-hidden rounded-lg border border-dashed transition-colors",
        over ? "border-primary bg-accent" : "border-border",
      )}
    >
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          void accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {shot ? (
        <div className="relative">
          <img
            src={shot}
            alt={source ? `Screenshot of ${label(source)}` : "Reference screenshot"}
            className="block max-h-44 w-full object-cover object-top"
          />
          <button
            onClick={onClear}
            aria-label="Remove reference"
            className="bg-background/80 hover:bg-background absolute top-1.5 right-1.5 rounded-md border p-1 backdrop-blur-sm"
          >
            <X className="size-3.5" />
          </button>
          {source && !busy && (
            <span className="bg-background/80 absolute bottom-1.5 left-1.5 max-w-[88%] truncate rounded border px-1.5 py-0.5 text-[0.6875rem] backdrop-blur-sm">
              {label(source)}
            </span>
          )}
          {busy && (
            <div className="bg-background/70 absolute inset-0 flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
              <Loader2 className="size-4 animate-spin" />
              Reading…
            </div>
          )}
        </div>
      ) : busy ? (
        <div className="text-muted-foreground flex w-full flex-col items-center gap-2 px-4 py-7 text-center text-sm">
          <Loader2 className="size-5 animate-spin" />
          Loading the page…
        </div>
      ) : (
        <button
          onClick={() => input.current?.click()}
          className="flex w-full flex-col items-center gap-2 px-4 py-7 text-center"
        >
          <ImageUp className="text-muted-foreground size-5" />
          <span className="text-sm font-medium">Drop a screenshot</span>
          <span className="text-muted-foreground text-xs">
            or paste with ⌘V, or click to browse
          </span>
        </button>
      )}

      <div className="flex items-center gap-1 border-t p-1.5">
        <div
          className={cn(
            "border-input bg-background flex h-7 flex-1 items-center gap-1.5 rounded-md border px-2",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          )}
        >
          <Link2 className="text-muted-foreground size-3.5 shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Match a URL"
            spellCheck={false}
            autoComplete="off"
            aria-label="Match the theme of a web page"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 px-2.5"
          disabled={busy || !url.trim()}
          onClick={submit}
        >
          Match
        </Button>
        {shot && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            File
          </Button>
        )}
      </div>
    </div>
  );
}
