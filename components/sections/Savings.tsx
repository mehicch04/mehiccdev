"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Check, Coffee, ShieldCheck, X } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Lang = "bs" | "en";
type Plan = { name: string; price: number; free: number };
type Content = {
  eyebrow: string; h: string; accent: string; sub: string;
  planLabel: string; plans: Plan[];
  yearsLabel: string; supportLabel: string; supportSub: string; supportFree: string;
  perDay: string; noSub: string; totalFor: string; yearShort: string; coffeeNote: string;
  trHead: string; before: string; after: string;
  pairs: { b: string; a: string }[];
  bannerText: string; btn: string; included: string[];
  sup: number; coffee: number;
};

const T: Record<Lang, Content> = {
  bs: {
    eyebrow: "Zašto se isplati",
    h: "Zvuči kao velika investicija?",
    accent: "Nije.",
    sub: "Aplikaciju plaćate jednom i ona je zauvijek vaša. Izaberite paket, pomjerite klizač i pogledajte koliko to stvarno košta.",
    planLabel: "Paket",
    plans: [{ name: "Starter", price: 1000, free: 0 }, { name: "Business", price: 1800, free: 2 }, { name: "Premium", price: 2800, free: 0 }],
    yearsLabel: "Koliko dugo koristite aplikaciju",
    supportLabel: "Mjesečna podrška",
    supportSub: "+100 KM mjesečno, po želji",
    supportFree: "uz Business prva 2 mjeseca gratis",
    perDay: "Po danu",
    noSub: "Bez obavezne pretplate",
    totalFor: "Ukupno za",
    yearShort: "God.",
    coffeeNote: "računajući kafu 2 KM",
    trHead: "Od haosa do potpune kontrole",
    before: "Bez sistema",
    after: "Sa sistemom",
    pairs: [
      { b: "Excel tabele i ručne bilješke", a: "Sve na jednom mjestu" },
      { b: "Sati izgubljeni na administraciju", a: "Vrijeme za rast biznisa" },
      { b: "Propušteni upiti i greške", a: "Svaki upit zabilježen" },
      { b: "Sve ručno, sve sporo", a: "Gotovo u 2 klika" },
    ],
    bannerText: "Računicu za vaš slučaj napravimo na besplatnim konsultacijama.",
    btn: "Zakaži besplatne konsultacije",
    included: ["Dizajn po mjeri", "Aplikacija je vaša", "Hosting i domena podešeni", "Izmjene bez developera"],
    sup: 100, coffee: 2,
  },
  en: {
    eyebrow: "Why it pays off",
    h: "Sounds like a big investment?",
    accent: "It isn't.",
    sub: "You pay for the app once and it's yours for good. Pick a package, move the slider and see what it really costs.",
    planLabel: "Package",
    plans: [{ name: "Starter", price: 500, free: 0 }, { name: "Business", price: 920, free: 2 }, { name: "Premium", price: 1430, free: 0 }],
    yearsLabel: "How long you use the app",
    supportLabel: "Monthly support",
    supportSub: "+€50 a month, optional",
    supportFree: "first 2 months free with Business",
    perDay: "Per day",
    noSub: "No required subscription",
    totalFor: "Total for",
    yearShort: "Yr",
    coffeeNote: "counting a €2 coffee",
    trHead: "From chaos to full control",
    before: "Without a system",
    after: "With the system",
    pairs: [
      { b: "Spreadsheets and manual notes", a: "Everything in one place" },
      { b: "Hours lost on admin", a: "Time to grow the business" },
      { b: "Missed inquiries and errors", a: "Every inquiry captured" },
      { b: "All manual, all slow", a: "Done in 2 clicks" },
    ],
    bannerText: "We'll run the numbers for your case in a free consultation.",
    btn: "Book a free consultation",
    included: ["Design made for you", "The app is yours", "Hosting and domain set up", "Edits without a developer"],
    sup: 50, coffee: 2,
  },
};

const money = (n: number, l: Lang) =>
  l === "bs" ? `${Math.round(n).toLocaleString("de-DE")} KM` : `€${Math.round(n).toLocaleString("en-US")}`;
const daily = (n: number, l: Lang) =>
  l === "bs" ? `${n.toFixed(2).replace(".", ",")} KM` : `€${n.toFixed(2)}`;
const yearsText = (n: number, l: Lang) =>
  l === "bs" ? (n === 1 ? "1 godinu" : n < 5 ? `${n} godine` : `${n} godina`) : n === 1 ? "1 year" : `${n} years`;
const coffeeText = (n: number, l: Lang) => {
  if (n < 1) return l === "bs" ? "Manje od jedne kafe dnevno" : "Less than one coffee a day";
  const k = Math.round(n);
  if (l === "en") return k === 1 ? "About one coffee a day" : `About ${k} coffees a day`;
  return k === 1 ? "Kao jedna kafa dnevno" : k < 5 ? `Kao ${k} kafe dnevno` : `Kao ${k} kafa dnevno`;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function Savings() {
  const { lang } = useLanguage();
  const l: Lang = lang === "en" ? "en" : "bs";
  const d = T[l];
  const reduce = useReducedMotion() ?? false;

  const [plan, setPlan] = useState(0);
  const [years, setYears] = useState(3);
  const [support, setSupport] = useState(false);
  const [after, setAfter] = useState(false);
  const touched = useRef(false);
  const flipRef = useRef<HTMLDivElement>(null);
  const flipInView = useInView(flipRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!flipInView || touched.current) return;
    const t = window.setTimeout(() => { if (!touched.current) setAfter(true); }, 1400);
    return () => window.clearTimeout(t);
  }, [flipInView]);

  const p = d.plans[plan];
  const yearCost = (y: number) => (y === 1 ? p.price : 0) + (support ? d.sup * 12 - (y === 1 ? p.free * d.sup : 0) : 0);
  const total = Array.from({ length: years }, (_, i) => yearCost(i + 1)).reduce((a, b) => a + b, 0);
  const perDay = total / (365 * years);
  const scale = d.plans[2].price + d.sup * 12;
  const cups = Math.min(8, Math.max(1, Math.ceil(perDay / d.coffee)));

  const dayMv = useSpring(perDay, { stiffness: 140, damping: 22 });
  useEffect(() => { dayMv.set(perDay); }, [perDay, dayMv]);
  const dayText = useTransform(dayMv, (v) => daily(Math.max(0, v), l));
  const totalMv = useSpring(total, { stiffness: 140, damping: 22 });
  useEffect(() => { totalMv.set(total); }, [total, totalMv]);
  const totalText = useTransform(totalMv, (v) => money(Math.max(0, v), l));

  const pct = ((years - 1) / 4) * 100;

  return (
    <section id="vrijednost" data-dark className="relative scroll-mt-24 overflow-hidden text-white"
             style={{ background: "linear-gradient(180deg, #0F3554 0%, #0D2E4A 55%, #0B2740 100%)" }}>
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8FB3D9]">{d.eyebrow}</p>
          <h2 className="mt-4 text-[32px] leading-[1.12] sm:text-[44px] font-semibold tracking-[-0.03em]" style={{ textWrap: "balance" }}>
            {d.h} <span className="text-[#4ADE80]">{d.accent}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#B9CCE0]">{d.sub}</p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col gap-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8FB3D9]">{d.planLabel}</p>
              <div role="radiogroup" aria-label={d.planLabel} className="mt-3 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-[#0B2740]/60 p-1.5">
                {d.plans.map((pl, i) => {
                  const on = i === plan;
                  return (
                    <button key={pl.name} type="button" role="radio" aria-checked={on} onClick={() => setPlan(i)}
                            className="relative rounded-xl px-2 py-2.5 text-center">
                      {on && (
                        <motion.span layoutId="savings-plan" className="absolute inset-0 rounded-xl bg-white"
                                     transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }} />
                      )}
                      <span className={`relative block text-[14px] font-semibold transition-colors ${on ? "text-[#0F172A]" : "text-white"}`}>{pl.name}</span>
                      <span className={`relative block text-[12px] tabular-nums transition-colors ${on ? "text-[#64748B]" : "text-[#8FB3D9]"}`}>{money(pl.price, l)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor="savings-years" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8FB3D9]">{d.yearsLabel}</label>
                <span className="text-[15px] font-semibold tabular-nums">{yearsText(years, l)}</span>
              </div>
              <div className="pt-5">
              <input
                id="savings-years"
                type="range"
                min={1}
                max={5}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                aria-valuetext={yearsText(years, l)}
                className="race-scrub"
                style={{ background: `linear-gradient(90deg, #4ADE80 ${pct}%, rgba(255,255,255,0.16) ${pct}%)` }}
              />
              </div>
              <div className="mt-3 flex justify-between">
                {[1, 2, 3, 4, 5].map((y) => (
                  <button key={y} type="button" onClick={() => setYears(y)}
                          className={`w-8 text-center text-[12px] font-semibold tabular-nums transition-colors ${y === years ? "text-white" : "text-[#8FB3D9] hover:text-white"}`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" role="switch" aria-checked={support} onClick={() => setSupport((v) => !v)}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0B2740]/60 p-4 text-left transition-colors hover:border-white/20">
              <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${support ? "bg-[#16A34A]" : "bg-white/15"}`}>
                <motion.span className="absolute top-1 h-5 w-5 rounded-full bg-white" initial={false}
                             animate={{ left: support ? 24 : 4 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }} />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold">{d.supportLabel}</span>
                <span className="block text-[13px] text-[#B9CCE0]">{d.supportSub}{p.free > 0 && <span className="text-[#4ADE80]"> · {d.supportFree}</span>}</span>
              </span>
            </button>

            <ul className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-white/10 pt-6">
              {d.included.map((c) => (
                <li key={c} className="flex items-center gap-2 text-[13.5px] text-[#DCE7F2]">
                  <Check size={15} strokeWidth={2.5} className="shrink-0 text-[#4ADE80]" /> {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col rounded-[24px] bg-white p-6 text-[#0F172A] sm:p-8" style={{ boxShadow: "0 40px 80px -40px rgba(0,0,0,0.55)" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{d.perDay}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[12px] font-semibold text-[#15803D]">
                <ShieldCheck size={13} /> {d.noSub}
              </span>
            </div>
            <motion.p className="mt-3 text-[54px] sm:text-[64px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{dayText}</motion.p>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="flex items-center gap-1">
                {Array.from({ length: cups }, (_, i) => (
                  <motion.span key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: perDay < d.coffee ? 0.5 : 1 }}
                               transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : i * 0.04, ease: EASE }}
                               className="grid h-8 w-8 place-items-center rounded-lg bg-[#F4EDE4] text-[#7C4A1E]">
                    <Coffee size={16} />
                  </motion.span>
                ))}
              </span>
              <span className="text-[14px] font-semibold text-[#0F172A]">{coffeeText(perDay / d.coffee, l)}</span>
              <span className="text-[12px] text-[#94A3B8]">{d.coffeeNote}</span>
            </div>

            <div className="mt-7 grid h-[150px] grid-cols-5 items-end gap-2.5 border-t border-[#F1F5F9] pt-5">
              {[1, 2, 3, 4, 5].map((y) => {
                const active = y <= years;
                const amt = yearCost(y);
                const h = amt > 0 ? 8 + (amt / scale) * 62 : 4;
                return (
                  <div key={y} className={`flex h-full flex-col items-center justify-end gap-1.5 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-25"}`}>
                    <span className={`text-[11px] font-semibold tabular-nums ${amt === 0 ? "text-[#15803D]" : "text-[#0F172A]"}`}>{money(amt, l)}</span>
                    <motion.span
                      className={`block w-full rounded-md ${y === 1 ? "bg-[#0F172A]" : amt === 0 ? "bg-[#4ADE80]" : "bg-[#0F3554]"}`}
                      initial={false}
                      animate={{ height: h }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 22 }}
                    />
                    <span className="text-[11px] text-[#64748B]">{d.yearShort} {y}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-[#F1F5F9] pt-5">
              <span className="text-[14px] text-[#475569]">{d.totalFor} {yearsText(years, l)}</span>
              <motion.span className="text-[22px] font-semibold tracking-tight tabular-nums">{totalText}</motion.span>
            </div>
          </div>
        </div>

        <div ref={flipRef} className="mt-20">
          <div className="flex flex-col items-center gap-5 text-center">
            <h3 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em]">{d.trHead}</h3>
            <div role="tablist" className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
              {[false, true].map((v) => {
                const on = after === v;
                return (
                  <button key={String(v)} type="button" role="tab" aria-selected={on}
                          onClick={() => { touched.current = true; setAfter(v); }}
                          className="relative rounded-full px-5 py-2 text-[14px] font-semibold">
                    {on && (
                      <motion.span layoutId="savings-flip" className={`absolute inset-0 rounded-full ${v ? "bg-[#16A34A]" : "bg-white/15"}`}
                                   transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }} />
                    )}
                    <span className={`relative ${on ? "text-white" : "text-[#8FB3D9]"}`}>{v ? d.after : d.before}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2" style={{ perspective: "900px" }}>
            {d.pairs.map((pr, i) => (
              <div key={pr.a} className="relative h-[68px]">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={after ? "a" : "b"}
                    initial={reduce ? { opacity: 0 } : { rotateX: -90, opacity: 0 }}
                    animate={reduce ? { opacity: 1 } : { rotateX: 0, opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { rotateX: 90, opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : i * 0.08, ease: EASE }}
                    style={{ transformOrigin: "50% 50%", backfaceVisibility: "hidden" }}
                    className={`absolute inset-0 flex items-center gap-3 rounded-2xl px-5 ${after ? "bg-white text-[#0F172A]" : "border border-white/10 bg-white/[0.04] text-[#B9CCE0]"}`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${after ? "bg-[#16A34A] text-white" : "bg-[#DC2626]/15 text-[#F87171]"}`}>
                      {after ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                    </span>
                    <span className={`text-[15px] ${after ? "font-semibold" : "line-through decoration-white/30"}`}>{after ? pr.a : pr.b}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-10 sm:flex-row">
          <p className="text-center text-[17px] font-medium text-[#DCE7F2] sm:text-left">{d.bannerText}</p>
          <a href="#kontakt"
             className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-[#0F172A] transition-colors hover:bg-[#E2E8F0]">
            {d.btn} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
