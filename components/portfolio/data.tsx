"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, ZoomIn } from "lucide-react";
import { BrowserFrame, PhoneMockup, preloadImage, type ZoomState } from "@/components/ui/kit";

export type Cat = "all" | "app" | "web" | "design" | "product";
export type Status = "live" | "build";
export type L = "bs" | "en";

export type Project = {
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
  pkg?: Record<L, string>;
  since?: string;
  stack?: string[];
  deliver: { i: DIcon; t: Record<L, string> }[];
  perf?: Record<L, string>;
  accent: string;
};

export type DIcon = "cal" | "panel" | "doc" | "car" | "globe" | "shield" | "users" | "card" | "image" | "search" | "phone" | "layers" | "trophy" | "home" | "chat" | "chart";

export const PROJECTS: Project[] = [
  {
    accent: "#0F3554", id: "maximum", cat: "app", status: "live", featured: true,
    desk: "/portfolio/maximum-poslije.webp", mob: "/portfolio/maximum-admin-mob-svijetla.webp",
    url: "maximum-rent.vercel.app", live: "https://maximum-rent.vercel.app", caseHref: "/maximum",
    title: "Maximum Rent a Car",
    industry: { bs: "Rent a car", en: "Car rental" },
    type: { bs: "Web aplikacija", en: "Web app" },
    desc: {
      bs: "Kompletan sistem za iznajmljivanje vozila. Gost bira auto i datume, sistem sprječava dupla rezervisanja, a vlasnik sve potvrđuje u dva klika iz svog panela.",
      en: "A complete car rental system. Guests pick a car and dates, the system prevents double bookings, and the owner confirms everything in two clicks from a private panel.",
    },
    pkg: { bs: "Rent a car Premium", en: "Car rental Premium" }, since: "2026",
    stack: ["Next.js", "TypeScript", "Tailwind", "Supabase", "Vercel"],
    perf: { bs: "Google PageSpeed 100 · 3,2 s na telefonu, ranije 21,6 s", en: "Google PageSpeed 100 · 3.2 s on mobile, was 21.6 s" },
    deliver: [
      { i: "cal", t: { bs: "Online rezervacije", en: "Online bookings" } },
      { i: "panel", t: { bs: "Admin panel po mjeri", en: "Custom admin panel" } },
      { i: "doc", t: { bs: "Automatski ugovori", en: "Automatic contracts" } },
      { i: "car", t: { bs: "Preuzimanje i povrat", en: "Pickup and return" } },
      { i: "globe", t: { bs: "4 jezika: HR, EN, DE, ES", en: "4 languages: HR, EN, DE, ES" } },
      { i: "shield", t: { bs: "Provjere na serveru", en: "Server side checks" } },
    ],
    scope: { bs: ["Dizajn", "Razvoj", "Admin panel", "SEO i brzina"], en: ["Design", "Development", "Admin panel", "SEO and speed"] },
    stats: [
      { v: "3,2s", l: { bs: "učitavanje na telefonu, prije 21,6s", en: "mobile load, was 21.6s" } },
      { v: "100", l: { bs: "Google ocjena performansi", en: "Google performance score" } },
      { v: "24/7", l: { bs: "prima upite i noću", en: "takes inquiries at night too" } },
    ],
  },
  {
    accent: "#111111", id: "gosto", cat: "app", status: "build",
    desk: "/portfolio/gosto-hero.webp", mob: "/portfolio/gosto-hero-mob.webp", mobBar: "dark", mobBarColor: "#0A0A0A",
    url: "adnangosto.com",
    title: "Adnan Gosto · IFBB Pro",
    industry: { bs: "Fitness", en: "Fitness" },
    type: { bs: "Web aplikacija", en: "Web app" },
    desc: {
      bs: "Platforma za IFBB Pro trenera i višestrukog prvaka BiH, s prijavama klijenata i admin panelom za vođenje saradnji.",
      en: "A platform for an IFBB Pro coach and multiple national champion, with client sign ups and an admin panel to manage coaching.",
    },
    stack: ["Next.js", "TypeScript", "Tailwind"],
    deliver: [
      { i: "card", t: { bs: "Paketi i cijene coachinga", en: "Coaching plans and prices" } },
      { i: "users", t: { bs: "Prijave novih klijenata", en: "New client sign ups" } },
      { i: "panel", t: { bs: "Admin panel za saradnje", en: "Admin panel for coaching" } },
      { i: "image", t: { bs: "Galerija transformacija", en: "Transformation gallery" } },
      { i: "trophy", t: { bs: "Rezultati i takmičenja", en: "Results and competitions" } },
      { i: "phone", t: { bs: "Prilagođeno telefonu", en: "Built for phones" } },
    ],
    scope: { bs: ["Dizajn", "Razvoj", "Admin panel"], en: ["Design", "Development", "Admin panel"] },
  },
  {
    accent: "#1E1B4B", id: "roobet", cat: "design", status: "live",
    desk: "/portfolio/roobet.webp", mob: "/portfolio/roobet-mob.webp", mobBar: "dark", mobBarColor: "#191939",
    url: "roobet.com", live: "https://roobet.com/",
    title: "Roobet Rewards",
    industry: { bs: "Gaming", en: "Gaming" },
    type: { bs: "UI/UX dizajn", en: "UI/UX design" },
    desc: {
      bs: "Dizajn sistema nagrada za gaming platformu, s nivoima i napretkom koji igrača vodi naprijed.",
      en: "Rewards system design for a gaming platform, with tiers and progression that pull players forward.",
    },
    deliver: [
      { i: "trophy", t: { bs: "Sistem nivoa nagrada", en: "Reward tier system" } },
      { i: "chart", t: { bs: "Prikaz napretka igrača", en: "Player progress display" } },
      { i: "layers", t: { bs: "Komponente dizajn sistema", en: "Design system components" } },
      { i: "phone", t: { bs: "Desktop i mobilni prikaz", en: "Desktop and mobile layouts" } },
    ],
    scope: { bs: ["UI/UX dizajn", "Sistem nivoa"], en: ["UI/UX design", "Tier system"] },
  },
  {
    accent: "#0E5E6F", id: "oxybaric", cat: "web", status: "build",
    desk: "/portfolio/oxybaric.webp", url: "oxybaricmostar.ba",
    title: "OxyBaric Mostar",
    industry: { bs: "Medicina", en: "Medicine" },
    type: { bs: "Web sajt", en: "Website" },
    desc: {
      bs: "Medicinski sajt koji dovodi pacijente iz Google pretrage, jasan i brz na svakom telefonu.",
      en: "A medical site that brings patients in from Google search, clear and fast on every phone.",
    },
    stack: ["Next.js", "TypeScript", "Tailwind"],
    deliver: [
      { i: "layers", t: { bs: "Stranice tretmana i usluga", en: "Treatment and service pages" } },
      { i: "chat", t: { bs: "Upit za termin", en: "Appointment inquiry" } },
      { i: "search", t: { bs: "Lokalni SEO za Google", en: "Local SEO for Google" } },
      { i: "phone", t: { bs: "Brz na svakom telefonu", en: "Fast on every phone" } },
    ],
    scope: { bs: ["Dizajn", "Razvoj", "SEO"], en: ["Design", "Development", "SEO"] },
  },
  {
    accent: "#14532D", id: "nekretnine", cat: "product", status: "build",
    title: "Platforma za nekretnine",
    titleEn: "Real estate platform",
    industry: { bs: "Nekretnine", en: "Real estate" },
    type: { bs: "Naš proizvod", en: "Our product" },
    desc: {
      bs: "Naš vlastiti proizvod. Kreće s rezervacijom vikendica u Mostaru, a raste u platformu za prodaju i najam nekretnina.",
      en: "Our own product. It starts with cottage bookings in Mostar and grows into a platform for selling and renting property.",
    },
    stack: ["Next.js", "TypeScript", "Supabase"],
    deliver: [
      { i: "home", t: { bs: "Rezervacija vikendica", en: "Cottage bookings" } },
      { i: "cal", t: { bs: "Kalendar dostupnosti", en: "Availability calendar" } },
      { i: "panel", t: { bs: "Panel za vlasnike", en: "Owner panel" } },
      { i: "chart", t: { bs: "Kasnije: prodaja i najam", en: "Next: sales and rentals" } },
    ],
    scope: { bs: ["Proizvod", "Dizajn", "Razvoj"], en: ["Product", "Design", "Development"] },
  },
];

export const T = {
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
    k1: "Web aplikacije, sajtovi i dizajn za firme iz BiH i regiona. Gotove projekte možete otvoriti uživo.",
    proof: "Maximum Rent a Car na telefonu",
    proofV: "21,6s → 3,2s",
    all: "Svi projekti",
    colP: "Projekat",
    colT: "Tip",
    colI: "Industrija",
    colS: "Status",
    open: "Otvori",
    hover: "Pređite mišem preko projekta",
    tap: "Dodirnite projekat za detalje",
    empty: "U ovoj kategoriji još nema projekata.",
    selected: "Izdvojeni radovi",
    count: "projekata u portfoliju",
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
    k1: "Web apps, websites and design for companies across Bosnia and the region. Finished projects open live.",
    proof: "Maximum Rent a Car on mobile",
    proofV: "21.6s → 3.2s",
    all: "All projects",
    colP: "Project",
    colT: "Type",
    colI: "Industry",
    colS: "Status",
    open: "Open",
    hover: "Hover over a project",
    tap: "Tap a project for details",
    empty: "No projects in this category yet.",
    selected: "Selected work",
    count: "projects in the portfolio",
  },
};

export const CATS: Cat[] = ["all", "app", "web", "design", "product"];
export function StatusPill({ s, d, dark = false }: { s: Status; d: (typeof T)["bs"]; dark?: boolean }) {
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

export function Actions({ p, d, dark = false }: { p: Project; d: (typeof T)["bs"]; dark?: boolean }) {
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
        <a href="/kontakt" className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${ghost}`}>
          {d.similar} <ArrowRight size={14} />
        </a>
      )}
    </div>
  );
}

export const name = (p: Project, lang: L) => (lang === "en" && p.titleEn ? p.titleEn : p.title);

export function Shot({ p, d, onZoom, phone = true, sizes = "(max-width: 1024px) 90vw, 640px" }: {
  p: Project; d: (typeof T)["bs"]; onZoom: (z: ZoomState) => void; phone?: boolean; sizes?: string;
}) {
  if (!p.desk) {
    return (
      <BrowserFrame url={d.soon}>
        <span className="block aspect-[16/10] bg-white p-[5%]">
          <span className="flex items-center justify-between">
            <span className="h-2.5 w-20 rounded-full bg-[#0F172A]" />
            <span className="flex gap-1.5"><span className="h-2 w-8 rounded-full bg-[#E2E8F0]" /><span className="h-5 w-14 rounded-md bg-[#DC2626]" /></span>
          </span>
          <span className="mt-[6%] grid grid-cols-3 gap-[4%]">
            {d.listing.map((x, i) => (
              <span key={x} className="block overflow-hidden rounded-lg border border-[#EEF2F6]">
                <span className="block aspect-[4/3]" style={{ background: ["linear-gradient(135deg,#0F3554,#3B6E95)", "linear-gradient(135deg,#14532D,#4ADE80)", "linear-gradient(135deg,#0F172A,#475569)"][i] }} />
                <span className="block p-[8%]"><span className="block truncate text-[9px] font-semibold text-[#0F172A] sm:text-[10px]">{x}</span></span>
              </span>
            ))}
          </span>
        </span>
      </BrowserFrame>
    );
  }
  const withPhone = phone && !!p.mob;
  return (
    <div className="relative">
      <button type="button" onPointerEnter={() => preloadImage(p.desk!)} onClick={() => onZoom({ src: p.desk!, alt: p.title })}
              aria-label={`${p.title} · ${d.zoom}`} className={`group/zoom block cursor-zoom-in text-left ${withPhone ? "w-[86%]" : "w-full"}`}>
        <BrowserFrame url={p.url}>
          <span className="relative block aspect-[16/10] overflow-hidden">
            <Image src={p.desk} alt={p.title} fill sizes={sizes} quality={85} className="object-cover object-top transition-transform duration-700 ease-out group-hover/zoom:scale-[1.03]" />
            <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#0F172A]/80 px-2 py-1 text-[10.5px] font-medium text-white opacity-0 transition-opacity group-hover/zoom:opacity-100"><ZoomIn size={11} /> {d.zoom}</span>
          </span>
        </BrowserFrame>
      </button>
      {withPhone && (
        <button type="button" onPointerEnter={() => preloadImage(p.mob!)} onClick={() => onZoom({ src: p.mob!, alt: p.title, phone: true })}
                aria-label={`${p.title} · ${d.zoom}`} className="absolute -bottom-6 right-0 w-[24%] cursor-zoom-in transition-transform duration-500 ease-out hover:-translate-y-1">
          <PhoneMockup src={p.mob!} alt={p.title} bar={p.mobBar} barColor={p.mobBarColor} sizes="(max-width: 640px) 25vw, 170px" />
        </button>
      )}
    </div>
  );
}
