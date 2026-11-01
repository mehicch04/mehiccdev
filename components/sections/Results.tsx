"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Rocket, PhoneOff, Clock, ArrowUpRight, RotateCcw, Check, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Lang = "bs" | "en";

type Content = {
  label: string; heading1: string; headingAccent: string; sub: string;
  raceTitle: string; raceSub: string; oldLabel: string; newLabel: string;
  loadedLabel: string; stillLabel: string; loadingLabel: string; fasterBadge: string; raceNote: string;
  replay: string; oldUrl: string; waiting: string;
  scrubLabel: string; patience: string;
  mock: { heading: string; pickup: string; dropoff: string; search: string; free: string; cars: string[]; welcome: string };
  gaugesCaptionPre: string; gaugesLink: string;
  gauges: { v: number; l: string; s: string }[];
  facts: { t: string }[];
};

const T: Record<Lang, Content> = {
  bs: {
    label: "Rezultati",
    heading1: "Brojke koje",
    headingAccent: "možete provjeriti",
    sub: "Bez izmišljenih prosjeka i procenata. Ovo su stvarna Google mjerenja s našeg zadnjeg projekta, ista koja možete izmjeriti i sami.",
    raceTitle: "Koliko brzo se otvara?",
    raceSub: "Isti biznis, prije i poslije. Mjereno na telefonu, Google PageSpeed alatom.",
    oldLabel: "Stari sajt klijenta",
    newLabel: "Naša aplikacija",
    loadedLabel: "Učitano za",
    stillLabel: "Još se učitava…",
    loadingLabel: "Učitava se…",
    fasterBadge: "6,7× brže",
    raceNote: "Više od polovine posjetilaca odustane ako se stranica ne otvori za oko 3 sekunde. Na staroj brzini, ti ljudi nikad ne vide ponudu. Prikaz je ubrzan tri puta.",
    replay: "Pokreni ponovo",
    oldUrl: "stari sajt",
    waiting: "Gost čeka…",
    scrubLabel: "Povucite i pogledajte šta gost vidi u svakoj sekundi",
    patience: "oko 3 s: više od pola posjetilaca odlazi",
    mock: {
      heading: "Iznajmite auto u par klikova",
      pickup: "Preuzimanje",
      dropoff: "Povrat",
      search: "Pretraži",
      free: "Slobodno",
      cars: ["Ekonomična", "Kompaktna", "SUV"],
      welcome: "Dobrodošli",
    },
    gaugesCaptionPre: "Google PageSpeed ocjene, Maximum Rent a Car. Mjerenje možete ponoviti sami na",
    gaugesLink: "pagespeed.web.dev",
    gauges: [
      { v: 100, l: "Performanse", s: "desktop" },
      { v: 100, l: "SEO", s: "vidljivost na Googlu" },
      { v: 100, l: "Pristupačnost", s: "za sve korisnike" },
      { v: 90,  l: "Na telefonu", s: "performanse, mobitel" },
    ],
    facts: [
      { t: "Završeni projekti su uživo i rade u produkciji" },
      { t: "Gost rezerviše bez ijednog telefonskog poziva" },
      { t: "Odgovaramo u roku od 24 sata, obično isti dan" },
    ],
  },
  en: {
    label: "Results",
    heading1: "Numbers you can",
    headingAccent: "verify yourself",
    sub: "No invented averages or percentages. These are real Google measurements from our latest project, the same ones you can run yourself.",
    raceTitle: "How fast does it open?",
    raceSub: "The same business, before and after. Measured on mobile with Google PageSpeed.",
    oldLabel: "Client's old website",
    newLabel: "Our application",
    loadedLabel: "Loaded in",
    stillLabel: "Still loading…",
    loadingLabel: "Loading…",
    fasterBadge: "6.7× faster",
    raceNote: "More than half of visitors give up if a page doesn't open within about 3 seconds. At the old speed, those people never even see the offer. The replay runs three times faster.",
    replay: "Play again",
    oldUrl: "old website",
    waiting: "The guest is waiting…",
    scrubLabel: "Drag to see what a guest sees at every second",
    patience: "around 3 s: over half of visitors leave",
    mock: {
      heading: "Rent a car in a few clicks",
      pickup: "Pick-up",
      dropoff: "Return",
      search: "Search",
      free: "Available",
      cars: ["Economy", "Compact", "SUV"],
      welcome: "Welcome",
    },
    gaugesCaptionPre: "Google PageSpeed scores, Maximum Rent a Car. You can run the measurement again yourself at",
    gaugesLink: "pagespeed.web.dev",
    gauges: [
      { v: 100, l: "Performance", s: "desktop" },
      { v: 100, l: "SEO", s: "Google visibility" },
      { v: 100, l: "Accessibility", s: "for all users" },
      { v: 90,  l: "On mobile", s: "performance, phone" },
    ],
    facts: [
      { t: "Finished projects are live and running in production" },
      { t: "A guest books without a single phone call" },
      { t: "We reply within 24 hours, usually the same day" },
    ],
  },
};

const FACT_ICONS: LucideIcon[] = [Rocket, PhoneOff, Clock];

const OLD_SEC = 21.6;
const NEW_SEC = 3.2;
const SPEED = 3;
const PATIENCE = 3;
const RING = 2 * Math.PI * 23;

const fmt = (n: number, lang: string) => n.toFixed(1).replace(".", lang === "en" ? "." : ",");

function Browser({ url, progress, muted, children }: { url: string; progress: number; muted?: boolean; children: React.ReactNode }) {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white">
      <div className="flex items-center gap-1.5 border-b border-[#EEF2F6] bg-[#F8FAFC] px-3 py-2.5">
        <i className="block h-[9px] w-[9px] rounded-full bg-[#E2E8F0]" />
        <i className="block h-[9px] w-[9px] rounded-full bg-[#E2E8F0]" />
        <i className="block h-[9px] w-[9px] rounded-full bg-[#E2E8F0]" />
        <span className={`ml-2 flex h-[22px] min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap rounded-[6px] border border-[#EEF2F6] bg-white px-2 text-[11px] ${muted ? "text-[#94A3B8]" : "text-[#64748B]"}`}>
          {url}
        </span>
      </div>
      <div className="h-0.5 bg-[#F1F5F9]">
        <div className={`h-0.5 ${muted ? "bg-[#94A3B8]" : "bg-[#16A34A]"}`} style={{ width: `${progress}%` }} />
      </div>
      <div className="relative h-[140px] overflow-hidden md:h-[280px]">
        <div className="relative h-[280px] w-[200%] origin-top-left scale-50 md:w-full md:scale-100">{children}</div>
      </div>
    </div>
  );
}

function OursPage({ d }: { d: Content }) {
  return (
    <div className="race-rise flex flex-col gap-3.5 p-[18px]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold tracking-[-0.01em] text-[#0F172A]">Maximum <span className="text-[#DC2626]">Rent a Car</span></span>
        <span className="flex gap-1.5">
          <i className="block h-1.5 w-[26px] rounded-[3px] bg-[#E2E8F0]" />
          <i className="block h-1.5 w-[26px] rounded-[3px] bg-[#E2E8F0]" />
          <i className="block h-1.5 w-[26px] rounded-[3px] bg-[#E2E8F0]" />
        </span>
      </div>
      <span className="text-[20px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#0F172A]">{d.mock.heading}</span>
      <div className="flex flex-wrap gap-2">
        <span className="flex-[1_1_90px] rounded-[8px] border border-[#E2E8F0] px-2.5 py-[7px] text-[11px] text-[#475569]">{d.mock.pickup}</span>
        <span className="flex-[1_1_90px] rounded-[8px] border border-[#E2E8F0] px-2.5 py-[7px] text-[11px] text-[#475569]">{d.mock.dropoff}</span>
        <span className="rounded-[8px] bg-[#0F172A] px-3 py-[7px] text-[11px] font-semibold text-white">{d.mock.search}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {d.mock.cars.map((c) => (
          <div key={c} className="flex flex-col gap-1.5 rounded-[10px] border border-[#EEF2F6] p-2">
            <div className="h-[46px] rounded-[6px] bg-[#F1F5F9]" />
            <span className="text-[11px] font-semibold text-[#0F172A]">{c}</span>
            <span className="text-[10px] font-semibold text-[#15803D]">{d.mock.free}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3.5 p-[18px]">
      <div className="race-sk h-3 w-2/5" />
      <div className="race-sk h-[22px] w-3/4" />
      <div className="race-sk h-[30px] w-full" />
      <div className="grid grid-cols-3 gap-2">
        <div className="race-sk h-24" />
        <div className="race-sk h-24" />
        <div className="race-sk h-24" />
      </div>
    </div>
  );
}

function OldPage({ d }: { d: Content }) {
  return (
    <div className="race-rise flex flex-col gap-3 p-[18px] saturate-[.6]">
      <div className="h-[26px] rounded-[4px] bg-[#CBD5E1]" />
      <div className="flex h-[110px] items-center justify-center rounded-[4px] bg-[#E2E8F0] font-serif text-[18px] text-[#64748B]">{d.mock.welcome}</div>
      <div className="h-2.5 w-[90%] rounded-[3px] bg-[#E2E8F0]" />
      <div className="h-2.5 w-[70%] rounded-[3px] bg-[#E2E8F0]" />
      <div className="h-2.5 w-[80%] rounded-[3px] bg-[#E2E8F0]" />
    </div>
  );
}

function Race({ d, lang }: { d: Content; lang: string }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const raf = useRef(0);
  const [t, setT] = useState(0);

  const play = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (reduce) {
      setT(OLD_SEC);
      return;
    }
    const start = performance.now() + 300;
    setT(0);
    const step = (now: number) => {
      const next = Math.min(OLD_SEC, Math.max(0, (now - start) / 1000) * SPEED);
      setT(next);
      if (next < OLD_SEC) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [reduce]);

  useEffect(() => {
    if (inView) play();
  }, [inView, play]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const scrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    cancelAnimationFrame(raf.current);
    setT(Number(e.target.value) / 10);
  };

  const oursDone = t >= NEW_SEC;
  const oldDone = t >= OLD_SEC;
  const oldP = Math.min(1, t / OLD_SEC);
  const pct = (t / OLD_SEC) * 100;

  return (
    <div
      ref={ref}
      className="flex flex-col gap-7 rounded-[24px] border border-[#E5E7EB] bg-white p-5 sm:p-8"
      style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 30px 60px -40px rgba(15,23,42,0.35)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-[1_1_320px]">
          <h3 className="text-[19px] font-semibold tracking-[-0.015em] text-[#0F172A]">{d.raceTitle}</h3>
          <span className="mt-1.5 block text-[14px] leading-relaxed text-[#64748B]">{d.raceSub}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-[#DCFCE7] px-3 py-2 text-[13px] font-semibold text-[#15803D]">{d.fasterBadge}</span>
          <button
            type="button"
            onClick={play}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] bg-[#0F172A] px-[18px] text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#1E293B] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
          >
            <RotateCcw size={16} strokeWidth={2} />
            {d.replay}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-5">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-h-[28px] flex-col items-start gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
            <span className="text-[13px] font-semibold text-[#0F172A] md:text-[14px]">{d.newLabel}</span>
            {oursDone ? (
              <span className="race-rise inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#15803D] md:text-[13px]">
                <Check size={15} strokeWidth={3} />
                {d.loadedLabel} {fmt(NEW_SEC, lang)} s
              </span>
            ) : (
              <span className="text-[12px] tabular-nums text-[#64748B] md:text-[13px]">{d.loadingLabel} {fmt(t, lang)} s</span>
            )}
          </div>
          <Browser url="maximum-rent.vercel.app" progress={Math.min(1, t / NEW_SEC) * 100}>
            {oursDone ? <OursPage d={d} /> : <Skeleton />}
          </Browser>
          <div className="h-1.5 rounded-full bg-[#F1F5F9]">
            <div className="h-1.5 rounded-full bg-[#0F172A]" style={{ width: `${(Math.min(t, NEW_SEC) / OLD_SEC) * 100}%` }} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-h-[28px] flex-col items-start gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
            <span className="text-[13px] font-semibold text-[#64748B] md:text-[14px]">{d.oldLabel}</span>
            {oldDone ? (
              <span className="race-rise text-[12px] font-semibold text-[#64748B] md:text-[13px]">{d.loadedLabel} {fmt(OLD_SEC, lang)} s</span>
            ) : (
              <span className="text-[12px] tabular-nums text-[#94A3B8] md:text-[13px]">{d.stillLabel} {fmt(t, lang)} s</span>
            )}
          </div>
          <Browser url={d.oldUrl} muted progress={(oldDone ? 1 : 0.92 * (1 - Math.pow(1 - oldP, 2))) * 100}>
            {oldDone ? (
              <OldPage d={d} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#FAFBFC]">
                <svg viewBox="0 0 40 40" width="36" height="36" className="animate-spin motion-reduce:animate-none">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" strokeDasharray="30 100" />
                </svg>
                <span className="text-[12px] text-[#94A3B8]">{d.waiting}</span>
              </div>
            )}
          </Browser>
          <div className="h-1.5 rounded-full bg-[#F1F5F9]">
            <div className="h-1.5 rounded-full bg-[#CBD5E1]" style={{ width: `${oldP * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[16px] bg-[#F8FAFC] px-5 py-[18px]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <label htmlFor="race-scrub" className="text-[13px] font-medium text-[#475569]">{d.scrubLabel}</label>
          <span className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums text-[#0F172A]">{fmt(t, lang)} s</span>
        </div>
        <div className="relative pb-[30px]">
          <input
            id="race-scrub"
            type="range"
            min={0}
            max={OLD_SEC * 10}
            step={1}
            value={Math.round(t * 10)}
            onChange={scrub}
            aria-valuetext={`${fmt(t, lang)} s`}
            className="race-scrub"
            style={{ background: `linear-gradient(90deg, #0F172A ${pct}%, #E2E8F0 ${pct}%)` }}
          />
          <div className="pointer-events-none absolute top-[14px] flex flex-col items-start gap-1" style={{ left: `${(PATIENCE / OLD_SEC) * 100}%` }}>
            <i className="block h-2.5 w-0.5 rounded-[1px] bg-[#DC2626]" />
            <span className="max-w-[62vw] text-[11px] font-semibold leading-snug text-[#DC2626] sm:whitespace-nowrap">{d.patience}</span>
          </div>
        </div>
        <div className="flex justify-between text-[11px] tabular-nums text-[#94A3B8]">
          <span>0 s</span>
          <span>{fmt(OLD_SEC, lang)} s</span>
        </div>
      </div>

      <span className="block max-w-3xl text-[14px] leading-relaxed text-[#64748B]">{d.raceNote}</span>
    </div>
  );
}

function Scores({ d }: { d: Content }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [k, setK] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setK(1);
      return;
    }
    let id = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setK(1 - Math.pow(1 - p, 3));
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [inView, reduce]);

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {d.gauges.map((g) => (
        <div key={g.l} className="race-score flex items-center gap-3.5 rounded-[18px] border border-[#E5E7EB] bg-white p-4">
          <div className="relative h-[60px] w-[60px] flex-none">
            <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true" className="-rotate-90">
              <circle cx="30" cy="30" r="23" fill="none" stroke="#E8F5EC" strokeWidth="6" />
              <circle
                cx="30" cy="30" r="23" fill="none" stroke="#16A34A" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={RING} strokeDashoffset={RING * (1 - (g.v / 100) * k)}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[17px] font-bold tabular-nums text-[#15803D]">
              {Math.round(g.v * k)}
            </span>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[14px] font-semibold text-[#0F172A]">{g.l}</span>
            <span className="text-[12px] text-[#64748B]">{g.s}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Results() {
  const { lang } = useLanguage();
  const d = T[(lang as Lang)] ?? T.bs;

  return (
    <section id="rezultati" className="relative bg-white scroll-mt-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.label}</p>
          <h2 className="mt-4 text-[32px] leading-[1.12] sm:text-[44px] font-semibold tracking-[-0.03em] text-[#0F172A]">
            {d.heading1} <span className="text-[#0F3554]">{d.headingAccent}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#475569]">{d.sub}</p>
        </div>

        <div className="mt-12">
          <Race d={d} lang={lang} />
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Scores d={d} />
          <span className="block text-center text-[13px] leading-relaxed text-[#64748B]">
            {d.gaugesCaptionPre}{" "}
            <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-0.5 font-semibold text-[#0F172A] underline decoration-[#CBD5E1] underline-offset-2 hover:decoration-[#0F172A]">
              {d.gaugesLink}<ArrowUpRight size={11} />
            </a>
          </span>
        </div>

        <ul className="mt-8 lg:-mx-6 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-center gap-x-6 gap-y-3">
          {d.facts.map((f, i) => {
            const Icon = FACT_ICONS[i];
            return (
              <li key={f.t} className="flex items-center gap-2.5 text-[13px] text-[#475569]">
                <Icon size={15} className="shrink-0 text-[#0F3554]" />
                {f.t}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
