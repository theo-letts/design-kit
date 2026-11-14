import * as React from "react";
import type { Study } from "./types";

/* --- study:start --- */

/* The strip each reel slides. It runs past both ends of 0–9 so a wrap has
   somewhere to travel to: 9 going up lands on the spare 0 above it rather
   than winding backwards through 8, 7, 6. After the slide the reel is put
   back inside the real range with the transition off, which is invisible
   because the cell it lands on shows the same digit. */
const LOW = -9;
const HIGH = 18;
const CELLS = Array.from({ length: HIGH - LOW + 1 }, (_, i) => (((i + LOW) % 10) + 10) % 10);

/** A number that rolls to its new value rather than cutting to it, and rolls
 *  the way the value went.
 *
 *  The whole trick is that nothing animates a number. Each place is a column
 *  of digits in a box one line tall, and the column slides. What you read as
 *  counting is static text behind a window.
 *
 *  Pass onValueChange and it becomes a control: drag across it, or focus it
 *  and use the arrow keys. */
export function Odometer({
  value,
  /** Minimum places. The number keeps its own if it is longer. */
  places = 1,
  /** Value per pixel dragged. */
  sensitivity = 1,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  onValueChange,
  className,
  ...props
}: {
  value: number;
  places?: number;
  sensitivity?: number;
  min?: number;
  max?: number;
  onValueChange?: (next: number) => void;
} & Omit<React.ComponentProps<"span">, "children" | "onChange">) {
  const text = Math.max(0, Math.round(value)).toString().padStart(places, "0");

  // Which way the reels should turn: the sign of the last change.
  const previous = React.useRef(value);
  const direction = value === previous.current ? 1 : value > previous.current ? 1 : -1;
  React.useEffect(() => {
    previous.current = value;
  }, [value]);

  const drag = React.useRef<{ x: number; from: number } | null>(null);
  const live = Boolean(onValueChange);
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n)));

  return (
    <span
      className={className}
      style={live ? { touchAction: "none", cursor: "ew-resize" } : undefined}
      role={live ? "spinbutton" : undefined}
      tabIndex={live ? 0 : undefined}
      aria-valuenow={live ? Math.round(value) : undefined}
      aria-valuemin={live ? min : undefined}
      aria-valuemax={live && max !== Number.MAX_SAFE_INTEGER ? max : undefined}
      onPointerDown={
        live
          ? (e) => {
              drag.current = { x: e.clientX, from: value };
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          : undefined
      }
      onPointerMove={
        live
          ? (e) => {
              const d = drag.current;
              if (!d) return;
              onValueChange?.(clamp(d.from + (e.clientX - d.x) * sensitivity));
            }
          : undefined
      }
      onPointerUp={live ? () => (drag.current = null) : undefined}
      onKeyDown={
        live
          ? (e) => {
              const step = e.shiftKey ? 100 : 1;
              if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                e.preventDefault();
                onValueChange?.(clamp(value + step));
              } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                e.preventDefault();
                onValueChange?.(clamp(value - step));
              }
            }
          : undefined
      }
      {...props}
    >
      {/* The digits change but the number is one value, so a screen reader
          should hear it once rather than hear the places shuffle past. A
          plain string beats aria-label here: a label on a span with no role
          is not reliably announced. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex tabular-nums">
        {text.split("").map((ch, i) => (
          <Reel key={`${text.length}-${i}`} digit={Number(ch)} direction={direction} />
        ))}
      </span>
    </span>
  );
}

/** Whether this reader asked for less motion. Kept in the file rather than
 *  imported, so the study pastes into a project whole. */
function useCalm() {
  const [calm, setCalm] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setCalm(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return calm;
}

function Reel({ digit, direction }: { digit: number; direction: number }) {
  const strip = React.useRef<HTMLSpanElement>(null);
  const at = React.useRef(digit);
  const calm = useCalm();

  React.useLayoutEffect(() => {
    const node = strip.current;
    if (!node) return;
    const place = (p: number) => `translateY(${-(p - LOW)}em)`;

    /* Put the reel back inside 0–9 before moving it again, with the
       transition off. Without this the wraps accumulate and the strip walks
       off its own ends after a few turns. */
    const here = ((at.current % 10) + 10) % 10;
    if (here !== at.current) {
      node.style.transition = "none";
      node.style.transform = place(here);
      at.current = here;
      void node.offsetHeight; // flush, so the next change still animates
    }
    if (here === digit) return;

    // Travel the short way in the direction the number actually went.
    const step = direction >= 0 ? (digit - here + 10) % 10 : -((((here - digit) % 10) + 10) % 10);
    at.current = here + step;
    node.style.transition = "";
    node.style.transform = place(at.current);
  }, [digit, direction]);

  return (
    <span className="inline-block h-[1em] overflow-hidden leading-none">
      <span
        ref={strip}
        className="flex flex-col"
        style={{
          transform: `translateY(${-(digit - LOW)}em)`,
          transitionProperty: "transform",
          // The kit's own motion axis, so a reel in the Slow theme is slow.
          transitionDuration: calm ? "0ms" : "var(--motion-duration, 240ms)",
          transitionTimingFunction: "var(--motion-ease, ease)",
        }}
      >
        {CELLS.map((d, i) => (
          <span key={i} className="h-[1em] leading-none">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/* --- study:end --- */

function Demo() {
  const [value, setValue] = React.useState(1024);

  return (
    <div className="flex flex-col items-center gap-6">
      <Odometer
        value={value}
        places={5}
        max={99999}
        sensitivity={2}
        onValueChange={setValue}
        className="font-heading focus-visible:ring-ring/50 rounded-md text-6xl font-semibold tracking-tight outline-none focus-visible:ring-[3px]"
      />
      <p className="text-muted-foreground text-xs">Drag across the number, or focus and arrow.</p>

      <div className="flex flex-wrap items-center justify-center gap-1">
        {[-1000, -100, -1, +1, +100, +1000].map((step) => (
          <button
            key={step}
            onClick={() => setValue((v) => Math.max(0, Math.min(99999, v + step)))}
            className="hover:bg-accent rounded-md border px-2.5 py-1 text-sm tabular-nums transition-colors"
          >
            {step > 0 ? `+${step}` : step}
          </button>
        ))}
        <button
          onClick={() => setValue(Math.floor(Math.random() * 99999))}
          className="bg-foreground text-background ml-1 rounded-md px-2.5 py-1 text-sm font-medium"
        >
          Random
        </button>
      </div>
    </div>
  );
}

export default {
  id: "odometer",
  name: "Odometer",
  note: "Rolling digits that turn the way the number went. Drag to scrub.",
  order: 2,
  Component: Demo,
} satisfies Study;
