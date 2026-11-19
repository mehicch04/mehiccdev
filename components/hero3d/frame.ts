export type V3 = [number, number, number];
export type Frame = { pos: V3; target: V3; fov: number };
export type Layout = { aspect: number; water: number; top: number; half: number; compact: boolean };

export const SPAN = 28.7;
export const SPRING = 7.4;
export const RISE = 12.4;
export const RING = 0.82;
export const CROWN = 21;
export const DECK_END = 17.2;
export const DECK_X = 20.5;
export const TOWER_TOP = 31.5;
export const EXTENT = 30.5;

export function deckY(x: number) {
  const a = Math.abs(x);
  const r = 2.4;
  const slope = (CROWN - DECK_END) / DECK_X;
  if (a < r) return CROWN - (slope * a * a) / (2 * r);
  return CROWN - slope * (a - r / 2);
}

export const PATH3D: V3[] = (() => {
  const out: V3[] = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const x = -DECK_X + (2 * DECK_X * i) / n;
    out.push([x, deckY(x) + 1.9, 2.4]);
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

const CAM_Y = 3.2;

export function frameFor(l: Layout): Frame {
  const fov = l.compact ? 36 : l.aspect < 1.35 ? 34 : 30;
  const toPx = (ndc: number) => (1 - ndc) / 2;
  let dist = 160;
  let ty = 18;
  const build = (): Frame => ({ pos: [0, CAM_Y, dist], target: [0, ty, 0], fov });
  for (let iter = 0; iter < 6; iter++) {
    let lo = 40;
    let hi = 900;
    for (let k = 0; k < 40; k++) {
      dist = (lo + hi) / 2;
      const f = build();
      const span = toPx(project(f, l.aspect, [0, 0, 6])[1]) - toPx(project(f, l.aspect, [0, TOWER_TOP, 0])[1]);
      if (span > l.water - l.top) lo = dist;
      else hi = dist;
    }
    let a = -80;
    let b = 120;
    for (let k = 0; k < 40; k++) {
      ty = (a + b) / 2;
      const y = toPx(project(build(), l.aspect, [0, 0, 6])[1]);
      if (y > l.water) b = ty;
      else a = ty;
    }
  }
  const f = build();
  const w = project(f, l.aspect, [EXTENT, 12, 0])[0];
  if (w > l.half) {
    const s = w / l.half;
    dist *= s;
    let a = -80;
    let b = 120;
    for (let k = 0; k < 40; k++) {
      ty = (a + b) / 2;
      const y = toPx(project(build(), l.aspect, [0, 0, 6])[1]);
      if (y > l.water) b = ty;
      else a = ty;
    }
  }
  return build();
}

export const POSTER = { w: 1600, h: 1000 };
