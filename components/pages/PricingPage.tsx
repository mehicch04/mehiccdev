"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Pricing } from "@/components/sections/Pricing";
import { PricingBuilder } from "@/components/sections/PricingBuilder";
import { Faq } from "@/components/sections/Faq";
import { Booking } from "@/components/sections/Booking";

const MONTHS = 36;
const EASE = [0.22, 1, 0.36, 1] as const;

const T = {
  bs: {
    eyebrow: "Cjenovnik", h1: "Platite jednom.", h1b: "Ne svaki mjesec.",
    sub: "Gotove platforme naplaćuju pretplatu dok god ih koristite. Kod nas je sistem vaš, a mjesečni trošak je nula.",
    primary: "Pogledajte cijene", secondary: "Zakažite poziv",
    trust: ["Plaćanje 50% na početku, 50% po predaji", "0 KM mjesečno, bez pretplate", "Bez provizije po rezervaciji"],
    chart: "Ukupan trošak kroz 3 godine", month: "mjesec", cross: (n: number) => `${n}. mjesec`,
    subL: "Pretplata", subPer: "/mj", once: "mehiccdev, jednom",
    note: "Poređenje s tipičnom pretplatom za sistem rezervacija. Primjer, ne tačna cijena konkurencije.",
    rate: 120, total: 1790, money: (n: number) => `${n.toLocaleString("de-DE")} KM`,
  },
  en: {
    eyebrow: "Pricing", h1: "Pay once.", h1b: "Not every month.",
    sub: "Off the shelf platforms charge a subscription for as long as you use them. With us the system is yours and the monthly cost is zero.",
    primary: "See the prices", secondary: "Book a call",
    trust: ["50% upfront, 50% on delivery", "€0 per month, no subscription", "No fee per booking"],
    chart: "Total cost over 3 years", month: "month", cross: (n: number) => `month ${n}`,
    subL: "Subscription", subPer: "/mo", once: "mehiccdev, one time",
    note: "Compared with a typical booking system subscription. An example, not a specific competitor's price.",
    rate: 60, total: 915, money: (n: number) => `€${n.toLocaleString("en-US")}`,
  },
};

function CostChart({ d }: { d: (typeof T)["bs"] }) {
  const reduce = useReducedMotion() ?? false;
  const [m, setM] = useState(reduce ? MONTHS : 0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) { setM(MONTHS); return; }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / 2200);
      setM(Math.round((1 - Math.pow(1 - k, 2)) * MONTHS));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    const id = window.setTimeout(() => { raf = requestAnimationFrame(tick); }, 450);
    return () => { window.clearTimeout(id); cancelAnimationFrame(raf); };
  }, [reduce]);

  const W = 520, H = 240, P = 24;
  const max = d.rate * MONTHS;
  const x = (i: number) => P + (i / MONTHS) * (W - P * 2);
  const y = (v: number) => H - P - (v / max) * (H - P * 2);
  const cross = Math.ceil(d.total / d.rate);
  const line = Array.from({ length: m + 1 }, (_, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.rate * i).toFixed(1)}`).join(" ");
  const flat = `M${x(0)} ${y(d.total)} L${x(Math.max(m, 0.001)).toFixed(1)} ${y(d.total)}`;
  const past = m >= cross;
  const labelLeft = x(cross) > W * 0.62;

  return (
    <div ref={ref} className="rounded-[26px] border border-[#E5E7EB] bg-white p-5 shadow-[0_30px_60px_-34px_rgba(15,23,42,0.35)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-[#0F172A]">{d.chart}</p>
        <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[12px] font-medium tabular-nums text-[#475569]">{d.month} {m}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label={d.chart}>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={P} x2={W - P} y1={y(max * g)} y2={y(max * g)} stroke="#F1F5F9" />)}
        <path d={line} fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={flat} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
        <motion.g initial={false} animate={{ opacity: past ? 1 : 0, scale: past ? 1 : 0.6 }} transition={{ duration: 0.35, ease: EASE }}
                  style={{ transformOrigin: `${x(cross)}px ${y(d.total)}px` }}>
          <circle cx={x(cross)} cy={y(d.total)} r="9" fill="#0F172A" opacity="0.12" />
          <circle cx={x(cross)} cy={y(d.total)} r="4.5" fill="#0F172A" />
          <rect x={labelLeft ? x(cross) - 82 : x(cross) + 10} y={y(d.total) - 34} width="72" height="22" rx="6" fill="#0F172A" />
          <text x={labelLeft ? x(cross) - 46 : x(cross) + 46} y={y(d.total) - 19} fontSize="11.5" fill="#FFFFFF" fontWeight="600" textAnchor="middle">{d.cross(cross)}</text>
        </motion.g>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#FEF2F2] p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-[#B91C1C]"><span className="h-2 w-2 rounded-full bg-[#DC2626]" />{d.subL} {d.money(d.rate)}{d.subPer}</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#0F172A] sm:text-[22px]">{d.money(d.rate * m)}</p>
        </div>
        <div className="rounded-2xl bg-[#F0FDF4] p-4">
          <p className="flex items-center gap-1.5 text-[12px] text-[#15803D]"><span className="h-2 w-2 rounded-full bg-[#16A34A]" />{d.once}</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-[#0F172A] sm:text-[22px]">{d.money(d.total)}</p>
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-[#64748B]">{d.note}</p>
    </div>
  );
}

function PricingHero() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  const reduce = useReducedMotion() ?? false;
  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: i * 0.08, ease: EASE } });

  return (
    <section className="hero-light relative bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-32 sm:pt-36 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:px-8 lg:pb-20">
        <div>
          <motion.span {...rise(0)} className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12.5px] font-medium text-[#0F172A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />{d.eyebrow}
          </motion.span>
          <motion.h1 {...rise(1)} className="mt-6 text-[42px] font-semibold leading-[1.03] tracking-[-0.04em] text-[#0F172A] sm:text-[56px]">
            {d.h1}<span className="block text-[#94A3B8]">{d.h1b}</span>
          </motion.h1>
          <motion.p {...rise(2)} className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-[#475569] sm:text-[17px]">{d.sub}</motion.p>
          <motion.div {...rise(3)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#cjenovnik" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
              {d.primary} <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a href="#zakazi" className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F9FAFB]">{d.secondary}</a>
          </motion.div>
          <motion.ul {...rise(4)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {d.trust.map((t) => <li key={t} className="flex items-center gap-2 text-[13.5px] text-[#475569]"><ShieldCheck size={15} className="text-[#16A34A]" />{t}</li>)}
          </motion.ul>
        </div>
        <motion.div {...rise(2)}><CostChart d={d} /></motion.div>
      </div>
    </section>
  );
}

export function PricingPage() {
  return (
    <main className="relative bg-white">
      <PricingHero />
      <PricingBuilder />
      <Pricing extras />
      <Faq />
      <Booking />
    </main>
  );
}
