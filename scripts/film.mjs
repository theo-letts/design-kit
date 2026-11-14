#!/usr/bin/env node
/*
 * film — capture the canvas under a set of themes and gate on what changed.
 *
 * The approach (and the --select / --width / --gate / --states shape) is
 * adapted from Stageshow's film.mjs by Benji Taylor, MIT licensed:
 * https://github.com/benjitaylor/skills. Theirs is built around that kit's
 * own .ss-stage contract, so this is a reimplementation for this project
 * rather than a copy.
 *
 * Why it exists: typecheck cannot see a texture that stopped tiling, a glass
 * card that went opaque, or a shader that froze. Those are exactly the three
 * bugs that reached a screenshot in this project before anyone noticed.
 *
 *   node scripts/film.mjs --update            write baselines
 *   node scripts/film.mjs --gate              fail if anything moved
 *   node scripts/film.mjs --motion            prove animated backdrops animate
 *   node scripts/film.mjs --states dark,glass just those
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const ROOT = new URL("..", import.meta.url).pathname;
const DIR = {
  baseline: join(ROOT, "film/baseline"),
  out: join(ROOT, "film/out"),
  diff: join(ROOT, "film/diff"),
};

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};

const URL_BASE = value("url", "http://localhost:5173");
const SELECT = value("select", ".themed");
const WIDTH = Number(value("width", 1280));
const HEIGHT = Number(value("height", 900));
/* Zero by default. Headless rendering here is deterministic — repeat runs come
   back at exactly 0.000% — and the changes this kit produces are fine: doubling
   a bracket arm moved 0.029% of a 7.4M-pixel frame. Any slack hides them. */
const TOLERANCE = Number(value("tolerance", 0));
const UPDATE = flag("update");
const GATE = flag("gate");
const MOTION = flag("motion");
const KITS = flag("kits");

/* Each state is an override onto DEFAULT_CONFIG, applied in the page so the
   app's own modules stay the single source of truth for config shape.
   `animated` states are never pixel-gated — a live shader differs from itself
   between any two frames, which is the point of it. */
const STATES = [
  { name: "default", base: "Neutral", theme: "Neutral", over: {} },
  { name: "dark", base: "Zinc", theme: "Indigo", over: { mode: "dark" } },
  {
    name: "newspaper",
    base: "Stone",
    theme: "Blue",
    over: {
      style: "Vega",
      radius: "None",
      surface: "Subtle",
      outline: "Double",
      fontHeading: "Playfair Display",
      fontSans: "Source Serif 4",
    },
  },
  {
    name: "brutalist",
    base: "Neutral",
    theme: "Amber",
    over: { style: "Mira", outline: "Bracket", tilt: "Lean" },
  },
  {
    name: "editorial",
    base: "Stone",
    theme: "Blue",
    over: {
      style: "Vega",
      radius: "None",
      outline: "Double",
      typeScale: "Editorial",
      elevation: "Soft",
      fontHeading: "Playfair Display",
      fontSans: "Source Serif 4",
    },
  },
  {
    name: "glass",
    base: "Mauve",
    theme: "Violet",
    over: {
      mode: "dark",
      style: "Rhea",
      surface: "Glass",
      glassDepth: "Deep",
      outline: "Gradient",
    },
  },
  {
    /* Both stroke axes at once, on a style with a 2px border so the drop is
       the 6px the treatment was measured against. */
    name: "offset",
    base: "Stone",
    theme: "Blue",
    over: {
      style: "Mira",
      outline: "Offset",
      buttonOutline: "Offset",
    },
  },
  /* Inert while the backdrop axis is off: the stored config is cleared on
     load, so this films the glass style with no backdrop behind it. */
  {
    name: "shader",
    base: "Mauve",
    theme: "Violet",
    animated: true,
    over: {
      mode: "dark",
      style: "Rhea",
      surface: "Glass",
      glassDepth: "Deep",
      backdrop: "Flow",
      backdropFade: "Strong",
    },
  },
];

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (existsSync(mac)) return mac;
  return null;
}

const pct = (n) => `${(n * 100).toFixed(3)}%`;

async function applyState(page, state) {
  await page.evaluate(
    async ({ over, base, theme, kit }) => {
      const cfg = await import("/src/lib/config.ts");
      let c;
      if (kit) {
        /* A kit is already a whole config. Running the base and theme ramps
           over it would overwrite the colours that make it that kit. */
        const kits = await import("/src/kits/index.ts");
        c = { ...kits.kitById(kit).config, ...over };
      } else {
        c = { ...cfg.DEFAULT_CONFIG, ...over };
        c = cfg.applyThemeColor(cfg.applyBase(c, base), theme);
      }
      localStorage.setItem("design-kit.config.v3", JSON.stringify(c));
    },
    { over: state.over, base: state.base, theme: state.theme, kit: state.kit },
  );
  await page.reload({ waitUntil: "networkidle" });

  /* document.fonts.ready is not enough, and believing it cost three false
     failures in one afternoon: it resolves when nothing is *pending*, which
     includes the moment before a face has been asked for. The shutter then
     catches fallback metrics and the diff comes back as a few hundred
     scattered text bands — a real difference, and nothing to do with the
     change under test.
     
     Asking for each family at each weight makes the request, so the promise
     has something to wait on. */
  await page.evaluate(async () => {
    const el = document.querySelector(".themed") ?? document.body;
    const cs = getComputedStyle(el);
    const families = ["--font-sans", "--font-heading", "--font-mono"]
      .map((v) =>
        cs
          .getPropertyValue(v)
          .split(",")[0]
          .trim()
          .replace(/^["']|["']$/g, ""),
      )
      .filter(Boolean);
    const weights = ["400", "500", "600", "700", "800"];
    const request = () =>
      Promise.all(
        families.flatMap((f) =>
          weights.map((w) => document.fonts.load(`${w} 16px "${f}"`).catch(() => {})),
        ),
      );

    /* Wait for the set of loaded faces to stop growing, rather than for a
       list of weights to appear.
       
       Asking "is 800 available?" looks precise and is not: most of these
       families do not ship an 800, so the check never came true, the loop
       ran to its deadline every time, and the shutter fired on whatever
       happened to be painted. Brutalist and Glass each rendered at two
       different heights depending on the run — a gate that cannot be
       re-baselined, because the baseline and the next run disagree.
       
       Settling is the honest condition: request everything, let it land,
       and stop when two consecutive checks agree. */
    const deadline = Date.now() + 8000;
    let previous = -1;
    for (;;) {
      await request();
      await document.fonts.ready;
      const loaded = [...document.fonts].filter((f) => f.status === "loaded").length;
      if (loaded === previous || Date.now() > deadline) break;
      previous = loaded;
      await new Promise((r) => setTimeout(r, 150));
    }
  });
  // Let textures rasterise and any transition settle before the shutter.
  await page.waitForTimeout(500);
  /* A looping animation never settles, so a spinner alone makes every frame
     differ and a zero-tolerance gate can never pass. Entrance keyframes have
     long finished by now, and clearing them leaves each element on its own
     resting style — which is the deterministic thing to photograph. */
  await page.addStyleTag({
    content: "*, *::before, *::after { animation: none !important; transition: none !important; }",
  });
  /* The board lives inside a scrolling pane, and Chrome only paints what that
     pane clips to — an element screenshot of something taller than the pane
     comes back as one screenful on a white field the size of the whole board.
     That is not a small inaccuracy: it silently drops everything below the
     fold while still reporting a full-height image, so the gate passes on
     content it never looked at. Unclip the ancestors and the element lays out
     in document flow, where the whole thing paints. */
  await page.addStyleTag({
    content: `html, body, #root { height: auto !important; overflow: visible !important; }
      #root > div { height: auto !important; overflow: visible !important; }
      main { overflow: visible !important; height: auto !important; }`,
  });
  await page.waitForTimeout(250);
}

/* Motion cannot be filmed. A WebGL canvas with preserveDrawingBuffer: false
   does not hand back live frames to a screenshot — the capture happens outside
   the compositing frame and returns the same bytes every time, which reads as
   "frozen" whatever the shader is doing.

   So this checks the thing that actually broke instead: whether each shader
   program is time-dependent. It renders the real GLSL offscreen at two
   timestamps and compares. That is the check that caught Caustics sitting
   still while its uniforms advanced. It also confirms the live canvas got past
   context creation, which is the other failure this project has seen. */
async function filmMotion(page, state) {
  const report = await page.evaluate(async () => {
    const sh = await import("/src/lib/shaders.ts");
    const colorMod = await import("/src/lib/color.ts");
    const stored = JSON.parse(localStorage.getItem("design-kit.config.v3"));
    const lin = (o) => sh.toLinear(colorMod.oklchToRgb(colorMod.gamutFit(o)));

    const render = (name, time) => {
      const cv = document.createElement("canvas");
      cv.width = 160;
      cv.height = 100;
      const gl = cv.getContext("webgl", { preserveDrawingBuffer: true });
      if (!gl) return null;
      const mk = (type, src) => {
        const o = gl.createShader(type);
        gl.shaderSource(o, src);
        gl.compileShader(o);
        if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) {
          throw new Error(`${name}: ${gl.getShaderInfoLog(o)}`);
        }
        return o;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, mk(gl.VERTEX_SHADER, sh.VERTEX_SHADER));
      gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, sh.FRAGMENT_SHADERS[name]));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(`${name}: ${gl.getProgramInfoLog(prog)}`);
      }
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(gl.getUniformLocation(prog, "u_res"), cv.width, cv.height);
      gl.uniform1f(gl.getUniformLocation(prog, "u_time"), time);
      gl.uniform3fv(gl.getUniformLocation(prog, "u_bg"), lin(stored.colors.background));
      gl.uniform3fv(gl.getUniformLocation(prog, "u_brand"), lin(stored.colors.primary));
      gl.uniform3fv(gl.getUniformLocation(prog, "u_accent"), lin(stored.colors.accent));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const px = new Uint8Array(cv.width * cv.height * 4);
      gl.readPixels(0, 0, cv.width, cv.height, gl.RGBA, gl.UNSIGNED_BYTE, px);
      return px;
    };

    const mad = (a, b) => {
      let d = 0;
      for (let i = 0; i < a.length; i += 4) d += Math.abs(a[i] - b[i]);
      return d / (a.length / 4);
    };

    const canvas = document.querySelector('canvas[data-slot="shader-backdrop"]');
    const out = {
      mounted: !!canvas,
      // 300x150 is the HTML default: the effect bailed before its first resize.
      initialised: !!canvas && canvas.width !== 300,
      shaders: {},
    };
    for (const name of sh.SHADER_NAMES) {
      const a = render(name, 0);
      if (!a) return { ...out, webgl: false };
      out.shaders[name] = +mad(a, render(name, 6)).toFixed(2);
    }
    return { ...out, webgl: true };
  });

  if (!report.webgl) {
    console.log(`  motion ${state.name}: ✗ no WebGL in this browser`);
    return false;
  }
  if (!report.mounted || !report.initialised) {
    console.log(
      `  motion ${state.name}: ✗ canvas ${report.mounted ? "never initialised" : "not mounted"}`,
    );
    return false;
  }
  let ok = true;
  for (const [name, drift] of Object.entries(report.shaders)) {
    const alive = drift > 1;
    if (!alive) ok = false;
    console.log(`  motion ${name}: ${drift} levels over 6s ${alive ? "✓" : "✗ static"}`);
  }
  return ok;
}

async function filmStill(page, state) {
  const el = page.locator(SELECT).first();

  /* Shoot until two consecutive frames agree.
  
     Every attempt to predict when the page has finished settling has been
     wrong in a different way: fonts.ready resolves before a face has been
     asked for, a weight list waits forever on an 800 most families do not
     ship, and a face count can plateau mid-load. Comparing two frames needs
     no theory about why the first one moved, and costs one extra screenshot
     on a page that was already still — which is the common case.
     
     It is not a complete fix. If both frames land before a face arrives they
     agree and are both wrong, which is why the waits above still matter. */
  let shot = await el.screenshot();
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(250);
    const again = await el.screenshot();
    if (again.equals(shot)) break;
    shot = again;
  }
  const outPath = join(DIR.out, `${state.name}.png`);
  writeFileSync(outPath, shot);

  const basePath = join(DIR.baseline, `${state.name}.png`);
  if (UPDATE || !existsSync(basePath)) {
    writeFileSync(basePath, shot);
    console.log(`  ${state.name}: baseline ${UPDATE ? "updated" : "created"}`);
    return true;
  }

  const actual = PNG.sync.read(shot);
  const expected = PNG.sync.read(readFileSync(basePath));
  if (actual.width !== expected.width || actual.height !== expected.height) {
    console.log(
      `  ${state.name}: ✗ size changed ${expected.width}x${expected.height} -> ${actual.width}x${actual.height}`,
    );
    return false;
  }

  const diff = new PNG({ width: actual.width, height: actual.height });
  const changed = pixelmatch(expected.data, actual.data, diff.data, actual.width, actual.height, {
    threshold: 0.1,
  });
  const ratio = changed / (actual.width * actual.height);
  const ok = ratio * 100 <= TOLERANCE;
  if (!ok) writeFileSync(join(DIR.diff, `${state.name}.png`), PNG.sync.write(diff));
  console.log(
    `  ${state.name}: ${pct(ratio)} changed ${ok ? "✓" : `✗ over ${TOLERANCE}% — see film/diff/${state.name}.png`}`,
  );
  return ok;
}

async function main() {
  const exe = chromePath();
  if (!exe) {
    console.error("film: no Chrome found. Set CHROME_PATH to a Chrome or Chromium binary.");
    process.exit(2);
  }

  const res = await fetch(URL_BASE).catch(() => null);
  if (!res?.ok) {
    console.error(`film: nothing serving at ${URL_BASE}. Start it with \`npm run dev\`.`);
    process.exit(2);
  }
  /* Something answering is not the same as the right something: when 5173 is
     taken, Vite moves to 5174 and this points at whatever else is on 5173.
     Ask for a module only this app serves, so the failure names itself. */
  const probe = await fetch(new URL("/src/lib/config.ts", URL_BASE)).catch(() => null);
  if (!probe?.ok) {
    console.error(
      `film: ${URL_BASE} is serving something, but not this app (no /src/lib/config.ts).\n` +
        `       Check which port \`npm run dev\` printed and pass --url http://localhost:<port>.`,
    );
    process.exit(2);
  }

  for (const d of Object.values(DIR)) mkdirSync(d, { recursive: true });

  const only = value("states", null)?.split(",");
  /* --kits films the real matrix: every saved kit, in both modes. The seven
     states above are axis probes — they exercise treatments no kit happens
     to use — and they stay the fast default, because a gate nobody waits for
     is a gate nobody runs. This is the one for CI. */
  const browser = await chromium.launch({ executablePath: exe });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  /* The sheet renders a live calendar, so today's date is baked into every
     baseline and the gate fails by ~0.017% the next morning — a real change
     and a false alarm at the same time, which is the worst kind. Pin the
     clock before the first navigation and the frame is the same on any day. */
  await page.clock.setFixedTime(new Date("2026-01-15T12:00:00Z"));
  await page.goto(URL_BASE, { waitUntil: "networkidle" });

  let states = STATES.filter((s) => (only ? only.includes(s.name) : true)).filter((s) =>
    MOTION ? s.animated : !s.animated,
  );

  if (KITS) {
    const list = await page.evaluate(async () => {
      const kits = await import("/src/kits/index.ts");
      return kits.KITS.map((k) => ({ id: k.id, mode: k.config.mode }));
    });
    states = list.flatMap(({ id, mode }) => [
      { name: `${id}-light`, kit: id, over: { mode: "light" } },
      { name: `${id}-dark`, kit: id, over: { mode: "dark" } },
      /* Its own side gets filmed twice under a different name on purpose:
         the file is what a reviewer opens, and "green-3" should be the kit
         as it ships, not as one half of a matrix. */
      ...(mode ? [{ name: id, kit: id, over: {} }] : []),
    ]);
    if (only) states = states.filter((s) => only.includes(s.name));
  }

  console.log(`film: ${states.length} state(s) at ${WIDTH}x${HEIGHT}, selector ${SELECT}`);
  const results = [];
  for (const state of states) {
    await applyState(page, state);
    results.push(MOTION ? await filmMotion(page, state) : await filmStill(page, state));
  }
  await browser.close();

  const failed = results.filter((r) => !r).length;
  if (failed) {
    console.error(`film: ${failed} of ${results.length} failed`);
    if (GATE) process.exit(1);
  } else {
    console.log(`film: rehearsal passed (${results.length}/${results.length})`);
  }
}

main().catch((err) => {
  console.error("film:", err.message);
  process.exit(2);
});
