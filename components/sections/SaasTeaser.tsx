"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Check, Heart, Landmark, RefreshCw, Search, Sparkles, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Key = "ai" | "xml" | "calc";
type Lang = "bs" | "en";
type Content = {
  label: string; status: string; launch: string; h: string; accent: string; desc: string;
  pick: string; features: { key: Key; t: string; d: string }[]; marketsLabel: string;
  aiTitle: string; aiText: string; aiDone: string;
  xmlTitle: string; xmlSub: string; xmlCount: string; xmlRow: string;
  calcTitle: string; calcPrice: string; calcDown: string; calcYears: string; calcRate: string; calcNote: string;
  search: string; filters: string[];
  earlyAccess: string; earlyAccessDesc: string; placeholder: string; submit: string; submitting: string; success: string; error: string;
};

const T: Record<Lang, Content> = {
  bs: {
    label: "Naš flagship produkt",
    status: "U razvoju",
    launch: "Lansiranje: oktobar 2027",
    h: "Nova generacija",
    accent: "oglašavanja nekretnina",
    desc: "Platforma za nekretnine građena za Balkan. AI piše opise, oglasi agencija se objavljuju sami, a sve radi trenutno i na telefonu.",
    pick: "Funkcije platforme",
    features: [
      { key: "ai", t: "AI opisi oglasa", d: "Agent unese parametre, prodajni tekst je gotov jednim klikom." },
      { key: "xml", t: "XML sinhronizacija", d: "Oglasi velikih agencija se objavljuju potpuno sami." },
      { key: "calc", t: "Kreditni kalkulator", d: "Kupac odmah vidi ratu, a banka dobija spremnog klijenta." },
    ],
    marketsLabel: "Od starta za 4 tržišta",
    aiTitle: "AI opis oglasa",
    aiText: "Svijetao trosoban stan od 78 m² u samom centru Mostara. Renoviran, sa pogledom na Neretvu i parkingom u dvorištu. Idealan za porodicu ili investiciju.",
    aiDone: "Gotovo",
    xmlTitle: "XML sinhronizacija",
    xmlSub: "Oglasi vaše agencije",
    xmlCount: "oglasa objavljeno",
    xmlRow: "Objavljeno",
    calcTitle: "Kreditni kalkulator",
    calcPrice: "185.000 KM",
    calcDown: "Učešće 20%",
    calcYears: "Rok otplate",
    calcRate: "Mjesečna rata",
    calcNote: "Primjer uz kamatu 4,5%",
    search: "Trosoban stan, Mostar…",
    filters: ["BiH", "KM", "3+ sobe", "Prodaja"],
    earlyAccess: "Rani pristup za agencije",
    earlyAccessDesc: "Prijavite se prije lansiranja, prva 2 mjeseca su besplatna.",
    placeholder: "vasa@email.com",
    submit: "Prijavi se",
    submitting: "Slanje…",
    success: "Hvala na prijavi! Javit ćemo vam se prije lansiranja.",
    error: "Slanje nije uspjelo. Pišite nam na bakir.mehic@mehiccdev.com.",
  },
  en: {
    label: "Our flagship product",
    status: "In development",
    launch: "Launch: October 2027",
    h: "The next generation of",
    accent: "real estate listings",
    desc: "A real estate platform built for the Balkans. AI writes the listing copy, agency listings publish themselves, and everything is instant, even on a phone.",
    pick: "Platform features",
    features: [
      { key: "ai", t: "AI listing copy", d: "The agent enters the details, the sales copy is ready in one click." },
      { key: "xml", t: "XML synchronization", d: "Listings from large agencies publish themselves." },
      { key: "calc", t: "Mortgage calculator", d: "Buyers see the payment instantly, banks get ready leads." },
    ],
    marketsLabel: "4 markets from day one",
    aiTitle: "AI listing copy",
    aiText: "Bright three room flat of 78 m² right in the centre of Mostar. Renovated, with a view of the Neretva and parking in the yard. Ideal for a family or as an investment.",
    aiDone: "Done",
    xmlTitle: "XML synchronization",
    xmlSub: "Your agency's listings",
    xmlCount: "listings published",
    xmlRow: "Published",
    calcTitle: "Mortgage calculator",
    calcPrice: "€94,500",
    calcDown: "20% down payment",
    calcYears: "Loan term",
    calcRate: "Monthly payment",
    calcNote: "Example at 4.5% interest",
    search: "Three room flat, Mostar…",
    filters: ["BiH", "EUR", "3+ rooms", "For sale"],
    earlyAccess: "Early access for agencies",
    earlyAccessDesc: "Sign up before launch, the first 2 months are free.",
    placeholder: "your@email.com",
    submit: "Sign up",
    submitting: "Sending…",
    success: "Thanks for signing up! We'll reach out before launch.",
    error: "Sending failed. Email us at bakir.mehic@mehiccdev.com.",
  },
};

const ICONS: Record<Key, LucideIcon> = { ai: Sparkles, xml: RefreshCw, calc: Landmark };
const MARKETS = [["BA", "BiH"], ["RS", "Srbija"], ["HR", "Hrvatska"], ["ME", "Crna Gora"]] as const;
const LISTINGS = {
  bs: [
    { t: "Trosoban stan, Centar", m: "78 m² · 3 sobe", p: "185.000 KM" },
    { t: "Kuća s okućnicom, Bijeli Brijeg", m: "142 m² · 5 soba", p: "320.000 KM" },
    { t: "Penthouse, Rondo", m: "110 m² · 4 sobe", p: "410.000 KM" },
  ],
  en: [
    { t: "Three room flat, Centre", m: "78 m² · 3 rooms", p: "€94,500" },
    { t: "House with garden, Bijeli Brijeg", m: "142 m² · 5 rooms", p: "€163,500" },
    { t: "Penthouse, Rondo", m: "110 m² · 4 rooms", p: "€209,500" },
  ],
} as const;
const PRICE = { bs: 185000, en: 94500 };
const CYCLE = 7000;
const EASE = [0.22, 1, 0.36, 1] as const;
const FLOAT = "0 1px 2px rgba(15,23,42,0.06), 0 24px 48px -24px rgba(15,23,42,0.4)";

function useCalm() {
  const pref = useReducedMotion() ?? false;
  const [calm, setCalm] = useState(false);
  useEffect(() => setCalm(pref), [pref]);
  return calm;
}

function Building({ i }: { i: number }) {
  const tones = [["#E8EEF5", "#C9D6E4"], ["#EEF1E8", "#D3DCC6"], ["#F3EEE6", "#E0D4C2"]][i % 3];
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden>
      <rect width="160" height="100" fill={tones[0]} />
      <circle cx="128" cy="24" r="10" fill="#FFFFFF" opacity=".7" />
      <rect x={i % 2 ? 22 : 36} y={i % 2 ? 34 : 26} width={i % 2 ? 70 : 54} height="74" fill={tones[1]} />
      <rect x="96" y="48" width="38" height="60" fill={tones[1]} opacity=".75" />
      {Array.from({ length: 12 }).map((_, k) => (
        <rect key={k} x={(i % 2 ? 30 : 44) + (k % 4) * 14} y={(i % 2 ? 42 : 34) + Math.floor(k / 4) * 16} width="8" height="9" rx="1" fill="#FFFFFF" opacity=".85" />
      ))}
    </svg>
  );
}

function AiPanel({ d, calm }: { d: Content; calm: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (calm) { setN(d.aiText.length); return; }
    if (n >= d.aiText.length) return;
    const id = window.setTimeout(() => setN((v) => Math.min(d.aiText.length, v + 2)), 22);
    return () => window.clearTimeout(id);
  }, [n, calm, d.aiText.length]);
  const done = n >= d.aiText.length;
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[13px] font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0F3554] text-white"><Sparkles size={14} /></span>{d.aiTitle}</span>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${done ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F1F5F9] text-[#64748B]"}`}>{done ? d.aiDone : "…"}</span>
      </div>
      <p className="mt-3 min-h-[84px] text-[13px] leading-relaxed text-[#334155]">
        {d.aiText.slice(0, n)}{!done && <span className="ml-px inline-block h-[13px] w-[1.5px] translate-y-[2px] animate-pulse bg-[#0F3554]" />}
      </p>
    </>
  );
}

function XmlPanel({ d, l, calm }: { d: Content; l: Lang; calm: boolean }) {
  const [c, setC] = useState(0);
  useEffect(() => {
    if (calm) { setC(142); return; }
    if (c >= 142) return;
    const id = window.setTimeout(() => setC((v) => Math.min(142, v + 6)), 30);
    return () => window.clearTimeout(id);
  }, [c, calm]);
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[13px] font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0F3554] text-white"><RefreshCw size={14} /></span>{d.xmlTitle}</span>
        <span className="text-[11.5px] text-[#64748B]">{d.xmlSub}</span>
      </div>
      <p className="mt-3 flex items-baseline gap-2"><span className="text-[30px] font-semibold leading-none tabular-nums">{c}</span><span className="text-[12.5px] text-[#64748B]">{d.xmlCount}</span></p>
      <ul className="mt-3 space-y-1.5">
        {LISTINGS[l].map((it, i) => (
          <motion.li key={it.t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: calm ? 0 : 0.25 + i * 0.18, ease: EASE }}
            className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-2.5 py-1.5 text-[12px]">
            <Check size={13} strokeWidth={3} className="text-[#16A34A]" />
            <span className="min-w-0 flex-1 truncate text-[#334155]">{it.t}</span>
            <span className="text-[10.5px] font-semibold text-[#15803D]">{d.xmlRow}</span>
          </motion.li>
        ))}
      </ul>
    </>
  );
}

function CalcPanel({ d, l }: { d: Content; l: Lang }) {
  const [years, setYears] = useState(25);
  const loan = PRICE[l] * 0.8;
  const r = 0.045 / 12;
  const rate = (loan * r) / (1 - Math.pow(1 + r, -years * 12));
  const shown = l === "bs" ? `${Math.round(rate).toLocaleString("de-DE")} KM` : `€${Math.round(rate).toLocaleString("en-US")}`;
  const pct = ((years - 10) / 20) * 100;
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[13px] font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0F3554] text-white"><Landmark size={14} /></span>{d.calcTitle}</span>
        <span className="text-[11.5px] text-[#64748B]">{d.calcPrice} · {d.calcDown}</span>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <label htmlFor="saas-years" className="text-[12px] text-[#64748B]">{d.calcYears}</label>
        <span className="text-[12.5px] font-semibold tabular-nums">{years} {l === "bs" ? "god." : "yrs"}</span>
      </div>
      <div className="pt-3">
        <input id="saas-years" type="range" min={10} max={30} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))}
               className="race-scrub" style={{ background: `linear-gradient(90deg, #0F3554 ${pct}%, #E2E8F0 ${pct}%)` }} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-2 rounded-xl bg-[#F4F7FB] px-3 py-2.5">
        <span className="text-[12px] text-[#64748B]">{d.calcRate}</span>
        <span className="text-[24px] font-semibold leading-none tabular-nums">{shown}</span>
      </div>
      <p className="mt-2 text-[10.5px] text-[#94A3B8]">{d.calcNote}</p>
    </>
  );
}

export function SaasTeaser() {
  const { lang } = useLanguage();
  const l: Lang = lang === "en" ? "en" : "bs";
  const d = T[l];
  const calm = useCalm();
  const [a, setA] = useState(0);
  const [touched, setTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const key = d.features[a].key;

  useEffect(() => {
    if (calm || touched) return;
    const id = window.setTimeout(() => { if (!document.hidden) setA((v) => (v + 1) % d.features.length); }, CYCLE);
    return () => window.clearTimeout(id);
  }, [a, calm, touched, d.features.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: l === "en" ? "Early access (agency)" : "Rani pristup (agencija)",
          email,
          subject: "Rani pristup · Real Estate SaaS",
          message: (l === "en" ? "An agency signed up for early access to the real estate platform: " : "Agencija se prijavila za rani pristup platformi za nekretnine: ") + email,
          website: "",
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <section id="saas" className="relative bg-white scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-8">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.label}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#15803D]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A34A]" /> {d.status}
            </span>
          </div>
          <h2 className="mt-4 text-[32px] leading-[1.1] sm:text-[44px] font-semibold tracking-[-0.03em] text-[#0F172A]" style={{ textWrap: "balance" }}>
            {d.h} <span className="text-[#0F3554]">{d.accent}</span>
          </h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#475569]">{d.desc}</p>

          <div role="tablist" aria-label={d.pick} className="mt-8 flex flex-col gap-2">
            {d.features.map((f, i) => {
              const on = i === a;
              const Icon = ICONS[f.key];
              return (
                <button key={f.key} type="button" role="tab" aria-selected={on} onClick={() => { setA(i); setTouched(true); }}
                  className={`group relative flex items-start gap-3.5 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${on ? "border-[#0F172A] bg-[#0F172A] text-white" : "border-[#E5E7EB] bg-white text-[#0F172A] hover:-translate-y-0.5 hover:border-[#CBD5E1]"}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${on ? "bg-white/10 text-white" : "bg-[#EEF3F8] text-[#0F3554]"}`}><Icon size={17} /></span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold">{f.t}</span>
                    <span className={`mt-0.5 block text-[13px] leading-snug ${on ? "text-[#94A3B8]" : "text-[#64748B]"}`}>{f.d}</span>
                  </span>
                  {on && !calm && !touched && <span key={`p${a}`} aria-hidden className="hero-progress absolute bottom-0 left-0 h-[2px] bg-[#DC2626]" style={{ animationDuration: `${CYCLE}ms` }} />}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[12.5px] font-medium text-[#64748B]">{d.marketsLabel}</span>
            {MARKETS.map(([code, name]) => (
              <span key={code} className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-2.5 py-1 text-[12px] text-[#334155]">
                <span className="text-[10px] font-bold text-[#0F3554]">{code}</span> {name}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-[#F4F7FB] p-3 sm:p-4">
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white" style={{ boxShadow: FLOAT }}>
              <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-3">
                <span className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-[#0F3554] text-white"><Building2 size={13} /></span>
                  <span className="h-2 w-16 rounded-full bg-[#0F172A]/80" />
                </span>
                <span className="text-[11px] font-medium text-[#64748B]">{d.launch}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2">
                  <Search size={14} className="text-[#94A3B8]" />
                  <span className="flex-1 truncate text-[12px] text-[#475569]">{d.search}</span>
                  <span className="rounded-lg bg-[#0F172A] px-2 py-1 text-white"><Search size={11} /></span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {d.filters.map((f, k) => (
                    <span key={f} className={`rounded-full px-2.5 py-1 text-[10.5px] font-medium ${k === 0 ? "bg-[#0F3554] text-white" : "bg-[#F1F5F9] text-[#475569]"}`}>{f}</span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-[1.3fr_1fr] gap-3">
                  {LISTINGS[l].slice(0, 2).map((it, i) => (
                    <div key={it.t} className="group/c overflow-hidden rounded-xl border border-[#F1F5F9] transition-transform duration-300 hover:-translate-y-1">
                      <div className="relative aspect-[16/11] overflow-hidden">
                        <div className="h-full w-full transition-transform duration-500 group-hover/c:scale-105"><Building i={i} /></div>
                        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[#64748B]"><Heart size={11} /></span>
                        {i === 0 && key === "ai" && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-[#0F3554] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"><Sparkles size={9} /> AI</span>}
                      </div>
                      <div className="p-2.5">
                        <p className="text-[12.5px] font-semibold text-[#0F172A]">{it.p}</p>
                        <p className="mt-0.5 truncate text-[11px] text-[#475569]">{it.t}</p>
                        <p className="text-[10.5px] text-[#94A3B8]">{it.m}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative -mt-16 mx-3 sm:mx-8" onPointerDown={() => setTouched(true)}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={key}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: calm ? 0 : 0.4, ease: EASE }}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[#0F172A]" style={{ boxShadow: FLOAT }}>
                  {key === "ai" && <AiPanel d={d} calm={calm} />}
                  {key === "xml" && <XmlPanel d={d} l={l} calm={calm} />}
                  {key === "calc" && <CalcPanel d={d} l={l} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 rounded-[20px] bg-[#0F172A] p-5 sm:p-6">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-white"><Sparkles size={15} className="text-[#4ADE80]" /> {d.earlyAccess}</p>
            <p className="mt-1 text-[13px] text-[#94A3B8]">{d.earlyAccessDesc}</p>
            {state === "done" ? (
              <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-3 text-[14px] font-medium text-white">
                <Check size={16} className="text-[#4ADE80]" /> {d.success}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={d.placeholder} aria-label={d.placeholder}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white px-4 py-3 text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-white" />
                <button type="submit" disabled={state === "sending"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-70">
                  {state === "sending" ? d.submitting : d.submit} {state !== "sending" && <ArrowRight size={15} />}
                </button>
              </form>
            )}
            {state === "error" && <p className="mt-3 text-[13px] text-[#FCA5A5]">{d.error}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
