"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Clock, Gift, Linkedin, ShieldCheck, ShieldHalf, Zap } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { W_CITIES, W_DOTS, W_H, W_W } from "@/components/ui/geo";
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
    h1: "Iskustvo iz Amerike.",
    h1b: "Standard za naše tržište.",
    sub: "Radili smo za digitalne agencije iz New Yorka, Los Angelesa i San Diega, na sistemima koji moraju raditi godinama bez zastoja. To znanje smo donijeli kući i pretvorili u sistem koji domaćim firmama nudimo po domaćim cijenama.",
    name: "Bakir Mehić", role: ["Osnivač mehiccdev-a", "QA i Lead Developer"], li: "LinkedIn profil",
    primary: "Kako bi radilo kod mene?", secondary: "Isporučeni projekti",
    cities: ["New York", "Los Angeles", "San Diego"], home: "Mostar, danas",
    careLabel: "Uključeno u svaki sistem",
    care: [
      { t: "3 mjeseca podrške gratis", d: "Nakon predaje smo tu za sve izmjene i pitanja, bez naplate." },
      { t: "12 mjeseci garancije", d: "Ako nešto ne radi kako treba, javite se i popravljamo besplatno." },
      { t: "Zaštita podataka", d: "Zaštita od upada i krađe podataka, po standardu stranog tržišta." },
    ],
    subLabel: "Mjesečna podrška", subOpt: "po želji, nije obavezna", subPrice: "100 €", subPer: "/mj",
    subItems: [
      { I: Clock, t: "4 sata rada mjesečno" },
      { I: Zap, t: "Prioritet kad nešto zatreba" },
    ],
  },
  en: {
    eyebrow: "About · Mostar",
    h1: "Experience from the US.",
    h1b: "A standard for our market.",
    sub: "We worked for digital agencies from New York, Los Angeles and San Diego, on systems that have to run for years without downtime. We brought that knowledge home and turned it into a system we offer local companies at local prices.",
    name: "Bakir Mehić", role: ["Founder of mehiccdev", "QA and Lead Developer"], li: "LinkedIn profile",
    primary: "How would it work for me?", secondary: "Delivered projects",
    cities: ["New York", "Los Angeles", "San Diego"], home: "Mostar, today",
    careLabel: "Included with every system",
    care: [
      { t: "3 months of free support", d: "After delivery we handle changes and questions at no cost." },
      { t: "12 month warranty", d: "If something doesn't work as it should, we fix it for free." },
      { t: "Data protection", d: "Protection against breaches and data theft, to foreign market standards." },
    ],
    subLabel: "Monthly support", subOpt: "optional, never required", subPrice: "€100", subPer: "/mo",
    subItems: [
      { I: Clock, t: "4 hours of work a month" },
      { I: Zap, t: "Priority when you need something" },
    ],
  },
};

function Pin({ x, y, c, d, reduce }: { x: number; y: number; c: string; d: number; reduce: boolean }) {
  return (
    <g>
      {!reduce && (
        <motion.circle cx={x} cy={y} r={7} fill={c} initial={{ scale: 1, opacity: 0.45 }} animate={{ scale: 3.2, opacity: 0 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: d }} style={{ transformOrigin: `${x}px ${y}px` }} />
      )}
      <circle cx={x} cy={y} r={6} fill={c} stroke="#FFFFFF" strokeWidth={2.5} />
    </g>
  );
}

function WorldMap({ reduce }: { reduce: boolean }) {
  const [mx, my] = W_CITIES.mo;
  const arc = (k: "ny" | "la") => {
    const [x, y] = W_CITIES[k];
    return `M${x} ${y} Q${(x + mx) / 2} ${Math.min(y, my) - 90} ${mx} ${my}`;
  };
  return (
    <svg viewBox={`0 0 ${W_W} ${W_H}`} className="w-full" aria-hidden>
      {W_DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.1} fill="#24324D" />)}
      {(["ny", "la"] as const).map((k, i) => (
        <motion.path key={k} d={arc(k)} fill="none" stroke="#8FB3D9" strokeWidth={1.8}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{ duration: 1.8, delay: 0.6 + i * 0.3, ease: EASE }} />
      ))}
      {(["ny", "la", "sd"] as const).map((k, i) => <Pin key={k} x={W_CITIES[k][0]} y={W_CITIES[k][1]} c="#DC2626" d={i * 0.4} reduce={reduce} />)}
      <Pin x={mx} y={my} c="#16A34A" d={1} reduce={reduce} />
    </svg>
  );
}

function AboutHero() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  const reduce = useReducedMotion() ?? false;
  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: i * 0.08, ease: EASE } });

  return (
    <section data-hero data-dark className="hero-light relative overflow-hidden text-white" style={{ background: "linear-gradient(180deg,#0B1324 0%,#0F172A 100%)" }}>
      <div className="pointer-events-none absolute top-28 hidden lg:block" style={{ left: "36%", width: "88%" }}><WorldMap reduce={reduce} /></div>
      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-32 sm:pt-36 lg:px-8 lg:pb-20">
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

        <motion.div {...rise(5)} className="mt-8 flex flex-wrap gap-2 lg:justify-end">
          {d.cities.map((c) => <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0F172A] px-3 py-1 text-[12px]"><span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />{c}</span>)}
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
  return (
    <main className="relative bg-white">
      <AboutHero />
      <About />
      <Clients />
      <Process />
      <Booking />
    </main>
  );
}
