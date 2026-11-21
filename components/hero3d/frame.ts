export type V3 = [number, number, number];
export type Frame = { pos: V3; target: V3; fov: number };
export type Layout = { aspect: number; water: number; top: number; half: number; compact: boolean; extent?: number };

export const CROWN = 20.25;
export const CROWN_X = 0.5;
export const DECK_X = 11.4;
export const DECK_Z = 1.9;
export const TOWER_TOP = 37;
export const EXTENT = 36;
export const WATER: V3 = [0, 1.7, 14];

export function deckY(x: number) {
  const a = Math.abs(x - CROWN_X);
  const r = 2.4;
  const slope = 0.23;
  if (a < r) return CROWN - (slope * a * a) / (2 * r);
  return CROWN - slope * (a - r / 2);
}

export const PATH3D: V3[] = (() => {
  const out: V3[] = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const x = -DECK_X + (2 * DECK_X * i) / n;
    out.push([x, deckY(x) + 1.5, DECK_Z]);
  }
  return out;
})();

const LEN = (() => {
  const c = [0];
  for (let i = 1; i < PATH3D.length; i++) {
    const a = PATH3D[i - 1];
    const b = PATH3D[i];
    c.push(c[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  return c;
})();

export function pathAt(t: number): V3 {
  const d = Math.min(Math.max(t, 0), 1) * LEN[LEN.length - 1];
  let i = 1;
  while (i < LEN.length - 1 && LEN[i] < d) i++;
  const k = (d - LEN[i - 1]) / (LEN[i] - LEN[i - 1] || 1);
  const a = PATH3D[i - 1];
  const b = PATH3D[i];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

function norm(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
function cross(a: V3, b: V3): V3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function dot(a: V3, b: V3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function project(f: Frame, aspect: number, p: V3): [number, number] {
  const fw = norm([f.target[0] - f.pos[0], f.target[1] - f.pos[1], f.target[2] - f.pos[2]]);
  const rt = norm(cross(fw, [0, 1, 0]));
  const up = cross(rt, fw);
  const d: V3 = [p[0] - f.pos[0], p[1] - f.pos[1], p[2] - f.pos[2]];
  const z = dot(d, fw);
  const t = Math.tan((f.fov * Math.PI) / 360);
  return [dot(d, rt) / (z * t * aspect), dot(d, up) / (z * t)];
}

const CAM_Y = 7;

export function frameFor(l: Layout): Frame {
  const fov = l.compact ? 40 : l.aspect < 1.35 ? 36 : 32;
  const toPx = (ndc: number) => (1 - ndc) / 2;
  let dist = 120;
  let ty = 18;
  const build = (): Frame => ({ pos: [0, CAM_Y, dist], target: [0, ty, 0], fov });
  const fitY = () => {
    let a = -60;
    let b = 90;
    for (let k = 0; k < 40; k++) {
      ty = (a + b) / 2;
      const y = toPx(project(build(), l.aspect, WATER)[1]);
      if (y > l.water) b = ty;
      else a = ty;
    }
  };
  for (let iter = 0; iter < 6; iter++) {
    let lo = 40;
    let hi = 700;
    for (let k = 0; k < 40; k++) {
      dist = (lo + hi) / 2;
      const f = build();
      const span = toPx(project(f, l.aspect, WATER)[1]) - toPx(project(f, l.aspect, [0, TOWER_TOP, 0])[1]);
      if (span > l.water - l.top) lo = dist;
      else hi = dist;
    }
    fitY();
  }
  const w = project(build(), l.aspect, [l.extent ?? EXTENT, 20, 0])[0];
  if (w > l.half) {
    dist *= w / l.half;
    fitY();
  }
  return build();
}

export const POSTER = { w: 1600, h: 1000 };
export const POSTER_LAYOUT: Layout = { aspect: POSTER.w / POSTER.h, water: 0.9, top: 0.4, half: 0.9, compact: false };
