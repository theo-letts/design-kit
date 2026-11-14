import * as React from "react";
import { Halftone, HALFTONE_FIELDS, fieldFromDraw, shade } from "./halftone";
import type { Study } from "./types";

/* --- study:start --- */

/* A front page, set in one ink.
 *
 *  Needs ./halftone, which is the only study here that another one leans on.
 *  That is the point of it: the screen is a primitive, and this is what a
 *  primitive is for. Every picture below is a few arcs drawn into an
 *  offscreen canvas and read back as coverage — no images, no assets.
 *
 *  Everything is one colour. A newspaper got its range from dot size, not
 *  from more inks, and that constraint is what holds the page together. */

const INK = "text-primary";

/* Four pixels. The screen has to be fine enough that you read the picture
   before you read the dots — at six, a duck is twenty-five dots across and
   stops being a duck. The drawings were legible all along; the screen was
   the thing throwing them away. */
const PITCH = 4;

/** Shapes, drawn solid. fieldFromDraw only reads alpha, so fill colour is
 *  irrelevant — what matters is where there is paint and where there is not. */
const APPLE = shade(
  fieldFromDraw((ctx, s) => {
    const u = s / 100;
    ctx.fillStyle = "#000";
    // Two overlapping lobes, which is what gives an apple its waist.
    ctx.beginPath();
    ctx.ellipse(42 * u, 58 * u, 30 * u, 32 * u, 0, 0, Math.PI * 2);
    ctx.ellipse(58 * u, 58 * u, 30 * u, 32 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    // The dimple: paint removed, not drawn over, so the notch survives.
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.ellipse(50 * u, 22 * u, 13 * u, 9 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = 4 * u;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(50 * u, 26 * u);
    ctx.quadraticCurveTo(54 * u, 12 * u, 64 * u, 8 * u);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(70 * u, 14 * u, 11 * u, 6 * u, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }),
);

const BALLOONS = shade(
  fieldFromDraw((ctx, s) => {
    const u = s / 100;
    ctx.fillStyle = "#000";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.6 * u;
    const bulbs: [number, number, number][] = [
      [32, 30, 19],
      [60, 24, 17],
      [48, 52, 16],
    ];
    for (const [x, y, r] of bulbs) {
      ctx.beginPath();
      ctx.ellipse(x * u, y * u, r * u, r * 1.12 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x * u, (y + r * 1.12) * u);
      ctx.quadraticCurveTo((x + 6) * u, 80 * u, 50 * u, 96 * u);
      ctx.stroke();
    }
  }),
);

const DUCK = shade(
  fieldFromDraw((ctx, s) => {
    const u = s / 100;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(50 * u, 66 * u, 34 * u, 20 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(30 * u, 40 * u, 17 * u, 16 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    // Beak.
    ctx.beginPath();
    ctx.moveTo(15 * u, 40 * u);
    ctx.lineTo(2 * u, 45 * u);
    ctx.lineTo(15 * u, 50 * u);
    ctx.closePath();
    ctx.fill();
    // Tail.
    ctx.beginPath();
    ctx.moveTo(78 * u, 56 * u);
    ctx.lineTo(94 * u, 44 * u);
    ctx.lineTo(88 * u, 62 * u);
    ctx.closePath();
    ctx.fill();
    // Eye, punched out so it reads at any screen pitch.
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(26 * u, 36 * u, 3.4 * u, 0, Math.PI * 2);
    ctx.fill();
  }),
);

const BALL = shade(
  fieldFromDraw((ctx, s) => {
    const u = s / 100;
    ctx.fillStyle = "#000";
    // Alternate wedges, so the screen renders the panels as density.
    for (let i = 0; i < 6; i += 2) {
      ctx.beginPath();
      ctx.moveTo(50 * u, 50 * u);
      ctx.arc(50 * u, 50 * u, 42 * u, (i * Math.PI) / 3, ((i + 1) * Math.PI) / 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.lineWidth = 3 * u;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.arc(50 * u, 50 * u, 42 * u, 0, Math.PI * 2);
    ctx.stroke();
  }),
);

function Rule({ weight = 1 }: { weight?: number }) {
  return <div className="bg-current w-full" style={{ height: weight }} />;
}

/** Filler set as text, not as a grey box: the whole question a front page
 *  asks is whether the pictures hold up against real columns. */
function Column({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.6875rem] leading-[1.45] hyphens-auto">{children}</p>;
}

const BODY =
  "The announcement arrived late and was read twice before anyone thought to write it down. " +
  "Officials declined to say whether the matter had been settled, only that it had been " +
  "considered at length and would be considered again. Residents reported no change. " +
  "A spokesman confirmed the hour, declined the date, and left by the side entrance.";

export function FrontPage() {
  return (
    <div className={`${INK} w-full max-w-3xl`}>
      <div className="flex items-end justify-between gap-3 text-[0.625rem] tracking-wide uppercase">
        <span>Vol. XI — No. 4</span>
        <span className="hidden sm:inline">Printed overnight</span>
        <span>One ink</span>
      </div>
      <Rule weight={1} />

      {/* The masthead carries the moon inside the word, which is the one place
          a picture is allowed to interrupt the type. */}
      <h1 className="font-heading my-1 flex items-center justify-center gap-1 text-[clamp(2rem,9vw,4.5rem)] leading-none font-semibold tracking-tight">
        <span>The Blue H</span>
        <Halftone
          field={HALFTONE_FIELDS.Moon}
          size={72}
          pitch={4}
          className="inline-block translate-y-[0.06em]"
          aria-label="A screened moon"
        />
        <span>ur</span>
      </h1>

      <Rule weight={3} />
      <div className="flex justify-between py-1 text-[0.625rem] tracking-wide uppercase">
        <span>Late edition</span>
        <span>Weather: continuing</span>
      </div>
      <Rule weight={1} />

      <div className="mt-3 grid gap-4 sm:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-xl leading-tight font-semibold">
            Moon Appears Again; Experts Decline to Rule Out a Third Occurrence
          </h2>
          <div className="flex gap-3">
            <Halftone field={BALLOONS} size={150} pitch={4} aria-label="Screened balloons" />
            <Column>{BODY}</Column>
          </div>
          <Rule />
          <h3 className="font-heading text-base leading-tight font-semibold">
            Apple Falls, Lands, Is Recovered by Owner
          </h3>
          <div className="flex gap-3">
            <Column>{BODY}</Column>
            <Halftone field={APPLE} size={130} pitch={4} aria-label="A screened apple" />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:border-l sm:border-current/30 sm:pl-4">
          <h3 className="font-heading text-base leading-tight font-semibold">
            Bath Duck Completes Second Lap, Reports Water Was Agreeable
          </h3>
          <Halftone
            field={DUCK}
            size={176}
            pitch={4}
            className="self-center"
            aria-label="A screened duck"
          />
          <Column>{BODY}</Column>
          <Rule />
          <h3 className="font-heading text-base leading-tight font-semibold">Ball Still Rising</h3>
          <div className="flex items-start gap-3">
            <Halftone field={BALL} size={104} pitch={4} aria-label="A screened beach ball" />
            <Column>{BODY}</Column>
          </div>
        </div>
      </div>

      <Rule weight={1} />
      <p className="py-1 text-center text-[0.625rem] tracking-wide uppercase">
        Every picture on this page is a few arcs and a dot screen
      </p>
    </div>
  );
}

/* --- study:end --- */

function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <FrontPage />
      <p className="text-muted-foreground text-xs">
        Each picture takes the pointer: move it to move the light, click for a ring.
      </p>
    </div>
  );
}

export default {
  id: "front-page",
  name: "Front Page",
  note: "A newspaper in one ink. Every picture is a few arcs put through the screen.",
  order: 4,
  Component: Demo,
} satisfies Study;
