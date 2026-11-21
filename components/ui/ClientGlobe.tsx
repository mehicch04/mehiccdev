"use client";

import { useEffect, useRef } from "react";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import type { Flag } from "@/components/ui/Flags";
import { HL, LAND } from "@/components/ui/worldGlobe";

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
const LAND_GEO = { type: "MultiPolygon" as const, coordinates: LAND as unknown as number[][][][] };
const HL_GEO = (k: Flag) => ({ type: "MultiPolygon" as const, coordinates: HL[k] as unknown as number[][][][] });
const GRAT = geoGraticule10();
const FROM: Exclude<Spot, "mo">[] = ["la", "ny", "sd", "yo"];

const target = (k: Spot): [number, number] => [-SPOT_LL[k][0], -SPOT_LL[k][1] * 0.7];
const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

export function ClientGlobe({ size, active, onPick, reduce = false, labels = true }: {
  size: number; active: Spot; onPick: (k: Spot) => void; reduce?: boolean; labels?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const sphere = useRef<SVGPathElement>(null);
  const grat = useRef<SVGPathElement>(null);
  const land = useRef<SVGPathElement>(null);
  const hl = useRef<Partial<Record<Flag, SVGPathElement | null>>>({});
  const arcs = useRef<(SVGPathElement | null)[]>([]);
  const runners = useRef<(SVGCircleElement | null)[]>([]);
  const pins = useRef<Partial<Record<Spot, SVGGElement | null>>>({});
  const tags = useRef<Partial<Record<Spot, HTMLButtonElement | null>>>({});
  const rot = useRef<[number, number]>(target(active));
  const goal = useRef<[number, number]>(target(active));
  const act = useRef<Spot>(active);
  const drag = useRef<{ x: number; y: number; r: [number, number] } | null>(null);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    act.current = active;
    goal.current = target(active);
    kick.current();
  }, [active]);

  useEffect(() => {
    const R = size / 2 - 1;
    const proj = geoOrthographic().scale(R).translate([size / 2, size / 2]).clipAngle(90).precision(0.7);
    const path = geoPath(proj);
    const lines = FROM.map((k) => geoInterpolate(SPOT_LL[k], SPOT_LL.mo));
    const arcD = lines.map((ip) => ({ type: "LineString" as const, coordinates: Array.from({ length: 49 }, (_, j) => ip(j / 48)) }));
    let raf = 0;
    let seen = true;
    let running = false;
    const t0 = performance.now();

    const paint = (now: number) => {
      const r = rot.current;
      proj.rotate([r[0], r[1]]);
      const center: [number, number] = [-r[0], -r[1]];
      sphere.current?.setAttribute("d", path({ type: "Sphere" }) ?? "");
      grat.current?.setAttribute("d", path(GRAT) ?? "");
      land.current?.setAttribute("d", path(LAND_GEO) ?? "");
      const lit = SPOT_FLAG[act.current];
      (Object.keys(PIN) as Flag[]).forEach((f) => {
        const el = hl.current[f];
        if (!el) return;
        el.setAttribute("d", path(HL_GEO(f)) ?? "");
        el.style.opacity = f === lit || (lit === "ba" && f !== "ba") ? (f === lit ? "1" : "0.45") : "0";
      });
      arcD.forEach((g, i) => {
        const el = arcs.current[i];
        if (el) {
          el.setAttribute("d", path(g) ?? "");
          const on = act.current === FROM[i] || act.current === "mo";
          el.setAttribute("stroke", on ? "#9DBDDF" : "#3A4E70");
          el.setAttribute("stroke-width", on ? "1.8" : "1.1");
        }
        const dot = runners.current[i];
        if (dot) {
          const p = ((now - t0) / (3200 + i * 500) + i * 0.23) % 1;
          const ll = lines[i](p);
          const xy = proj(ll);
          const vis = !reduce && geoDistance(ll, center) < Math.PI / 2 - 0.02;
          dot.setAttribute("cx", xy ? xy[0].toFixed(1) : "-99");
          dot.setAttribute("cy", xy ? xy[1].toFixed(1) : "-99");
          dot.style.opacity = vis ? "1" : "0";
        }
      });
      SPOTS.forEach((k) => {
        const ll = SPOT_LL[k];
        const xy = proj(ll);
        const vis = geoDistance(ll, center) < Math.PI / 2 - 0.05;
        const g = pins.current[k];
        const tg = tags.current[k];
        const on = act.current === k;
        if (g && xy) {
          g.setAttribute("transform", `translate(${xy[0].toFixed(1)} ${xy[1].toFixed(1)})`);
          g.style.opacity = vis ? "1" : "0";
          g.style.pointerEvents = vis ? "auto" : "none";
          g.dataset.on = on ? "1" : "0";
        }
        if (tg && xy) {
          const below = k === "sd";
          const edgeL = xy[0] < size * 0.22;
          const off = below ? "8px, 10px" : k === "la" && !edgeL ? "calc(-100% - 10px), -100%" : edgeL ? "10px, -110%" : "-50%, calc(-100% - 14px)";
          tg.style.transform = `translate(${xy[0]}px, ${xy[1]}px) translate(${off})`;
          tg.style.opacity = vis ? "1" : "0";
          tg.style.pointerEvents = vis ? "auto" : "none";
          tg.dataset.on = on ? "1" : "0";
        }
      });
    };

    const frame = (now: number) => {
      if (!drag.current) {
        const r = rot.current;
        const g = goal.current;
        const dl = wrap(g[0] - r[0]);
        const dp = g[1] - r[1];
        const k = reduce ? 1 : 0.075;
        rot.current = [r[0] + dl * k, r[1] + dp * k];
      }
      paint(now);
      if (seen && !document.hidden) raf = requestAnimationFrame(frame);
      else running = false;
    };
    const start = () => {
      if (running || !seen) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    kick.current = start;
    paint(performance.now());
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) start(); }, { threshold: 0.05 });
    if (box.current) io.observe(box.current);
    const vis = () => { if (!document.hidden) start(); };
    document.addEventListener("visibilitychange", vis);
    start();
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, [size, reduce]);

  const down = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" && e.isPrimary === false) return;
    drag.current = { x: e.clientX, y: e.clientY, r: [...rot.current] as [number, number] };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const s = 180 / size;
    rot.current = [d.r[0] + (e.clientX - d.x) * s, Math.max(-60, Math.min(60, d.r[1] - (e.clientY - d.y) * s))];
    kick.current();
  };
  const up = () => {
    if (!drag.current) return;
    drag.current = null;
    goal.current = [...rot.current] as [number, number];
  };

  return (
    <div ref={box} className="relative select-none" style={{ width: size, height: size, touchAction: "pan-y" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block cursor-grab active:cursor-grabbing"
           onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} role="img" aria-label={SPOTS.map((k) => SPOT_NAME[k]).join(", ")}>
        <defs><radialGradient id="cg-shade" cx="42%" cy="38%" r="62%"><stop offset="0" stopColor="#132340" /><stop offset="1" stopColor="#0A1426" /></radialGradient></defs>
        <path ref={sphere} fill="url(#cg-shade)" stroke="#2A3A5A" strokeWidth={1} />
        <path ref={grat} fill="none" stroke="#16243E" strokeWidth={0.6} />
        <path ref={land} fill="#1F2D49" stroke="#2C3D5F" strokeWidth={0.6} strokeLinejoin="round" />
        {(Object.keys(PIN) as Flag[]).map((f) => (
          <path key={f} ref={(el) => { hl.current[f] = el; }} fill={f === "ba" ? "#1C4434" : f === "jp" ? "#463821" : "#3A2537"}
            stroke={PIN[f]} strokeOpacity={0.6} strokeWidth={0.8} style={{ opacity: 0, transition: "opacity 0.45s ease" }} />
        ))}
        {FROM.map((k, i) => <path key={k} ref={(el) => { arcs.current[i] = el; }} fill="none" strokeLinecap="round" style={{ transition: "stroke 0.4s" }} />)}
        {FROM.map((k, i) => <circle key={k} ref={(el) => { runners.current[i] = el; }} r={2.3} fill="#FFFFFF" style={{ opacity: 0 }} />)}
        {SPOTS.map((k) => (
          <g key={k} ref={(el) => { pins.current[k] = el; }} className="group cursor-pointer" style={{ transition: "opacity 0.3s" }}
             onPointerDown={(e) => e.stopPropagation()} onClick={() => onPick(k)} onPointerEnter={(e) => { if (e.pointerType === "mouse") onPick(k); }}>
            <circle r={14} fill="transparent" />
            <circle r={12} fill={PIN[SPOT_FLAG[k]]} fillOpacity={0.18} className="origin-center scale-0 transition-transform duration-300 [transform-box:fill-box] group-data-[on='1']:scale-100" />
            <circle r={6} fill={PIN[SPOT_FLAG[k]]} stroke="#FFFFFF" strokeWidth={2.2} />
          </g>
        ))}
      </svg>
      {labels && SPOTS.map((k) => (
        <button key={k} ref={(el) => { tags.current[k] = el; }} type="button" tabIndex={-1} aria-hidden
          onPointerDown={(e) => e.stopPropagation()} onClick={() => onPick(k)} onPointerEnter={(e) => { if (e.pointerType === "mouse") onPick(k); }}
          className="group absolute left-0 top-0 whitespace-nowrap opacity-0 transition-opacity duration-300">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0B1324]/90 px-2 py-[3px] text-[11.5px] font-medium leading-none text-[#CBD5E1] transition-colors duration-300 group-data-[on='1']:border-white group-data-[on='1']:bg-white group-data-[on='1']:text-[#0F172A]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: PIN[SPOT_FLAG[k]] }} />{SPOT_NAME[k]}
          </span>
        </button>
      ))}
    </div>
  );
}
