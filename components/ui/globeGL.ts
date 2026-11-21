import type { Flag } from "@/components/ui/Flags";
import { HL, LAND } from "@/components/ui/worldGlobe";

type MP = number[][][][];

const VS = `#version 300 es
in vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uRot;
uniform float uR;
uniform float uS;
uniform float uD;
uniform vec3 uLit;
out vec4 o;
const float PI = 3.141592653589793;
const vec3 SEA0 = vec3(0.07451, 0.13725, 0.25098);
const vec3 SEA1 = vec3(0.03922, 0.07843, 0.14902);
const vec3 GRAT = vec3(0.08627, 0.14118, 0.24314);
const vec3 LANDC = vec3(0.12157, 0.17647, 0.28627);
const vec3 LANDS = vec3(0.17255, 0.23922, 0.37255);
const vec3 RIM = vec3(0.16471, 0.22745, 0.35294);
const vec3 USF = vec3(0.22745, 0.14510, 0.21569);
const vec3 JPF = vec3(0.27451, 0.21961, 0.12941);
const vec3 BAF = vec3(0.10980, 0.26667, 0.20392);
const vec3 USP = vec3(0.86275, 0.14902, 0.14902);
const vec3 JPP = vec3(0.96078, 0.61961, 0.04314);
const vec3 BAP = vec3(0.08627, 0.63922, 0.29020);

float edge(float m){ return 1.0 - abs(2.0 * m - 1.0); }
float line(float dist, float fw, float w){ float px = dist / max(fw, 1e-5); return clamp(w * 0.5 + 0.5 - px, 0.0, 1.0) * min(w, 1.0); }

void main(){
  vec2 c = vec2(uS * 0.5);
  vec2 p = gl_FragCoord.xy - c;
  float r = length(p);
  float inside = clamp(uR - r + 0.5, 0.0, 1.0);
  float rim = clamp(uD * 0.5 + 0.5 - abs(r - uR), 0.0, 1.0);
  if (inside <= 0.0 && rim <= 0.0) { o = vec4(0.0); return; }

  vec2 uv = p / uR;
  float zz = sqrt(max(0.0, 1.0 - dot(uv, uv)));
  float cp = cos(uRot.y), sp = sin(uRot.y);
  float X = zz * cp + uv.y * sp;
  float Z = uv.y * cp - zz * sp;
  float Y = uv.x;
  float lon = atan(Y, X) - uRot.x;
  float lat = asin(clamp(Z, -1.0, 1.0));

  float u = lon / (2.0 * PI) + 0.5;
  float u0 = fract(u);
  float u1 = fract(u + 0.5) - 0.5;
  float v = 0.5 - lat / PI;
  vec2 dx0 = vec2(dFdx(u0), dFdx(v));
  vec2 dy0 = vec2(dFdy(u0), dFdy(v));
  vec2 dx1 = vec2(dFdx(u1), dFdx(v));
  vec2 dy1 = vec2(dFdy(u1), dFdy(v));
  bool use1 = abs(dx1.x) + abs(dy1.x) < abs(dx0.x) + abs(dy0.x);
  vec2 dx = use1 ? dx1 : dx0;
  vec2 dy = use1 ? dy1 : dy0;
  vec2 tc = vec2(u0, v);
  vec2 A = textureGrad(uA, tc, dx, dy).rg;
  vec2 B = textureGrad(uB, tc, dx, dy).rg;

  vec2 g = vec2(0.42, 0.62) * uS;
  float t = clamp(length(gl_FragCoord.xy - g) / (0.62 * uS), 0.0, 1.0);
  vec3 col = mix(SEA0, SEA1, t);

  float lonD = (use1 ? u1 : u0) * 360.0;
  float latD = lat * 180.0 / PI;
  float fwLon = abs(dx.x * 360.0) + abs(dy.x * 360.0);
  float fwLat = fwidth(latD);
  float w = 0.6 * uD;
  float mer = abs(fract(lonD / 10.0 + 0.5) - 0.5) * 10.0;
  float mer90 = abs(fract(lonD / 90.0 + 0.5) - 0.5) * 90.0;
  float par = abs(fract(latD / 10.0 + 0.5) - 0.5) * 10.0;
  float gl1 = abs(latD) <= 80.0 ? line(mer, fwLon, w) : line(mer90, fwLon, w);
  float gl2 = abs(latD) <= 80.5 ? line(par, fwLat, w) : 0.0;
  col = mix(col, GRAT, max(gl1, gl2));

  col = mix(col, LANDC, A.r);
  col = mix(col, LANDS, edge(A.r) * 0.9);

  col = mix(col, USF, A.g * uLit.x);
  col = mix(col, USP, edge(A.g) * 0.6 * uLit.x);
  col = mix(col, JPF, B.r * uLit.y);
  col = mix(col, JPP, edge(B.r) * 0.6 * uLit.y);
  col = mix(col, BAF, B.g * uLit.z);
  col = mix(col, BAP, edge(B.g) * 0.6 * uLit.z);

  vec3 outc = mix(col, RIM, rim);
  float a = max(inside, rim);
  o = vec4(outc * a, a);
}`;

const unwrap = (ring: number[][]) => {
  const out: number[][] = [];
  let prev = ring[0][0];
  let acc = ring[0][0];
  for (const [lo, la] of ring) {
    let d = lo - prev;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    acc += out.length ? d : 0;
    prev = lo;
    out.push([acc, la]);
  }
  const span = out[out.length - 1][0] - out[0][0];
  if (Math.abs(span) > 300) {
    const pole = out.reduce((s, q) => s + q[1], 0) / out.length < 0 ? -90 : 90;
    out.push([out[out.length - 1][0], pole], [out[0][0], pole]);
  }
  return out;
};

const prep = (mp: MP) => mp.map((poly) => poly.map(unwrap));
let cache: { land: number[][][][]; hl: Record<Flag, number[][][][]> } | null = null;
const shapes = () => {
  if (!cache) cache = { land: prep(LAND as MP), hl: { us: prep(HL.us as MP), jp: prep(HL.jp as MP), ba: prep(HL.ba as MP) } };
  return cache;
};

const paintMask = (cx: CanvasRenderingContext2D, mp: number[][][][], W: number, H: number, color: string) => {
  cx.fillStyle = color;
  for (const poly of mp) {
    for (const k of [-360, 0, 360]) {
      cx.beginPath();
      for (const ring of poly) {
        ring.forEach(([lo, la], i) => {
          const x = ((lo + k + 180) / 360) * W;
          const y = ((90 - la) / 180) * H;
          if (i) cx.lineTo(x, y); else cx.moveTo(x, y);
        });
        cx.closePath();
      }
      cx.fill("evenodd");
    }
  }
};

const maskCanvas = (W: number, H: number, red: number[][][][], green: number[][][][]) => {
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const cx = cv.getContext("2d", { alpha: false });
  if (!cx) return null;
  cx.fillStyle = "#000";
  cx.fillRect(0, 0, W, H);
  cx.globalCompositeOperation = "lighter";
  paintMask(cx, red, W, H, "#FF0000");
  paintMask(cx, green, W, H, "#00FF00");
  return cv;
};

const idle = (fn: () => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) { const id = w.requestIdleCallback(fn, { timeout: 400 }); return () => w.cancelIdleCallback?.(id); }
  const id = window.setTimeout(fn, 16);
  return () => window.clearTimeout(id);
};

export type GlobeGL = { draw: (lam: number, phi: number, lit: [number, number, number]) => void; ready: () => boolean; dispose: () => void };

export function createGlobeGL(canvas: HTMLCanvasElement, size: number, dpr: number, onReady: () => void, onLost: () => void): GlobeGL | null {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true, depth: false, stencil: false, powerPreference: "high-performance" });
  if (!gl) return null;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VS);
  const fs = sh(gl.FRAGMENT_SHADER, FS);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {
    a: gl.getUniformLocation(prog, "uA"),
    b: gl.getUniformLocation(prog, "uB"),
    rot: gl.getUniformLocation(prog, "uRot"),
    r: gl.getUniformLocation(prog, "uR"),
    s: gl.getUniformLocation(prog, "uS"),
    d: gl.getUniformLocation(prog, "uD"),
    lit: gl.getUniformLocation(prog, "uLit"),
  };
  gl.uniform1i(U.a, 0);
  gl.uniform1i(U.b, 1);

  const S = canvas.width;
  gl.viewport(0, 0, S, S);
  gl.uniform1f(U.s, S);
  gl.uniform1f(U.r, (size / 2 - 1) * dpr);
  gl.uniform1f(U.d, dpr);
  gl.clearColor(0, 0, 0, 0);

  const circ = Math.PI * size * dpr;
  const maxT = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const W = Math.min(maxT, circ > 2300 ? 4096 : 2048);
  const H = W / 2;

  let ok = false;
  let dead = false;
  const texs: WebGLTexture[] = [];
  const upload = (unit: number, cv: HTMLCanvasElement) => {
    const t = gl.createTexture();
    if (!t) return false;
    texs.push(t);
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG8, W, H, 0, gl.RG, gl.UNSIGNED_BYTE, cv);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    cv.width = 0;
    cv.height = 0;
    return true;
  };

  const cancels: (() => void)[] = [];
  cancels.push(idle(() => {
    if (dead) return;
    const sp = shapes();
    const a = maskCanvas(W, H, sp.land, sp.hl.us);
    if (!a || !upload(0, a)) return;
    cancels.push(idle(() => {
      if (dead) return;
      const b = maskCanvas(W, H, sp.hl.jp, sp.hl.ba);
      if (!b || !upload(1, b)) return;
      ok = true;
      onReady();
    }));
  }));

  const lost = (e: Event) => { e.preventDefault(); ok = false; onLost(); };
  canvas.addEventListener("webglcontextlost", lost);

  return {
    ready: () => ok,
    draw: (lam, phi, lit) => {
      if (!ok) return;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.rot, (lam * Math.PI) / 180, (phi * Math.PI) / 180);
      gl.uniform3f(U.lit, lit[0], lit[1], lit[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose: () => {
      dead = true;
      ok = false;
      cancels.forEach((c) => c());
      canvas.removeEventListener("webglcontextlost", lost);
      texs.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
