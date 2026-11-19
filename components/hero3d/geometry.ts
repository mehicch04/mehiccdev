import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RING, RISE, SPAN, SPRING, deckY } from "./frame";

export type Quality = { arc: number; lathe: number; terrainX: number; terrainZ: number; houses: number };
export const HIGH: Quality = { arc: 72, lathe: 40, terrainX: 300, terrainZ: 220, houses: 300 };
export const LOW: Quality = { arc: 40, lathe: 24, terrainX: 170, terrainZ: 130, houses: 150 };

const A = SPAN / 2;
const E = 1.25;
const K = (A * A + 2 * A * E - RISE * RISE) / (2 * RISE);
const R = Math.hypot(A + E, K);
const CY = SPRING - K;
const BASE = -8;
const BODY_X = 21.6;
const DEPTH = 4.6;

function rnd(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export function fbm(x: number, y: number, o = 4) {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < o; i++) {
    v += a * vnoise(x, y);
    x *= 2.07;
    y *= 2.07;
    a *= 0.5;
  }
  return v;
}

function arcPoints(r: number, n: number) {
  const pts: THREE.Vector2[] = [];
  const aSpring = Math.atan2(SPRING - CY, -(A + E));
  const yTop = CY + Math.sqrt(r * r - E * E);
  const aTop = Math.atan2(yTop - CY, -E);
  for (let i = 0; i <= n; i++) {
    const a = aSpring + ((aTop - aSpring) * i) / n;
    pts.push(new THREE.Vector2(E + r * Math.cos(a), CY + r * Math.sin(a)));
  }
  const right: THREE.Vector2[] = [];
  for (let i = pts.length - 2; i >= 0; i--) right.push(new THREE.Vector2(-pts[i].x, pts[i].y));
  return [...pts, ...right];
}

function deckPts(off: number, x0: number, x1: number, n: number) {
  const out: THREE.Vector2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    out.push(new THREE.Vector2(x, deckY(x) + off));
  }
  return out;
}

function extrude(shape: THREE.Shape, depth: number, bevel = 0.14, segs = 2, curve = 12) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segs,
    curveSegments: curve,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

function clean(g: THREE.BufferGeometry) {
  const n = g.index ? g.toNonIndexed() : g;
  n.deleteAttribute("uv");
  if (n.getAttribute("uv2")) n.deleteAttribute("uv2");
  if (!n.getAttribute("normal")) n.computeVertexNormals();
  return n;
}

export function bridgeGeometry(q: Quality) {
  const parts: THREE.BufferGeometry[] = [];
  const intra = arcPoints(R, q.arc);
  const body = new THREE.Shape();
  body.moveTo(-BODY_X, BASE);
  deckPts(0, -BODY_X, BODY_X, q.arc).forEach((p) => body.lineTo(p.x, p.y));
  body.lineTo(BODY_X, BASE);
  body.lineTo(A, BASE);
  for (let i = intra.length - 1; i >= 0; i--) body.lineTo(intra[i].x, intra[i].y);
  body.lineTo(-A, BASE);
  body.closePath();
  parts.push(clean(extrude(body, DEPTH, 0.12)));

  const ring = new THREE.Shape();
  const outer = arcPoints(R + RING, q.arc);
  ring.moveTo(intra[0].x, intra[0].y);
  outer.forEach((p) => ring.lineTo(p.x, p.y));
  for (let i = intra.length - 1; i >= 0; i--) ring.lineTo(intra[i].x, intra[i].y);
  ring.closePath();
  parts.push(clean(extrude(ring, DEPTH + 0.2, 0.06, 1)));

  const band = new THREE.Shape();
  const lo = deckPts(-0.95, -20.2, 20.2, q.arc);
  const hi = deckPts(-0.55, -20.2, 20.2, q.arc);
  band.moveTo(lo[0].x, lo[0].y);
  lo.forEach((p) => band.lineTo(p.x, p.y));
  for (let i = hi.length - 1; i >= 0; i--) band.lineTo(hi[i].x, hi[i].y);
  band.closePath();
  parts.push(clean(extrude(band, DEPTH + 0.34, 0.06, 1)));

  for (const z of [-1, 1]) {
    const par = new THREE.Shape();
    const b = deckPts(-0.05, -20.2, 20.2, q.arc);
    const t = deckPts(0.92, -20.2, 20.2, q.arc);
    par.moveTo(b[0].x, b[0].y);
    b.forEach((p) => par.lineTo(p.x, p.y));
    for (let i = t.length - 1; i >= 0; i--) par.lineTo(t[i].x, t[i].y);
    par.closePath();
    const g = clean(extrude(par, 0.46, 0.1, 2));
    g.translate(0, 0, z * (DEPTH / 2 - 0.2));
    parts.push(g);
  }

  for (const s of [-1, 1]) {
    const w = new THREE.Shape();
    w.moveTo(-2.45, 15.4);
    w.lineTo(2.45, 15.4);
    w.lineTo(4.9, 2.2);
    w.lineTo(5.6, BASE);
    w.lineTo(-5.6, BASE);
    w.lineTo(-4.9, 2.2);
    w.closePath();
    const len = BODY_X + 2.4 - A;
    const g = new THREE.ExtrudeGeometry(w, { depth: len, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2, bevelSegments: 2 });
    g.rotateY(s < 0 ? -Math.PI / 2 : Math.PI / 2);
    g.translate(s * A, 0, 0);
    parts.push(clean(g));
  }

  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  merged.computeBoundingSphere();
  return merged;
}

function lathe(profile: [number, number][], seg: number) {
  return clean(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg));
}

function hip(w: number, d: number, h: number, ridge: number, over = 0.5) {
  const W = w / 2 + over;
  const D = d / 2 + over;
  const r = Math.min(ridge / 2, W * 0.9);
  const v = [
    [-W, 0, -D], [W, 0, -D], [W, 0, D], [-W, 0, D],
    [-r, h, 0], [r, h, 0],
  ];
  const f = [
    [3, 2, 5, 4], [1, 0, 4, 5],
  ];
  const tris: number[] = [];
  f.forEach(([a, b, c, dd]) => tris.push(a, b, c, a, c, dd));
  tris.push(0, 3, 4, 2, 1, 5, 0, 1, 2, 0, 2, 3);
  const pos: number[] = [];
  tris.forEach((i) => pos.push(...v[i]));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

function taperedBox(w: number, h: number, d: number, taper: number, radius: number, seg = 3) {
  const g = new RoundedBoxGeometry(w, h, d, seg, radius);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const k = 1 + taper * (0.5 - (y + h / 2) / h);
    p.setX(i, p.getX(i) * k);
    p.setZ(i, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return clean(g);
}

export type Towers = { stone: THREE.BufferGeometry; roof: THREE.BufferGeometry; plaster: THREE.BufferGeometry; windows: THREE.Vector3[] };

export function towerGeometry(q: Quality): Towers {
  const stone: THREE.BufferGeometry[] = [];
  const roof: THREE.BufferGeometry[] = [];
  const plaster: THREE.BufferGeometry[] = [];
  const windows: THREE.Vector3[] = [];

  const L = lathe(
    [[0, BASE], [6.4, BASE], [6.1, 2], [5.4, 10], [5.0, 18], [4.85, 27.6], [5.15, 27.9], [5.15, 28.6], [4.95, 28.8], [0, 28.8]],
    q.lathe,
  );
  L.translate(-26.3, 0, -1.6);
  stone.push(L);
  const lr = clean(new THREE.ConeGeometry(5.75, 3.1, q.lathe, 1, false));
  lr.translate(-26.3, 28.8 + 1.55, -1.6);
  roof.push(lr);
  const lf = clean(new THREE.CylinderGeometry(0.05, 0.12, 1.2, 6));
  lf.translate(-26.3, 32.4, -1.6);
  roof.push(lf);

  const ch = taperedBox(5.4, 3.2, 3.4, 0, 0.18);
  ch.translate(-23.4, 22.6, 3.3);
  plaster.push(ch);
  const chb = taperedBox(4.2, 0.35, 2.6, 0, 0.1);
  chb.translate(-23.4, 20.85, 3.1);
  roof.push(chb);
  const chr = hip(5.4, 3.4, 1.6, 2.2, 0.55);
  chr.translate(-23.4, 24.2, 3.3);
  roof.push(chr);
  [-1.6, 0, 1.6].forEach((dx) => windows.push(new THREE.Vector3(-23.4 + dx, 22.7, 5.03)));

  const Rt = taperedBox(9.4, 34.5, 9.2, 0.1, 0.35);
  Rt.translate(26.8, BASE + 34.5 / 2, -1.2);
  stone.push(Rt);
  const Rc = taperedBox(10.0, 0.5, 9.8, 0, 0.15);
  Rc.translate(26.8, BASE + 34.5 + 0.1, -1.2);
  stone.push(Rc);
  const Rr = hip(9.6, 9.4, 3.6, 0.7, 0.75);
  Rr.translate(26.8, BASE + 34.5 + 0.35, -1.2);
  roof.push(Rr);

  const Ra = taperedBox(8.6, 25, 9, 0.08, 0.3);
  Ra.translate(34.6, BASE + 12.5, -3.2);
  stone.push(Ra);
  const Rar = hip(8.6, 9, 3.0, 3.2, 0.7);
  Rar.translate(34.6, BASE + 25, -3.2);
  roof.push(Rar);

  const La = taperedBox(9, 24, 9, 0.08, 0.3);
  La.translate(-34.8, BASE + 12, -4.2);
  stone.push(La);
  const Lar = hip(9, 9, 3.0, 3.4, 0.7);
  Lar.translate(-34.8, BASE + 24, -4.2);
  roof.push(Lar);

  windows.push(new THREE.Vector3(-26.3, 25.2, 3.32), new THREE.Vector3(-27.9, 17.5, 3.4));
  windows.push(new THREE.Vector3(25.4, 23.5, 3.55), new THREE.Vector3(28.2, 23.5, 3.55), new THREE.Vector3(26.8, 16.8, 3.65));
  windows.push(new THREE.Vector3(33.6, 12.5, 1.42), new THREE.Vector3(-33.6, 12, 0.42));

  const m = (a: THREE.BufferGeometry[]) => {
    const g = mergeGeometries(a, false)!;
    a.forEach((x) => x.dispose());
    return g;
  };
  return { stone: m(stone), roof: m(roof), plaster: m(plaster), windows };
}

export function riverCenter(z: number) {
  return 9 * Math.sin((z + 40) / 110) - 9 * Math.sin(40 / 110);
}

export function terrainHeight(x: number, z: number) {
  const c = riverCenter(z);
  const front = Math.max(z - 14, 0);
  const half = 11.6 + Math.min(Math.abs(z), 400) * 0.028 + front * 0.22 + (fbm(z * 0.02, 3.1) - 0.5) * 3;
  const near = Math.exp(-(z * z) / (12 * 12));
  const w = half - near * 0.6;
  const d = Math.abs(x - c) - w;
  const n = fbm(x * 0.06, z * 0.06);
  const n2 = fbm(x * 0.21 + 7, z * 0.21);
  let h = -8;
  if (d > 0) {
    const s = THREE.MathUtils.smoothstep(d, 0, 10.5);
    h = -8 + s * (23 - Math.min(front / 90, 1) * 13) + Math.max(d - 10.5, 0) * 0.05;
    h += (n - 0.5) * 6 * Math.min(d / 6, 1) + (n2 - 0.5) * 2.2;
    h += THREE.MathUtils.smoothstep(Math.abs(x), 90, 230) * 34 * (0.6 + n);
  } else {
    h += (n2 - 0.5) * 1.5;
  }
  return h;
}

export function terrainGeometry(q: Quality) {
  const nx = q.terrainX;
  const nz = q.terrainZ;
  const pos: number[] = [];
  const idx: number[] = [];
  const mapX = (u: number) => Math.sign(u) * 300 * Math.pow(Math.abs(u), 1.75);
  const mapZ = (v: number) => (v < 0 ? -520 * Math.pow(-v, 1.7) : 120 * Math.pow(v, 1.35));
  for (let j = 0; j <= nz; j++) {
    const v = -1 + (2 * j) / nz;
    const z = mapZ(v);
    for (let i = 0; i <= nx; i++) {
      const u = -1 + (2 * i) / nx;
      const x = mapX(u);
      pos.push(x, terrainHeight(x, z), z);
    }
  }
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      const b = a + 1;
      const c = a + nx + 1;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const nrm = g.attributes.normal;
  const col: number[] = [];
  const rock = new THREE.Color("#a39580");
  const rockDark = new THREE.Color("#6f6556");
  const green = new THREE.Color("#33503f");
  const tmp = new THREE.Color();
  for (let i = 0; i < nrm.count; i++) {
    const x = pos[i * 3];
    const y = pos[i * 3 + 1];
    const z = pos[i * 3 + 2];
    const slope = 1 - nrm.getY(i);
    const veg = THREE.MathUtils.smoothstep(y, 2.5, 8) * (1 - THREE.MathUtils.smoothstep(slope, 0.18, 0.42)) * (0.6 + 0.4 * fbm(x * 0.15, z * 0.15));
    tmp.copy(rock).lerp(rockDark, fbm(x * 0.3 + 3, z * 0.3) * 0.7).lerp(green, Math.min(veg, 1));
    const bx = Math.max(Math.abs(x) - 14, 0);
    const foot = Math.exp(-(bx * bx) / 40) * Math.exp(-(z * z) / 60) * (1 - THREE.MathUtils.smoothstep(y, 6, 14));
    tmp.multiplyScalar(1 - foot * 0.45);
    col.push(tmp.r, tmp.g, tmp.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return g;
}

export type Town = { body: THREE.Matrix4[]; roof: THREE.Matrix4[]; win: THREE.Matrix4[] };

export function townLayout(q: Quality): Town {
  const r = rnd(7);
  const body: THREE.Matrix4[] = [];
  const roof: THREE.Matrix4[] = [];
  const win: THREE.Matrix4[] = [];
  const v = new THREE.Vector3();
  const s = new THREE.Vector3();
  const qq = new THREE.Quaternion();
  const e = new THREE.Euler();
  let tries = 0;
  const placed: [number, number, number][] = [];
  while (body.length < q.houses && tries < q.houses * 40) {
    tries++;
    const side = r() < 0.5 ? -1 : 1;
    const z = -300 + r() * 335;
    const c = riverCenter(z);
    const x = c + side * (24 + Math.pow(r(), 1.3) * 150);
    if (Math.abs(x) < 42 && Math.abs(z) < 14) continue;
    if (Math.hypot(x - MOSQUE[0], z - MOSQUE[1]) < 30) continue;
    const h0 = terrainHeight(x, z);
    if (h0 < 4) continue;
    const w = 6 + r() * 4.5;
    const d = 6 + r() * 3.5;
    const hh = 5 + Math.floor(r() * 3) * 2.6 + r() * 0.8;
    const ok = placed.every(([px, pz, pr]) => Math.hypot(px - x, pz - z) > pr + Math.max(w, d) * 0.55);
    if (!ok) continue;
    const hs = [terrainHeight(x - w / 2, z - d / 2), terrainHeight(x + w / 2, z - d / 2), terrainHeight(x - w / 2, z + d / 2), terrainHeight(x + w / 2, z + d / 2)];
    const lo = Math.min(...hs);
    const hi = Math.max(...hs);
    if (hi - lo > 6) continue;
    placed.push([x, z, Math.max(w, d) * 0.55]);
    const yaw = (r() - 0.5) * 0.3 + Math.atan2(riverCenter(z + 1) - c, 1) * 0.5;
    e.set(0, yaw, 0);
    qq.setFromEuler(e);
    const base = lo - 1.5;
    const top = hi + hh;
    const H = top - base;
    body.push(new THREE.Matrix4().compose(v.set(x, base + H / 2, z), qq, s.set(w, H, d)));
    roof.push(new THREE.Matrix4().compose(v.set(x, top, z), qq, s.set(w, 1.6 + r() * 0.8, d)));
    const floors = Math.max(1, Math.floor((top - hi - 1.5) / 2.6));
    for (let f = 0; f < floors; f++) {
      const cols = w > 8 ? 3 : 2;
      for (let k = 0; k < cols; k++) {
        if (r() < 0.42) continue;
        const lx = (k - (cols - 1) / 2) * (w / cols);
        const ly = top - 1.6 - f * 2.6;
        const p = new THREE.Vector3(lx, ly - (base + H / 2), d / 2 + 0.06).applyQuaternion(qq).add(new THREE.Vector3(x, base + H / 2, z));
        win.push(new THREE.Matrix4().compose(p, qq, s.set(0.75, 1.05, 1)));
      }
    }
  }
  return { body, roof, win };
}

export const MOSQUE: [number, number] = [33, -250];

export function mosqueGeometry(q: Quality) {
  const [x, z] = MOSQUE;
  const y = terrainHeight(x, z) - 1;
  const parts: THREE.BufferGeometry[] = [];
  const b = taperedBox(14, 14, 14, 0, 0.3);
  b.translate(0, 1, 0);
  parts.push(b);
  const drum = lathe([[0, 0], [5.4, 0], [5.4, 1.6], [0, 1.6]], q.lathe);
  drum.translate(0, 8, 0);
  parts.push(drum);
  const dome = clean(new THREE.SphereGeometry(5.4, q.lathe, 12, 0, Math.PI * 2, 0, Math.PI / 2));
  dome.translate(0, 9.6, 0);
  parts.push(dome);
  const mi = lathe([[0, -6], [1.25, -6], [1.05, 1], [0.95, 22], [1.45, 22.4], [1.45, 23], [0.9, 23.3], [0.85, 26.5], [0, 26.6]], 16);
  mi.translate(-9.5, 0, 3);
  parts.push(mi);
  const cone = clean(new THREE.ConeGeometry(0.95, 4.2, 16));
  cone.translate(-9.5, 28.6, 3);
  parts.push(cone);
  const g = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  g.scale(1.4, 1.4, 1.4);
  g.translate(x, y, z);
  return g;
}

export function ridgeGeometry(z: number, width: number, base: number, amp: number, seed: number, step: number) {
  const r = rnd(seed);
  const s = new THREE.Shape();
  s.moveTo(-width, -20);
  let x = -width;
  while (x < width) {
    const t = x / width;
    const env = 0.55 + 0.45 * Math.cos(t * Math.PI * 0.9 + seed);
    s.lineTo(x, base + amp * env * (0.55 + r() * 0.45));
    x += step * (0.5 + r());
  }
  s.lineTo(width, base);
  s.lineTo(width, -20);
  s.closePath();
  const g = new THREE.ShapeGeometry(s, 4);
  g.translate(0, 0, z);
  return g;
}

export function skyStars(count: number) {
  const r = rnd(11);
  const p: number[] = [];
  for (let i = 0; i < count; i++) {
    const th = r() * Math.PI * 2;
    const ph = Math.acos(0.15 + r() * 0.85);
    const R0 = 1400;
    p.push(R0 * Math.sin(ph) * Math.cos(th), R0 * Math.cos(ph), R0 * Math.sin(ph) * Math.sin(th) - 200);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
}

export function noiseTexture(size: number) {
  const data = new Uint8Array(size * size * 4);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const u = i / size;
      const v = j / size;
      const n = fbm(Math.cos(u * Math.PI * 2) * 3 + 10, Math.sin(u * Math.PI * 2) * 3 + v * 40, 4);
      const k = (j * size + i) * 4;
      const c = Math.floor(n * 255);
      data[k] = c;
      data[k + 1] = c;
      data[k + 2] = c;
      data[k + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

