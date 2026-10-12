"use client";

import { useState } from "react";
import {
  Sparkles, RefreshCw, Landmark, Globe2, TrendingUp, Gauge, Building2, Search,
  Check, ArrowRight, Heart, type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { keepTail } from "@/lib/text";

type Content = {
  label: string; heading1: string; headingAccent: string;
  badge: string; title: string; desc: string;
  roadmap: { icon: "start" | "launch"; date: string; label: string }[];
  chips: [string, string][];
  mockSearch: string;
  features: { t: string; d: string }[];
  earlyAccess: string; earlyAccessDesc: string;
  placeholder: string; submit: string; submitting: string; success: string;
  error: string; status: string;
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    label: "Naš flagship produkt",
    heading1: "Nova generacija",
    headingAccent: "oglašavanja nekretnina",
    badge: "Real Estate SaaS Platforma",
    title: "Jedna platforma za nekretnine, građena za Balkan",
    desc: "Agencije gube sate na ručni unos oglasa i pisanje tekstova, a kupci se muče sa sporim i nepreglednim oglasnicima. Gradimo platformu koja to mijenja: AI piše prodajne opise, oglasi velikih agencija se sinhronizuju sami, a sve se učitava trenutno i na telefonu. Dizajnirano u Mostaru, napravljeno za cijeli Balkan.",
    roadmap: [
      { icon: "start",  date: "Novembar 2026", label: "Početak razvoja" },
      { icon: "launch", date: "Oktobar 2027",  label: "Planirano lansiranje" },
    ],
    chips: [
      ["AI opis oglasa", "generisan jednim klikom"],
      ["XML sync", "142 oglasa objavljena sama"],
      ["Kreditni kalkulator", "rata od 486 KM/mj"],
    ],
    mockSearch: "Trosoban stan, Mostar…",
    features: [
      { t: "AI opisi oglasa",     d: "Agent unese parametre, prodajni tekst je gotov jednim klikom." },
      { t: "XML sinhronizacija",  d: "Kod velikih agencija se oglasi objavljuju potpuno sami." },
      { t: "Kreditni kalkulator", d: "Bankama donosi spremne klijente, direktno iz oglasa." },
      { t: "4 tržišta od starta", d: "Više valuta i jezika, za BiH, Srbiju, Hrvatsku i Crnu Goru." },
      { t: "Boost oglasa",        d: "Isticanje i promocija za privatne korisnike." },
      { t: "Ispod sekunde",       d: "Čist dizajn, prvo za telefon, sa savršenim tamnim modom." },
    ],
    earlyAccess: "Rani pristup za agencije",
    earlyAccessDesc: "Prijavite se prije lansiranja i testirajte besplatno prva 2 mjeseca.",
    placeholder: "vasa@email.com",
    submit: "Prijavi se",
    submitting: "Slanje…",
    success: "Hvala na prijavi! Javit ćemo vam se prije lansiranja.",
    error: "Slanje nije uspjelo. Pišite nam na bakir.mehic@mehiccdev.com.",
    status: "U razvoju",
  },
  en: {
    label: "Our flagship product",
    heading1: "The next generation of",
    headingAccent: "real estate listings",
    badge: "Real Estate SaaS Platform",
    title: "One real estate platform, built for the Balkans",
    desc: "Agencies lose hours on manual listing entry and copywriting, while buyers struggle with slow, cluttered listing sites. We're building a platform that changes that: AI writes the sales copy, large agencies' listings sync themselves, and everything loads instantly, even on a phone. Designed in Mostar, made for the whole Balkan region.",
    roadmap: [
      { icon: "start",  date: "November 2026", label: "Development starts" },
      { icon: "launch", date: "October 2027",  label: "Planned launch" },
    ],
    chips: [
      ["AI listing copy", "generated in one click"],
      ["XML sync", "142 listings published on their own"],
      ["Mortgage calculator", "payment from €248/mo"],
    ],
    mockSearch: "Two bedroom apartment, Mostar…",
    features: [
      { t: "AI listing copy",      d: "The agent enters the parameters, sales copy is ready in one click." },
      { t: "XML synchronization",  d: "At large agencies, listings publish themselves." },
      { t: "Mortgage calculator",  d: "Delivers ready leads to partner banks, straight from the listing." },
      { t: "4 markets from day 1", d: "Multiple currencies and languages for Bosnia, Serbia, Croatia and Montenegro." },
      { t: "Listing boost",        d: "Featuring and promotion for private users." },
      { t: "Under a second",       d: "Clean design, built for phones first, with a flawless dark mode." },
    ],
    earlyAccess: "Early access for agencies",
    earlyAccessDesc: "Sign up before launch and test free for the first 2 months.",
    placeholder: "your@email.com",
    submit: "Sign up",
    submitting: "Sending…",
    success: "Thanks for signing up! We'll reach out before launch.",
    error: "Sending failed. Email us at bakir.mehic@mehiccdev.com.",
    status: "In development",
  },
};

const FEATURE_ICONS: LucideIcon[] = [Sparkles, RefreshCw, Landmark, Globe2, TrendingUp, Gauge];
const CHIP_ICONS: LucideIcon[]    = [Sparkles, RefreshCw, Landmark];
const MARKETS = [["BA", "BiH"], ["RS", "Srbija"], ["HR", "Hrvatska"], ["ME", "Crna Gora"]] as const;

const LISTINGS = {
  bs: [
    { t: "Trosoban stan, Centar",  m: "78 m² · 3 sobe",  p: "185.000 KM", tag: "boost" },
    { t: "Kuća s okućnicom, Bijeli Brijeg", m: "142 m² · 5 soba", p: "320.000 KM", tag: "ai" },
    { t: "Dvosoban stan, Zalik",   m: "56 m² · 2 sobe",  p: "129.000 KM", tag: "" },
    { t: "Penthouse, Rondo",       m: "110 m² · 4 sobe", p: "410.000 KM", tag: "" },
  ],
  en: [
    { t: "Three room flat, Centre",    m: "78 m² · 3 rooms",  p: "€94,500",  tag: "boost" },
    { t: "House with garden, Bijeli Brijeg", m: "142 m² · 5 rooms", p: "€163,500", tag: "ai" },
    { t: "Two room flat, Zalik",     m: "56 m² · 2 rooms",  p: "€66,000",  tag: "" },
    { t: "Penthouse, Rondo",       m: "110 m² · 4 rooms", p: "€209,500", tag: "" },
  ],
} as const;

const TONES = [
  ["#E8EEF5", "#C9D6E4"], ["#EEF1E8", "#D3DCC6"], ["#F3EEE6", "#E0D4C2"], ["#E9ECF2", "#CDD3DF"],
];

const SOFT = "0 1px 2px rgba(15,23,42,0.04)";
const FLOAT = "0 1px 2px rgba(15,23,42,0.06), 0 18px 36px -18px rgba(15,23,42,0.28)";

function Building({ i }: { i: number }) {
  const [sky, wall] = TONES[i % TONES.length];
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden>
      <rect width="160" height="100" fill={sky} />
      <circle cx="128" cy="24" r="10" fill="#FFFFFF" opacity=".7" />
      <rect x={i % 2 ? 22 : 36} y={i % 2 ? 34 : 26} width={i % 2 ? 70 : 54} height="74" fill={wall} />
      <rect x={i % 2 ? 96 : 96} y="48" width="38" height="60" fill={wall} opacity=".75" />
      {Array.from({ length: 12 }).map((_, k) => (
        <rect key={k} x={(i % 2 ? 30 : 44) + (k % 4) * 14} y={(i % 2 ? 42 : 34) + Math.floor(k / 4) * 16}
              width="8" height="9" rx="1" fill="#FFFFFF" opacity=".85" />
      ))}
      <rect x="0" y="92" width="160" height="8" fill="#FFFFFF" opacity=".6" />
    </svg>
  );
}

function PlatformMock({ lang, search }: { lang: "bs" | "en"; search: string }) {
  const items = LISTINGS[lang];
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white" style={{ boxShadow: FLOAT }}>
      <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#0F3554] text-white"><Building2 size={13} /></span>
            <span className="h-2 w-16 rounded-full bg-[#0F172A]/80" />
          </span>
          <span className="flex gap-1.5">
            <span className="h-2 w-10 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-10 rounded-full bg-[#E2E8F0]" />
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2">
          <Search size={14} className="text-[#94A3B8]" />
          <span className="flex-1 truncate text-[12px] text-[#475569]">{search}</span>
          <span className="rounded-lg bg-[#0F172A] px-2.5 py-1 text-[10.5px] font-semibold text-white">
            <Search size={11} className="inline" />
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {["BiH", "KM", lang === "en" ? "3+ rooms" : "3+ sobe", lang === "en" ? "For sale" : "Prodaja"].map((f, k) => (
            <span key={f} className={`rounded-full px-2.5 py-1 text-[10.5px] font-medium ${k === 0 ? "bg-[#0F3554] text-white" : "bg-[#F1F5F9] text-[#475569]"}`}>{f}</span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {items.map((it, i) => (
            <div key={it.t} className="overflow-hidden rounded-xl border border-[#F1F5F9]">
              <div className="relative aspect-[16/10]">
                <Building i={i} />
                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[#64748B]"><Heart size={11} /></span>
                {it.tag === "boost" && <span className="absolute left-2 top-2 rounded-md bg-[#16A34A] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Boost</span>}
                {it.tag === "ai" && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-[#0F3554] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"><Sparkles size={9} /> AI</span>}
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
  );
}

export function SaasTeaser() {
  const { lang } = useLanguage();
  const l = (lang === "en" ? "en" : "bs") as "bs" | "en";
  const d = T[l];

  const [email, setEmail]   = useState("");
  const [state, setState]   = useState<"idle" | "sending" | "done" | "error">("idle");

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
          message: (l === "en"
            ? "An agency signed up for early access to the real estate platform: "
            : "Agencija se prijavila za rani pristup platformi za nekretnine: ") + email,
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
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.label}</p>
          <h2 className="mt-4 text-[32px] leading-[1.12] sm:text-[44px] font-semibold tracking-[-0.03em] text-[#0F172A]"
              style={{ textWrap: "balance" }}>
            {d.heading1} <span className="text-[#0F3554]">{d.headingAccent}</span>
          </h2>
        </div>

        <div className="mt-12 overflow-hidden rounded-[28px] border border-[#E5E7EB]"
             style={{ background: "linear-gradient(180deg, #F5F8FC 0%, #FFFFFF 38%)", boxShadow: SOFT }}>

          <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-9">
            <span className="inline-flex flex-wrap items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0F3554] text-white"><Building2 size={16} /></span>
              <span className="text-[14px] font-semibold text-[#0F172A]">{d.badge}</span>
              <span className="whitespace-nowrap rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-semibold text-[#15803D]">{d.status}</span>
            </span>
            <ol className="flex items-center gap-3 text-[12px]">
              {d.roadmap.map((r, i) => (
                <li key={r.date} className="flex items-center gap-3">
                  {i > 0 && <span className="h-px w-8 sm:w-14 bg-[#CBD5E1]" aria-hidden />}
                  <span className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-[#0F3554] ring-4 ring-[#0F3554]/15" : "border-2 border-[#CBD5E1] bg-white"}`} />
                    <span>
                      <span className="block font-semibold text-[#0F172A]">{r.date}</span>
                      <span className="block text-[#64748B]">{r.label}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-12 px-6 py-10 sm:px-9 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-12">
            <div>
              <h3 className="text-[26px] leading-[1.2] font-semibold tracking-tight text-[#0F172A]" style={{ textWrap: "balance" }}>{d.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[#475569]">{keepTail(d.desc, 4)}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {MARKETS.map(([code, name]) => (
                  <li key={code} className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12.5px] text-[#334155]">
                    <span className="text-[10px] font-bold text-[#0F3554]">{code}</span> {name}
                  </li>
                ))}
              </ul>

              <ul className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {d.features.map((f, i) => {
                  const Icon = FEATURE_ICONS[i];
                  return (
                    <li key={f.t} className="flex gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EEF3F8] text-[#0F3554]"><Icon size={17} /></span>
                      <span>
                        <span className="block text-[14px] font-semibold text-[#0F172A]">{f.t}</span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-[#64748B]">{f.d}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="relative self-center lg:pl-4">
              <PlatformMock lang={l} search={d.mockSearch} />
              {d.chips.map(([title, value], i) => {
                const Icon = CHIP_ICONS[i];
                const pos = ["-left-3 sm:-left-10 -top-5", "-right-3 sm:-right-10 top-[36%]", "left-[12%] -bottom-6"][i];
                return (
                  <div key={title}
                    className={`float-y absolute ${pos} hidden sm:flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2`}
                    style={{ boxShadow: FLOAT, animationDelay: `${i * 0.8}s` }}>
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#EEF3F8] text-[#0F3554]"><Icon size={14} /></span>
                    <span className="leading-tight">
                      <span className="block text-[11px] font-semibold text-[#0F172A]">{title}</span>
                      <span className="block text-[11px] text-[#64748B]">{value}</span>
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" aria-hidden />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="m-3 sm:m-4 flex flex-col gap-5 rounded-[20px] bg-[#0F172A] px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[16px] font-semibold text-white">
                <Sparkles size={16} className="text-[#4ADE80]" /> {d.earlyAccess}
              </p>
              <p className="mt-1 text-[13.5px] text-[#94A3B8]">{d.earlyAccessDesc}</p>
            </div>

            {state === "done" ? (
              <p className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-3 text-[14px] font-medium text-white">
                <Check size={16} className="text-[#4ADE80]" /> {d.success}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto lg:min-w-[440px]">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={d.placeholder} aria-label={d.placeholder}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white px-4 py-3 text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-white"
                />
                <button type="submit" disabled={state === "sending"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-70">
                  {state === "sending" ? d.submitting : d.submit} {state !== "sending" && <ArrowRight size={15} />}
                </button>
              </form>
            )}
          </div>
          {state === "error" && <p className="-mt-1 mb-4 px-6 text-center text-[13px] text-[#B91C1C]">{d.error}</p>}
        </div>
      </div>
    </section>
  );
}
