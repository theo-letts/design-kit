/* Fragment shaders for the backdrop layer.

   A shader cannot be a token — it is a program writing pixels into a canvas,
   not a value the browser can paint from. What makes it fit here is that the
   backdrop is already a separate layer behind the content, so swapping its
   CSS image for a canvas changes nothing above it.

   All three take the same three palette colours as uniforms, in LINEAR space:
   shaders interpolate linearly, CSS colours are sRGB-encoded, and skipping the
   conversion gives washed-out, too-bright results. */

export const SHADER_NAMES = ["Drift", "Flow", "Caustics"] as const;
export type ShaderName = (typeof SHADER_NAMES)[number];

export const SHADER_BLURBS: Record<ShaderName, string> = {
  Drift: "Soft blobs wandering. A mesh gradient that never sits still.",
  Flow: "Domain-warped noise. Per-pixel, so it never tiles.",
  Caustics: "Light through water, layered and folded.",
};

export const VERTEX_SHADER = `attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const HEAD = `precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_bg;
uniform vec3 u_brand;
uniform vec3 u_accent;

/* The round trip has two halves and both are required. Uniforms arrive
   linearised so the mixing is physically right; the default framebuffer is
   8-bit and does no encoding, so the result has to be written back as sRGB.
   Do only the first half and everything renders far too dark. */
vec3 encode(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
`;

/* Value noise and fbm, shared by Flow. Cheap, and good enough for a backdrop
   that is about to be blurred and faded to 30% anyway. */
const NOISE = `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}
`;

const DRIFT = `${HEAD}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_res.x / u_res.y;
  float t = u_time * 0.06;

  float d1 = length(p - vec2(sin(t * 1.1) * 0.7, cos(t * 0.9) * 0.45));
  float d2 = length(p - vec2(cos(t * 0.7) * 0.8, sin(t * 1.3) * 0.55));
  float d3 = length(p - vec2(sin(t * 0.5 + 2.0) * 0.6, cos(t * 0.6 + 1.0) * 0.7));

  vec3 col = u_bg;
  col = mix(col, u_brand, clamp(exp(-d1 * d1 * 1.6) + exp(-d3 * d3 * 1.4) * 0.5, 0.0, 1.0));
  col = mix(col, u_accent, clamp(exp(-d2 * d2 * 1.8), 0.0, 1.0));
  gl_FragColor = vec4(encode(col), 1.0);
}`;

const FLOW = `${HEAD}${NOISE}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / u_res.y;
  float t = u_time * 0.05;

  // Domain warping: offset the lookup by more noise, twice.
  vec2 q = vec2(fbm(uv * 3.0 + t), fbm(uv * 3.0 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(uv * 3.0 + q * 1.6 + vec2(1.7, 9.2)), fbm(uv * 3.0 + q * 1.6 + vec2(8.3, 2.8)));
  float f = fbm(uv * 3.0 + r * 1.4);

  vec3 col = mix(u_bg, u_brand, smoothstep(0.25, 0.8, f));
  col = mix(col, u_accent, smoothstep(0.6, 1.0, f) * 0.8);
  gl_FragColor = vec4(encode(col), 1.0);
}`;

const CAUSTICS = `${HEAD}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / u_res.y;
  /* The large offset matters: it decorrelates the sin/cos phases so the folds
     differ across the field instead of repeating. */
  vec2 p = uv * 18.85 - 250.0;
  float t = u_time * 0.4;

  vec2 i = p;
  float c = 1.0;
  const float inten = 0.005;
  for (int n = 0; n < 5; n++) {
    float ti = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(ti - i.x) + sin(ti + i.y), sin(ti - i.y) + cos(ti + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + ti) / inten), p.y / (cos(i.y + ti) / inten)));
  }
  c /= 5.0;
  c = clamp(pow(abs(1.17 - pow(c, 1.4)), 8.0), 0.0, 1.0);

  vec3 col = mix(u_bg, u_brand, c);
  col = mix(col, u_accent, c * c * 0.6);
  gl_FragColor = vec4(encode(col), 1.0);
}`;

export const FRAGMENT_SHADERS: Record<ShaderName, string> = {
  Drift: DRIFT,
  Flow: FLOW,
  Caustics: CAUSTICS,
};

/** sRGB -> linear. Shaders mix light, CSS stores gamma-encoded values. */
export function toLinear(c: { r: number; g: number; b: number }): [number, number, number] {
  const f = (v: number) => {
    const n = v / 255;
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  return [f(c.r), f(c.g), f(c.b)];
}
