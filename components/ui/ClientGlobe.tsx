"use client";

import { useEffect, useRef } from "react";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import type { Flag } from "@/components/ui/Flags";
import { HL, LAND } from "@/components/ui/worldGlobe";
import { createGlobeGL, type GlobeGL } from "@/components/ui/globeGL";

export type Spot = "la" | "ny" | "sd" | "yo" | "mo";
export const SPOTS: Spot[] = ["la", "ny", "sd", "yo", "mo"];
export const SPOT_LL: Record<Spot, [number, number]> = {
  ny: [-74.006, 40.7128],
  la: [-118.2437, 34.0522],
  sd: [-117.1611, 32.7157],
  yo: [139.638, 35.4437],
  mo: [17.8078, 43.3438],
};
export const SPOT_FLAG: Record<Spot, Flag> = { ny: "us", la: "us", sd: "us", yo: "jp", mo: "ba" };
export const SPOT_NAME: Record<Spot, string> = { ny: "New York", la: "Los Angeles", sd: "San Diego", yo: "Yokohama", mo: "Mostar" };
const PIN: Record<Flag, string> = { us: "#DC2626", jp: "#F59E0B", ba: "#16A34A" };
const HL_FILL: Record<Flag, string> = { ba: "#1C4434", jp: "#463821", us: "#3A2537" };
const FLAGS: Flag[] = ["us", "jp", "ba"];
const LAND_GEO = { type: "MultiPolygon" as const, coordinates: LAND as unknown as number[][][][] };
const HL_GEOS: Record<Flag, { type: "MultiPolygon"; coordinates: number[][][][] }> = {
  us: { type: "MultiPolygon", coordinates: HL.us as unknown as number[][][][] },
  jp: { type: "MultiPolygon", coordinates: HL.jp as unknown as number[][][][] },
  ba: { type: "MultiPolygon", coordinates: HL.ba as unknown as number[][][][] },
};
const SPHERE = { type: "Sphere" as const };
const GRAT = geoGraticule10();
const FROM: Exclude<Spot, "mo">[] = ["la", "ny", "sd", "yo"];
const ARC_OFF = [58, 78, 112];
const ARC_ON = [157, 189, 223];
const OMEGA = 2.4;
const DRIFT = 2.6;
const LEAD = -5;

const target = (k: Spot): [number, number] => [-SPOT_LL[k][0], -SPOT_LL[k][1] * 0.7];
const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
const clampLat = (v: number) => Math.max(-60, Math.min(60, v));
const ease = (cur: number, to: number, dt: number, tau: number) => cur + (to - cur) * (1 - Math.exp(-dt / tau));
const smooth = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function ClientGlobe({ size, active, onPick, reduce = false, labels = true }: {
  size: number; active: Spot; onPick: (k: Spot) => void; reduce?: boolean; labels?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const base3d = useRef<HTMLCanvasElement>(null);
  const over = useRef<HTMLCanvasElement>(null);
  const pins = useRef<Partial<Record<Spot, HTMLButtonElement | null>>>({});
  const tags = useRef<Partial<Record<Spot, HTMLButtonElement | null>>>({});
  const rot = useRef<[number, number]>(target(active));
  const vel = useRef<[number, number]>([0, 0]);
  const goalBase = useRef<[number, number]>(target(active));
  const ofs = useRef(0);
  const act = useRef<Spot>(active);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number; r: [number, number] } | null>(null);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    if (act.current === active) return;
    act.current = active;
    goalBase.current = target(active);
    ofs.current = reduce ? 0 : LEAD;
    kick.current();
  }, [active, reduce]);

  useEffect(() => {
    const canvas = over.current;
    const glCanvas = base3d.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !glCanvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, size < 360 ? 1.5 : 2);
    const px = Math.round(size * dpr);
    canvas.width = px;
    canvas.height = px;
    glCanvas.width = px;
    glCanvas.height = px;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const R = size / 2 - 1;
    const proj = geoOrthographic().scale(R).translate([size / 2, size / 2]).clipAngle(90).precision(0.6);
    const path = geoPath(proj, ctx);
    const lines = FROM.map((k) => geoInterpolate(SPOT_LL[k], SPOT_LL.mo));
    const arcD = lines.map((ip) => ({ type: "LineString" as const, coordinates: Array.from({ length: 49 }, (_, j) => ip(j / 48)) }));
    const shade = ctx.createRadialGradient(size * 0.42, size * 0.38, 0, size * 0.42, size * 0.38, size * 0.62);
    shade.addColorStop(0, "#132340");
    shade.addColorStop(1, "#0A1426");

    let useGpu = false;
    const gpu: GlobeGL | null = createGlobeGL(glCanvas, size, dpr,
      () => { useGpu = true; glCanvas.style.opacity = "1"; kick.current(); },
      () => { useGpu = false; glCanvas.style.opacity = "0"; kick.current(); });

    const lit: Record<Flag, number> = { us: 0, jp: 0, ba: 0 };
    const arcMix = FROM.map(() => 0);
    const dims: Partial<Record<Spot, [number, number]>> = {};
    const measure = () => SPOTS.forEach((k) => { const t = tags.current[k]; if (t) dims[k] = [t.offsetWidth, t.offsetHeight]; });
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
    const pinState: Partial<Record<Spot, string>> = {};
    const tagState: Partial<Record<Spot, string>> = {};

    let raf = 0;
    let seen = true;
    let running = false;
    let last = 0;
    let prev: [number, number] = [...rot.current];
    const t0 = performance.now();

    const litGoal = (f: Flag) => {
      const on = SPOT_FLAG[act.current];
      if (f === on) return 1;
      return on === "ba" ? 0.45 : 0;
    };

    const paintCpuGlobe = () => {
      ctx.beginPath();
      path(SPHERE);
      ctx.fillStyle = shade;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#2A3A5A";
      ctx.stroke();
      ctx.beginPath();
      path(GRAT);
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = "#16243E";
      ctx.stroke();
      ctx.beginPath();
      path(LAND_GEO);
      ctx.fillStyle = "#1F2D49";
      ctx.fill();
      ctx.strokeStyle = "#2C3D5F";
      ctx.stroke();
      FLAGS.forEach((f) => {
        if (lit[f] < 0.01) return;
        ctx.globalAlpha = lit[f];
        ctx.beginPath();
        path(HL_GEOS[f]);
        ctx.fillStyle = HL_FILL[f];
        ctx.fill();
        ctx.globalAlpha = lit[f] * 0.6;
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = PIN[f];
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };

    const paint = (now: number, dt: number) => {
      const r = rot.current;
      proj.rotate([r[0], r[1]]);
      const center: [number, number] = [-r[0], -r[1]];
      FLAGS.forEach((f) => { lit[f] = dt > 0 ? ease(lit[f], litGoal(f), dt, 0.16) : litGoal(f); });

      ctx.clearRect(0, 0, size, size);
      if (useGpu && gpu) gpu.draw(r[0], r[1], [lit.us, lit.jp, lit.ba]);
      else paintCpuGlobe();

      arcD.forEach((g, i) => {
        const want = act.current === FROM[i] || act.current === "mo" ? 1 : 0;
        arcMix[i] = dt > 0 ? ease(arcMix[i], want, dt, 0.14) : want;
        const m = arcMix[i];
        ctx.beginPath();
        path(g);
        ctx.lineWidth = 1.1 + 0.7 * m;
        ctx.strokeStyle = `rgb(${Math.round(ARC_OFF[0] + (ARC_ON[0] - ARC_OFF[0]) * m)},${Math.round(ARC_OFF[1] + (ARC_ON[1] - ARC_OFF[1]) * m)},${Math.round(ARC_OFF[2] + (ARC_ON[2] - ARC_OFF[2]) * m)})`;
        ctx.stroke();
      });

      if (!reduce) {
        ctx.fillStyle = "#FFFFFF";
        lines.forEach((ip, i) => {
          const p = ((now - t0) / (3200 + i * 500) + i * 0.23) % 1;
          const ll = ip(p);
          const a = 1 - smooth(Math.PI / 2 - 0.12, Math.PI / 2 - 0.02, geoDistance(ll, center));
          if (a <= 0) return;
          const xy = proj(ll);
          if (!xy) return;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(xy[0], xy[1], 2.3, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      SPOTS.forEach((k) => {
        const ll = SPOT_LL[k];
        const xy = proj(ll);
        if (!xy) return;
        const vis = geoDistance(ll, center) < Math.PI / 2 - 0.05;
        const on = act.current === k ? "1" : "0";
        const st = (vis ? "v" : "h") + on;
        const pin = pins.current[k];
        if (pin) {
          pin.style.transform = `translate3d(${(xy[0] - 14).toFixed(2)}px, ${(xy[1] - 14).toFixed(2)}px, 0)`;
          if (pinState[k] !== st) {
            pinState[k] = st;
            pin.style.opacity = vis ? "1" : "0";
            pin.style.pointerEvents = vis ? "auto" : "none";
            pin.dataset.on = on;
          }
        }
        const tg = tags.current[k];
        if (tg) {
          const [w, h] = dims[k] ?? [80, 20];
          const e = smooth(size * 0.18, size * 0.26, xy[0]);
          let ox = 8;
          let oy = 10;
          if (k !== "sd") {
            const nx = k === "la" ? -w - 10 : -w / 2;
            const ny = k === "la" ? -h : -h - 14;
            ox = 10 + (nx - 10) * e;
            oy = -h * 1.1 + (ny + h * 1.1) * e;
          }
          tg.style.transform = `translate3d(${(xy[0] + ox).toFixed(2)}px, ${(xy[1] + oy).toFixed(2)}px, 0)`;
          if (tagState[k] !== st) {
            tagState[k] = st;
            tg.style.opacity = vis ? "1" : "0";
            tg.style.pointerEvents = vis ? "auto" : "none";
            tg.dataset.on = on;
          }
        }
      });
    };

    const step = (dt: number) => {
      const d = drag.current;
      if (d) {
        const s = 180 / size;
        rot.current = [wrap(d.r[0] + (d.cx - d.x) * s), clampLat(d.r[1] - (d.cy - d.y) * s)];
        const r = rot.current;
        const iv: [number, number] = [wrap(r[0] - prev[0]) / dt, (r[1] - prev[1]) / dt];
        vel.current = [ease(vel.current[0], iv[0], dt, 0.04), ease(vel.current[1], iv[1], dt, 0.04)];
        prev = [...r];
        return;
      }
      if (reduce) {
        rot.current = [goalBase.current[0], clampLat(goalBase.current[1])];
        vel.current = [0, 0];
        prev = [...rot.current];
        return;
      }
      ofs.current += DRIFT * dt;
      const g0 = goalBase.current[0] + ofs.current;
      const g1 = clampLat(goalBase.current[1]);
      const r = rot.current;
      const sub = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / sub;
      let x0 = r[0];
      let x1 = r[1];
      let v0 = vel.current[0];
      let v1 = vel.current[1];
      for (let i = 0; i < sub; i++) {
        v0 += (OMEGA * OMEGA * wrap(g0 - x0) - 2 * OMEGA * v0) * h;
        v1 += (OMEGA * OMEGA * (g1 - x1) - 2 * OMEGA * v1) * h;
        x0 += v0 * h;
        x1 += v1 * h;
      }
      rot.current = [wrap(x0), clampLat(x1)];
      vel.current = [v0, v1];
      prev = [...rot.current];
    };

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
      last = now;
      if (dt > 0) step(dt);
      paint(now, dt);
      if (seen && !document.hidden) raf = requestAnimationFrame(frame);
      else { running = false; last = 0; }
    };
    const start = () => {
      if (running || !seen || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    kick.current = start;
    paint(performance.now(), 0);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) start(); }, { threshold: 0.01 });
    if (box.current) io.observe(box.current);
    const vis = () => { if (!document.hidden) start(); };
    document.addEventListener("visibilitychange", vis);
    start();
    return () => {
      cancelAnimationFrame(raf);
      running = false;
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
      gpu?.dispose();
      glCanvas.style.opacity = "0";
    };
  }, [size, reduce, labels]);

  const down = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" && e.isPrimary === false) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, cx: e.clientX, cy: e.clientY, r: [...rot.current] as [number, number] };
    vel.current = [0, 0];
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    kick.current();
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    d.cx = e.clientX;
    d.cy = e.clientY;
  };
  const up = () => {
    if (!drag.current) return;
    drag.current = null;
    const v = vel.current;
    const sp = Math.hypot(v[0], v[1]);
    const cap = sp > 240 ? 240 / sp : 1;
    vel.current = [v[0] * cap, v[1] * cap];
    goalBase.current = [rot.current[0] + vel.current[0] / OMEGA, clampLat(rot.current[1] + vel.current[1] / OMEGA)];
    ofs.current = 0;
    kick.current();
  };
  const hover = (k: Spot) => (e: React.PointerEvent) => { if (e.pointerType === "mouse" && !drag.current) onPick(k); };

  return (
    <div ref={box} className="relative cursor-grab select-none active:cursor-grabbing" style={{ width: size, height: size, touchAction: "pan-y", contain: "layout paint" }}
         onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}
         role="img" aria-label={SPOTS.map((k) => SPOT_NAME[k]).join(", ")}>
      <canvas ref={base3d} aria-hidden className="pointer-events-none absolute inset-0 block" style={{ width: size, height: size, opacity: 0 }} />
      <canvas ref={over} aria-hidden className="pointer-events-none absolute inset-0 block" style={{ width: size, height: size }} />
      {SPOTS.map((k) => (
        <button key={k} ref={(el) => { pins.current[k] = el; }} type="button" tabIndex={-1} aria-hidden
          onPointerDown={(e) => e.stopPropagation()} onClick={() => onPick(k)} onPointerEnter={hover(k)}
          className="group absolute left-0 top-0 grid h-7 w-7 cursor-pointer place-items-center rounded-full opacity-0 transition-opacity duration-300 will-change-transform">
          <span className="absolute inset-[2px] scale-0 rounded-full transition-transform duration-300 group-data-[on='1']:scale-100" style={{ background: PIN[SPOT_FLAG[k]], opacity: 0.18 }} />
          <span className="relative h-[14px] w-[14px] rounded-full border-2 border-white" style={{ background: PIN[SPOT_FLAG[k]] }} />
        </button>
      ))}
      {labels && SPOTS.map((k) => (
        <button key={k} ref={(el) => { tags.current[k] = el; }} type="button" tabIndex={-1} aria-hidden
          onPointerDown={(e) => e.stopPropagation()} onClick={() => onPick(k)} onPointerEnter={hover(k)}
          className="group absolute left-0 top-0 cursor-pointer whitespace-nowrap opacity-0 transition-opacity duration-300 will-change-transform">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0B1324]/90 px-2 py-[3px] text-[11.5px] font-medium leading-none text-[#CBD5E1] transition-colors duration-300 group-data-[on='1']:border-white group-data-[on='1']:bg-white group-data-[on='1']:text-[#0F172A]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: PIN[SPOT_FLAG[k]] }} />{SPOT_NAME[k]}
          </span>
        </button>
      ))}
    </div>
  );
}
