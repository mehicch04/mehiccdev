"use client";

import { useEffect, useRef } from "react";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { FlagIcon, type Flag } from "@/components/ui/Flags";
import { HL, LAND } from "@/components/ui/worldGlobe";

type Key = "ny" | "la" | "sd" | "yo" | "mo";
const PLACES: { k: Key; name: string; ll: [number, number]; flag: Flag; c: string; at: number; dx: number; dy: number }[] = [
  { k: "ny", name: "New York", ll: [-74.006, 40.7128], flag: "us", c: "#DC2626", at: 350, dx: 0, dy: -1 },
  { k: "la", name: "Los Angeles", ll: [-118.2437, 34.0522], flag: "us", c: "#DC2626", at: 650, dx: -1, dy: -0.4 },
  { k: "sd", name: "San Diego", ll: [-117.1611, 32.7157], flag: "us", c: "#DC2626", at: 950, dx: -0.2, dy: 1 },
  { k: "yo", name: "Yokohama", ll: [139.638, 35.4437], flag: "jp", c: "#F59E0B", at: 2150, dx: 0, dy: 1 },
  { k: "mo", name: "Mostar", ll: [17.8078, 43.3438], flag: "ba", c: "#16A34A", at: 3500, dx: 0, dy: 1 },
];
const KEYS: { t: number; r: [number, number] }[] = [
  { t: 0, r: [100, -30] },
  { t: 1300, r: [100, -30] },
  { t: 2150, r: [218, -28] },
  { t: 2600, r: [218, -28] },
  { t: 3550, r: [352, -36] },
];
const ARC_FROM = 2650;
const ARC_MS = 1000;
export const DONE = 4900;
const TXT = {
  bs: { us: "SAD", jp: "Japan", ba: "BiH", from: "Znanje iz SAD i Japana", to: "sada u Mostaru", skip: "Preskoči" },
  en: { us: "USA", jp: "Japan", ba: "BiH", from: "Know-how from the US and Japan", to: "now in Mostar", skip: "Skip" },
};
const LAND_GEO = { type: "MultiPolygon" as const, coordinates: LAND as unknown as number[][][][] };
const HL_GEO = (k: Flag) => ({ type: "MultiPolygon" as const, coordinates: HL[k] as unknown as number[][][][] });
const GRAT = geoGraticule10();
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function rotAt(t: number): [number, number] {
  for (let i = 1; i < KEYS.length; i++) {
    const a = KEYS[i - 1];
    const b = KEYS[i];
    if (t <= b.t) {
      const k = ease((t - a.t) / Math.max(1, b.t - a.t));
      return [a.r[0] + (b.r[0] - a.r[0]) * k, a.r[1] + (b.r[1] - a.r[1]) * k];
    }
  }
  return KEYS[KEYS.length - 1].r;
}


export default function Globe({ size, lang, onReady }: { size: number; lang: "bs" | "en"; onReady?: () => void }) {
  const d = TXT[lang];
  const sphere = useRef<SVGPathElement>(null);
  const grat = useRef<SVGPathElement>(null);
  const land = useRef<SVGPathElement>(null);
  const hl = useRef<Record<Flag, SVGPathElement | null>>({ us: null, jp: null, ba: null });
  const arcs = useRef<(SVGPathElement | null)[]>([]);
  const pins = useRef<(SVGGElement | null)[]>([]);
  const chips = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const R = size / 2 - 2;
    const proj = geoOrthographic().scale(R).translate([size / 2, size / 2]).clipAngle(90).precision(0.6);
    const path = geoPath(proj);
    const mo = PLACES[4].ll;
    const lines = PLACES.slice(0, 4).map((p) => geoInterpolate(p.ll, mo));
    let raf = 0;
    const t0 = performance.now();
    onReady?.();
    const frame = (now: number) => {
      const t = now - t0;
      const r = rotAt(t);
      proj.rotate([r[0], r[1]]);
      const center: [number, number] = [-r[0], -r[1]];
      sphere.current?.setAttribute("d", path({ type: "Sphere" }) ?? "");
      grat.current?.setAttribute("d", path(GRAT) ?? "");
      land.current?.setAttribute("d", path(LAND_GEO) ?? "");
      const lit: Record<Flag, number> = { us: t > 300 && t < 1900 ? 1 : 0, jp: t > 2050 && t < 3050 ? 1 : 0, ba: t > 3350 ? 1 : 0 };
      (Object.keys(hl.current) as Flag[]).forEach((k) => {
        const el = hl.current[k];
        if (!el) return;
        el.setAttribute("d", path(HL_GEO(k)) ?? "");
        el.style.opacity = String(lit[k]);
      });
      const ap = Math.min(1, Math.max(0, (t - ARC_FROM) / ARC_MS));
      lines.forEach((ip, i) => {
        const el = arcs.current[i];
        if (!el) return;
        const k = ease(ap);
        if (k <= 0) { el.setAttribute("d", ""); return; }
        const n = 48;
        const coords = Array.from({ length: n + 1 }, (_, j) => ip((j / n) * k));
        el.setAttribute("d", path({ type: "LineString", coordinates: coords }) ?? "");
      });
      PLACES.forEach((p, i) => {
        const xy = proj(p.ll);
        const vis = geoDistance(p.ll, center) < Math.PI / 2 - 0.04;
        const on = t > p.at;
        const leg = p.flag === "us" ? t < 1900 || t > 3300 : p.flag === "jp" ? t < 3050 : true;
        const g = pins.current[i];
        const c = chips.current[i];
        if (g && xy) {
          g.setAttribute("transform", `translate(${xy[0].toFixed(1)} ${xy[1].toFixed(1)}) scale(${on && vis && (leg || p.flag !== "us") ? 1 : 0.001})`);
        }
        if (c && xy) {
          const show = on && vis && leg;
          c.style.transform = `translate(${xy[0]}px, ${xy[1]}px)`;
          c.style.opacity = show ? "1" : "0";
        }
      });
      if (t < DONE + 800) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size, onReady]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block" aria-hidden>
        <path ref={sphere} fill="#0E1A30" stroke="#24324F" strokeWidth={1} />
        <path ref={grat} fill="none" stroke="#15223B" strokeWidth={0.6} />
        <path ref={land} fill="#1E2B46" stroke="#2B3B5C" strokeWidth={0.6} strokeLinejoin="round" />
        {(["us", "jp", "ba"] as Flag[]).map((k) => (
          <path key={k} ref={(el) => { hl.current[k] = el; }} fill={k === "ba" ? "#1F4D3A" : k === "jp" ? "#4A3B1E" : "#3B2A3A"}
            stroke={k === "ba" ? "#16A34A" : k === "jp" ? "#F59E0B" : "#DC2626"} strokeWidth={0.8} style={{ transition: "opacity 0.5s ease", opacity: 0 }} />
        ))}
        {PLACES.slice(0, 4).map((p, i) => (
          <path key={p.k} ref={(el) => { arcs.current[i] = el; }} fill="none" stroke="#9DBDDF" strokeWidth={1.8} strokeLinecap="round" />
        ))}
        {PLACES.map((p, i) => (
          <g key={p.k} ref={(el) => { pins.current[i] = el; }} transform="scale(0.001)" style={{ transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
            <circle r={p.k === "mo" ? 7 : 5.5} fill={p.c} stroke="#FFFFFF" strokeWidth={2.2} />
          </g>
        ))}
      </svg>
      {PLACES.map((p, i) => (
        <div key={p.k} ref={(el) => { chips.current[i] = el; }} className="pointer-events-none absolute left-0 top-0 opacity-0" style={{ transition: "opacity 0.35s ease" }}>
          <div style={{ transform: `translate(${p.dx < 0 ? "calc(-100% - 12px)" : p.dx > 0 ? "12px" : "-50%"}, ${p.dy < 0 ? "calc(-100% - 12px)" : p.dy > 0 ? "12px" : "-50%"})` }}>
            <span className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border bg-[#0B1324] py-1 pl-1.5 pr-2 sm:gap-2 sm:py-1.5 sm:pl-2 sm:pr-2.5 ${p.k === "mo" ? "border-[#16A34A]/60" : "border-white/15"}`}>
              <FlagIcon f={p.flag} />
              <span className="text-[11px] font-semibold text-white sm:text-[13.5px]">{p.name}</span>
              <span className="text-[10px] font-medium sm:text-[11.5px]" style={{ color: p.flag === "jp" ? "#FBBF24" : p.flag === "ba" ? "#4ADE80" : "#F87171" }}>{d[p.flag]}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
