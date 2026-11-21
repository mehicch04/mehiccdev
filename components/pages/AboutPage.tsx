"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Clock, Gift, Linkedin, ShieldCheck, ShieldHalf, Zap } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { W_CITIES } from "@/components/ui/geo";
import { HL_FLAT, LAND_FLAT } from "@/components/ui/worldFlat";
import { MapIntro } from "@/components/ui/MapIntro";
import { FlagIcon } from "@/components/ui/Flags";
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
    careLabel: "Uključeno u svaki sistem",
    care: [
      { t: "3 mjeseca podrške gratis", d: "Nakon predaje smo tu za sve izmjene i pitanja, bez naplate." },
      { t: "12 mjeseci garancije", d: "Ako nešto ne radi kako treba, javite se i popravljamo besplatno." },
      { t: "Zaštita podataka", d: "Zaštita od upada i krađe podataka, po standardu stranog tržišta." },
    ],
    subLabel: "Mjesečna podrška", subOpt: "po želji, nije obavezna", subPrice: "100 €", subPer: "/mj",
    where: "Gdje smo stekli iskustvo",
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
    careLabel: "Included with every system",
    care: [
      { t: "3 months of free support", d: "After delivery we handle changes and questions at no cost." },
      { t: "12 month warranty", d: "If something doesn't work as it should, we fix it for free." },
      { t: "Data protection", d: "Protection against breaches and data theft, to foreign market standards." },
    ],
    subLabel: "Monthly support", subOpt: "optional, never required", subPrice: "€100", subPer: "/mo",
    where: "Where we gained our experience",
    subItems: [
      { I: Clock, t: "4 hours of work a month" },
      { I: Zap, t: "Priority when you need something" },
    ],
  },
};

type Spot = "ny" | "la" | "sd" | "yo" | "mo";
type Flag = "us" | "jp" | "ba";
const SPOTS: Spot[] = ["ny", "la", "sd", "yo", "mo"];
const VB = { x: 60, y: 30, w: 880, h: 440 };
const PT: Record<Spot, readonly [number, number]> = { ny: W_CITIES.ny, la: [W_CITIES.la[0] - 4, W_CITIES.la[1] - 7], sd: [W_CITIES.sd[0] + 6, W_CITIES.sd[1] + 9], yo: W_CITIES.yo, mo: W_CITIES.mo };
const FLAG: Record<Spot, Flag> = { ny: "us", la: "us", sd: "us", yo: "jp", mo: "ba" };
const TONE: Record<Flag, { pin: string; text: string }> = { us: { pin: "#DC2626", text: "#F87171" }, jp: { pin: "#F59E0B", text: "#FBBF24" }, ba: { pin: "#16A34A", text: "#4ADE80" } };
const SPOT_TXT: Record<"bs" | "en", Record<Spot, { c: string; n: string; t: string; d: string; y: string }>> = {
  bs: {
    ny: { c: "New York", n: "SAD", t: "Digitalna agencija", d: "QA i razvoj web aplikacija", y: "2023 do 2025" },
    la: { c: "Los Angeles", n: "SAD", t: "Digitalna agencija", d: "Testiranje sistema prije objave", y: "2023 do 2025" },
    sd: { c: "San Diego", n: "SAD", t: "Digitalna agencija", d: "QA za klijentske platforme", y: "2023 do 2025" },
    yo: { c: "Yokohama", n: "Japan", t: "Mozmene", d: "Freelance QA", y: "freelance" },
    mo: { c: "Mostar", n: "BiH", t: "mehiccdev", d: "Isti standard za domaće firme", y: "od 2025" },
  },
  en: {
    ny: { c: "New York", n: "USA", t: "Digital agency", d: "QA and web app development", y: "2023 to 2025" },
    la: { c: "Los Angeles", n: "USA", t: "Digital agency", d: "Testing systems before launch", y: "2023 to 2025" },
    sd: { c: "San Diego", n: "USA", t: "Digital agency", d: "QA for client platforms", y: "2023 to 2025" },
    yo: { c: "Yokohama", n: "Japan", t: "Mozmene", d: "Freelance QA", y: "freelance" },
    mo: { c: "Mostar", n: "BiH", t: "mehiccdev", d: "The same standard for local firms", y: "since 2025" },
  },
};

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

function WorldMap({ on, pick, go, live, fade = false }: { on: Spot; pick: (k: Spot) => void; go: boolean; live: boolean; fade?: boolean }) {
  const [mx, my] = PT.mo;
  const arc = (k: Exclude<Spot, "mo">) => {
    const [x, y] = PT[k];
    return `M${x} ${y} Q${(x + mx) / 2} ${Math.min(y, my) - 90} ${mx} ${my}`;
  };
  const lit = FLAG[on];
  return (
    <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className={`block w-full ${fade ? "[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]" : ""}`} role="img"
         aria-label={SPOTS.map((k) => SPOT_TXT.bs[k].c).join(", ")}>
      <path d={LAND_FLAT} fill="#1A2741" stroke="#24344F" strokeWidth={0.6} strokeLinejoin="round" />
      {(Object.keys(HL_FLAT) as Flag[]).map((k) => (
        <path key={k} d={HL_FLAT[k]} fill={k === "us" ? "#3B2433" : k === "jp" ? "#43361E" : "#1D4433"} stroke={TONE[k].pin} strokeWidth={0.8}
          style={{ opacity: lit === k ? 1 : 0, transition: "opacity 0.45s ease" }} />
      ))}
      {(["ny", "la", "sd", "yo"] as const).map((k, i) => (
        <g key={k}>
          <motion.path d={arc(k)} fill="none" stroke={on === k || on === "mo" ? "#9DBDDF" : "#3B4E6E"} strokeWidth={on === k ? 2.2 : 1.4} strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={go ? { pathLength: 1, opacity: 0.95 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 1.6, delay: 0.4 + i * 0.2, ease: EASE }} style={{ transition: "stroke 0.4s, stroke-width 0.4s" }} />
          {live && (
            <circle r={3} fill="#FFFFFF">
              <animateMotion dur={`${3.2 + i * 0.6}s`} begin={`${2.2 + i * 0.5}s`} repeatCount="indefinite" path={arc(k)} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
            </circle>
          )}
        </g>
      ))}
      {SPOTS.map((k) => {
        const [x, y] = PT[k];
        const act = on === k;
        return (
          <g key={k} className="cursor-pointer" onPointerEnter={(e) => { if (e.pointerType === "mouse") pick(k); }} onClick={() => pick(k)}>
            <circle cx={x} cy={y} r={20} fill="transparent" />
            <motion.circle cx={x} cy={y} fill="none" stroke={TONE[FLAG[k]].pin} strokeWidth={2} initial={false}
              animate={act && live ? { r: [7, 20], opacity: [0.7, 0] } : { r: 7, opacity: 0 }}
              transition={act && live ? { duration: 1.6, repeat: Infinity, ease: "easeOut" } : { duration: 0.2 }} />
            <motion.circle cx={x} cy={y} fill={TONE[FLAG[k]].pin} stroke="#FFFFFF" strokeWidth={2.5} initial={false} animate={{ r: act ? 8 : 6 }} transition={{ duration: 0.3, ease: EASE }} />
          </g>
        );
      })}
    </svg>
  );
}

function Places({ on, pick, lang, title }: { on: Spot; pick: (k: Spot) => void; lang: "bs" | "en"; title: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[#0B1220]/95 p-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
      <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8FB3D9]">{title}</p>
      <ul>
        {SPOTS.map((k) => {
          const x = SPOT_TXT[lang][k];
          const f = FLAG[k];
          const act = on === k;
          return (
            <li key={k}>
              <button type="button" onPointerEnter={(e) => { if (e.pointerType === "mouse") pick(k); }} onClick={() => pick(k)} aria-pressed={act}
                className={`relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-300 ${act ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}>
                <span className={`absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-full transition-opacity duration-300 ${act ? "opacity-100" : "opacity-0"}`} style={{ background: TONE[f].pin }} />
                <span className="mt-[3px] self-start"><FlagIcon f={f} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="flex items-baseline gap-1.5">
                      <span className={`text-[14px] font-semibold transition-colors ${act ? "text-white" : "text-[#CBD5E1]"}`}>{x.c}</span>
                      <span className="text-[11.5px] font-medium" style={{ color: TONE[f].text }}>{x.n}</span>
                    </span>
                    <span className={`shrink-0 text-[11.5px] tabular-nums transition-colors ${act ? "text-white" : "text-[#64748B]"}`}>{x.y}</span>
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-[#94A3B8]"><span className="text-[#CBD5E1]">{x.t}</span> · {x.d}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AboutHero({ go }: { go: boolean }) {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  const l: "bs" | "en" = lang === "en" ? "en" : "bs";
  const reduce = useReducedMotion() ?? false;
  const lg = useLg();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { amount: 0.2 });
  const [on, setOn] = useState<Spot>("ny");
  const [hold, setHold] = useState(false);
  const live = go && seen && !reduce;
  useEffect(() => {
    if (!live || hold) return;
    const id = window.setInterval(() => setOn((v) => SPOTS[(SPOTS.indexOf(v) + 1) % SPOTS.length]), 3200);
    return () => window.clearInterval(id);
  }, [live, hold]);
  const pick = useCallback((k: Spot) => { setOn(k); setHold(true); }, []);
  const rise = (i: number) => (reduce
    ? {}
    : { initial: { opacity: 0, y: 18 }, animate: go ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }, transition: { duration: 0.6, delay: go ? i * 0.08 : 0, ease: EASE } });

  return (
    <section ref={ref} data-hero data-dark className="hero-light relative overflow-hidden text-white" style={{ background: "linear-gradient(180deg,#0B1324 0%,#0F172A 100%)" }}
             onPointerLeave={(e) => { if (e.pointerType === "mouse") setHold(false); }}>
      {lg && (
        <motion.div {...rise(2)} className="absolute top-[130px] [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_96%,transparent)]" style={{ left: "37%", width: "66%" }}>
          <WorldMap on={on} pick={pick} go={go} live={live} />
        </motion.div>
      )}
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
          <motion.div {...rise(5)} className="absolute right-8 top-[400px] w-[410px]"><Places on={on} pick={pick} lang={l} title={d.where} /></motion.div>
        ) : (
          <motion.div {...rise(5)} className="mt-10 space-y-4">
            <div className="-mx-4"><WorldMap on={on} pick={pick} go={go} live={live} fade /></div>
            <Places on={on} pick={pick} lang={l} title={d.where} />
          </motion.div>
        )}

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
  const [go, setGo] = useState(false);
  const done = useCallback(() => setGo(true), []);
  useEffect(() => {
    if (!document.documentElement.hasAttribute("data-map")) setGo(true);
  }, []);
  return (
    <main className="relative bg-white">
      <MapIntro onDone={done} />
      <AboutHero go={go} />
      <About />
      <Clients />
      <Process />
      <Booking />
    </main>
  );
}
