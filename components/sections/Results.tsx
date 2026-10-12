"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Rocket, PhoneOff, Clock, ArrowUpRight, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Content = {
  label: string; heading1: string; headingAccent: string; sub: string;
  raceTitle: string; raceSub: string; oldLabel: string; newLabel: string;
  loadedLabel: string; stillLabel: string; fasterBadge: string; raceNote: string;
  gaugesCaptionPre: string; gaugesLink: string;
  gauges: { v: number; l: string; s: string }[];
  facts: { t: string }[];
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    label: "Rezultati",
    heading1: "Brojke koje",
    headingAccent: "možete provjeriti",
    sub: "Bez izmišljenih prosjeka i procenata. Ovo su stvarna Google mjerenja s našeg zadnjeg projekta, ista koja možete izmjeriti i sami.",
    raceTitle: "Koliko brzo se otvara?",
    raceSub: "Isti biznis, prije i poslije. Mjereno na telefonu, Google PageSpeed alatom.",
    oldLabel: "Stari sajt klijenta",
    newLabel: "Naša aplikacija",
    loadedLabel: "Učitano",
    stillLabel: "još se učitava…",
    fasterBadge: "6,7× brže",
    raceNote: "Više od polovine posjetilaca odustane ako se stranica ne otvori za oko 3 sekunde. Na staroj brzini, ti ljudi nikad ne vide ponudu.",
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
    loadedLabel: "Loaded",
    stillLabel: "still loading…",
    fasterBadge: "6.7× faster",
    raceNote: "More than half of visitors give up if a page doesn't open within about 3 seconds. At the old speed, those people never even see the offer.",
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

const fmt = (n: number, lang: string) => n.toFixed(1).replace(".", lang === "en" ? "." : ",");

export function Results() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;
  const reduce = useReducedMotion() ?? false;

  const bar = (pct: number) => ({
    style: { width: `${pct}%`, transformOrigin: "0% 50%" },
    initial: { scaleX: reduce ? 1 : 0 },
    whileInView: { scaleX: 1 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] as const },
  });

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

        <div className="mt-12 grid overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white lg:grid-cols-[1.3fr_1fr]">

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[17px] font-semibold text-[#0F172A]">{d.raceTitle}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">{d.raceSub}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[12px] font-semibold text-[#15803D]">
                {d.fasterBadge}
              </span>
            </div>

            <dl className="mt-7 space-y-5">
              <div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-[13px] font-medium text-[#0F172A]">{d.newLabel}</dt>
                  <dd className="text-[22px] font-semibold tracking-tight text-[#0F172A] tabular-nums">{fmt(NEW_SEC, lang)} s</dd>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#F1F5F9]">
                  <motion.div {...bar((NEW_SEC / OLD_SEC) * 100)} className="h-full rounded-full bg-[#0F172A]" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-[13px] font-medium text-[#64748B]">{d.oldLabel}</dt>
                  <dd className="text-[22px] font-semibold tracking-tight text-[#94A3B8] tabular-nums">{fmt(OLD_SEC, lang)} s</dd>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#F1F5F9]">
                  <motion.div {...bar(100)} className="h-full rounded-full bg-[#CBD5E1]" />
                </div>
              </div>
            </dl>

            <p className="mt-6 text-[13px] leading-relaxed text-[#64748B]">{d.raceNote}</p>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-[#E5E7EB] bg-[#F9FAFB] p-6 sm:p-8 flex flex-col">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7">
              {d.gauges.map((g) => (
                <div key={g.l}>
                  <dd className="flex items-baseline gap-1">
                    <span className="text-[34px] leading-none font-semibold tracking-tight text-[#0F172A] tabular-nums">{g.v}</span>
                    <span className="text-[13px] font-medium text-[#94A3B8]">/100</span>
                  </dd>
                  <dt className="mt-2 text-[13px] font-semibold text-[#0F172A]">{g.l}</dt>
                  <p className="text-[12px] text-[#64748B]">{g.s}</p>
                </div>
              ))}
            </dl>
            <p className="mt-auto pt-7 text-[12px] leading-relaxed text-[#64748B]">
              {d.gaugesCaptionPre}{" "}
              <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-0.5 font-semibold text-[#0F172A] underline decoration-[#CBD5E1] underline-offset-2 hover:decoration-[#0F172A]">
                {d.gaugesLink}<ArrowUpRight size={11} />
              </a>
            </p>
          </div>
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
