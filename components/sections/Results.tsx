"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Loader2, RotateCcw } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Lang = "bs" | "en";
type Content = {
  label: string; h: string; accent: string; sub: string;
  gauges: [number, string][]; verify: string; cta: string;
  same: string; replay: string; ready: string; ours: string; old: string; loaded: string; loading: string; left: string; marker: string; note: string; ahead: (x: string) => string;
};

const T: Record<Lang, Content> = {
  bs: {
    label: "Brzina",
    h: "Svaka sekunda",
    accent: "košta kupca",
    sub: "Stari sajt Maximum Rent a Car se na telefonu otvarao 21,6 sekundi. Novi se otvara za 3,2. Više od polovine ljudi ne čeka duže od 3 sekunde.",
    gauges: [[100, "Performanse"], [100, "SEO"], [90, "Na telefonu"]],
    verify: "Google PageSpeed, provjerite sami",
    cta: "Besplatno provjerimo vaš sajt",
    same: "Isti telefon. Isti internet.",
    replay: "Ponovo",
    ready: "Novi sajt je spreman",
    ours: "Novi sajt",
    old: "Stari sajt",
    loaded: "Učitano",
    loading: "učitava se",
    left: "još",
    marker: "Nakon 3 s pola posjetilaca odlazi",
    note: "Prikaz je ubrzan 3 puta.",
    ahead: (x) => `Novi sajt je bio spreman ${x} s ranije`,
  },
  en: {
    label: "Speed",
    h: "Every second",
    accent: "costs you a customer",
    sub: "Maximum Rent a Car's old site took 21.6 seconds to open on a phone. The new one opens in 3.2. More than half of people won't wait longer than 3 seconds.",
    gauges: [[100, "Performance"], [100, "SEO"], [90, "On mobile"]],
    verify: "Google PageSpeed, check it yourself",
    cta: "Get a free check of your site",
    same: "Same phone. Same connection.",
    replay: "Replay",
    ready: "The new site is ready",
    ours: "New site",
    old: "Old site",
    loaded: "Loaded",
    loading: "loading",
    left: "",
    marker: "After 3 s, half of visitors leave",
    note: "The replay runs 3 times faster.",
    ahead: (x) => `The new site was ready ${x} s sooner`,
  },
};

const OLD = 21.6;
const NEW = 3.2;
const SPEED = 3;
const R = 24;
const C = 2 * Math.PI * R;
const EASE = [0.22, 1, 0.36, 1] as const;
const fmt = (n: number, l: Lang) => n.toFixed(1).replace(".", l === "bs" ? "," : ".");

function Gauge({ v, l, on }: { v: number; l: string; on: boolean }) {
  return (
    <span className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-left">
      <span className="relative h-[54px] w-[54px] shrink-0">
        <svg viewBox="0 0 54 54" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="27" cy="27" r={R} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="4.5" />
          <motion.circle cx="27" cy="27" r={R} fill="none" stroke="#4ADE80" strokeWidth="4.5" strokeLinecap="round" strokeDasharray={C}
            initial={false} animate={{ strokeDashoffset: on ? C * (1 - v / 100) : C }} transition={{ duration: 1.2, ease: EASE }} />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[15px] font-semibold tabular-nums text-[#4ADE80]">{v}</span>
      </span>
      <span className="text-[13.5px] leading-tight text-[#94A3B8]">{l}</span>
    </span>
  );
}

function Skeleton() {
  return (
    <span className="absolute inset-0 flex flex-col gap-[6%] bg-[#F1F5F9] px-[7%] pt-[22%]">
      <span className="race-sk block h-[22%] rounded-xl bg-[#E2E8F0]" />
      <span className="race-sk block h-[3.2%] w-[70%] rounded-full bg-[#E2E8F0]" />
      <span className="race-sk block h-[3.2%] w-[88%] rounded-full bg-[#E2E8F0]" />
      <span className="race-sk block h-[3.2%] w-[52%] rounded-full bg-[#E2E8F0]" />
      <span className="race-sk block h-[16%] rounded-xl bg-[#E2E8F0]" />
      <span className="absolute left-1/2 top-[64%] grid -translate-x-1/2 place-items-center text-[#94A3B8]"><Loader2 size={26} className="animate-spin" /></span>
    </span>
  );
}

function Phone({ src, t, end, good, d, l }: { src: string; t: number; end: number; good: boolean; d: Content; l: Lang }) {
  const done = t >= end;
  const part = good ? 100 : t >= 14 ? 50 : t >= 6 ? 18 : 0;
  return (
    <div className="relative mx-auto w-full max-w-[210px]" style={{ containerType: "inline-size" }}>
      <div className="bg-[#05070D]" style={{ borderRadius: "17cqw", padding: "3.6cqw", boxShadow: "0 30px 70px -25px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
        <div className="relative aspect-[9/17] overflow-hidden bg-white" style={{ borderRadius: "13.5cqw" }}>
          {!done && <Skeleton />}
          {(done || part > 0) && (
            <Image src={src} alt="" fill sizes="210px" quality={85}
              className={`object-cover object-top transition-[clip-path,filter] duration-700 ${good ? "" : "saturate-[.6]"} ${done ? "race-rise" : ""}`}
              style={{ clipPath: done ? "inset(0 0 0 0)" : `inset(0 0 ${100 - part}% 0)` }} />
          )}
        </div>
      </div>
      <span className={`absolute -right-3 top-6 inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-semibold tabular-nums sm:-right-5 ${done
        ? good ? "border-[#4ADE80]/30 bg-[#052E1A] text-[#4ADE80]" : "border-white/10 bg-[#1E293B] text-[#CBD5E1]"
        : "border-white/10 bg-[#1E293B] text-[#94A3B8]"}`}>
        {done ? <>{good && <Check size={12} strokeWidth={3} />}{fmt(end, l)} s</> : <>{d.loading}</>}
      </span>
    </div>
  );
}

function Lane({ label, t, end, good, d, l, marker }: { label: string; t: number; end: number; good: boolean; d: Content; l: Lang; marker?: number }) {
  const done = t >= end;
  const w = (Math.min(t, end) / end) * 100;
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className={`whitespace-nowrap font-semibold ${good ? "text-white" : "text-[#94A3B8]"}`}>{label}</span>
        {done
          ? <span className={`whitespace-nowrap font-semibold tabular-nums ${good ? "text-[#4ADE80]" : "text-[#94A3B8]"}`}><span className="hidden sm:inline">{d.loaded} </span>{fmt(end, l)} s</span>
          : <span className="whitespace-nowrap tabular-nums text-[#64748B]">{d.left} {fmt(end - t, l)} s</span>}
      </div>
      <div className="relative mt-2.5 h-2 rounded-full bg-white/[0.08]">
        <div className={`h-2 rounded-full ${good ? "bg-gradient-to-r from-[#16A34A] to-[#4ADE80]" : "bg-[#64748B]"}`} style={{ width: `${w}%` }} />
        {marker !== undefined && <span aria-hidden className="absolute -bottom-1.5 -top-1.5 w-[2px] -translate-x-1/2 rounded-full bg-[#F87171]" style={{ left: `${marker}%` }} />}
      </div>
    </div>
  );
}

export function SpeedProof() {
  const { lang } = useLanguage();
  const l: Lang = lang === "en" ? "en" : "bs";
  const d = T[l];
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const raf = useRef(0);
  const [t, setT] = useState(0);

  const play = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (reduce) { setT(OLD); return; }
    const start = performance.now() + 300;
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

  const ready = t >= NEW;
  const over = t >= OLD;

  return (
    <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: EASE }}>
        <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />{d.label}
        </span>
        <h3 className="mt-5 text-[38px] font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-[54px]" style={{ textWrap: "balance" }}>
          {d.h}<br /><span className="bg-gradient-to-r from-[#FB7185] to-[#DC2626] bg-clip-text text-transparent">{d.accent}</span>
        </h3>
        <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#94A3B8]">{d.sub}</p>
        <div className="mt-8 grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-x-7 sm:gap-y-4">
          {d.gauges.map(([v, g]) => <Gauge key={g} v={v} l={g} on={inView} />)}
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a href="#zakazi" className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
            {d.cta} <ArrowRight size={15} />
          </a>
          <a href="https://pagespeed.web.dev" target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-[13px] text-[#94A3B8] underline decoration-white/20 underline-offset-4 hover:text-white">
            {d.verify} <ArrowUpRight size={12} />
          </a>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5 text-white backdrop-blur sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-[#94A3B8]">{d.same}</span>
          <button type="button" onClick={play} aria-label={d.replay}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/15 px-3 text-[13px] font-semibold transition-colors hover:bg-white/[0.06]">
            <RotateCcw size={14} /> {d.replay}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="text-[54px] font-semibold leading-none tracking-[-0.04em] tabular-nums sm:text-[68px]">{fmt(t, l)}<span className="ml-1.5 text-[26px] text-[#64748B] sm:text-[32px]">s</span></span>
          <span className={`inline-flex items-center gap-1.5 rounded-full border border-[#4ADE80]/25 bg-[#4ADE80]/[0.12] px-3 py-1 text-[12.5px] font-semibold text-[#4ADE80] transition-all duration-500 ${ready ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
            <Check size={13} strokeWidth={3} /> {over ? d.ahead(fmt(OLD - NEW, l)) : d.ready}
          </span>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-5 sm:gap-8">
          <div>
            <Phone src="/portfolio/maximum-poslije-mob.webp" t={t} end={NEW} good d={d} l={l} />
            <Lane label={d.ours} t={t} end={NEW} good d={d} l={l} />
          </div>
          <div>
            <Phone src="/portfolio/maximum-prije-mob.webp" t={t} end={OLD} good={false} d={d} l={l} />
            <Lane label={d.old} t={t} end={OLD} good={false} d={d} l={l} marker={(3 / OLD) * 100} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-2 font-semibold text-[#F87171]"><span className="h-3.5 w-[2px] rounded-full bg-[#F87171]" />{d.marker}</span>
          <span className="text-[#64748B]">{d.note}</span>
        </div>
      </motion.div>
    </div>
  );
}
