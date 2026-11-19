"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { stoneMaterial } from "./stone";
import { HIGH, LOW, bridgeGeometry, mosqueGeometry, noiseTexture, ridgeGeometry, skyStars, terrainGeometry, towerGeometry, townLayout, type Quality } from "./geometry";
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
};

const BG = "#070D1F";
const SKY_TOP = new THREE.Color("#070D1F");
const SKY_LOW = new THREE.Color("#142347");
const FOG = new THREE.Color("#101c3a");
const REVEAL = 0.72;

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uTop: { value: SKY_TOP }, uLow: { value: SKY_LOW } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader:
          "uniform vec3 uTop; uniform vec3 uLow; varying vec3 vP; void main(){ float h = clamp(vP.y * 2.4, 0.0, 1.0); vec3 c = mix(uLow, uTop, pow(h, 0.7)); gl_FragColor = vec4(c, 1.0); }",
      }),
    [],
  );
  const geo = useMemo(() => new THREE.SphereGeometry(1600, 32, 16), []);
  useEffect(() => () => { mat.dispose(); geo.dispose(); }, [mat, geo]);
  return <mesh geometry={geo} material={mat} renderOrder={-2} />;
}

function Stars({ count }: { count: number }) {
  const geo = useMemo(() => skyStars(count), [count]);
  const mat = useMemo(
    () => new THREE.PointsMaterial({ color: "#cfd8f0", size: 1.3, sizeAttenuation: false, transparent: true, opacity: 0.42, fog: false, depthWrite: false }),
    [],
  );
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <points geometry={geo} material={mat} renderOrder={-1} />;
}

function World({ q, low }: { q: Quality; low: boolean }) {
  const res = useMemo(() => {
    const bridge = bridgeGeometry(q);
    const towers = towerGeometry(q);
    const terrain = terrainGeometry(q);
    const mosque = mosqueGeometry(q);
    const town = townLayout(q);
    const ridges = [
      ridgeGeometry(-420, 1400, 70, 120, 3, 60),
      ridgeGeometry(-640, 1700, 110, 170, 5, 90),
      ridgeGeometry(-900, 2200, 150, 220, 9, 120),
    ];
    const houseGeo = new THREE.BoxGeometry(1, 1, 1);
    const roofGeo = (() => {
      const g = new THREE.BufferGeometry();
      const W = 0.5 + 0.06;
      const D = 0.5 + 0.06;
      const r = 0.22;
      const v = [[-W, 0, -D], [W, 0, -D], [W, 0, D], [-W, 0, D], [-r, 1, 0], [r, 1, 0]];
      const t = [3, 2, 5, 3, 5, 4, 1, 0, 4, 1, 4, 5, 0, 3, 4, 2, 1, 5, 0, 1, 2, 0, 2, 3];
      const p: number[] = [];
      t.forEach((i) => p.push(...v[i]));
      g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
      g.computeVertexNormals();
      return g;
    })();
    const winGeo = new THREE.PlaneGeometry(1, 1);
    const stone = stoneMaterial({ color: "#d3bd9c", masonry: 1, course: 0.46, uplight: 1.05 });
    const towerStone = stoneMaterial({ color: "#c4b192", masonry: 1, course: 0.5, uplight: 0.9 });
    const roof = stoneMaterial({ color: "#6e6d6c", masonry: 1, course: 0.34, uplight: 0.35 });
    const rock = stoneMaterial({ color: "#ffffff", masonry: 0, uplight: 0.85, reach: 70, vertexColors: true, roughness: 1 });
    rock.flatShading = true;
    const townStone = stoneMaterial({ color: "#b9ab95", masonry: 1, course: 0.52, uplight: 0.5, reach: 90 });
    const townRoof = stoneMaterial({ color: "#7a7774", masonry: 1, course: 0.3, uplight: 0.2, reach: 90 });
    const plaster = new THREE.MeshStandardMaterial({ color: "#e9e2d6", roughness: 0.9, emissive: new THREE.Color("#ffb766"), emissiveIntensity: 0.16 });
    const win = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.55, 0.7), toneMapped: false, side: THREE.DoubleSide });
    const winDim = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 0.72, 0.36), toneMapped: false, side: THREE.DoubleSide });
    const mosqueMat = stoneMaterial({ color: "#d8cfc2", masonry: 0, uplight: 0.7, reach: 0 });
    const ridgeMats = ["#1a2648", "#141e3c", "#0f1832"].map((c) => new THREE.MeshBasicMaterial({ color: c, fog: true }));
    return { bridge, towers, terrain, mosque, town, ridges, houseGeo, roofGeo, winGeo, stone, towerStone, roof, rock, townStone, townRoof, plaster, win, winDim, mosqueMat, ridgeMats };
  }, [q]);

  useEffect(
    () => () => {
      [res.bridge, res.towers.stone, res.towers.roof, res.towers.plaster, res.terrain, res.mosque, res.houseGeo, res.roofGeo, res.winGeo, ...res.ridges].forEach((g) => g.dispose());
      [res.stone, res.towerStone, res.roof, res.rock, res.townStone, res.townRoof, res.plaster, res.win, res.winDim, res.mosqueMat, ...res.ridgeMats].forEach((m) => m.dispose());
    },
    [res],
  );

  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const roofRef = useRef<THREE.InstancedMesh>(null);
  const winRef = useRef<THREE.InstancedMesh>(null);
  const towerWinRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    res.town.body.forEach((m, i) => bodyRef.current?.setMatrixAt(i, m));
    res.town.roof.forEach((m, i) => roofRef.current?.setMatrixAt(i, m));
    res.town.win.forEach((m, i) => winRef.current?.setMatrixAt(i, m));
    const m = new THREE.Matrix4();
    res.towers.windows.forEach((p, i) => towerWinRef.current?.setMatrixAt(i, m.compose(p, new THREE.Quaternion(), new THREE.Vector3(0.62, 1.15, 1))));
    [bodyRef, roofRef, winRef, towerWinRef].forEach((r) => {
      if (!r.current) return;
      r.current.instanceMatrix.needsUpdate = true;
      r.current.computeBoundingSphere();
    });
  }, [res]);

  return (
    <group>
      {res.ridges.map((g, i) => <mesh key={i} geometry={g} material={res.ridgeMats[i]} />)}
      <mesh geometry={res.terrain} material={res.rock} />
      <mesh geometry={res.bridge} material={res.stone} />
      <mesh geometry={res.towers.stone} material={res.towerStone} />
      <mesh geometry={res.towers.roof} material={res.roof} />
      <mesh geometry={res.towers.plaster} material={res.plaster} />
      <mesh geometry={res.mosque} material={res.mosqueMat} />
      <instancedMesh ref={bodyRef} args={[res.houseGeo, res.townStone, res.town.body.length]} frustumCulled={false} />
      <instancedMesh ref={roofRef} args={[res.roofGeo, res.townRoof, res.town.roof.length]} frustumCulled={false} />
      <instancedMesh ref={winRef} args={[res.winGeo, res.winDim, res.town.win.length]} frustumCulled={false} />
      <instancedMesh ref={towerWinRef} args={[res.winGeo, res.win, res.towers.windows.length]} />
      <Water low={low} />
    </group>
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
    varying vec4 vUv;
    varying vec3 vW;
    void main() {
      vec2 q = vW.xz;
      float a = texture2D(tNoise, q * vec2(0.012, 0.004) + vec2(0.0, uTime * 0.018)).r;
      float b = texture2D(tNoise, q * vec2(0.031, 0.011) + vec2(0.37, uTime * 0.041)).r;
      float c = texture2D(tNoise, q * vec2(0.09, 0.03) + vec2(0.71, uTime * 0.09)).r;
      float d = length(vW - cameraPosition);
      float near = clamp(90.0 / d, 0.25, 1.0);
      vec2 off = vec2((a - 0.5) * 0.006 + (c - 0.5) * 0.004, (b - 0.5) * 0.03 + (c - 0.5) * 0.014) * near;
      vec2 uv = vUv.xy / vUv.w + off;
      vec3 r = texture2D(tDiffuse, uv).rgb;
      r += texture2D(tDiffuse, uv + vec2(0.0, 0.006)).rgb;
      r += texture2D(tDiffuse, uv - vec2(0.0, 0.006)).rgb;
      r /= 3.0;
      vec3 base = vec3(0.012, 0.03, 0.04);
      vec3 col = base + r * color * (0.82 + 0.3 * c);
      float f = 1.0 - exp(-pow(uDensity * d, 2.0));
      col = mix(col, uFog, f);
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
};

function Water({ low }: { low: boolean }) {
  const { size, viewport, scene } = useThree();
  const tex = useMemo(() => noiseTexture(128), []);
  const ref = useMemo(() => {
    const k = low ? 0.35 : 0.5;
    const w = Math.max(256, Math.round(size.width * viewport.dpr * k));
    const h = Math.max(256, Math.round(size.height * viewport.dpr * k));
    const r = new Reflector(new THREE.PlaneGeometry(1400, 900), {
      textureWidth: w,
      textureHeight: h,
      color: new THREE.Color(0.52, 0.6, 0.68),
      clipBias: 0.002,
      multisample: 0,
      shader: WATER,
    });
    const u = (r.material as THREE.ShaderMaterial).uniforms;
    u.tNoise.value = tex;
    r.rotation.x = -Math.PI / 2;
    r.position.set(0, 0, -180);
    return r;
  }, [low, size.width, size.height, viewport.dpr, tex]);
  useEffect(
    () => () => {
      ref.getRenderTarget().dispose();
      ref.geometry.dispose();
      (ref.material as THREE.Material).dispose();
    },
    [ref],
  );
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame((_, dt) => {
    const u = (ref.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value += dt;
    if (scene.fog instanceof THREE.FogExp2) u.uDensity.value = scene.fog.density;
  });
  return <primitive object={ref} />;
}

function Rig({ api, start, fly, reduce, compact, onShown, onReveal, onLand }: Omit<Props, "active">) {
  const { camera, size, gl, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const st = useRef({ t: fly ? 0 : 1, started: false, revealed: false, landed: false, shown: 0, mx: 0, my: 0, px: 0, py: 0 });
  const frame = useRef<Frame | null>(null);
  const curves = useRef<{ p: THREE.CatmullRomCurve3; l: THREE.CatmullRomCurve3 } | null>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const proj = useRef<Projector>(() => null);

  useEffect(() => {
    const L = api.layout.current;
    const aspect = size.width / size.height;
    const panel = L.panels ? (size.width >= 1536 ? 64 + 256 : 40 + 244) + 18 : 0;
    const half = L.panels ? (size.width / 2 - panel) / (size.width / 2) : compact ? 0.92 : 0.8;
    const top = Math.min(0.62, L.top / size.height);
    const layout: Layout = compact
      ? { aspect, water: 0.7, top, half, compact: true }
      : { aspect, water: L.panels ? 0.775 : 0.76, top: size.width >= 1024 ? Math.max(top, (L.panels ? 0.775 : 0.76) - 0.285) : top, half, compact: false };
    const f = frameFor(layout);
    frame.current = f;
    const d = f.pos[2];
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 0.3 / d;
    curves.current = {
      p: new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-d * 0.55, d * 0.62, d * 1.32),
          new THREE.Vector3(-d * 0.42, d * 0.38, d * 1.18),
          new THREE.Vector3(-d * 0.16, d * 0.12, d * 1.06),
          new THREE.Vector3(...f.pos),
        ],
        false,
        "centripetal",
      ),
      l: new THREE.CatmullRomCurve3(
        [new THREE.Vector3(0, 2, -260), new THREE.Vector3(0, 6, -120), new THREE.Vector3(0, f.target[1] * 0.7, -30), new THREE.Vector3(...f.target)],
        false,
        "centripetal",
      ),
    };
    cam.fov = f.fov;
    cam.near = 1;
    cam.far = 4000;
    cam.updateProjectionMatrix();
  }, [size.width, size.height, compact, api, cam, scene]);

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const on = (e: PointerEvent) => {
      st.current.mx = (e.clientX / window.innerWidth) * 2 - 1;
      st.current.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [reduce]);

  useEffect(() => {
    proj.current = (t: number) => {
      const p = pathAt(t);
      v.set(p[0], p[1], p[2]).project(cam);
      if (v.z > 1) return null;
      return [((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height];
    };
  }, [cam, size.width, size.height, v]);

  useFrame((_, dtRaw) => {
    const s = st.current;
    const f = frame.current;
    const c = curves.current;
    if (!f || !c) return;
    const dt = Math.min(dtRaw, 1 / 20);
    const dur = compact ? 2.1 : 2.8;
    if (start && !s.started) s.started = true;
    if (s.started && s.t < 1) s.t = Math.min(1, s.t + dt / dur);
    const k = ease(s.t);
    if (s.t >= 1) {
      pos.set(...f.pos);
      look.set(...f.target);
    } else {
      c.p.getPoint(k, pos);
      c.l.getPoint(k, look);
    }
    if (s.landed && !reduce) {
      s.px += (s.mx - s.px) * Math.min(1, dt * 2.2);
      s.py += (s.my - s.py) * Math.min(1, dt * 2.2);
      const yaw = -s.px * THREE.MathUtils.degToRad(1.5);
      const pitch = s.py * THREE.MathUtils.degToRad(0.7);
      v.copy(pos).sub(look);
      v.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      v.y += v.length() * pitch;
      pos.copy(look).add(v);
    }
    cam.position.copy(pos);
    cam.lookAt(look);
    cam.updateMatrixWorld();
    if (s.shown < 3) {
      s.shown++;
      if (s.shown === 3) onShown();
    }
    if (s.started && !s.revealed && s.t >= REVEAL) {
      s.revealed = true;
      onReveal();
    }
    if (s.started && !s.landed && s.t >= 1) {
      s.landed = true;
      onLand();
    }
    api.onFrame.current?.(proj.current);
  });

  useEffect(() => {
    gl.setClearColor(BG, 1);
  }, [gl]);

  return null;
}

export default function Scene(p: Props) {
  const [low, setLow] = useState(p.compact);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);
  useEffect(() => {
    const max = Math.min(window.devicePixelRatio || 1, p.compact ? 1.5 : 2);
    setDpr([1, max]);
  }, [p.compact]);
  const q = p.compact ? LOW : HIGH;
  return (
    <Canvas
      flat
      dpr={dpr}
      frameloop={p.active ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false, stencil: false }}
      camera={{ fov: 30, near: 1, far: 4000, position: [0, 40, 220] }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.FogExp2(FOG, p.compact ? 0.0042 : 0.0036);
        scene.background = new THREE.Color(BG);
      }}
    >
      <PerformanceMonitor onDecline={() => { setLow(true); setDpr([1, 1]); }} />
      <Sky />
      <Stars count={p.compact ? 500 : 1100} />
      <hemisphereLight args={["#6b80c0", "#0b0f1c", 0.62]} />
      <directionalLight position={[-120, 160, -220]} intensity={0.5} color="#9db2e6" />
      <directionalLight position={[60, 40, 160]} intensity={0.16} color="#7f93c8" />
      <World q={q} low={low} />
      <Rig api={p.api} start={p.start} fly={p.fly} reduce={p.reduce} compact={p.compact} onShown={p.onShown} onReveal={p.onReveal} onLand={p.onLand} />
      <EffectComposer multisampling={0} enableNormalPass={false}>
        {low ? <></> : <Bloom mipmapBlur luminanceThreshold={0.86} luminanceSmoothing={0.12} intensity={0.62} radius={0.62} />}
        <Vignette offset={0.32} darkness={0.58} eskil={false} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
