"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, BellRing, CalendarCheck, CarFront, Check, CircleCheck,
  Globe, LayoutDashboard, Megaphone, PenTool, type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Key = "app" | "web" | "ux" | "mkt";
type Item = { key: Key; title: string; tag: string; lead: string; desc: string; points: string[]; price?: string; link: string; alt: string };
type Content = {
  label: string; h: string; accent: string; sub: string; tabs: string;
  items: Item[];
  toasts: [string, string, string][];
  editLabel: string; saved: string; lines: string[];
  boxes: [string, string];
  tiles: string[]; feedName: string; feedSub: string;
  report: { title: string; sub: string; kpis: [string, string][]; chart: string };
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    label: "Usluge",
    h: "Sve što vam treba online,",
    accent: "iz jedne ruke",
    sub: "Ne morate posebno tražiti dizajnera, programera i nekoga za mreže. Radimo sve četiri stvari, i one rade zajedno.",
    tabs: "Usluge",
    items: [
      {
        key: "app", title: "Web aplikacije", tag: "Rezervacije, termini i admin panel", lead: "Aplikacija koja vodi vaš posao",
        desc: "Rezervacije, evidencija klijenata ili interni alat za tim. Sve na jednom mjestu, plaćate jednom i aplikacija je vaša.",
        points: ["Rezervacije, termini i upiti na jednom mjestu", "Admin panel za vas i vaš tim", "Obavijesti na email i WhatsApp", "Plaćate jednom, bez pretplate"],
        price: "od 1.000 KM", link: "Pogledajte primjer", alt: "Admin panel, Maximum Rent a Car",
      },
      {
        key: "web", title: "Sajtovi", tag: "Brz sajt, prvo za telefon", lead: "Sajt koji se vidi i koji sami uređujete",
        desc: "Brzi sajtovi koji se vide na Googlu i rade savršeno na telefonu. Tekst, cijene i slike mijenjate sami, bez programera.",
        points: ["Prvo za telefon, brzo učitavanje", "Vidljivost na Googlu", "Tekst, cijene i slike mijenjate sami", "Dvojezično, BS i EN"],
        link: "Pogledajte projekat", alt: "OxyBaric Mostar, medicinski sajt",
      },
      {
        key: "ux", title: "UI/UX dizajn", tag: "Prototip i dizajn sistem", lead: "Dizajn prije prve linije koda",
        desc: "Ekrani i tok korisnika osmišljeni unaprijed, da proizvod bude jasan i lak za korištenje od prvog dana.",
        points: ["Mapa toka korisnika", "Klikabilni prototip prije koda", "Dizajn sistem: boje, slova, komponente", "Ekrani za mobitel i desktop"],
        link: "Pogledajte radove", alt: "Roobet Rewards, sistem nagrada",
      },
      {
        key: "mkt", title: "Marketing", tag: "Instagram, Facebook i reklame", lead: "Objave i reklame koje se mogu pratiti",
        desc: "Društvene mreže i reklame sa jasnim izvještajem. Znate šta je objavljeno, ko je to vidio i koliko je upita stiglo.",
        points: ["Instagram i Facebook objave", "Meta i Google reklame", "Mjesečni izvještaj koji se razumije", "Bez ugovorne obaveze"],
        price: "od 60 KM mj.", link: "Pogledajte pakete", alt: "Primjer mjesečnog izvještaja",
      },
    ],
    toasts: [["Nova rezervacija", "VW Golf 8 · 10. do 13. jula", "Potvrđeno"], ["Termin zakazan", "Konsultacija · utorak 18:00", "Novo"], ["WhatsApp poslan", "Klijent je dobio potvrdu", "Isporučeno"]],
    editLabel: "Uredi naslov", saved: "Sačuvano",
    lines: ["Nove cijene od 1. decembra", "Radno vrijeme: 08 do 20h", "Akcija za vikend paket"],
    boxes: ["Baner · 358 × 176", "Dugme · 358 × 48"],
    tiles: ["Kako radimo", "Novi projekat", "Prije i poslije", "Savjet sedmice", "Iza kulisa", "Rezultat"],
    feedName: "mehiccdev", feedSub: "plan objava",
    report: { title: "Mjesečni izvještaj", sub: "Oktobar · primjer", kpis: [["16", "objava"], ["4", "reelsa"], ["1", "kampanja"]], chart: "Upiti po sedmicama" },
  },
  en: {
    label: "Services",
    h: "Everything you need online,",
    accent: "from one team",
    sub: "No need to hunt for a designer, a developer and someone for social media. We do all four, and they work together.",
    tabs: "Services",
    items: [
      {
        key: "app", title: "Web apps", tag: "Bookings, scheduling and an admin panel", lead: "An app that runs your business",
        desc: "Bookings, client records or an internal tool for your team. All in one place, you pay once and the app is yours.",
        points: ["Bookings, appointments and inquiries in one place", "Admin panel for you and your team", "Email and WhatsApp alerts", "Pay once, no subscription"],
        price: "from €500", link: "See an example", alt: "Admin panel, Maximum Rent a Car",
      },
      {
        key: "web", title: "Websites", tag: "Fast and built for phones first", lead: "A site people find and you edit yourself",
        desc: "Fast websites that show up on Google and work perfectly on phones. You change text, prices and photos yourself, no developer needed.",
        points: ["Mobile first, fast loading", "Visibility on Google", "You edit text, prices and photos", "Bilingual, BS and EN"],
        link: "See the project", alt: "OxyBaric Mostar, medical website",
      },
      {
        key: "ux", title: "UI/UX design", tag: "Prototype and design system", lead: "Design before the first line of code",
        desc: "Screens and user flows planned upfront, so the product is clear and easy to use from day one.",
        points: ["User flow map", "Clickable prototype before code", "Design system: colors, type, components", "Screens for mobile and desktop"],
        link: "See the work", alt: "Roobet Rewards, rewards system",
      },
      {
        key: "mkt", title: "Marketing", tag: "Instagram, Facebook and ads", lead: "Posts and ads you can actually track",
        desc: "Social media and ads with a clear report. You know what was posted, who saw it and how many inquiries came in.",
        points: ["Instagram and Facebook posts", "Meta and Google ads", "A monthly report that makes sense", "No contract commitment"],
        price: "from €30 a month", link: "See the packages", alt: "Sample monthly report",
      },
    ],
    toasts: [["New booking", "VW Golf 8 · July 10 to 13", "Confirmed"], ["Appointment booked", "Consultation · Tuesday 6 PM", "New"], ["WhatsApp sent", "The client got a confirmation", "Delivered"]],
    editLabel: "Edit headline", saved: "Saved",
    lines: ["New prices from December 1", "Opening hours: 8 AM to 8 PM", "Weekend package offer"],
    boxes: ["Banner · 358 × 176", "Button · 358 × 48"],
    tiles: ["How we work", "New project", "Before and after", "Tip of the week", "Behind the scenes", "Results"],
    feedName: "mehiccdev", feedSub: "post plan",
    report: { title: "Monthly report", sub: "October · sample", kpis: [["16", "posts"], ["4", "reels"], ["1", "campaign"]], chart: "Inquiries per week" },
  },
};

const ICONS: Record<Key, LucideIcon> = { app: LayoutDashboard, web: Globe, ux: PenTool, mkt: Megaphone };
const HREFS: Record<Key, string> = { app: "/maximum", web: "/portfolio", ux: "/portfolio", mkt: "#cjenovnik" };
const TOAST_ICONS: LucideIcon[] = [CarFront, CalendarCheck, BellRing];
const TILE_COLORS = [["#0F172A", "#FFFFFF"], ["#F4F7FB", "#0F172A"], ["#0F3554", "#FFFFFF"], ["#DC2626", "#FFFFFF"], ["#E9E2D6", "#0F172A"], ["#16A34A", "#FFFFFF"]];
const BOX_POS = [{ x: "7%", y: "25%", w: "86%", h: "22%" }, { x: "7%", y: "52%", w: "86%", h: "9%" }];
const BARS = [34, 47, 43, 66];
const SWATCHES = ["#0F172A", "#0F3554", "#DC2626", "#16A34A", "#FFFFFF"];
const BRIDGE = "M5 62 L5 19.5 L12.5 16.6 L20 19.5 L20 31.9 L28 32.5 L28 40.5 Q50 34 72 40.5 L72 31 L85.5 31 L85.5 45 L95 45 L95 62 L71 62 L71 56 A21 17.5 0 0 0 29 56 L29 62 Z";
const EASE = [0.22, 1, 0.36, 1] as const;
const SHADOW = "0 1px 2px rgba(15,23,42,0.06), 0 30px 60px -30px rgba(15,23,42,0.55)";

function useCalm() {
  const pref = useReducedMotion() ?? false;
  const [calm, setCalm] = useState(false);
  useEffect(() => setCalm(pref), [pref]);
  return calm;
}

function Browser({ url, src, alt, dark = false }: { url: string; src: string; alt: string; dark?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-xl border ${dark ? "border-white/10 bg-[#0B1220]" : "border-[#E5E7EB] bg-white"}`} style={{ boxShadow: SHADOW }}>
      <div className={`flex items-center gap-1.5 border-b px-3 py-2 ${dark ? "border-white/10" : "border-[#F1F5F9]"}`}>
        {[0, 1, 2].map((i) => <span key={i} className={`h-2 w-2 rounded-full ${dark ? "bg-white/15" : "bg-[#E2E8F0]"}`} />)}
        <span className={`ml-2 min-w-0 truncate text-[10.5px] ${dark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>{url}</span>
      </div>
      <div className="relative aspect-[16/10]">
        <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 90vw, 640px" quality={85} className="object-cover object-top" />
      </div>
    </div>
  );
}

function Phone({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ containerType: "inline-size" }}>
      <div className="bg-black" style={{ borderRadius: "15cqw", padding: "2.6cqw", boxShadow: "0 24px 50px -20px rgba(0,0,0,0.6)" }}>
        <div className="relative aspect-[1179/2556] overflow-hidden bg-white" style={{ borderRadius: "12cqw" }}>
          <Image src={src} alt={alt} fill sizes="200px" quality={85} className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}

function LiveToast({ d }: { d: Content }) {
  const calm = useCalm();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (calm) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % d.toasts.length), 3200);
    return () => window.clearInterval(id);
  }, [calm, d.toasts.length]);
  const [title, detail, tag] = d.toasts[i];
  const Icon = TOAST_ICONS[i];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={i}
        initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16213A] px-3.5 py-3 text-white" style={{ boxShadow: SHADOW }}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#16A34A] text-white"><Icon size={17} /></span>
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold">{title}</span>
          <span className="block text-[11.5px] leading-snug text-[#94A3B8]">{detail}</span>
        </span>
        <span className="ml-auto hidden shrink-0 rounded-md bg-[#16A34A]/15 px-2 py-0.5 text-[10.5px] font-semibold text-[#4ADE80] sm:inline">{tag}</span>
      </motion.div>
    </AnimatePresence>
  );
}

function TypingEditor({ d }: { d: Content }) {
  const calm = useCalm();
  const [li, setLi] = useState(0);
  const [n, setN] = useState(0);
  const full = d.lines[li];
  const done = n >= full.length;
  useEffect(() => {
    if (calm) { setN(full.length); return; }
    const id = window.setTimeout(() => {
      if (!done) setN((v) => v + 1);
      else { setLi((v) => (v + 1) % d.lines.length); setN(0); }
    }, done ? 2200 : 55);
    return () => window.clearTimeout(id);
  }, [n, done, calm, full.length, d.lines.length]);
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3.5 text-[#0F172A]" style={{ boxShadow: SHADOW }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">{d.editLabel}</span>
        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold transition-all duration-300 ${done ? "bg-[#DCFCE7] text-[#15803D] opacity-100" : "bg-[#F1F5F9] text-[#64748B] opacity-40"}`}>
          <Check size={11} strokeWidth={3} /> {d.saved}
        </span>
      </div>
      <div className="mt-2 rounded-lg border border-[#0F3554] bg-[#F8FAFC] px-2.5 py-2 text-[13px] font-semibold">
        {full.slice(0, n)}<span className="ml-px inline-block h-[14px] w-[1.5px] translate-y-[2px] animate-pulse bg-[#0F3554]" />
      </div>
    </div>
  );
}

function DesignOverlay({ d }: { d: Content }) {
  const calm = useCalm();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (calm) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % BOX_POS.length), 2600);
    return () => window.clearInterval(id);
  }, [calm]);
  const b = BOX_POS[i];
  return (
    <motion.div aria-hidden className="pointer-events-none absolute border-[1.5px] border-[#38BDF8]"
      initial={false} animate={{ left: b.x, top: b.y, width: b.w, height: b.h }} transition={{ duration: calm ? 0 : 0.7, ease: EASE }}>
      {["-left-[4px] -top-[4px]", "-right-[4px] -top-[4px]", "-left-[4px] -bottom-[4px]", "-right-[4px] -bottom-[4px]"].map((c) => (
        <span key={c} className={`absolute h-[7px] w-[7px] border-[1.5px] border-[#38BDF8] bg-white ${c}`} />
      ))}
      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#38BDF8] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#0B1220]">{d.boxes[i]}</span>
    </motion.div>
  );
}

function Swatches() {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0B1220]/90 p-2">
      {SWATCHES.map((c) => <span key={c} className="h-6 w-6 rounded-md ring-1 ring-white/15" style={{ background: c }} />)}
      <span className="ml-1 pr-1 text-[10.5px] font-semibold text-[#94A3B8]">Aa Inter</span>
    </div>
  );
}

function Feed({ d }: { d: Content }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-3">
      <div className="mb-2.5 flex items-center gap-2 px-1">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white">
          <svg viewBox="2 13 96 56" className="h-2.5 w-auto" aria-hidden><path fill="#0F172A" d={BRIDGE} /></svg>
        </span>
        <span className="text-[12px] font-semibold text-white">{d.feedName}</span>
        <span className="ml-auto text-[10.5px] text-[#64748B]">{d.feedSub}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {d.tiles.map((t, i) => (
          <motion.div key={t} className="relative aspect-square overflow-hidden rounded-lg p-2.5"
            style={{ background: TILE_COLORS[i][0], color: TILE_COLORS[i][1] }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: EASE }}>
            <svg viewBox="2 13 96 56" className="h-3 w-auto opacity-80" aria-hidden><path fill="currentColor" d={BRIDGE} /></svg>
            <span className="absolute bottom-2 left-2.5 right-2 text-[11px] font-semibold leading-tight">{t}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Report({ d }: { d: Content }) {
  const r = d.report;
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-[#0F172A]" style={{ boxShadow: SHADOW }}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0F172A] text-white"><Megaphone size={14} /></span>
          <span>
            <span className="block text-[13px] font-semibold">{r.title}</span>
            <span className="block text-[11px] text-[#64748B]">{r.sub}</span>
          </span>
        </span>
        <span className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-white"><Image src="/team/nedim.jpg" alt="" fill sizes="28px" className="object-cover" /></span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {r.kpis.map(([v, k]) => (
          <span key={k} className="rounded-lg bg-[#F4F7FB] px-2.5 py-2">
            <span className="block text-[18px] font-semibold leading-none tabular-nums">{v}</span>
            <span className="mt-1 block text-[10.5px] text-[#64748B]">{k}</span>
          </span>
        ))}
      </div>
      <div className="mt-3">
        <span className="text-[10.5px] font-semibold text-[#475569]">{r.chart}</span>
        <div className="mt-2 flex h-[72px] items-end gap-2">
          {BARS.map((h, i) => (
            <motion.span key={i} className={`block flex-1 rounded-t-md ${i === BARS.length - 1 ? "bg-[#0F3554]" : "bg-[#CBD5E1]"}`}
              initial={{ height: 0 }} animate={{ height: h }} transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: EASE }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stage({ k, d }: { k: Key; d: Content }) {
  const alt = d.items.find((x) => x.key === k)?.alt ?? "";
  const rise = (delay: number, y = 30) => ({
    initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 },
    transition: { duration: 0.55, delay, ease: EASE },
  });
  if (k === "app") return (
    <div className="relative h-full">
      <motion.div {...rise(0)} className="absolute left-0 right-[-10%] top-10"><Browser dark url="maximum-rent.vercel.app/admin" src="/portfolio/maximum-admin-desktop-tamna.webp" alt={alt} /></motion.div>
      <motion.div {...rise(0.12, 60)} className="absolute right-4 top-28 w-[24%]"><Phone src="/portfolio/maximum-admin-mob-tamna.webp" alt={alt} /></motion.div>
      <motion.div {...rise(0.25, 16)} className="absolute left-6 top-0 w-[300px] max-w-[78%]"><LiveToast d={d} /></motion.div>
    </div>
  );
  if (k === "web") return (
    <div className="relative h-full">
      <motion.div {...rise(0)} className="absolute left-0 right-[-10%] top-10"><Browser url="oxybaricmostar.ba" src="/portfolio/oxybaric.png" alt={alt} /></motion.div>
      <motion.div {...rise(0.25, 16)} className="absolute left-6 top-0 w-[270px] max-w-[78%]"><TypingEditor d={d} /></motion.div>
    </div>
  );
  if (k === "ux") return (
    <div className="relative h-full">
      <motion.div {...rise(0)} className="absolute left-0 right-[22%] top-10 opacity-90"><Browser dark url="roobet.com/rewards" src="/portfolio/roobet.png" alt={alt} /></motion.div>
      <motion.div {...rise(0.12, 60)} className="absolute right-4 top-4 w-[30%]">
        <div className="relative"><Phone src="/portfolio/roobet-mob.webp" alt={alt} /><DesignOverlay d={d} /></div>
      </motion.div>
      <motion.div {...rise(0.25, 16)} className="absolute bottom-6 left-6"><Swatches /></motion.div>
    </div>
  );
  return (
    <div className="relative grid h-full grid-cols-1 items-start gap-4 pt-4 sm:grid-cols-2">
      <motion.div {...rise(0)} className="hidden sm:block"><Feed d={d} /></motion.div>
      <motion.div {...rise(0.12, 40)}><Report d={d} /></motion.div>
    </div>
  );
}

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide;
}

function Bar({ p, i, n }: { p: MotionValue<number>; i: number; n: number }) {
  const w = useTransform(p, (v) => `${Math.min(1, Math.max(0, v * n - i)) * 100}%`);
  return (
    <span className="mt-4 block h-[3px] w-full max-w-[260px] overflow-hidden rounded-full bg-[#E2E8F0]">
      <motion.span className="block h-full rounded-full bg-[#DC2626]" style={{ width: w }} />
    </span>
  );
}

function Panel({ s, i, n, d, calm }: { s: Item; i: number; n: number; d: Content; calm: boolean }) {
  const href = HREFS[s.key];
  const ext = href.startsWith("http");
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-[#0B1120] bg-[image:radial-gradient(700px_420px_at_100%_0%,rgba(15,53,84,0.75),transparent_65%),radial-gradient(500px_360px_at_0%_100%,rgba(220,38,38,0.10),transparent_65%)] text-white">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={s.key} className="relative z-10 px-7 pt-7 sm:px-10 sm:pt-10"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: calm ? 0 : 0.4, ease: EASE }}>
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
            <span className="tabular-nums text-[#F87171]">0{i + 1}</span><span className="text-[#475569]"> / 0{n}</span> · {s.title}
          </p>
          <h3 className="mt-3 text-[26px] font-semibold leading-[1.12] tracking-[-0.025em] sm:text-[34px]" style={{ textWrap: "balance" }}>{s.lead}</h3>
          <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {s.points.map((pt, k) => (
              <motion.li key={pt} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: calm ? 0 : 0.35, delay: calm ? 0 : 0.08 + k * 0.05, ease: EASE }}
                className="flex items-start gap-2.5 text-[14.5px] leading-snug text-[#CBD5E1]">
                <CircleCheck size={17} className="mt-px shrink-0 text-[#4ADE80]" /> {pt}
              </motion.li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
               className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#0F172A] transition-colors hover:bg-[#E2E8F0]">
              {s.link} {ext ? <ArrowUpRight size={14} /> : <ArrowRight size={14} />}
            </a>
            {s.price && <span className="text-[14px] font-semibold tabular-nums text-[#4ADE80]">{s.price}</span>}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="relative mt-4 min-h-[300px] flex-1 overflow-hidden sm:min-h-[360px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={s.key} className="absolute inset-0 px-7 sm:px-10" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Stage k={s.key} d={d} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Services() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;
  const calm = useCalm();
  const wide = useWide();
  const n = d.items.length;
  const [a, setA] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!wide) return;
    const next = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
    setA((cur) => (cur === next ? cur : next));
  });

  const go = (i: number) => {
    if (!wide || !track.current) { setA(i); return; }
    const el = track.current;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const run = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + run * ((i + 0.05) / n), behavior: calm ? "auto" : "smooth" });
  };

  const header = (
    <div>
      <span className="inline-flex items-center gap-2.5 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626] shadow-[0_0_0_4px_rgba(220,38,38,0.15)]" />{d.label}
      </span>
      <h2 className="mt-5 text-[34px] font-semibold leading-[1.06] tracking-[-0.035em] text-[#0F172A] sm:text-[46px]" style={{ textWrap: "balance" }}>
        {d.h} <span className="text-[#0F3554]">{d.accent}</span>
      </h2>
      <p className="mt-4 max-w-md text-[16px] leading-relaxed text-[#475569]">{d.sub}</p>
    </div>
  );

  return (
    <section id="usluge" className="relative scroll-mt-24">
      <div ref={track} className="relative" style={wide ? { height: `${n * 85}vh` } : undefined}>
        <div className={wide ? "sticky top-0 flex h-screen items-center" : ""}>
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-14 lg:px-8">
            <div className="flex min-w-0 flex-col justify-center">
              {header}
              <div role="tablist" aria-label={d.tabs} className="-mx-6 mt-8 flex gap-2 overflow-x-auto px-6 pb-1 lg:mx-0 lg:mt-10 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
                {d.items.map((x, i) => {
                  const on = i === a;
                  return (
                    <button key={x.key} type="button" role="tab" aria-selected={on} onClick={() => go(i)}
                      className={`relative shrink-0 text-left transition-colors duration-300 lg:w-full ${on
                        ? "rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_18px_40px_-12px_rgba(15,23,42,0.18)] lg:rounded-[22px]"
                        : "rounded-2xl border border-[#E2E8F0] bg-white/60 lg:rounded-none lg:border-0 lg:border-t lg:bg-transparent"} px-4 py-3 lg:px-6 lg:py-5`}>
                      {on && <span className="absolute bottom-5 left-0 top-5 hidden w-1 rounded-full bg-[#DC2626] lg:block" />}
                      <span className="flex items-baseline gap-4">
                        <span className={`hidden text-[13px] font-semibold tabular-nums lg:inline ${on ? "text-[#DC2626]" : "text-[#94A3B8]"}`}>0{i + 1}</span>
                        <span>
                          <span className={`block whitespace-nowrap text-[15px] font-semibold tracking-[-0.01em] lg:text-[22px] ${on ? "text-[#0F172A]" : "text-[#64748B] lg:text-[#94A3B8]"}`}>{x.title}</span>
                          <span className={`mt-1 hidden text-[14px] lg:block ${on ? "text-[#475569]" : "text-[#94A3B8]"}`}>{x.tag}</span>
                          {on && wide && <Bar p={scrollYProgress} i={i} n={n} />}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="h-[640px] sm:h-[700px] lg:h-[min(680px,82vh)]">
              <Panel s={d.items[a]} i={a} n={n} d={d} calm={calm} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
