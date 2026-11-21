"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, CalendarCheck, ChevronLeft, ChevronRight, Search, ShieldCheck, Wallet } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { ClientGlobe, SPOTS, SPOT_FLAG, SPOT_NAME, type Spot } from "@/components/ui/ClientGlobe";
import { FlagIcon } from "@/components/ui/Flags";

type L = "bs" | "en";
type Info = { firm: string; land: string; role: string; when: string; took: string; tags: string[] };

const EASE = [0.22, 1, 0.36, 1] as const;
const STEP = 4200;
const TONE = { us: "#F87171", jp: "#FBBF24", ba: "#4ADE80" } as const;
const PERKS = [Search, CalendarCheck, Wallet, ShieldCheck];

const T = {
  bs: {
    eyebrow: "Iskustvo iz SAD i Japana", about: "O nama",
    h1a: "Ne treba vam sajt.", h1b: "Treba vam most do klijenata.",
    sub: "Sistemi koji primaju upite i rezervacije 24/7, građeni po standardu firmi iz Amerike i Japana.",
    cta: "Zakažite besplatan poziv", cta2: "Pogledajte Maximum uživo",
    perks: [
      { t: "Pronađu vas na Googleu", d: "SEO i brzina 100/100" },
      { t: "Rezervacije 24/7", d: "i dok vi spavate" },
      { t: "Plaćate jednom", d: "0 KM mjesečne pretplate" },
      { t: "12 mjeseci garancije", d: "popravke bez naplate" },
    ],
    took: "Šta smo donijeli kući", hint: "Povucite planetu ili izaberite grad", prev: "Prethodni grad", next: "Sljedeći grad",
    info: {
      la: { firm: "Conspire Agency", land: "SAD", role: "QA i razvoj Shopify Plus prodavnica", when: "2023 do 2025", took: "Testiranje prije svake objave, bez izuzetka", tags: ["Shopify Plus Premier partner", "E-commerce"] },
      ny: { firm: "Partneri Conspire-a", land: "SAD", role: "QA za web shopove klijenata", when: "2023 do 2025", took: "Provjera na svakom uređaju i pregledniku", tags: ["Web shopovi", "QA"] },
      sd: { firm: "Partneri Conspire-a", land: "SAD", role: "Testiranje e-commerce platformi", when: "2023 do 2025", took: "Brzina i stabilnost pod opterećenjem", tags: ["E-commerce", "Performanse"] },
      yo: { firm: "Mozmene", land: "Japan", role: "Freelance QA", when: "freelance", took: "Japanska preciznost do detalja", tags: ["Japansko tržište", "QA"] },
      mo: { firm: "mehiccdev", land: "BiH", role: "Rezervacioni sistemi i sajtovi", when: "od 2025", took: "Sve to, za domaće firme i po domaćim cijenama", tags: ["Do 4 jezika", "0 KM mjesečno"] },
    } as Record<Spot, Info>,
  },
  en: {
    eyebrow: "Experience from the US and Japan", about: "About us",
    h1a: "You don't need a website.", h1b: "You need a bridge to clients.",
    sub: "Systems that take inquiries and bookings 24/7, built to the standard of companies in the US and Japan.",
    cta: "Book a free call", cta2: "See Maximum live",
    perks: [
      { t: "Found on Google", d: "SEO and 100/100 speed" },
      { t: "Bookings 24/7", d: "even while you sleep" },
      { t: "Pay once", d: "€0 monthly subscription" },
      { t: "12 month warranty", d: "fixes at no cost" },
    ],
    took: "What we brought home", hint: "Drag the planet or pick a city", prev: "Previous city", next: "Next city",
    info: {
      la: { firm: "Conspire Agency", land: "USA", role: "QA and development of Shopify Plus stores", when: "2023 to 2025", took: "Testing before every release, no exceptions", tags: ["Shopify Plus Premier partner", "E-commerce"] },
      ny: { firm: "Conspire partners", land: "USA", role: "QA for client web shops", when: "2023 to 2025", took: "Checks on every device and browser", tags: ["Web shops", "QA"] },
      sd: { firm: "Conspire partners", land: "USA", role: "Testing e-commerce platforms", when: "2023 to 2025", took: "Speed and stability under load", tags: ["E-commerce", "Performance"] },
      yo: { firm: "Mozmene", land: "Japan", role: "Freelance QA", when: "freelance", took: "Japanese attention to detail", tags: ["Japanese market", "QA"] },
      mo: { firm: "mehiccdev", land: "BiH", role: "Booking systems and websites", when: "since 2025", took: "All of it, for local companies at local prices", tags: ["Up to 4 languages", "€0 monthly"] },
    } as Record<Spot, Info>,
  },
};

const STARS = (() => {
  let s = 7;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  return Array.from({ length: 110 }, () => ({ x: r() * 1440, y: r() * 560, r: 0.5 + r() * 1.1, o: 0.2 + r() * 0.6, t: r() < 0.14 }));
})();

function Stars() {
  return (
    <svg aria-hidden viewBox="0 0 1440 560" preserveAspectRatio="xMidYMin slice" className="pointer-events-none absolute inset-x-0 top-0 h-[78%] w-full [mask-image:linear-gradient(180deg,#000_55%,transparent)]">
      <style>{"@keyframes hw-tw{0%,100%{opacity:var(--o)}50%{opacity:.08}}@media (prefers-reduced-motion:reduce){.hw-t{animation:none!important}}"}</style>
      {STARS.map((st, i) => (
        <circle key={i} cx={st.x.toFixed(1)} cy={st.y.toFixed(1)} r={st.r.toFixed(2)} fill="#E2E8F0" opacity={st.o.toFixed(2)}
          className={st.t ? "hw-t" : undefined}
          style={st.t ? ({ "--o": st.o.toFixed(2), animation: `hw-tw ${3 + (i % 5)}s ease-in-out ${(i % 7) * 0.6}s infinite` } as React.CSSProperties) : undefined} />
      ))}
    </svg>
  );
}

function useSize(ref: React.RefObject<HTMLElement>) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

function Card({ on, d, l, run, go, pick }: { on: Spot; d: (typeof T)["bs"]; l: L; run: boolean; go: (dir: 1 | -1) => void; pick: (k: Spot) => void }) {
  const x = d.info[on];
  const f = SPOT_FLAG[on];
  const idx = SPOTS.indexOf(on);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]/95 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.85)]" aria-live="polite">
      <div className="p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={on + l} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: EASE }}>
            <p className="flex items-center justify-between gap-3 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.1em]">
              <span className="flex items-center gap-2" style={{ color: TONE[f] }}><FlagIcon f={f} />{SPOT_NAME[on]} · {x.land}</span>
              <span className="text-[#64748B]">{x.when}</span>
            </p>
            <p className="mt-2 text-[16px] font-semibold text-white">{x.firm}</p>
            <p className="text-[13px] text-[#94A3B8]">{x.role}</p>
            <div className="mt-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8FB3D9]">{d.took}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-[#E2E8F0]">{x.took}</p>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {x.tags.map((t) => <span key={t} className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-[#CBD5E1]">{t}</span>)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2 border-t border-white/[0.07] px-3 py-2">
        <button type="button" onClick={() => go(-1)} aria-label={d.prev} className="grid h-7 w-7 place-items-center rounded-lg text-[#94A3B8] transition-colors hover:bg-white/[0.06] hover:text-white"><ChevronLeft size={15} /></button>
        <div className="flex flex-1 items-center gap-0.5">
          {SPOTS.map((k, i) => (
            <button key={k} type="button" onClick={() => pick(k)} aria-label={SPOT_NAME[k]} aria-current={i === idx ? "step" : undefined} title={SPOT_NAME[k]}
              className="group/s flex h-7 flex-1 items-center px-[2px]">
              <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/[0.08] transition-[height,background-color] duration-200 group-hover/s:h-[5px] group-hover/s:bg-white/20">
                {i < idx && <span className="absolute inset-0 bg-white/40" />}
                {i === idx && <span key={on + String(run)} className="absolute inset-0 origin-left bg-white" style={run ? { animation: `hw-bar ${STEP}ms linear forwards` } : undefined} />}
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label={d.next} className="grid h-7 w-7 place-items-center rounded-lg text-[#94A3B8] transition-colors hover:bg-white/[0.06] hover:text-white"><ChevronRight size={15} /></button>
      </div>
      <style>{"@keyframes hw-bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}"}</style>
    </div>
  );
}

export function HeroWorld() {
  const { lang } = useLanguage();
  const l: L = lang === "en" ? "en" : "bs";
  const d = T[l];
  const reduce = useReducedMotion() ?? false;
  const root = useRef<HTMLElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const seen = useInView(root, { amount: 0.25 });
  const w = useSize(slot);
  const [on, setOn] = useState<Spot>("la");
  const [hold, setHold] = useState(false);
  const run = seen && !hold && !reduce;

  useEffect(() => {
    const html = document.documentElement;
    if (html.hasAttribute("data-most")) html.removeAttribute("data-most");
    try { sessionStorage.setItem("mehiccdev-intro", "1"); } catch {}
  }, []);

  useEffect(() => {
    if (!run) return;
    const id = window.setTimeout(() => setOn((v) => SPOTS[(SPOTS.indexOf(v) + 1) % SPOTS.length]), STEP);
    return () => window.clearTimeout(id);
  }, [on, run]);

  useEffect(() => {
    if (!hold) return;
    const id = window.setTimeout(() => setHold(false), 9000);
    return () => window.clearTimeout(id);
  }, [hold, on]);

  const pick = useCallback((k: Spot) => { setOn(k); setHold(true); }, []);
  const go = useCallback((dir: 1 | -1) => { setOn((v) => SPOTS[(SPOTS.indexOf(v) + dir + SPOTS.length) % SPOTS.length]); setHold(true); }, []);
  const size = Math.max(260, Math.min(w, 480));
  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.05 + i * 0.07, ease: EASE } });

  return (
    <section ref={root} data-hero data-dark aria-labelledby="hero-title" className="hero-light relative isolate overflow-hidden text-white"
             style={{ background: "linear-gradient(180deg,#070D1B 0%,#0B1428 45%,#141A36 80%,#1A1B3A 100%)" }}>
      <Stars />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-[0.55] [mask-image:linear-gradient(180deg,transparent_15%,#000_65%)]">
        <Image src="/hero/most-sumrak.svg" alt="" width={1520} height={463} unoptimized priority className="w-full" />
      </div>

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-24 pt-28 sm:px-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-6 lg:px-8 lg:pb-64 lg:pt-36">
        <div>
          <motion.a {...rise(0)} href="/o-nama" className="group inline-flex h-8 items-center gap-2.5 rounded-full border border-white/[0.14] bg-[#050913]/40 pl-1.5 pr-3 text-[13px] font-medium text-[#CBD5E1] transition-colors duration-200 hover:border-white/30 hover:text-white">
            <span className="flex h-5 items-center gap-1 rounded-full bg-white/[0.08] px-1.5" aria-hidden>
              <FlagIcon f="us" /><FlagIcon f="jp" />
            </span>
            {d.eyebrow}
            <span className="flex items-center gap-1 border-l border-white/[0.14] pl-2.5 font-semibold text-white">{d.about}<ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" /></span>
          </motion.a>
          <motion.h1 {...rise(1)} id="hero-title" className="mt-7 text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] sm:text-[52px] lg:text-[56px] xl:text-[60px]">
            <span className="block text-[#9AABCA]">{d.h1a}</span>{d.h1b}
          </motion.h1>
          <motion.p {...rise(2)} className="mt-6 max-w-[440px] text-[16px] leading-relaxed text-[#C3CEE0] sm:text-[18px]">{d.sub}</motion.p>
          <motion.div {...rise(3)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#zakazi" className="cta-primary group inline-flex h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#DC2626] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
              {d.cta} <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a href="https://maximum-rent.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/20 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white/35 hover:bg-white/[0.05]">
              {d.cta2} <ArrowUpRight size={15} className="opacity-60" />
            </a>
          </motion.div>
          <motion.ul {...rise(4)} className="mt-9 grid max-w-xl grid-cols-1 gap-x-6 gap-y-3.5 border-t border-white/10 pt-6 sm:grid-cols-2 sm:gap-y-4">
            {d.perks.map((p, i) => {
              const I = PERKS[i];
              return (
                <li key={p.t} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#16A34A]/15 text-[#4ADE80]"><I size={16} /></span>
                  <span><span className="block text-[14px] font-semibold leading-tight text-white">{p.t}</span><span className="mt-0.5 block text-[12.5px] text-[#94A3B8]">{p.d}</span></span>
                </li>
              );
            })}
          </motion.ul>
        </div>

        <motion.div {...rise(2)} className="relative flex flex-col items-center lg:translate-x-6 lg:items-start min-[1400px]:translate-x-20">
          <div ref={slot} className="w-full max-w-[480px]">
            {w > 0 && <ClientGlobe size={size} active={on} onPick={pick} reduce={reduce} labels={size > 330} />}
          </div>
          <div className="relative z-10 mt-4 w-full max-w-[480px] lg:absolute lg:-right-2 lg:bottom-[-36px] lg:mt-0 lg:w-[330px] min-[1400px]:-right-12">
            <Card on={on} d={d} l={l} run={run} go={go} pick={pick} />
          </div>
          <p className="mt-3 self-center text-[11.5px] text-[#64748B] lg:hidden">{d.hint}</p>
        </motion.div>
      </div>
    </section>
  );
}
