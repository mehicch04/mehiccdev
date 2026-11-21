"use client";

import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { scanMaterial } from "./scan";
import { stoneMaterial } from "./stone";
import { HIGH, LOW, WINDOWS, mosqueGeometry, noiseTexture, ridgeGeometry, skyStars, terrainGeometry, townLayout, type Quality } from "./geometry";
import { frameFor, pathAt, type Frame, type Layout } from "./frame";

export type Projector = (t: number) => [number, number] | null;
export type SceneApi = {
  onFrame: MutableRefObject<((p: Projector) => void) | null>;
  layout: MutableRefObject<{ top: number; panels: boolean }>;
};
type Props = {
  api: SceneApi;
  start: boolean;
  fly: boolean;
  reduce: boolean;
  compact: boolean;
  active: boolean;
  onShown: () => void;
  onReveal: () => void;
  onLand: () => void;
  onFail: () => void;
};

const MODEL = "/models/stari-most.glb";
const DRACO = "/draco/";
const BG = "#050a16";
const FOG = new THREE.Color("#0c1630");
const REVEAL = 0.7;
const FLIGHT = 2;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        uniforms: {
          uTop: { value: new THREE.Color("#050a16") },
          uLow: { value: new THREE.Color("#111f3d") },
          uGlow: { value: new THREE.Color("#c8662e") },
          uCloud: { value: new THREE.Color("#2a3352") },
        },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: /* glsl */ `
          uniform vec3 uTop; uniform vec3 uLow; uniform vec3 uGlow; uniform vec3 uCloud;
          varying vec3 vP;
          float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float n2(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(h2(i), h2(i + vec2(1,0)), f.x), mix(h2(i + vec2(0,1)), h2(i + vec2(1,1)), f.x), f.y); }
          float fb(vec2 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * n2(p); p *= 2.02; a *= 0.5; } return v; }
          void main(){
            float e = vP.y;
            float h = clamp(e * 2.6, 0.0, 1.0);
            vec3 c = mix(uLow, uTop, pow(h, 0.62));
            float az = atan(vP.x, -vP.z);
            float g = exp(-pow(max(e, 0.0) / 0.075, 1.4)) * exp(-az * az * 1.6);
            c += uGlow * g * 0.16;
            vec2 cp = vec2(az * 3.2, e * 18.0);
            float cl = smoothstep(0.52, 0.78, fb(cp + vec2(0.0, 1.3)));
            float band = smoothstep(0.015, 0.06, e) * (1.0 - smoothstep(0.13, 0.26, e));
            vec3 cc = mix(uCloud, uGlow * 0.55 + uCloud, g * 0.7);
            c = mix(c, cc, cl * band * 0.5);
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  const geo = useMemo(() => new THREE.SphereGeometry(1800, 48, 24), []);
  useEffect(() => () => { mat.dispose(); geo.dispose(); }, [mat, geo]);
  return <mesh geometry={geo} material={mat} renderOrder={-2} />;
}

function Stars({ count }: { count: number }) {
  const geo = useMemo(() => {
    const g = skyStars(count);
    const n = g.attributes.position.count;
    const a = new Float32Array(n);
    for (let i = 0; i < n; i++) a[i] = 0.25 + (((i * 7919) % 97) / 97) * 0.75;
    g.setAttribute("aMag", new THREE.BufferAttribute(a, 1));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uScale: { value: 1 } },
        vertexShader: /* glsl */ `
          attribute float aMag; varying float vM; uniform float uScale;
          void main(){ vM = aMag; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (1.1 + aMag * 1.2) * uScale; }`,
        fragmentShader: /* glsl */ `
          varying float vM;
          void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); float a = smoothstep(0.5, 0.1, r);
            gl_FragColor = vec4(vec3(0.78, 0.84, 1.0) * a * (0.18 + vM * 0.34), 1.0); }`,
      }),
    [],
  );
  const { viewport } = useThree();
  useEffect(() => { mat.uniforms.uScale.value = viewport.dpr; }, [mat, viewport.dpr]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <points geometry={geo} material={mat} renderOrder={-1} />;
}

function Backdrop({ q }: { q: Quality }) {
  const res = useMemo(() => {
    const terrain = terrainGeometry(q);
    const mosque = mosqueGeometry(q);
    const town = townLayout(q);
    const ridges = [
      ridgeGeometry(-520, 1500, 40, 150, 3, 14),
      ridgeGeometry(-760, 1900, 70, 230, 5, 18),
      ridgeGeometry(-1050, 2400, 90, 300, 9, 24),
    ];
    const houseGeo = new THREE.BoxGeometry(1, 1, 1);
    const roofGeo = (() => {
      const g = new THREE.BufferGeometry();
      const W = 0.56;
      const r = 0.22;
      const v = [[-W, 0, -W], [W, 0, -W], [W, 0, W], [-W, 0, W], [-r, 1, 0], [r, 1, 0]];
      const t = [3, 2, 5, 3, 5, 4, 1, 0, 4, 1, 4, 5, 0, 3, 4, 2, 1, 5, 0, 1, 2, 0, 2, 3];
      const p: number[] = [];
      t.forEach((i) => p.push(...v[i]));
      g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
      g.computeVertexNormals();
      return g;
    })();
    const winGeo = new THREE.PlaneGeometry(1, 1);
    const rock = stoneMaterial({ color: "#ffffff", masonry: 0, uplight: 0.12, reach: 0, vertexColors: true, roughness: 1 });
    const townStone = stoneMaterial({ color: "#b5a48b", masonry: 1, course: 0.42, uplight: 0.42, reach: 0, roughness: 0.96 });
    const townRoof = stoneMaterial({ color: "#7e7a75", masonry: 1, course: 0.26, uplight: 0.12, reach: 0, roughness: 0.98 });
    const winDim = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.56, 0.25), toneMapped: false, side: THREE.DoubleSide });
    const mosqueMat = stoneMaterial({ color: "#b9b0a3", masonry: 0, uplight: 0.5, reach: 0 });
    const ridgeMats = ["#0e1834", "#0b142c", "#091024"].map((c) => new THREE.MeshBasicMaterial({ color: c, fog: true }));
    return { terrain, mosque, town, ridges, houseGeo, roofGeo, winGeo, rock, townStone, townRoof, winDim, mosqueMat, ridgeMats };
  }, [q]);

  useEffect(
    () => () => {
      [res.terrain, res.mosque, res.houseGeo, res.roofGeo, res.winGeo, ...res.ridges].forEach((g) => g.dispose());
      [res.rock, res.townStone, res.townRoof, res.winDim, res.mosqueMat, ...res.ridgeMats].forEach((m) => m.dispose());
    },
    [res],
  );

  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const roofRef = useRef<THREE.InstancedMesh>(null);
  const winRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    res.town.body.forEach((m, i) => bodyRef.current?.setMatrixAt(i, m));
    res.town.roof.forEach((m, i) => roofRef.current?.setMatrixAt(i, m));
    res.town.win.forEach((m, i) => winRef.current?.setMatrixAt(i, m));
    [bodyRef, roofRef, winRef].forEach((r) => {
      if (!r.current) return;
      r.current.instanceMatrix.needsUpdate = true;
      r.current.computeBoundingSphere();
    });
  }, [res]);

  return (
    <group>
      {res.ridges.map((g, i) => <mesh key={i} geometry={g} material={res.ridgeMats[i]} />)}
      <mesh geometry={res.terrain} material={res.rock} />
      <mesh geometry={res.mosque} material={res.mosqueMat} />
      <instancedMesh ref={bodyRef} args={[res.houseGeo, res.townStone, res.town.body.length]} frustumCulled={false} />
      <instancedMesh ref={roofRef} args={[res.roofGeo, res.townRoof, res.town.roof.length]} frustumCulled={false} />
      <instancedMesh ref={winRef} args={[res.winGeo, res.winDim, res.town.win.length]} frustumCulled={false} />
    </group>
  );
}

function Scan() {
  const gltf = useGLTF(MODEL, DRACO);
  const { gl } = useThree();
  const res = useMemo(() => {
    const root = gltf.scene.clone(true);
    const aniso = Math.min(gl.capabilities.getMaxAnisotropy(), 16);
    const mats: THREE.Material[] = [];
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const m = scanMaterial(mesh.material as THREE.MeshStandardMaterial, aniso);
      mesh.material = m;
      mats.push(m);
    });
    return { root, mats };
  }, [gltf, gl]);
  useEffect(
    () => () => {
      res.mats.forEach((m) => m.dispose());
      res.root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry.dispose();
      });
      Object.values(gltf.materials).forEach((m) => {
        const s = m as THREE.MeshStandardMaterial;
        s.map?.dispose();
        s.normalMap?.dispose();
        s.dispose();
      });
      useGLTF.clear(MODEL);
    },
    [res, gltf],
  );
  return <primitive object={res.root} />;
}

function Windows() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geo, mat } = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying float vI;
        void main(){ vUv = uv; vI = float(gl_InstanceID);
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; varying vec2 vUv; varying float vI;
        void main(){
          vec2 d = (vUv - 0.5) * vec2(1.0, 0.8);
          float r = length(d);
          float core = smoothstep(0.16, 0.05, r);
          float halo = exp(-r * r * 26.0) * 0.55;
          float f = 0.92 + 0.08 * sin(uTime * (0.7 + fract(vI * 0.37)) + vI * 2.1);
          vec3 c = vec3(1.0, 0.66, 0.3) * (core * 1.5 + halo) * f;
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    return { geo: g, mat: m };
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1.5, 1.8, 1);
    const z = new THREE.Vector3(0, 0, 1);
    WINDOWS.forEach(([x, y, wz, nx, nz], i) => {
      q.setFromUnitVectors(z, new THREE.Vector3(nx, 0, nz).normalize());
      ref.current?.setMatrixAt(i, m.compose(new THREE.Vector3(x + nx * 0.12, y, wz + nz * 0.12), q, s));
    });
    if (ref.current) {
      ref.current.instanceMatrix.needsUpdate = true;
      ref.current.computeBoundingSphere();
    }
  }, []);
  useFrame((_, dt) => { mat.uniforms.uTime.value += dt; });
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <instancedMesh ref={ref} args={[geo, mat, WINDOWS.length]} renderOrder={2} />;
}

const SPOTS: { p: [number, number, number]; t: [number, number, number]; i: number; c: string; a: number }[] = [
  { p: [0, 2.2, 10], t: [0, 17, -1], i: 5200, c: "#ffad42", a: 0.66 },
  { p: [-20, 3, 24], t: [-22, 24, 1], i: 7800, c: "#ffad42", a: 0.52 },
  { p: [15, 2.6, 20], t: [15, 15, 2], i: 4800, c: "#ff8b2b", a: 0.5 },
  { p: [30, 4, 26], t: [35, 30, 3], i: 8200, c: "#ffad42", a: 0.42 },
  { p: [-12, 16, 70], t: [-26, 4, 30], i: 2600, c: "#ff9a3c", a: 0.34 },
];

function Lights() {
  const refs = useRef<(THREE.SpotLight | null)[]>([]);
  const targets = useMemo(
    () =>
      SPOTS.map((s) => {
        const o = new THREE.Object3D();
        o.position.set(...s.t);
        return o;
      }),
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((l, i) => {
      if (l) l.intensity = SPOTS[i].i * (0.97 + 0.03 * Math.sin(t * 0.5 + i * 1.7));
    });
  });
  return (
    <>
      <hemisphereLight args={["#3a4d80", "#05070d", 0.55]} />
      <directionalLight position={[-150, 34, 80]} intensity={1.1} color="#9fb4ff" />
      {targets.map((o, i) => <primitive key={`t${i}`} object={o} />)}
      {SPOTS.map((s, i) => (
        <spotLight
          key={i}
          ref={(l) => { refs.current[i] = l; }}
          position={s.p}
          target={targets[i]}
          color={s.c}
          intensity={s.i}
          angle={s.a}
          penumbra={0.85}
          decay={2}
          distance={0}
        />
      ))}
    </>
  );
}

const WATER = {
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    tNoise: { value: null },
    uTime: { value: 0 },
    uFog: { value: FOG },
    uDensity: { value: 0.002 },
    uSky: { value: new THREE.Color("#16264a") },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec3 vW;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vec4 w = modelMatrix * vec4(position, 1.0);
      vW = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 color;
    uniform sampler2D tDiffuse;
    uniform sampler2D tNoise;
    uniform float uTime;
    uniform vec3 uFog;
    uniform float uDensity;
    uniform vec3 uSky;
    varying vec4 vUv;
    varying vec3 vW;
    void main() {
      vec2 q = vW.xz;
      float a = texture2D(tNoise, q * vec2(0.016, 0.006) + vec2(0.0, uTime * 0.022)).r;
      float b = texture2D(tNoise, q * vec2(0.04, 0.014) + vec2(0.37, uTime * 0.05)).r;
      float c = texture2D(tNoise, q * vec2(0.11, 0.04) + vec2(0.71, uTime * 0.11)).r;
      vec3 v = cameraPosition - vW;
      float d = length(v);
      vec3 vd = v / d;
      float fr = 0.18 + 0.82 * pow(1.0 - max(vd.y, 0.0), 4.0);
      float near = clamp(70.0 / d, 0.3, 1.0);
      vec2 off = vec2((a - 0.5) * 0.007 + (c - 0.5) * 0.004, (b - 0.5) * 0.026 + (c - 0.5) * 0.012) * near;
      vec2 uv = vUv.xy / vUv.w + off;
      vec3 r = texture2D(tDiffuse, uv).rgb * 0.5;
      r += texture2D(tDiffuse, uv + vec2(0.0, 0.005)).rgb * 0.25;
      r += texture2D(tDiffuse, uv - vec2(0.0, 0.005)).rgb * 0.25;
      vec3 deep = vec3(0.0012, 0.0055, 0.0075);
      vec3 col = deep + mix(uSky * 0.05, r * color, fr) * (0.85 + 0.3 * c);
      col += vec3(0.6, 0.75, 1.0) * pow(max(c - 0.62, 0.0), 2.0) * 0.06 * near;
      float f = 1.0 - exp(-pow(uDensity * d, 2.0));
      col = mix(col, uFog, f);
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
};

function Water({ low }: { low: boolean }) {
  const { size, viewport, scene } = useThree();
  const tex = useMemo(() => noiseTexture(128), []);
  const ref = useMemo(() => {
    const r = new Reflector(new THREE.PlaneGeometry(1600, 1100), {
      textureWidth: 512,
      textureHeight: 512,
      color: new THREE.Color(0.78, 0.84, 0.86),
      clipBias: 0.003,
      multisample: 0,
      shader: WATER,
    });
    (r.material as THREE.ShaderMaterial).uniforms.tNoise.value = tex;
    r.rotation.x = -Math.PI / 2;
    r.position.set(0, 1.7, -300);
    r.renderOrder = 1;
    return r;
  }, [tex]);
  useEffect(() => {
    const k = low ? 0.4 : 0.6;
    ref.getRenderTarget().setSize(Math.max(256, Math.round(size.width * viewport.dpr * k)), Math.max(256, Math.round(size.height * viewport.dpr * k)));
  }, [ref, low, size.width, size.height, viewport.dpr]);
  useEffect(
    () => () => {
      ref.getRenderTarget().dispose();
      ref.geometry.dispose();
      (ref.material as THREE.Material).dispose();
      tex.dispose();
    },
    [ref, tex],
  );
  useFrame((_, dt) => {
    const u = (ref.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value += dt;
    if (scene.fog instanceof THREE.FogExp2) u.uDensity.value = scene.fog.density;
  });
  return <primitive object={ref} />;
}

function Rig({ api, start, fly, reduce, compact, onShown, onReveal, onLand }: Omit<Props, "active" | "onFail">) {
  const { camera, size, gl, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const st = useRef({ t: fly && !reduce ? 0 : 1, started: false, revealed: false, landed: false, frames: -1 });
  const frame = useRef<Frame | null>(null);
  const from = useRef({ p: new THREE.Vector3(), l: new THREE.Vector3() });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const w = useMemo(() => new THREE.Vector3(), []);
  const proj = useRef<Projector>(() => null);

  useLayoutEffect(() => {
    const L = api.layout.current;
    const aspect = size.width / size.height;
    const panel = L.panels ? (size.width >= 1536 ? 64 + 256 : 40 + 244) + 18 : 0;
    const half = L.panels ? 0.9 : compact ? 1.02 : 0.9;
    const top = Math.min(0.62, L.top / size.height);
    const layout: Layout = compact
      ? { aspect, water: 0.7, top: Math.max(top, 0.14), half, compact: true, extent: 22 }
      : { aspect, water: L.panels ? 0.9 : 0.84, top: size.width >= 1024 ? Math.max(top, 0.4) : Math.max(top, 0.16), half, compact: false };
    const f = frameFor(layout);
    frame.current = f;
    const d = f.pos[2];
    from.current.p.set(f.pos[0], f.pos[1] + d * 0.26, f.pos[2] + d * 0.18);
    from.current.l.set(0, 9, -4);
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 0.32 / d;
    cam.fov = f.fov;
    cam.near = 0.5;
    cam.far = 5000;
    cam.updateProjectionMatrix();
  }, [size.width, size.height, compact, api, cam, scene]);

  useEffect(() => {
    proj.current = (t: number) => {
      const p = pathAt(t);
      w.set(p[0], p[1], p[2]).project(cam);
      if (w.z > 1) return null;
      return [((w.x + 1) / 2) * size.width, ((1 - w.y) / 2) * size.height];
    };
  }, [cam, size.width, size.height, w]);

  useEffect(() => {
    const f = frame.current;
    if (f) {
      cam.position.set(...f.pos);
      cam.lookAt(...f.target);
      cam.updateMatrixWorld();
    }
    gl.compile(scene, cam);
    st.current.frames = 0;
  }, [gl, scene, cam]);

  useFrame((_, dtRaw) => {
    const s = st.current;
    const f = frame.current;
    if (!f) return;
    const dt = Math.min(dtRaw, 1 / 30);
    if (start && !s.started) s.started = true;
    if (s.started && s.t < 1) s.t = Math.min(1, s.t + dt / FLIGHT);
    if (s.t >= 1) {
      pos.set(...f.pos);
      look.set(...f.target);
    } else {
      const k = easeOut(s.t);
      pos.lerpVectors(from.current.p, v.set(...f.pos), k);
      look.lerpVectors(from.current.l, v.set(...f.target), k);
    }
    cam.position.copy(pos);
    cam.lookAt(look);
    cam.updateMatrixWorld();
    if (s.frames >= 0 && s.frames < 3) {
      s.frames++;
      if (s.frames === 3) onShown();
    }
    if (s.started && s.frames >= 3) {
      if (!s.revealed && s.t >= REVEAL) {
        s.revealed = true;
        onReveal();
      }
      if (!s.landed && s.t >= 1) {
        s.landed = true;
        onLand();
      }
    }
    api.onFrame.current?.(proj.current);
  });

  return null;
}

class Guard extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Scene(p: Props) {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);
  useEffect(() => {
    setDpr([1, Math.min(window.devicePixelRatio || 1, 1.75)]);
  }, []);
  const q = p.compact ? LOW : HIGH;
  const fail = useRef(p.onFail);
  fail.current = p.onFail;
  return (
    <Canvas
      dpr={dpr}
      frameloop={p.active ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false, stencil: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ fov: 32, near: 0.5, far: 5000, position: [0, 40, 160] }}
      onCreated={({ scene, gl }) => {
        scene.fog = new THREE.FogExp2(FOG, 0.003);
        scene.background = new THREE.Color(BG);
        gl.setClearColor(BG, 1);
        gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); fail.current(); }, { once: true });
      }}
    >
      <Sky />
      <Stars count={p.compact ? 260 : 520} />
      <Lights />
      <Guard onFail={p.onFail}>
        <Suspense fallback={null}>
          <Scan />
          <Backdrop q={q} />
          <Windows />
          <Water low={p.compact} />
          <Rig api={p.api} start={p.start} fly={p.fly} reduce={p.reduce} compact={p.compact} onShown={p.onShown} onReveal={p.onReveal} onLand={p.onLand} />
        </Suspense>
      </Guard>
    </Canvas>
  );
}
