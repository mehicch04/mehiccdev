"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowRight, ArrowUpRight, Gauge, KeyRound, Palette, Plus, Smartphone, Star, ZoomIn } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Backdrop, Fade, BrowserFrame, PhoneMockup, Lightbox, preloadImage, SOFT, FLOAT, type ZoomState } from "@/components/ui/kit";

type Cat = "all" | "app" | "web" | "design" | "product";
type Status = "live" | "build";
type L = "bs" | "en";

type Project = {
  id: string;
  cat: Exclude<Cat, "all">;
  status: Status;
  featured?: boolean;
  desk?: string;
  mob?: string;
  mobBar?: "light" | "dark";
  mobBarColor?: string;
  url?: string;
  live?: string;
  caseHref?: string;
  title: string;
  titleEn?: string;
  industry: Record<L, string>;
  type: Record<L, string>;
  desc: Record<L, string>;
  scope: Record<L, string[]>;
  stats?: { v: string; l: Record<L, string> }[];
};

const PROJECTS: Project[] = [
  {
    id: "maximum", cat: "app", status: "live", featured: true,
    desk: "/portfolio/maximum-poslije.webp", mob: "/portfolio/maximum-admin-mob-svijetla.webp",
    url: "maximum-rent.vercel.app", live: "https://maximum-rent.vercel.app", caseHref: "/maximum",
    title: "Maximum Rent a Car",
    industry: { bs: "Rent a car", en: "Car rental" },
    type: { bs: "Web aplikacija", en: "Web app" },
    desc: {
      bs: "Kompletan sistem za iznajmljivanje vozila. Gost bira auto i datume, sistem sprječava dupla rezervisanja, a vlasnik sve potvrđuje u dva klika iz svog panela.",
      en: "A complete car rental system. Guests pick a car and dates, the system prevents double bookings, and the owner confirms everything in two clicks from a private panel.",
    },
    scope: { bs: ["Dizajn", "Razvoj", "Admin panel", "SEO i brzina"], en: ["Design", "Development", "Admin panel", "SEO and speed"] },
    stats: [
      { v: "3,2s", l: { bs: "učitavanje na telefonu, prije 21,6s", en: "mobile load, was 21.6s" } },
      { v: "100", l: { bs: "Google ocjena performansi", en: "Google performance score" } },
      { v: "24/7", l: { bs: "prima upite i noću", en: "takes inquiries at night too" } },
    ],
  },
  {
    id: "gosto", cat: "app", status: "build",
    desk: "/portfolio/gosto-coaching.webp", mob: "/portfolio/gosto-mob.webp", mobBar: "dark", mobBarColor: "#0A0A0A",
    url: "adnangosto.com",
    title: "Adnan Gosto · IFBB Pro",
    industry: { bs: "Fitness", en: "Fitness" },
    type: { bs: "Web aplikacija", en: "Web app" },
    desc: {
      bs: "Platforma za IFBB Pro trenera i višestrukog prvaka BiH, s prijavama klijenata i admin panelom za vođenje saradnji.",
      en: "A platform for an IFBB Pro coach and multiple national champion, with client sign ups and an admin panel to manage coaching.",
    },
    scope: { bs: ["Dizajn", "Razvoj", "Admin panel"], en: ["Design", "Development", "Admin panel"] },
  },
  {
    id: "roobet", cat: "design", status: "live",
    desk: "/portfolio/roobet.png", mob: "/portfolio/roobet-mob.webp", mobBar: "dark", mobBarColor: "#191939",
    url: "roobet.com", live: "https://roobet.com/",
    title: "Roobet Rewards",
    industry: { bs: "Gaming", en: "Gaming" },
    type: { bs: "UI/UX dizajn", en: "UI/UX design" },
    desc: {
      bs: "Dizajn sistema nagrada za gaming platformu, s nivoima i napretkom koji igrača vodi naprijed.",
      en: "Rewards system design for a gaming platform, with tiers and progression that pull players forward.",
    },
    scope: { bs: ["UI/UX dizajn", "Sistem nivoa"], en: ["UI/UX design", "Tier system"] },
  },
  {
    id: "oxybaric", cat: "web", status: "build",
    desk: "/portfolio/oxybaric.png", url: "oxybaricmostar.ba",
    title: "OxyBaric Mostar",
    industry: { bs: "Medicina", en: "Medicine" },
    type: { bs: "Web sajt", en: "Website" },
    desc: {
      bs: "Medicinski sajt koji dovodi pacijente iz Google pretrage, jasan i brz na svakom telefonu.",
      en: "A medical site that brings patients in from Google search, clear and fast on every phone.",
    },
    scope: { bs: ["Dizajn", "Razvoj", "SEO"], en: ["Design", "Development", "SEO"] },
  },
  {
    id: "nekretnine", cat: "product", status: "build",
    title: "Platforma za nekretnine",
    titleEn: "Real estate platform",
    industry: { bs: "Nekretnine", en: "Real estate" },
    type: { bs: "Naš proizvod", en: "Our product" },
    desc: {
      bs: "Naš vlastiti proizvod. Kreće s rezervacijom vikendica u Mostaru, a raste u platformu za prodaju i najam nekretnina.",
      en: "Our own product. It starts with cottage bookings in Mostar and grows into a platform for selling and renting property.",
    },
    scope: { bs: ["Proizvod", "Dizajn", "Razvoj"], en: ["Product", "Design", "Development"] },
  },
];

const T = {
  bs: {
    eyebrow: "Portfolio",
    h1: "Radovi koje možete",
    h1b: "otvoriti i probati.",
    sub: "Svaki projekat ovdje je pravi posao za pravog klijenta ili naš vlastiti proizvod. Gotovi rade uživo, a na ostalima radimo upravo sada.",
    ctaPrimary: "Želim ovakav projekat",
    ctaSecondary: "Pogledaj projekte",
    board: "Ukratko",
    projects: "projekata",
    live: "Uživo",
    build: "U izradi",
    industries: "Industrije",
    cats: { all: "Sve", app: "Web aplikacije", web: "Sajtovi", design: "UI/UX dizajn", product: "Naši proizvodi" } as Record<Cat, string>,
    featured: "Najveći projekat",
    seeLive: "Pogledaj uživo",
    caseStudy: "Pogledaj case study",
    similar: "Želim sličan projekat",
    zoom: "Uvećaj",
    close: "Zatvori",
    soon: "uskoro",
    nextTitle: "Sljedeći projekat može biti vaš.",
    nextSub: "Opišite šta vam treba i za 24 sata dobijate odgovor, cijenu i plan.",
    nextCta: "Pošaljite upit",
    sameHead: "Isto u svakom projektu",
    sameH: "Ono što ne zavisi od",
    sameHb: "veličine posla",
    same: [
      { t: "Dizajn po mjeri", d: "Bez gotovih šablona. Izgled prati vaš brend i vaše kupce." },
      { t: "Brzina", d: "Sajt se otvara brzo i na slabom signalu, jer od toga zavise upiti." },
      { t: "Prvo za telefon", d: "Većina kupaca dolazi s mobitela, pa tu sve mora raditi savršeno." },
      { t: "Sve je vaše", d: "Sistem, sajt i podaci pripadaju vama. Nema zaključavanja." },
    ],
    banner: ["Imate ideju? ", "Pretvorimo je u sistem koji radi."],
    bannerSub: "Besplatne konsultacije, bez obaveze.",
    bannerBtn: "Zakaži razgovor",
    listing: ["Vikendica uz Neretvu", "Kuća s bazenom", "Apartman, Stari grad"],
  },
  en: {
    eyebrow: "Portfolio",
    h1: "Work you can",
    h1b: "open and try.",
    sub: "Every project here is real work for a real client or our own product. Finished ones run live, and we are working on the rest right now.",
    ctaPrimary: "I want a project like this",
    ctaSecondary: "Browse projects",
    board: "At a glance",
    projects: "projects",
    live: "Live",
    build: "In progress",
    industries: "Industries",
    cats: { all: "All", app: "Web apps", web: "Websites", design: "UI/UX design", product: "Our products" } as Record<Cat, string>,
    featured: "Biggest build",
    seeLive: "See it live",
    caseStudy: "See the case study",
    similar: "I want something similar",
    zoom: "Enlarge",
    close: "Close",
    soon: "coming soon",
    nextTitle: "Your project could be next.",
    nextSub: "Tell us what you need and within 24 hours you get an answer, a price and a plan.",
    nextCta: "Send an inquiry",
    sameHead: "Same in every project",
    sameH: "What doesn't depend on",
    sameHb: "the size of the job",
    same: [
      { t: "Custom design", d: "No ready made templates. The look follows your brand and your customers." },
      { t: "Speed", d: "The site opens fast even on weak signal, because inquiries depend on it." },
      { t: "Phone first", d: "Most customers arrive on a phone, so everything has to work perfectly there." },
      { t: "It's all yours", d: "The system, the site and the data belong to you. No lock in." },
    ],
    banner: ["Got an idea? ", "Let's turn it into a system that works."],
    bannerSub: "Free consultation, no strings attached.",
    bannerBtn: "Book a call",
    listing: ["Cottage by the Neretva", "House with a pool", "Old Town apartment"],
  },
};

const SAME_ICONS = [Palette, Gauge, Smartphone, KeyRound];
const CATS: Cat[] = ["all", "app", "web", "design", "product"];
const GRID_BG = {
  backgroundColor: "#F4F7FB",
};

function StatusPill({ s, d, dark = false }: { s: Status; d: (typeof T)["bs"]; dark?: boolean }) {
  return s === "live" ? (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${dark ? "bg-[#16A34A]/15 text-[#4ADE80]" : "bg-[#DCFCE7] text-[#15803D]"}`}>
      <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-60" /><span className="relative h-1.5 w-1.5 rounded-full bg-[#16A34A]" /></span>
      {d.live}
    </span>
  ) : (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${dark ? "bg-white/10 text-[#CBD5E1]" : "bg-[#FEF3C7] text-[#B45309]"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
      {d.build}
    </span>
  );
}

function Visual({ p, d, onZoom, big = false }: { p: Project; d: (typeof T)["bs"]; onZoom: (z: ZoomState) => void; big?: boolean }) {
  if (!p.desk) {
    return (
      <div className="relative px-6 pt-8 pb-10 sm:px-10" style={GRID_BG}>
        <BrowserFrame url={d.soon}>
          <span className="block aspect-[16/10] bg-white p-[5%]">
            <span className="flex items-center justify-between">
              <span className="h-2.5 w-20 rounded-full bg-[#0F172A]" />
              <span className="flex gap-1.5"><span className="h-2 w-8 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-8 rounded-full bg-[#E2E8F0]" /><span className="h-5 w-14 rounded-md bg-[#DC2626]" /></span>
            </span>
            <span className="mt-[6%] grid grid-cols-3 gap-[4%]">
              {d.listing.map((x, i) => (
                <span key={x} className="block overflow-hidden rounded-lg border border-[#EEF2F6]">
                  <span className="block aspect-[4/3]" style={{ background: ["linear-gradient(135deg,#0F3554,#3B6E95)", "linear-gradient(135deg,#16A34A,#86EFAC)", "linear-gradient(135deg,#0F172A,#475569)"][i] }} />
                  <span className="block p-[8%]">
                    <span className="block truncate text-[9px] font-semibold text-[#0F172A] sm:text-[10px]">{x}</span>
                    <span className="mt-1 block h-1.5 w-1/2 rounded-full bg-[#E2E8F0]" />
                  </span>
                </span>
              ))}
            </span>
          </span>
        </BrowserFrame>
      </div>
    );
  }
  return (
    <div className={`relative ${big ? "px-5 pt-6 pb-10 sm:px-10 sm:pt-10 sm:pb-14" : "px-6 pt-8 pb-10 sm:px-10"}`} style={big ? undefined : GRID_BG}>
      <button type="button" onPointerEnter={() => preloadImage(p.desk!)} onClick={() => onZoom({ src: p.desk!, alt: p.title })}
              aria-label={`${p.title} · ${d.zoom}`} className={`group/zoom block cursor-zoom-in text-left ${p.mob ? "w-[86%]" : "w-full"}`}>
        <BrowserFrame url={p.url}>
          <span className="relative block aspect-[16/10] overflow-hidden">
            <Image src={p.desk} alt={p.title} fill sizes={big ? "(max-width: 1024px) 90vw, 620px" : "(max-width: 1024px) 90vw, 480px"} quality={85}
                   className="object-cover object-top transition-transform duration-700 ease-out group-hover/zoom:scale-[1.03]" />
            <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#0F172A]/80 px-2 py-1 text-[10.5px] font-medium text-white opacity-0 transition-opacity group-hover/zoom:opacity-100">
              <ZoomIn size={11} /> {d.zoom}
            </span>
          </span>
        </BrowserFrame>
      </button>
      {p.mob && (
        <button type="button" onPointerEnter={() => preloadImage(p.mob!)} onClick={() => onZoom({ src: p.mob!, alt: p.title, phone: true })}
                aria-label={`${p.title} · ${d.zoom}`}
                className={`absolute cursor-zoom-in transition-transform duration-500 ease-out hover:-translate-y-1 ${big ? "bottom-4 right-5 w-[24%] sm:right-10" : "bottom-5 right-6 w-[23%] sm:right-10"}`}>
          <PhoneMockup src={p.mob} alt={p.title} bar={p.mobBar} barColor={p.mobBarColor} sizes="(max-width: 640px) 25vw, 160px" />
        </button>
      )}
    </div>
  );
}

function Actions({ p, d, dark = false }: { p: Project; d: (typeof T)["bs"]; dark?: boolean }) {
  const ghost = dark
    ? "border-white/15 text-white hover:bg-white/10"
    : "border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]";
  return (
    <div className="flex flex-wrap gap-2.5">
      {p.caseHref && (
        <a href={p.caseHref} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${dark ? "bg-white text-[#0F172A] hover:bg-[#F1F5F9]" : "bg-[#0F172A] text-white hover:bg-[#1E293B]"}`}>
          {d.caseStudy} <ArrowRight size={14} />
        </a>
      )}
      {p.live && (
        <a href={p.live} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${ghost}`}>
          {d.seeLive} <ArrowUpRight size={14} />
        </a>
      )}
      {!p.live && !p.caseHref && (
        <a href="/#kontakt" className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${ghost}`}>
          {d.similar} <ArrowRight size={14} />
        </a>
      )}
    </div>
  );
}

function Featured({ p, d, lang, onZoom }: { p: Project; d: (typeof T)["bs"]; lang: L; onZoom: (z: ZoomState) => void }) {
  return (
    <article className="grid overflow-hidden rounded-[24px] bg-[#0F172A] lg:grid-cols-[0.95fr_1.1fr]" style={{ boxShadow: FLOAT }}>
      <div className="flex flex-col p-7 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-semibold text-white">
            <Star size={11} className="fill-[#FBBF24] text-[#FBBF24]" /> {d.featured}
          </span>
          <StatusPill s={p.status} d={d} dark />
        </div>
        <p className="mt-6 text-[12.5px] font-medium text-[#94A3B8]">{p.type[lang]} · {p.industry[lang]}</p>
        <h2 className="mt-1.5 text-[28px] font-semibold tracking-[-0.02em] text-white sm:text-[34px]">{p.title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#CBD5E1]">{p.desc[lang]}</p>
        {p.stats && (
          <dl className="mt-7 grid grid-cols-3 gap-4 border-y border-white/10 py-5">
            {p.stats.map((x) => (
              <div key={x.v}>
                <dd className="text-[22px] font-semibold tracking-tight text-white tabular-nums">{x.v}</dd>
                <dt className="mt-0.5 text-[11.5px] leading-snug text-[#94A3B8]">{x.l[lang]}</dt>
              </div>
            ))}
          </dl>
        )}
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {p.scope[lang].map((s) => <li key={s} className="rounded-full border border-white/10 px-2.5 py-1 text-[11.5px] text-[#CBD5E1]">{s}</li>)}
        </ul>
        <div className="mt-auto pt-8"><Actions p={p} d={d} dark /></div>
      </div>
      <div className="relative order-first flex items-center lg:order-none" style={{ background: "linear-gradient(160deg, #1B3553 0%, #12233A 45%, #0F172A 100%)" }}>
        <div className="w-full"><Visual p={p} d={d} onZoom={onZoom} big /></div>
      </div>
    </article>
  );
}

function Card({ p, d, lang, onZoom }: { p: Project; d: (typeof T)["bs"]; lang: L; onZoom: (z: ZoomState) => void }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#E5E7EB] bg-white transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[#CBD5E1]" style={{ boxShadow: SOFT }}>
      <div className="border-b border-[#F1F5F9]"><Visual p={p} d={d} onZoom={onZoom} /></div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12.5px] font-medium text-[#64748B]">{p.type[lang]} · {p.industry[lang]}</p>
          <StatusPill s={p.status} d={d} />
        </div>
        <h3 className="mt-2 text-[21px] font-semibold tracking-[-0.01em] text-[#0F172A]">{lang === "en" && p.titleEn ? p.titleEn : p.title}</h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[#475569]">{p.desc[lang]}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {p.scope[lang].map((s) => <li key={s} className="rounded-full bg-[#EEF3F8] px-2.5 py-1 text-[11.5px] font-medium text-[#0F3554]">{s}</li>)}
        </ul>
        <div className="mt-auto pt-6"><Actions p={p} d={d} /></div>
      </div>
    </article>
  );
}

export function PortfolioPage() {
  const { lang: raw } = useLanguage();
  const lang: L = raw === "en" ? "en" : "bs";
  const d = T[lang];
  const [cat, setCat] = useState<Cat>("all");
  const [zoom, setZoom] = useState<ZoomState>(null);
  const closeZoom = useCallback(() => setZoom(null), []);

  const counts = useMemo(() => {
    const c: Record<Cat, number> = { all: PROJECTS.length, app: 0, web: 0, design: 0, product: 0 };
    PROJECTS.forEach((p) => { c[p.cat] += 1; });
    return c;
  }, []);
  const liveN = PROJECTS.filter((p) => p.status === "live").length;
  const shown = PROJECTS.filter((p) => cat === "all" || p.cat === cat);
  const industries = Array.from(new Set(PROJECTS.map((p) => p.industry[lang])));

  return (
    <main className="relative bg-white">
      <section className="hero-light relative bg-white">
        <Backdrop>
          <div className="mx-auto grid max-w-6xl items-end gap-12 px-6 pb-20 pt-36 sm:pt-40 lg:grid-cols-[1.25fr_1fr] lg:px-8">
            <Fade>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12.5px] font-medium text-[#0F172A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> {d.eyebrow}
              </span>
              <h1 className="mt-6 text-[40px] leading-[1.05] sm:text-[58px] font-semibold tracking-[-0.035em] text-[#0F172A]" style={{ textWrap: "balance" }}>
                {d.h1} <span className="block text-[#0F3554]">{d.h1b}</span>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#475569]">{d.sub}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="/#kontakt" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
                  {d.ctaPrimary} <ArrowRight size={16} />
                </a>
                <a href="#projekti" className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F9FAFB]">
                  {d.ctaSecondary}
                </a>
              </div>
            </Fade>

            <Fade delay={0.1}>
              <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-6 sm:p-7" style={{ boxShadow: FLOAT }}>
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.board}</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#0F172A] p-4 text-white">
                    <p className="text-[30px] font-semibold leading-none tracking-tight tabular-nums">{PROJECTS.length}</p>
                    <p className="mt-1.5 text-[12px] text-[#94A3B8]">{d.projects}</p>
                  </div>
                  <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4">
                    <p className="text-[30px] font-semibold leading-none tracking-tight text-[#16A34A] tabular-nums">{liveN}</p>
                    <p className="mt-1.5 text-[12px] text-[#15803D]">{d.live}</p>
                  </div>
                  <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
                    <p className="text-[30px] font-semibold leading-none tracking-tight text-[#B45309] tabular-nums">{PROJECTS.length - liveN}</p>
                    <p className="mt-1.5 text-[12px] text-[#B45309]">{d.build}</p>
                  </div>
                </div>
                <p className="mt-6 text-[12.5px] font-semibold text-[#0F172A]">{d.industries}</p>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {industries.map((x) => <li key={x} className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[12px] text-[#334155]">{x}</li>)}
                </ul>
              </div>
            </Fade>
          </div>
        </Backdrop>
      </section>

      <section id="projekti" className="strip relative scroll-mt-16 bg-white">
        <div className="sticky top-16 z-30 border-y border-[#F1F5F9] bg-white">
          <div className="mx-auto max-w-6xl overflow-x-auto px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <LayoutGroup id="cats">
              <ul className="flex w-max gap-1.5 py-3" role="tablist">
                {CATS.map((c) => {
                  const on = cat === c;
                  return (
                    <li key={c}>
                      <button type="button" role="tab" aria-selected={on} onClick={() => setCat(c)}
                              className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${on ? "text-white" : "text-[#475569] hover:text-[#0F172A]"}`}>
                        {on && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-[#0F172A]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                        <span className="relative">{d.cats[c]}</span>
                        <span className={`relative rounded-full px-1.5 text-[11px] tabular-nums ${on ? "bg-white/15 text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>{counts[c]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </LayoutGroup>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl px-6 lg:px-8">
          <motion.div layout className="grid gap-6 lg:grid-cols-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((p) => (
                <motion.div key={p.id} layout
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className={p.featured ? "lg:col-span-2" : ""}>
                  {p.featured ? <Featured p={p} d={d} lang={lang} onZoom={setZoom} /> : <Card p={p} d={d} lang={lang} onZoom={setZoom} />}
                </motion.div>
              ))}
              <motion.a key="next" layout href="/#kontakt"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className={`group flex min-h-[260px] flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center transition-colors hover:border-[#0F3554] hover:bg-[#EEF3F8] ${shown.filter((p) => !p.featured).length % 2 === 0 ? "lg:col-span-2" : ""}`}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0F3554] transition-transform duration-300 group-hover:rotate-90" style={{ boxShadow: SOFT }}>
                  <Plus size={22} />
                </span>
                <p className="mt-5 text-[20px] font-semibold tracking-tight text-[#0F172A]">{d.nextTitle}</p>
                <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-[#64748B]">{d.nextSub}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-[#DC2626]">{d.nextCta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></span>
              </motion.a>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-white">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.sameHead}</p>
            <h2 className="mt-4 text-[32px] leading-[1.12] sm:text-[44px] font-semibold tracking-[-0.03em] text-[#0F172A]">
              {d.sameH} <span className="text-[#0F3554]">{d.sameHb}</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.same.map((x, i) => {
              const I = SAME_ICONS[i];
              return (
                <Fade key={x.t} delay={i * 0.05} className="rounded-[20px] border border-[#E5E7EB] bg-white p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF3F8] text-[#0F3554]"><I size={18} /></span>
                  <p className="mt-5 text-[16px] font-semibold text-[#0F172A]">{x.t}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#64748B]">{x.d}</p>
                </Fade>
              );
            })}
          </div>

          <div className="mt-14 flex flex-col gap-6 rounded-[20px] bg-[#0F172A] p-7 sm:flex-row sm:items-center sm:p-9">
            <div className="flex-1">
              <p className="text-[20px] font-semibold leading-snug tracking-tight text-white sm:text-[22px]">
                {d.banner[0]}<span className="text-[#93C5FD]">{d.banner[1]}</span>
              </p>
              <p className="mt-2 text-[14px] text-[#94A3B8]">{d.bannerSub}</p>
            </div>
            <a href="/#kontakt" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
              {d.bannerBtn} <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <Lightbox zoom={zoom} onClose={closeZoom} closeLabel={d.close} />
    </main>
  );
}
