"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
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
  modeCost: string; modeEarn: string; bookingsLabel: string; valueLabel: string; paysIn: string; sample: string;
  revMonth: string; firstYear: string; afterPrice: string; costLine: string; paid: string; mShort: string; roiNote: string;
  valMin: number; valMax: number; valStep: number; valDefault: number;
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
    modeCost: "Koliko košta", modeEarn: "Koliko donosi",
    bookingsLabel: "Novih rezervacija mjesečno", valueLabel: "Prosječna vrijednost rezervacije",
    paysIn: "Aplikacija se isplati za", sample: "Primjer računice",
    revMonth: "Dodatni prihod mjesečno", firstYear: "Prva godina", afterPrice: "nakon cijene aplikacije",
    costLine: "Cijena aplikacije", paid: "Isplaćeno", mShort: "mj.",
    roiNote: "Računica ne uključuje vaše troškove poslovanja. Na konsultacijama je napravimo za vaš posao.",
    valMin: 20, valMax: 500, valStep: 10, valDefault: 120,
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
    modeCost: "What it costs", modeEarn: "What it brings",
    bookingsLabel: "New bookings per month", valueLabel: "Average booking value",
    paysIn: "The app pays for itself in", sample: "Sample calculation",
    revMonth: "Extra revenue per month", firstYear: "First year", afterPrice: "after the app price",
    costLine: "App price", paid: "Paid off", mShort: "mo",
    roiNote: "This does not include your business costs. We will run it for your business in a free consultation.",
    valMin: 10, valMax: 250, valStep: 5, valDefault: 60,
  },
};

const money = (n: number, l: Lang) =>
  l === "bs" ? `${Math.round(n).toLocaleString("de-DE")} KM` : `€${Math.round(n).toLocaleString("en-US")}`;
const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
};
const payback = (days: number, l: Lang) => {
  if (!isFinite(days)) return "—";
  if (days <= 31) { const n = Math.max(1, Math.ceil(days)); return l === "bs" ? `${n} ${plural(n, "dan", "dana", "dana")}` : `${n} ${n === 1 ? "day" : "days"}`; }
  if (days <= 112) { const n = Math.ceil(days / 7); return l === "bs" ? `${n} ${plural(n, "sedmicu", "sedmice", "sedmica")}` : `${n} weeks`; }
  const n = Math.ceil(days / 30.4);
  if (n > 24) return l === "bs" ? "više od 2 godine" : "over 2 years";
  return l === "bs" ? `${n} ${plural(n, "mjesec", "mjeseca", "mjeseci")}` : `${n} months`;
};


export function Savings() {
  const { lang } = useLanguage();
  const l: Lang = lang === "en" ? "en" : "bs";
  const d = T[l];
  const reduce = useReducedMotion() ?? false;

  const [plan, setPlan] = useState(0);
  const [bookings, setBookings] = useState(10);
  const [value, setValue] = useState(d.valDefault);
  useEffect(() => { setValue(T[l].valDefault); }, [l]);
  const p = d.plans[plan];
  const rev = bookings * value;
  const days = rev > 0 ? p.price / (rev / 30.4) : Infinity;
  const scaleR = Math.max(rev * 12, p.price * 1.15);
  const bPct = ((bookings - 1) / 59) * 100;
  const vPct = ((value - d.valMin) / (d.valMax - d.valMin)) * 100;
  const firstPaid = Array.from({ length: 12 }, (_, i) => rev * (i + 1)).findIndex((c) => c >= p.price);

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

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
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

              <>
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor="roi-bookings" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8FB3D9]">{d.bookingsLabel}</label>
                    <span className="text-[15px] font-semibold tabular-nums">{bookings}</span>
                  </div>
                  <div className="pt-5">
                    <input id="roi-bookings" type="range" min={1} max={60} step={1} value={bookings} onChange={(e) => setBookings(Number(e.target.value))}
                           className="race-scrub" style={{ background: `linear-gradient(90deg, #4ADE80 ${bPct}%, rgba(255,255,255,0.16) ${bPct}%)` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor="roi-value" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8FB3D9]">{d.valueLabel}</label>
                    <span className="whitespace-nowrap text-[15px] font-semibold tabular-nums">{money(value, l)}</span>
                  </div>
                  <div className="pt-5">
                    <input id="roi-value" type="range" min={d.valMin} max={d.valMax} step={d.valStep} value={value} onChange={(e) => setValue(Number(e.target.value))}
                           className="race-scrub" style={{ background: `linear-gradient(90deg, #4ADE80 ${vPct}%, rgba(255,255,255,0.16) ${vPct}%)` }} />
                  </div>
                </div>
                <p className="rounded-2xl border border-white/10 bg-[#0B2740]/60 p-4 text-[13.5px] leading-relaxed text-[#B9CCE0]">
                  {bookings} × {money(value, l)} = <span className="font-semibold text-white">{money(rev, l)}</span> {l === "bs" ? "mjesečno" : "a month"}
                </p>
              </>

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
              <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{d.paysIn}</span>
              <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[12px] font-semibold text-[#475569]">{d.sample}</span>
            </div>
            <p className="mt-3 text-[46px] sm:text-[56px] font-semibold leading-none tracking-[-0.04em] text-[#15803D]">{payback(days, l)}</p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-[#F4F7FB] p-4">
                <p className="text-[12px] text-[#64748B]">{d.revMonth}</p>
                <p className="mt-1 text-[18px] font-semibold tabular-nums sm:text-[22px]">{money(rev, l)}</p>
              </div>
              <div className="rounded-2xl bg-[#DCFCE7] p-4">
                <p className="text-[12px] text-[#15803D]">{d.firstYear}, {d.afterPrice}</p>
                <p className="mt-1 text-[18px] font-semibold tabular-nums text-[#15803D] sm:text-[22px]">{money(Math.max(0, rev * 12 - p.price), l)}</p>
              </div>
            </div>
            <div className="relative mt-6 h-[150px] border-t border-[#F1F5F9] pt-5">
              <div className="relative grid h-full grid-cols-12 items-end gap-1.5">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-[#DC2626]" style={{ bottom: `calc(18px + (100% - 18px) * ${(p.price / scaleR).toFixed(4)})` }} />
                {Array.from({ length: 12 }, (_, i) => {
                  const cum = rev * (i + 1);
                  const ok = cum >= p.price;
                  return (
                    <div key={i} className="flex h-full flex-col items-center justify-end gap-1">
                      <motion.span className={`block w-full rounded-t-md ${ok ? "bg-[#16A34A]" : "bg-[#CBD5E1]"}`} initial={false}
                        animate={{ height: `max(3px, calc((100% - 18px) * ${Math.min(1, cum / scaleR).toFixed(4)}))` }}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 22 }} />
                      <span className="text-[10px] tabular-nums text-[#94A3B8]">{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[12px] font-semibold">
              <span className="inline-flex items-center gap-2 text-[#B91C1C]"><span className="w-5 border-t-2 border-dashed border-[#DC2626]" />{d.costLine} {money(p.price, l)}</span>
              <span className="inline-flex items-center gap-2 text-[#15803D]"><span className="h-2.5 w-2.5 rounded-sm bg-[#16A34A]" />{firstPaid >= 0 ? (l === "bs" ? `${d.paid} u ${firstPaid + 1}. mjesecu` : `${d.paid} in month ${firstPaid + 1}`) : (l === "bs" ? "Isplata nakon 12 mjeseci" : "Pays off after 12 months")}</span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-[#64748B]">{d.roiNote}</p>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-10 sm:flex-row">
          <p className="text-center text-[17px] font-medium text-[#DCE7F2] sm:text-left">{d.bannerText}</p>
          <a href="#zakazi"
             className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-[#0F172A] transition-colors hover:bg-[#E2E8F0]">
            {d.btn} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
