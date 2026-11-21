import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type Quality = { lathe: number; terrainX: number; terrainZ: number; houses: number };
export const HIGH: Quality = { lathe: 40, terrainX: 260, terrainZ: 200, houses: 260 };
export const LOW: Quality = { lathe: 24, terrainX: 150, terrainZ: 120, houses: 130 };

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

function clean(g: THREE.BufferGeometry) {
  const n = g.index ? g.toNonIndexed() : g;
  n.deleteAttribute("uv");
  if (n.getAttribute("uv2")) n.deleteAttribute("uv2");
  if (!n.getAttribute("normal")) n.computeVertexNormals();
  return n;
}

function lathe(profile: [number, number][], seg: number) {
  return clean(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg));
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

export function riverCenter(z: number) {
  const k = Math.max(-z - 26, 0);
  return -0.0011 * k * k;
}

function scanMask(x: number, z: number) {
  const ix = 1 - THREE.MathUtils.smoothstep(Math.abs(x), 150, 190);
  return ix * THREE.MathUtils.smoothstep(z, -36, -26);
}

export function terrainHeight(x: number, z: number) {
  const c = riverCenter(z);
  const half = 12 + Math.max(-z - 26, 0) * 0.035 + (fbm(z * 0.02, 3.1) - 0.5) * 3;
  const d = Math.abs(x - c) - half;
  const n = fbm(x * 0.05, z * 0.05);
  const n2 = fbm(x * 0.19 + 7, z * 0.19);
  let h = -6;
  if (d > 0) {
    const s = THREE.MathUtils.smoothstep(d, 0, 12);
    h = -6 + s * 22 + Math.max(d - 12, 0) * 0.08;
    h += (n - 0.5) * 7 * Math.min(d / 6, 1) + (n2 - 0.5) * 4.5 * Math.min(d / 4, 1);
    h += THREE.MathUtils.smoothstep(Math.abs(x - c), 70, 220) * 40 * (0.55 + n);
  } else {
    h += (n2 - 0.5) * 1.2;
  }
  return THREE.MathUtils.lerp(h, -24, scanMask(x, z));
}

export function terrainGeometry(q: Quality) {
  const nx = q.terrainX;
  const nz = q.terrainZ;
  const pos: number[] = [];
  const idx: number[] = [];
  const mapX = (u: number) => Math.sign(u) * 340 * Math.pow(Math.abs(u), 1.6);
  const mapZ = (v: number) => (v < 0 ? -620 * Math.pow(-v, 1.55) : 130 * Math.pow(v, 1.2));
  for (let j = 0; j <= nz; j++) {
    const z = mapZ(-1 + (2 * j) / nz);
    for (let i = 0; i <= nx; i++) {
      const x = mapX(-1 + (2 * i) / nx);
      pos.push(x, terrainHeight(x, z), z);
    }
  }
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      const c = a + nx + 1;
      idx.push(a, c, a + 1, a + 1, c, c + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const nrm = g.attributes.normal;
  const col: number[] = [];
  const rock = new THREE.Color("#4a4740");
  const rockDark = new THREE.Color("#2c2a26");
  const green = new THREE.Color("#0f1c14");
  const tmp = new THREE.Color();
  for (let i = 0; i < nrm.count; i++) {
    const x = pos[i * 3];
    const y = pos[i * 3 + 1];
    const z = pos[i * 3 + 2];
    const slope = 1 - nrm.getY(i);
    const veg = THREE.MathUtils.smoothstep(y, 1.2, 4) * (0.75 + 0.25 * fbm(x * 0.2, z * 0.2)) * (1 - 0.5 * THREE.MathUtils.smoothstep(slope, 0.55, 0.85));
    tmp.copy(rock).lerp(rockDark, fbm(x * 0.3 + 3, z * 0.3) * 0.8).lerp(green, Math.min(veg * 1.2, 1));
    col.push(tmp.r, tmp.g, tmp.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return g;
}

export type Town = { body: THREE.Matrix4[]; roof: THREE.Matrix4[]; win: THREE.Matrix4[] };

export const MOSQUE: [number, number] = [9, -205];

export function townLayout(q: Quality): Town {
  const r = rnd(7);
  const body: THREE.Matrix4[] = [];
  const roof: THREE.Matrix4[] = [];
  const win: THREE.Matrix4[] = [];
  const v = new THREE.Vector3();
  const s = new THREE.Vector3();
  const qq = new THREE.Quaternion();
  const e = new THREE.Euler();
  const placed: [number, number, number][] = [];
  let tries = 0;
  while (body.length < q.houses && tries < q.houses * 50) {
    tries++;
    const side = r() < 0.5 ? -1 : 1;
    const z = -420 + r() * 480;
    const c = riverCenter(z);
    const x = c + side * (22 + Math.pow(r(), 1.2) * 200);
    if (scanMask(x, z) > 0.02) continue;
    if (Math.hypot(x - MOSQUE[0], z - MOSQUE[1]) < 26) continue;
    const w = 6 + r() * 4.5;
    const d = 6 + r() * 3.5;
    const hs = [terrainHeight(x - w / 2, z - d / 2), terrainHeight(x + w / 2, z - d / 2), terrainHeight(x - w / 2, z + d / 2), terrainHeight(x + w / 2, z + d / 2)];
    const lo = Math.min(...hs);
    const hi = Math.max(...hs);
    if (lo < 3 || hi - lo > 6) continue;
    if (!placed.every(([px, pz, pr]) => Math.hypot(px - x, pz - z) > pr + Math.max(w, d) * 0.55)) continue;
    placed.push([x, z, Math.max(w, d) * 0.55]);
    const hh = 5 + Math.floor(r() * 3) * 2.6 + r() * 0.8;
    const yaw = (r() - 0.5) * 0.4;
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
        if (r() < 0.55) continue;
        const lx = (k - (cols - 1) / 2) * (w / cols);
        const ly = top - 1.6 - f * 2.6;
        const p = new THREE.Vector3(lx, ly - (base + H / 2), d / 2 + 0.06).applyQuaternion(qq).add(new THREE.Vector3(x, base + H / 2, z));
        win.push(new THREE.Matrix4().compose(p, qq, s.set(0.7, 1.0, 1)));
      }
    }
  }
  return { body, roof, win };
}

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
  const mi = lathe([[0, -6], [1.15, -6], [0.98, 1], [0.86, 22], [1.35, 22.4], [1.35, 23], [0.82, 23.3], [0.78, 26.5], [0, 26.6]], 16);
  mi.translate(-10, 0, 3);
  parts.push(mi);
  const cone = clean(new THREE.ConeGeometry(0.86, 4.6, 16));
  cone.translate(-10, 28.8, 3);
  parts.push(cone);
  const g = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  g.scale(1.15, 1.15, 1.15);
  g.translate(x, y, z);
  return g;
}

export const WINDOWS: [number, number, number, number, number][] = [
  [-24.17, 27.32, 3.94, -0.38, 0.92],
  [-21.18, 27.38, 3.53, 0.37, 0.92],
  [-24.98, 25.81, 3.72, -0.57, 0.81],
  [-19.19, 21.32, 5.74, -0.74, 0.67],
  [-18.04, 21.29, 6.91, -0.59, 0.8],
  [-16.63, 21.3, 6.8, 0.77, 0.62],
  [-15.53, 21.34, 5.53, 0.67, 0.72],
  [34.13, 34.21, 0.21, -0.94, 0.34],
  [34.35, 34.31, 1.55, -0.99, 0.16],
  [34.52, 34.21, 2.59, -0.98, 0.22],
  [34.73, 34.26, 3.76, -0.99, 0.16],
  [34.95, 34.28, 5.02, -0.98, 0.18],
  [35.13, 34.28, 6.16, -0.99, 0.11],
  [35.36, 34.21, 7.45, -0.89, 0.41],
  [37.14, 34.14, 8.61, -0.28, 0.89],
  [38.31, 34.12, 8.47, -0.11, 0.9],
  [14.3, 18.64, 3.2, -0.07, 1],
];

export function ridgeGeometry(z: number, width: number, base: number, amp: number, seed: number, step: number) {
  const r = rnd(seed);
  const s = new THREE.Shape();
  s.moveTo(-width, -20);
  const o = r() * 100;
  for (let x = -width; x < width; x += step) {
    const t = x / width;
    const env = 0.5 + 0.5 * Math.cos(t * Math.PI * 1.1 + seed);
    s.lineTo(x, base + amp * env * (0.35 + fbm(x * 0.004 + o, seed, 5) * 0.9));
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
    const ph = Math.acos(0.42 + r() * 0.58);
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

