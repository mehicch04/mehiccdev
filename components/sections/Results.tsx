"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Loader2, RotateCcw } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Lang = "bs" | "en";
type Content = {
  label: string; h: string; accent: string; sub: string;
  gauges: [number, string][]; verify: string; cta: string; cta2: string;
  card: string; replay: string; ours: string; old: string; loaded: string; loading: string; marker: string; note: string; badge: string;
};

const T: Record<Lang, Content> = {
  bs: {
    label: "Rezultati",
    h: "Svaka sekunda",
    accent: "košta kupca",
    sub: "Stari sajt Maximum Rent a Car se na telefonu otvarao 21,6 sekundi. Novi se otvara za 3,2. Više od polovine ljudi ne čeka duže od 3 sekunde.",
    gauges: [[100, "Performanse"], [100, "SEO"], [90, "Na telefonu"]],
    verify: "Google PageSpeed, provjerite sami",
    cta: "Besplatno provjerimo vaš sajt",
    cta2: "Pogledajte projekat",
    card: "Učitavanje na telefonu",
    replay: "Ponovo",
    ours: "Naša aplikacija",
    old: "Stari sajt",
    loaded: "Učitano",
    loading: "Učitava se",
    marker: "3 s: pola posjetilaca odlazi",
    note: "Prikaz je ubrzan 3 puta.",
    badge: "6,7× brže",
  },
  en: {
    label: "Results",
    h: "Every second",
    accent: "costs you a customer",
    sub: "Maximum Rent a Car's old site took 21.6 seconds to open on a phone. The new one opens in 3.2. More than half of people won't wait longer than 3 seconds.",
    gauges: [[100, "Performance"], [100, "SEO"], [90, "On mobile"]],
    verify: "Google PageSpeed, check it yourself",
    cta: "Get a free check of your site",
    cta2: "See the project",
    card: "Loading on a phone",
    replay: "Replay",
    ours: "Our app",
    old: "Old website",
    loaded: "Loaded",
    loading: "Loading",
    marker: "3 s: half of visitors leave",
    note: "The replay runs 3 times faster.",
    badge: "6.7× faster",
  },
};

const OLD = 21.6;
const NEW = 3.2;
const SPEED = 3;
const R = 15;
const C = 2 * Math.PI * R;
const fmt = (n: number, l: Lang) => n.toFixed(1).replace(".", l === "bs" ? "," : ".");

function Gauge({ v, l }: { v: number; l: string }) {
  return (
    <span className="flex flex-col items-start gap-1.5 rounded-2xl border border-[#E2E8F0] bg-white p-2.5 sm:flex-row sm:items-center sm:gap-2.5 sm:py-2 sm:pl-2 sm:pr-3.5">
      <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90 sm:h-10 sm:w-10" aria-hidden>
        <circle cx="18" cy="18" r={R} fill="none" stroke="#DCFCE7" strokeWidth="3.5" />
        <circle cx="18" cy="18" r={R} fill="none" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} />
      </svg>
      <span className="leading-tight">
        <span className="block text-[17px] font-semibold tabular-nums text-[#0F172A]">{v}</span>
        <span className="block text-[11px] text-[#64748B] sm:text-[11.5px]">{l}</span>
      </span>
    </span>
  );
}

function Row({ label, thumb, end, t, l, d, good, marker }: { label: string; thumb: string; end: number; t: number; l: Lang; d: Content; good: boolean; marker: number }) {
  const done = t >= end;
  const w = (Math.min(t, end) / OLD) * 100;
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[104px] w-[50px] shrink-0 overflow-hidden rounded-[10px] border-[2.5px] border-[#1E293B] bg-[#1E293B]">
        {done ? (
          <Image src={thumb} alt="" fill sizes="50px" className={`race-rise object-cover object-top ${good ? "" : "saturate-50"}`} />
        ) : (
          <span className="absolute inset-0 grid place-items-center bg-[#16213A] text-[#64748B]"><Loader2 size={16} className="animate-spin" /></span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[14px] font-semibold ${good ? "text-white" : "text-[#94A3B8]"}`}>{label}</span>
          {done ? (
            <span className={`race-rise inline-flex items-center gap-1 text-[13px] font-semibold tabular-nums ${good ? "text-[#4ADE80]" : "text-[#94A3B8]"}`}>
              {good && <Check size={14} strokeWidth={3} />}{d.loaded} {fmt(end, l)} s
            </span>
          ) : (
            <span className="text-[13px] tabular-nums text-[#64748B]">{d.loading} {fmt(t, l)} s</span>
          )}
        </div>
        <div className="relative mt-3 h-2.5 rounded-full bg-white/[0.07]">
          <div className={`h-2.5 rounded-full ${good ? "bg-[#4ADE80]" : "bg-[#64748B]"}`} style={{ width: `${w}%` }} />
          <span aria-hidden className="absolute -bottom-1.5 -top-1.5 w-[2px] -translate-x-1/2 rounded-full bg-[#DC2626]" style={{ left: `${marker}%` }} />
        </div>
      </div>
    </div>
  );
}

export function Results() {
  const { lang } = useLanguage();
  const l: Lang = lang === "en" ? "en" : "bs";
  const d = T[l];
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const raf = useRef(0);
  const [t, setT] = useState(0);

  const play = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (reduce) { setT(OLD); return; }
    const start = performance.now() + 250;
    setT(0);
    const step = (now: number) => {
      const next = Math.min(OLD, Math.max(0, (now - start) / 1000) * SPEED);
      setT(next);
      if (next < OLD) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [reduce]);

  useEffect(() => { if (inView) play(); }, [inView, play]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const marker = (3 / OLD) * 100;

  return (
    <section id="rezultati" className="relative scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.label}</p>
          <h2 className="mt-4 text-[34px] leading-[1.08] sm:text-[48px] font-semibold tracking-[-0.03em] text-[#0F172A]" style={{ textWrap: "balance" }}>
            {d.h} <span className="text-[#DC2626]">{d.accent}</span>
          </h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#475569]">{d.sub}</p>
          <div className="mt-7 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
            {d.gauges.map(([v, g]) => <Gauge key={g} v={v} l={g} />)}
          </div>
          <a href="https://pagespeed.web.dev" target="_blank" rel="noopener noreferrer"
             className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-[#64748B] underline decoration-[#CBD5E1] underline-offset-4 hover:text-[#0F172A]">
            {d.verify} <ArrowUpRight size={12} />
          </a>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#kontakt" className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
              {d.cta} <ArrowRight size={15} />
            </a>
            <a href="/maximum" className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-semibold text-[#0F172A] transition-colors hover:border-[#0F172A]">
              {d.cta2} <ArrowRight size={15} />
            </a>
          </div>
        </div>

        <div ref={ref} className="rounded-[28px] bg-[#0F172A] p-6 text-white sm:p-8" style={{ boxShadow: "0 40px 80px -40px rgba(15,23,42,0.6)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-[#8FB3D9]">{d.card}</p>
              <p className="mt-1 text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{fmt(t, l)}<span className="ml-1 text-[22px] text-[#64748B]">s</span></p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`whitespace-nowrap rounded-full bg-[#16A34A]/15 px-3 py-1.5 text-[12.5px] font-semibold text-[#4ADE80] transition-opacity duration-500 ${t >= OLD ? "opacity-100" : "opacity-0"}`}>{d.badge}</span>
              <button type="button" onClick={play} aria-label={d.replay}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/15 px-3 text-[13px] font-semibold transition-colors hover:bg-white/[0.06]">
                <RotateCcw size={14} /> {d.replay}
              </button>
            </div>
          </div>

          <div className="relative mt-8 space-y-5">
            <Row label={d.ours} thumb="/portfolio/maximum-poslije-mob.webp" end={NEW} t={t} l={l} d={d} good marker={marker} />
            <Row label={d.old} thumb="/portfolio/maximum-prije-mob.webp" end={OLD} t={t} l={l} d={d} good={false} marker={marker} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pl-[66px] text-[12px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#F87171]"><span className="h-3 w-[2px] rounded-full bg-[#DC2626]" />{d.marker}</span>
            <span className="text-[#64748B]">{d.note}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
