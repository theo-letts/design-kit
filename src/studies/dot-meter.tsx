import * as React from "react";
import type { Study } from "./types";

/* --- study:start --- */

/** A value read as a count of dots rather than the length of a bar.
 *
 *  A progress bar asks you to judge a proportion by eye. A grid of dots can
 *  be counted, so it carries its own scale — and because every dot is the
 *  same size at every value, it stays legible at widths where a bar has
 *  already collapsed to a sliver.
 *
 *  Pass onValueChange and it becomes a control you can drag along. */
export function DotMeter({
  /** 0 to 1. */
  value,
  rows = 3,
  columns = 24,
  /** Dot diameter and the space around it, both in px. */
  dot = 5,
  gap = 4,
  label,
  onValueChange,
  className,
  ...props
}: {
  value: number;
  rows?: number;
  columns?: number;
  dot?: number;
  gap?: number;
  label?: string;
  onValueChange?: (next: number) => void;
} & Omit<React.ComponentProps<"div">, "children" | "onChange">) {
  const total = rows * columns;
  const clamped = Math.min(1, Math.max(0, value));
  const lit = Math.round(clamped * total);
  const live = Boolean(onValueChange);
  const calm = useCalm();
  const dragging = React.useRef(false);

  const setFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - rect.left) / rect.width;
    onValueChange?.(Math.min(1, Math.max(0, t)));
  };

  return (
    <div
      className={className}
      style={live ? { touchAction: "none", cursor: "ew-resize" } : undefined}
      role={live ? "slider" : "meter"}
      tabIndex={live ? 0 : undefined}
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      onPointerDown={
        live
          ? (e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              setFromPointer(e);
            }
          : undefined
      }
      onPointerMove={live ? (e) => dragging.current && setFromPointer(e) : undefined}
      onPointerUp={live ? () => (dragging.current = false) : undefined}
      onKeyDown={
        live
          ? (e) => {
              const step = e.shiftKey ? 0.1 : 1 / total;
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                onValueChange?.(Math.min(1, clamped + step));
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                onValueChange?.(Math.max(0, clamped - step));
              }
            }
          : undefined
      }
      {...props}
    >
      <div
        aria-hidden
        className="grid w-fit grid-flow-col"
        style={{
          gridTemplateRows: `repeat(${rows}, ${dot}px)`,
          gridAutoColumns: `${dot}px`,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: total }, (_, i) => {
          /* Column-major, so the meter fills left to right. The grid is laid
             out the same way with grid-flow-col, which keeps the index and
             the position in step without any arithmetic. */
          const on = i < lit;
          return (
            <span
              key={i}
              className="bg-current"
              style={{
                borderRadius: dot / 2,
                opacity: on ? 1 : 0.15,
                // Unlit dots sit small, so lighting one is a pop rather than
                // a fade. Both properties move together on the kit's timing.
                transform: on ? "scale(1)" : "scale(0.55)",
                transitionProperty: "opacity, transform",
                transitionDuration: calm ? "0ms" : "var(--motion-duration, 240ms)",
                transitionTimingFunction: "var(--motion-ease, ease)",
                /* Stagger from the frontier rather than from dot zero. Under
                   a drag the dots you just crossed move at once and the ones
                   further off trail — a stagger counted from the start of the
                   row would make the whole meter lag behind the pointer. */
                transitionDelay: calm ? "0ms" : `${Math.min(Math.abs(i - lit) * 6, 120)}ms`,
              }}
            />
          );
        })}
      </div>
    </div>
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

/* --- study:end --- */

function Demo() {
  const [value, setValue] = React.useState(0.62);

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="flex flex-col items-center gap-3">
        <DotMeter
          value={value}
          onValueChange={setValue}
          label="Storage used"
          className="text-primary focus-visible:ring-ring/50 rounded-md p-1 outline-none focus-visible:ring-[3px]"
        />
        <div className="text-muted-foreground flex w-full justify-between text-xs tabular-nums">
          <span>Storage used</span>
          <span className="text-foreground">{Math.round(value * 100)}%</span>
        </div>
      </div>

      <p className="text-muted-foreground text-xs">Drag across any of them.</p>

      <div className="flex flex-col items-center gap-4">
        <DotMeter
          value={value}
          onValueChange={setValue}
          rows={1}
          columns={40}
          dot={4}
          gap={3}
          label="Signal"
          className="focus-visible:ring-ring/50 rounded-md p-1 outline-none focus-visible:ring-[3px]"
        />
        <DotMeter
          value={value}
          onValueChange={setValue}
          rows={6}
          columns={6}
          dot={8}
          gap={5}
          label="Blocks"
          className="focus-visible:ring-ring/50 rounded-md p-1 outline-none focus-visible:ring-[3px]"
        />
      </div>
    </div>
  );
}

export default {
  id: "dot-meter",
  name: "Dot Meter",
  note: "A value you can count instead of estimate. Drag to set it.",
  order: 3,
  Component: Demo,
} satisfies Study;
