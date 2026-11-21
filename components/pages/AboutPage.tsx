"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Clock, Gift, Linkedin, ShieldCheck, ShieldHalf, Zap } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { W_CITIES, W_DOTS } from "@/components/ui/geo";
import { MapIntro } from "@/components/ui/MapIntro";
import { About } from "@/components/sections/About";
import { Clients } from "@/components/sections/Clients";
import { Process } from "@/components/sections/Process";
import { Booking } from "@/components/sections/Booking";

const EASE = [0.22, 1, 0.36, 1] as const;
const LINKEDIN = "https://www.linkedin.com/in/bakir-mehic-qa-engineer/";
const CARE_ICONS = [Gift, ShieldCheck, ShieldHalf];

const T = {
  bs: {
    eyebrow: "O nama · Mostar",
    h1: "Iskustvo iz Amerike i Japana.",
    h1b: "Standard za naše tržište.",
    sub: "Radili smo za digitalne agencije iz New Yorka, Los Angelesa i San Diega i za japansku firmu Mozmene iz Yokohame, na sistemima koji moraju raditi godinama bez zastoja. To znanje smo donijeli kući i pretvorili u sistem koji domaćim firmama nudimo po domaćim cijenama.",
    name: "Bakir Mehić", role: ["Osnivač mehiccdev-a", "QA i Lead Developer"], li: "LinkedIn profil",
    primary: "Kako bi radilo kod mene?", secondary: "Isporučeni projekti",
    cities: ["New York", "Los Angeles", "San Diego", "Yokohama"], home: "Mostar, danas",
    careLabel: "Uključeno u svaki sistem",
    care: [
      { t: "3 mjeseca podrške gratis", d: "Nakon predaje smo tu za sve izmjene i pitanja, bez naplate." },
      { t: "12 mjeseci garancije", d: "Ako nešto ne radi kako treba, javite se i popravljamo besplatno." },
      { t: "Zaštita podataka", d: "Zaštita od upada i krađe podataka, po standardu stranog tržišta." },
    ],
    subLabel: "Mjesečna podrška", subOpt: "po želji, nije obavezna", subPrice: "100 €", subPer: "/mj",
    qa: { t: "Kontrola kvaliteta prije predaje", p: "Maximum Rent a Car", done: "Spremno za predaju", of: "provjera prošlo",
      items: ["Rezervacija bez duplog termina", "Forma radi na svakom telefonu", "Zaštita od neovlaštenog pristupa", "Sva 4 jezika provjerena", "Učitavanje ispod 3,5 s"] },
    subItems: [
      { I: Clock, t: "4 sata rada mjesečno" },
      { I: Zap, t: "Prioritet kad nešto zatreba" },
    ],
  },
  en: {
    eyebrow: "About · Mostar",
    h1: "Experience from the US and Japan.",
    h1b: "A standard for our market.",
    sub: "We worked for digital agencies from New York, Los Angeles and San Diego and for Mozmene, a Japanese company from Yokohama, on systems that have to run for years without downtime. We brought that knowledge home and turned it into a system we offer local companies at local prices.",
    name: "Bakir Mehić", role: ["Founder of mehiccdev", "QA and Lead Developer"], li: "LinkedIn profile",
    primary: "How would it work for me?", secondary: "Delivered projects",
    cities: ["New York", "Los Angeles", "San Diego", "Yokohama"], home: "Mostar, today",
    careLabel: "Included with every system",
    care: [
      { t: "3 months of free support", d: "After delivery we handle changes and questions at no cost." },
      { t: "12 month warranty", d: "If something doesn't work as it should, we fix it for free." },
      { t: "Data protection", d: "Protection against breaches and data theft, to foreign market standards." },
    ],
    subLabel: "Monthly support", subOpt: "optional, never required", subPrice: "€100", subPer: "/mo",
    qa: { t: "Quality check before delivery", p: "Maximum Rent a Car", done: "Ready for delivery", of: "checks passed",
      items: ["Bookings without double slots", "Form works on every phone", "Protected from unauthorised access", "All 4 languages checked", "Loads in under 3.5 s"] },
    subItems: [
      { I: Clock, t: "4 hours of work a month" },
      { I: Zap, t: "Priority when you need something" },
    ],
  },
};

type Spot = "ny" | "la" | "sd" | "yo" | "mo";
const SPOTS: Spot[] = ["ny", "la", "sd", "yo", "mo"];
const VB = { x: 60, y: 30, w: 880, h: 440 };
const PT: Record<Spot, readonly [number, number]> = { ny: W_CITIES.ny, la: [W_CITIES.la[0] - 4, W_CITIES.la[1] - 7], sd: [W_CITIES.sd[0] + 6, W_CITIES.sd[1] + 9], yo: W_CITIES.yo, mo: W_CITIES.mo };
const SPOT_TXT: Record<"bs" | "en", Record<Spot, { c: string; t: string; d: string; y: string }>> = {
  bs: {
    ny: { c: "New York", t: "Digitalna agencija", d: "QA i razvoj web aplikacija", y: "2023 do 2025" },
    la: { c: "Los Angeles", t: "Digitalna agencija", d: "Testiranje sistema prije objave", y: "2023 do 2025" },
    sd: { c: "San Diego", t: "Digitalna agencija", d: "QA za klijentske platforme", y: "2023 do 2025" },
    yo: { c: "Yokohama", t: "Mozmene", d: "Freelance QA za japansku firmu", y: "Japan" },
    mo: { c: "Mostar", t: "mehiccdev", d: "Isti standard za domaće firme", y: "od 2025" },
  },
  en: {
    ny: { c: "New York", t: "Digital agency", d: "QA and web app development", y: "2023 to 2025" },
    la: { c: "Los Angeles", t: "Digital agency", d: "Testing systems before launch", y: "2023 to 2025" },
    sd: { c: "San Diego", t: "Digital agency", d: "QA for client platforms", y: "2023 to 2025" },
    yo: { c: "Yokohama", t: "Mozmene", d: "Freelance QA for a Japanese company", y: "Japan" },
    mo: { c: "Mostar", t: "mehiccdev", d: "The same standard for local firms", y: "since 2025" },
  },
};

const DOTS_D = W_DOTS.map(([x, y]) => `M${x} ${y}h0`).join("");

function useLg() {
  const [lg, setLg] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const on = () => setLg(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return lg;
}

function Tip({ on, lang }: { on: Spot; lang: "bs" | "en" }) {
  const tip = SPOT_TXT[lang][on];
  return (
    <>
      <p className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
        <span className={on === "mo" ? "text-[#4ADE80]" : on === "yo" ? "text-[#FBBF24]" : "text-[#F87171]"}>{tip.c}</span>
        <span className="text-[#64748B]">{tip.y}</span>
      </p>
      <p className="mt-1.5 text-[14px] font-semibold text-white">{tip.t}</p>
      <p className="text-[12.5px] text-[#94A3B8]">{tip.d}</p>
    </>
  );
}

function WorldMap({ reduce, lang, inline = false }: { reduce: boolean; lang: "bs" | "en"; inline?: boolean }) {
  const [mx, my] = PT.mo;
  const [on, setOn] = useState<Spot>("ny");
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { amount: 0.2 });
  const live = seen && !reduce;
  useEffect(() => {
    if (hover || !live) return;
    const id = window.setInterval(() => setOn((v) => SPOTS[(SPOTS.indexOf(v) + 1) % SPOTS.length]), 3200);
    return () => window.clearInterval(id);
  }, [hover, live]);
  const arc = (k: "ny" | "la" | "sd" | "yo") => {
    const [x, y] = PT[k];
    return `M${x} ${y} Q${(x + mx) / 2} ${Math.min(y, my) - 90} ${mx} ${my}`;
  };
  const [tx, ty] = PT[on];
  const right = (tx - VB.x) / VB.w > 0.55;
  return (
    <div ref={ref} className="relative" onPointerLeave={() => setHover(false)}>
      <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className={`block w-full ${inline ? "[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]" : ""}`} role="img" aria-label={SPOTS.map((k) => SPOT_TXT[lang][k].c).join(", ")}>
        <path d={DOTS_D} stroke="#24324D" strokeWidth={4.2} strokeLinecap="round" fill="none" />
        {(["ny", "la", "sd", "yo"] as const).map((k, i) => (
          <g key={k}>
            <motion.path d={arc(k)} fill="none" stroke={on === k || on === "mo" ? "#8FB3D9" : "#3B4E6E"} strokeWidth={on === k ? 2.2 : 1.4}
              initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.95 }}
              transition={{ duration: 1.8, delay: 0.6 + i * 0.3, ease: EASE }} style={{ transition: "stroke 0.4s, stroke-width 0.4s" }} />
            {live && (
              <circle r={3.2} fill="#FFFFFF">
                <animateMotion dur={`${3.2 + i * 0.6}s`} begin={`${2.4 + i * 0.5}s`} repeatCount="indefinite" path={arc(k)} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
              </circle>
            )}
          </g>
        ))}
        {SPOTS.map((k, i) => {
          const [x, y] = PT[k];
          const c = k === "mo" ? "#16A34A" : k === "yo" ? "#F59E0B" : "#DC2626";
          return (
            <g key={k} className="cursor-pointer" onPointerEnter={(e) => { if (e.pointerType === "mouse") { setHover(true); setOn(k); } }} onClick={() => setOn(k)}>
              <circle cx={x} cy={y} r={20} fill="transparent" />
              {live && (
                <motion.circle cx={x} cy={y} r={7} fill={c} initial={{ scale: 1, opacity: 0.45 }} animate={{ scale: 3.2, opacity: 0 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }} style={{ transformOrigin: `${x}px ${y}px` }} />
              )}
              <motion.circle cx={x} cy={y} fill={c} stroke="#FFFFFF" strokeWidth={2.5} initial={false} animate={{ r: on === k ? 8 : 6 }} transition={{ duration: 0.3, ease: EASE }} />
            </g>
          );
        })}
      </svg>
      {inline ? (
        <div className="mx-4 mt-3 rounded-xl border border-white/10 bg-[#0B1220] p-3" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={on} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: EASE }}>
              <Tip on={on} lang={lang} />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <motion.div key={on} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}
          className="pointer-events-none absolute w-[230px] rounded-xl border border-white/10 bg-[#0B1220] p-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)]"
          style={{ left: `calc(${((tx - VB.x) / VB.w) * 100}% ${right ? "- 250px" : "+ 20px"})`, top: `calc(${((ty - VB.y) / VB.h) * 100}% + 14px)` }}>
          <Tip on={on} lang={lang} />
        </motion.div>
      )}
    </div>
  );
}

function QaCard({ q, reduce }: { q: (typeof T)["bs"]["qa"]; reduce: boolean }) {
  const n = q.items.length;
  const [k, setK] = useState(reduce ? n : 0);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { amount: 0.3 });
  useEffect(() => {
    if (reduce || !seen) return;
    const id = window.setTimeout(() => setK((v) => (v >= n ? 0 : v + 1)), k === 0 ? 1600 : k >= n ? 5200 : 650);
    return () => window.clearTimeout(id);
  }, [k, n, reduce, seen]);
  const ok = k >= n;
  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
      <div className="flex items-center justify-between gap-3">
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8FB3D9]">{q.t}</span>
          <span className="block text-[12.5px] text-[#64748B]">{q.p}</span>
        </span>
        <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tabular-nums transition-colors duration-300 ${ok ? "bg-[#16A34A] text-white" : "bg-white/[0.06] text-[#CBD5E1]"}`}>
          {ok ? q.done : `${k}/${n}`}
        </span>
      </div>
      <span className="mt-3 block h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.span className="block h-full rounded-full bg-[#16A34A]" initial={false} animate={{ width: `${(k / n) * 100}%` }} transition={{ duration: 0.45, ease: EASE }} />
      </span>
      <ul className="mt-3 space-y-1.5">
        {q.items.map((t, i) => {
          const pass = i < k;
          const run = i === k && !ok;
          return (
            <li key={t} className={`flex items-center gap-2.5 text-[12.5px] transition-colors duration-300 ${pass ? "text-[#E2E8F0]" : "text-[#64748B]"}`}>
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${pass ? "border-[#16A34A] bg-[#16A34A]" : run ? "border-[#8FB3D9]" : "border-white/15"}`}>
                {pass && <svg viewBox="0 0 12 12" className="h-2.5 w-2.5"><path d="M2.5 6.2 5 8.5 9.5 3.8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                {run && <motion.span className="h-1.5 w-1.5 rounded-full bg-[#8FB3D9]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />}
              </span>
              {t}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AboutHero() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  const reduce = useReducedMotion() ?? false;
  const lg = useLg();
  const l: "bs" | "en" = lang === "en" ? "en" : "bs";
  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: i * 0.08, ease: EASE } });

  return (
    <section data-hero data-dark className="hero-light relative overflow-hidden text-white" style={{ background: "linear-gradient(180deg,#0B1324 0%,#0F172A 100%)" }}>
      {lg && <div className="absolute top-[150px] [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_96%,transparent)]" style={{ left: "37%", width: "66%" }}><WorldMap reduce={reduce} lang={l} /></div>}
      <div className="pointer-events-none relative mx-auto max-w-6xl px-6 pb-16 pt-32 sm:pt-36 lg:px-8 lg:pb-20 [&>*]:pointer-events-auto">
        <div className="max-w-xl">
          <motion.span {...rise(0)} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[12.5px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />{d.eyebrow}
          </motion.span>
          <motion.h1 {...rise(1)} className="mt-6 text-[40px] font-semibold leading-[1.04] tracking-[-0.04em] sm:text-[54px]" style={{ textWrap: "balance" }}>
            {d.h1}<span className="block text-[#8FB3D9]">{d.h1b}</span>
          </motion.h1>
          <motion.p {...rise(2)} className="mt-6 text-[16.5px] leading-relaxed text-[#CBD5E1]">{d.sub}</motion.p>
          <motion.div {...rise(3)} className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 pr-3">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl"><Image src="/team/bakir.jpg" alt={d.name} fill sizes="48px" className="object-cover" /></span>
            <span className="min-w-0">
              <span className="block text-[14.5px] font-semibold">{d.name}</span>
              <span className="block text-[12.5px] leading-snug text-[#94A3B8]"><span className="block sm:inline">{d.role[0]}</span><span className="hidden sm:inline"> · </span><span className="block sm:inline">{d.role[1]}</span></span>
            </span>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label={d.li} title={d.li}
               className="ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#0A66C2] text-white transition-colors hover:bg-[#004182]">
              <Linkedin size={16} />
            </a>
          </motion.div>
          <motion.div {...rise(4)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#zakazi" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0F172A] transition-colors hover:bg-[#E2E8F0]">
              {d.primary} <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a href="/portfolio" className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-white/30">
              {d.secondary} <ArrowUpRight size={15} className="opacity-60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </div>

        {lg ? (
          <motion.div {...rise(5)} className="absolute right-8 top-[452px] w-[380px]"><QaCard q={d.qa} reduce={reduce} /></motion.div>
        ) : (
          <motion.div {...rise(5)} className="mt-10 space-y-4">
            <div className="-mx-4"><WorldMap reduce={reduce} lang={l} inline /></div>
            <QaCard q={d.qa} reduce={reduce} />
          </motion.div>
        )}
        <motion.div {...rise(5)} className="mt-8 flex flex-wrap gap-2 lg:justify-end">
          {d.cities.map((c) => <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0F172A] px-3 py-1 text-[12px]"><span className={`h-1.5 w-1.5 rounded-full ${c === "Yokohama" ? "bg-[#F59E0B]" : "bg-[#DC2626]"}`} />{c}</span>)}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#16A34A]/40 bg-[#0F172A] px-3 py-1 text-[12px]"><span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />{d.home}</span>
        </motion.div>

        <motion.div {...rise(6)} className="mt-12 grid overflow-hidden rounded-[22px] border border-white/10 lg:grid-cols-[3fr_1.15fr]">
          <div className="p-6 sm:p-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8FB3D9]">{d.careLabel}</p>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              {d.care.map((c, i) => {
                const I = CARE_ICONS[i];
                return (
                  <div key={c.t}>
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#16A34A]/15 text-[#4ADE80]"><I size={17} /></span>
                    <p className="mt-3 text-[15px] font-semibold">{c.t}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#94A3B8]">{c.d}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-6 sm:p-7 lg:border-l lg:border-t-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8FB3D9]">{d.subLabel}</p>
            <p className="mt-0.5 text-[12px] text-[#64748B]">{d.subOpt}</p>
            <p className="mt-4 text-[32px] font-semibold leading-none tracking-tight">{d.subPrice}<span className="text-[14px] font-medium text-[#94A3B8]">{d.subPer}</span></p>
            <ul className="mt-4 space-y-2">
              {d.subItems.map(({ I, t }) => <li key={t} className="flex items-center gap-2.5 text-[13.5px] text-[#E2E8F0]"><I size={15} className="text-[#4ADE80]" />{t}</li>)}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function AboutPage() {
  const [run, setRun] = useState(0);
  const done = useCallback(() => setRun(1), []);
  return (
    <main className="relative bg-white">
      <MapIntro onDone={done} />
      <AboutHero key={run} />
      <About />
      <Clients />
      <Process />
      <Booking />
    </main>
  );
}
