import * as React from "react";
import { gamutFit, oklchToRgb, type Oklch } from "@/lib/color";
import { FRAGMENT_SHADERS, toLinear, VERTEX_SHADER, type ShaderName } from "@/lib/shaders";

type Props = {
  shader: ShaderName;
  background: Oklch;
  brand: Oklch;
  accent: Oklch;
};

const linear = (c: Oklch) => toLinear(oklchToRgb(gamutFit(c)));

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("[shader]", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/* A full-screen quad behind the canvas content. Everything above it is still
   ordinary DOM, which is the only arrangement that scales: a GL context per
   card would hit the browser's context cap and take text rendering,
   selection and accessibility down with it. */
export function ShaderBackdrop({ shader, background, brand, accent }: Props) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const colors = React.useMemo(
    () => ({ bg: linear(background), brand: linear(brand), accent: linear(accent) }),
    [background, brand, accent],
  );

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false });
    // No WebGL: render nothing rather than a black rectangle. The page keeps
    // whatever page texture it had.
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADERS[shader]);
    const program = vs && fs ? gl.createProgram() : null;
    if (!vs || !fs || !program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[shader]", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // One triangle large enough to cover the viewport; cheaper than two.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(program, "u_res"),
      time: gl.getUniformLocation(program, "u_time"),
      bg: gl.getUniformLocation(program, "u_bg"),
      brand: gl.getUniformLocation(program, "u_brand"),
      accent: gl.getUniformLocation(program, "u_accent"),
    };
    gl.uniform3fv(u.bg, colors.bg);
    gl.uniform3fv(u.brand, colors.brand);
    gl.uniform3fv(u.accent, colors.accent);

    /* Half resolution, upscaled by CSS. A backdrop is about to be blurred and
       faded; paying for every device pixel of it is pure waste. */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
    };

    const draw = (t: number) => {
      resize();
      gl.uniform1f(u.time, t / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let visible = true;

    if (still) {
      // One frame, held. The look survives; the animation does not.
      draw(0);
    } else {
      const loop = (t: number) => {
        draw(t);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const start = () => {
      if (!still && !frame && visible && !document.hidden) {
        const loop = (t: number) => {
          draw(t);
          frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
      }
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    // Scrolled out of sight is the same as hidden, as far as the GPU cares.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      if (still) draw(0);
    });
    ro.observe(canvas);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      ro.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      /* Deliberately NOT calling WEBGL_lose_context here. The effect re-runs on
         the same canvas whenever the shader or palette changes — and under
         StrictMode, immediately on mount — and getContext() hands back the
         same, now permanently lost, context. The context dies with the
         element instead. */
    };
  }, [shader, colors]);

  return (
    <div style={{ position: "sticky", top: 0, height: 0, zIndex: 0 }}>
      <canvas
        ref={ref}
        aria-hidden
        data-slot="shader-backdrop"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          pointerEvents: "none",
          filter: "var(--backdrop-filter)",
          opacity: "var(--backdrop-opacity)",
        }}
      />
    </div>
  );
}
