import * as React from "react";
import type { Study } from "./types";

/* --- study:start --- */

/** Where the light is. A unit-ish vector in the same space as the surface
 *  normal, so a field can shade with a plain dot product. */
export type Light = { x: number; y: number; z: number };

/** A field returns how much ink covers the point (x, y), both in -1..1, with
 *  0 for bare paper and 1 for solid. It also gets the light, which is what
 *  lets the same grid of dots react to the pointer without the grid moving.
 *  Anything that can answer that question can be screened, so a photograph
 *  drops in here as readily as these. */
export type HalftoneField = (x: number, y: number, light: Light) => number;

export const HALFTONE_FIELDS: Record<string, HalftoneField> = {
  /* A sphere. The normal's z falls off toward the rim, which is what makes a
     flat grid of dots read as something round — and because the shading is a
     dot product with the light, moving the light rotates the terminator
     across the face instead of just brightening it. */
  Moon: (x, y, light) => {
    const r = Math.hypot(x, y);
    if (r > 1) return 0;
    const z = Math.sqrt(1 - r * r);
    const lambert = Math.max(0, light.x * x + light.y * y + light.z * z);
    // Ink is the shadow, so dark where the light is not, plus a rim to hold
    // the edge — without it the disc dissolves exactly where it should end.
    return Math.min(1, 1 - lambert * 0.92 + (r > 0.93 ? 0.35 : 0));
  },
  /* The band thickens on the side the light is on, so the ring reads as a
     solid thing being lit rather than a flat stroke. */
  Ring: (x, y, light) => {
    const d = Math.abs(Math.hypot(x, y) - 0.66);
    const lean = 0.14 + 0.1 * Math.max(0, light.x * x + light.y * y);
    return Math.max(0, 1 - d / lean);
  },
  /* Light drives phase here rather than brightness: the crests travel. */
  Wave: (x, y, light) => {
    const falloff = Math.max(0, 1 - Math.hypot(x, y));
    const phase = light.x * 2.4 + light.y * 1.6;
    return falloff * (0.5 + 0.5 * Math.sin(x * 5.5 + Math.sin(y * 2.6) * 1.8 + phase));
  },
  Disc: (x, y) => (Math.hypot(x, y) <= 0.86 ? 1 : 0),
};

/** Turn anything you can draw into a field.
 *
 *  The analytic fields above are the exception, not the rule: most pictures
 *  are easier to draw than to describe as a function. So draw once into an
 *  offscreen canvas, then read its alpha back as coverage. The screen never
 *  knows the difference, and this is the same door a photograph comes
 *  through — swap the draw for drawImage and you are screening a photo. */
export function fieldFromDraw(
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  /* Rasterise a little finer than the screen will sample it. Much finer only
     buys aliasing, since each dot reads one pixel. */
  resolution = 160,
): HalftoneField {
  if (typeof document === "undefined") return () => 0;
  const off = document.createElement("canvas");
  off.width = resolution;
  off.height = resolution;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return () => 0;
  draw(ctx, resolution);
  const data = ctx.getImageData(0, 0, resolution, resolution).data;

  return (x, y) => {
    const px = Math.round(((x + 1) / 2) * (resolution - 1));
    const py = Math.round(((y + 1) / 2) * (resolution - 1));
    if (px < 0 || py < 0 || px >= resolution || py >= resolution) return 0;
    return data[((py * resolution + px) << 2) + 3] / 255;
  };
}

/* Two ways to screen a field, and they do not look alike.
 *
 *  "dots" is the printer's halftone: circles on a 45° grid whose *area*
 *  carries the tone. "dither" is the one the reference actually uses —
 *  looked at closely, its pictures are square cells on an axis-aligned grid,
 *  all the same size, and the tone is carried by how many are on. Mid-tone
 *  comes out as an exact checkerboard, shadows as solid runs pocked with
 *  single white holes, highlights as isolated squares. That is an ordered
 *  dither against a threshold map, not a halftone, and no amount of tuning
 *  dot radius gets you there. */
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const REST: Light = { x: -0.42, y: -0.55, z: 0.72 };

/** Give a flat silhouette some tone.
 *
 *  A drawing read back as alpha is binary: 1 inside the shape, 0 outside. A
 *  dither has nothing to say about that — every cell is either full or empty
 *  and the picture comes out as a solid blob with a ragged edge. The
 *  reference's pictures are not flat; they are lit, which is what gives the
 *  threshold lattice something to express across the middle of a shape.
 *
 *  So ramp the coverage across the shape along the light. The floor keeps the
 *  far side from dropping out entirely, which would eat the silhouette. */
export function shade(f: HalftoneField, strength = 0.55): HalftoneField {
  return (x, y, light) => {
    const a = f(x, y, light);
    if (a <= 0) return 0;
    const lit = light.x * x + light.y * y;
    return a * Math.min(1, Math.max(0.16, 0.86 - lit * strength));
  };
}

export function Halftone({
  field = HALFTONE_FIELDS.Moon,
  size = 320,
  /** Ordered dither on square cells, or a printer's dot screen. */
  screen = "dither",
  /** Cell pitch in px. Smaller is finer and costs one cell either way. */
  pitch = 6,
  /** Dots only. 45° is the printer's default because a round-dot grid set
   *  square-on reads as rows and columns before it reads as a picture. A
   *  dither grid is axis-aligned by nature — rotating it destroys the
   *  threshold lattice that makes it legible. */
  angle = 45,
  /** Pointer moves the light; click sends a ring through the screen. */
  interactive = true,
  className,
  ...props
}: {
  field?: HalftoneField;
  size?: number;
  screen?: "dither" | "dots";
  pitch?: number;
  angle?: number;
  interactive?: boolean;
} & Omit<React.ComponentProps<"canvas">, "ref" | "width" | "height">) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  /* Canvas, not SVG, and the motion is the reason. A screen this fine is a
     couple of thousand dots; as SVG that is a couple of thousand DOM nodes to
     diff every frame, which is comfortably over budget at 60fps. Drawing is
     one pass over the same grid and costs nothing to repeat.

     Everything the loop reads lives in refs, so a pointer move never queues a
     React render — the component renders once and the canvas does the work. */
  const target = React.useRef<Light>({ ...REST });
  const current = React.useRef<Light>({ ...REST });
  const ripple = React.useRef<{ x: number; y: number; at: number } | null>(null);
  const running = React.useRef(false);

  // Props the loop needs without restarting it.
  const spec = React.useRef({ field, size, pitch, angle, screen });
  spec.current = { field, size, pitch, angle, screen };

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const draw = (now: number) => {
      const { field: f, size: s, pitch: p, angle: a, screen: mode } = spec.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== s * dpr) {
        canvas.width = s * dpr;
        canvas.height = s * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, s, s);
      /* currentColor by hand: canvas has no cascade, so read the colour the
         surrounding text resolved to. That is what keeps the graphic on the
         theme's ink instead of carrying a hard-coded blue. */
      ctx.fillStyle = getComputedStyle(canvas).color;

      // Ease the light toward the pointer rather than snapping to it. One
      // lerp per frame is the whole of the "follow" feeling.
      const cur = current.current;
      const to = target.current;
      const k = calm.matches ? 1 : 0.12;
      cur.x += (to.x - cur.x) * k;
      cur.y += (to.y - cur.y) * k;
      cur.z += (to.z - cur.z) * k;

      const rip = ripple.current;
      const age = rip ? (now - rip.at) / 620 : 1;
      const live = rip !== null && age < 1;
      if (!live) ripple.current = null;

      /* Coverage at a point, with the click ripple folded in: a narrow
         gaussian band travelling outward, thickening whatever it crosses. */
      const half = s / 2;
      const coverAt = (x: number, y: number) => {
        let cover = f((x - half) / half, (y - half) / half, cur);
        if (live && rip) {
          const d = Math.hypot(x - rip.x, y - rip.y);
          const front = age * s * 0.95;
          const band = Math.exp(-((d - front) ** 2) / (2 * 26 ** 2));
          cover += band * 0.85 * (1 - age);
        }
        return cover;
      };

      ctx.beginPath();

      if (mode === "dither") {
        /* Every cell is the same square; the threshold decides whether it is
           inked. Sampling at the cell's centre rather than its corner keeps
           the picture where the drawing put it, and +0.5 on the matrix value
           stops the lightest level from filling on a coverage of exactly
           zero. */
        const n = BAYER4.length;
        const cells = Math.ceil(s / p);
        for (let gy = 0; gy <= cells; gy++) {
          for (let gx = 0; gx <= cells; gx++) {
            const x = gx * p;
            const y = gy * p;
            const cover = coverAt(x + p / 2, y + p / 2);
            if (cover <= 0) continue;
            const threshold = (BAYER4[gy % n][gx % n] + 0.5) / (n * n);
            if (cover > threshold) ctx.rect(x, y, p, p);
          }
        }
      } else {
        const rad = (a * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        // The rotated grid has to cover the diagonal or the corners come up bare.
        const reach = Math.ceil((s * Math.SQRT2) / 2 / p);
        for (let i = -reach; i <= reach; i++) {
          for (let j = -reach; j <= reach; j++) {
            const u = i * p;
            const v = j * p;
            const cx = u * cos - v * sin + half;
            const cy = u * sin + v * cos + half;
            if (cx < -p || cy < -p || cx > s + p || cy > s + p) continue;

            const cover = coverAt(cx, cy);
            if (cover <= 0.015) continue;
            /* Area is what the eye integrates, not radius — so the radius
               goes as the square root. Screen a linear ramp without this and
               the midtones come out a full stop too dark. */
            const r = (p / 2) * Math.sqrt(Math.min(1, cover)) * 1.02;
            if (r < 0.2) continue;
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
        }
      }

      ctx.fill();

      // Stop as soon as nothing is moving, so an idle study costs no frames.
      const settled = Math.abs(to.x - cur.x) < 0.001 && Math.abs(to.y - cur.y) < 0.001 && !live;
      if (settled) {
        running.current = false;
        return;
      }
      frame = requestAnimationFrame(draw);
    };

    const kick = () => {
      if (running.current) return;
      running.current = true;
      frame = requestAnimationFrame(draw);
    };

    // One draw for the static case, and a handle for the pointer to wake it.
    frame = requestAnimationFrame(draw);
    running.current = true;
    (canvas as HTMLCanvasElement & { _kick?: () => void })._kick = kick;

    return () => cancelAnimationFrame(frame);
  }, []);

  // Redraw when the controls change, not only when the pointer does.
  React.useEffect(() => {
    (ref.current as (HTMLCanvasElement & { _kick?: () => void }) | null)?._kick?.();
  }, [field, size, pitch, angle, screen]);

  const wake = () =>
    (ref.current as (HTMLCanvasElement & { _kick?: () => void }) | null)?._kick?.();

  const toLocal = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      px: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      py: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      cx: ((e.clientX - rect.left) / rect.width) * size,
      cy: ((e.clientY - rect.top) / rect.height) * size,
    };
  };

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size, touchAction: "none" }}
      className={className}
      role="img"
      onPointerMove={
        interactive
          ? (e) => {
              const { px, py } = toLocal(e);
              /* The pointer *is* the light's position on the sphere, so z
                 comes from the other two rather than being picked: inside the
                 disc that is the point you are over, outside it the light
                 grazes in from that side. A fixed z instead of a derived one
                 points the light at the camera near the middle, and the moon
                 flattens into a ring — lit centre, dark rim, no terminator. */
              const len = Math.hypot(px, py);
              target.current =
                len <= 1
                  ? { x: px, y: py, z: Math.sqrt(1 - len * len) }
                  : { x: px / len, y: py / len, z: 0 };
              wake();
            }
          : undefined
      }
      onPointerLeave={
        interactive
          ? () => {
              target.current = { ...REST };
              wake();
            }
          : undefined
      }
      onPointerDown={
        interactive
          ? (e) => {
              const { cx, cy } = toLocal(e);
              ripple.current = { x: cx, y: cy, at: performance.now() };
              wake();
            }
          : undefined
      }
      {...props}
    />
  );
}

/* --- study:end --- */

const NAMES = Object.keys(HALFTONE_FIELDS);

function Demo() {
  const [name, setName] = React.useState("Moon");
  const [screen, setScreen] = React.useState<"dither" | "dots">("dither");
  const [pitch, setPitch] = React.useState(6);
  const [angle, setAngle] = React.useState(45);

  return (
    <div className="flex flex-col items-center gap-6">
      <Halftone
        field={HALFTONE_FIELDS[name]}
        screen={screen}
        pitch={pitch}
        angle={angle}
        size={320}
        className="text-primary cursor-crosshair"
        aria-label={`${name}, screened at ${pitch}px. Move the pointer to move the light, click to send a ring through it.`}
      />
      <p className="text-muted-foreground text-xs">Move the light. Click to send a ring.</p>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex justify-center gap-1">
          {(["dither", "dots"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setScreen(m)}
              aria-pressed={m === screen}
              className={
                "rounded-md px-2.5 py-1 text-sm transition-colors " +
                (m === screen ? "bg-foreground text-background font-medium" : "hover:bg-accent")
              }
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          {NAMES.map((n) => (
            <button
              key={n}
              onClick={() => setName(n)}
              aria-pressed={n === name}
              className={
                "rounded-md px-2.5 py-1 text-sm transition-colors " +
                (n === name ? "bg-foreground text-background font-medium" : "hover:bg-accent")
              }
            >
              {n}
            </button>
          ))}
        </div>

        <label className="text-muted-foreground flex items-center gap-3 text-xs">
          <span className="w-10 shrink-0">Pitch</span>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            className="accent-primary w-full"
          />
          <span className="text-foreground w-10 shrink-0 text-right tabular-nums">{pitch}px</span>
        </label>

        <label
          className="text-muted-foreground flex items-center gap-3 text-xs"
          hidden={screen === "dither"}
        >
          <span className="w-10 shrink-0">Angle</span>
          <input
            type="range"
            min={0}
            max={90}
            step={1}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="accent-primary w-full"
          />
          <span className="text-foreground w-10 shrink-0 text-right tabular-nums">{angle}°</span>
        </label>
      </div>
    </div>
  );
}

export default {
  id: "halftone",
  name: "Halftone",
  note: "Ordered dither in one ink. The light follows the pointer; a click sends a ring.",
  order: 1,
  Component: Demo,
} satisfies Study;
