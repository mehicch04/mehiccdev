"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, CarFront, Gauge, Gem, PenTool, Trophy, UserPlus, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { PhoneMockup } from "@/components/ui/kit";

type Stat = { label: string; value: string; bar?: number; foot: [string, string] };
type Note = { title: string; detail: string; status: string };
type Shot = { name: string; short: string; cat: string; alt: string; open: string; stat: Stat; note: Note };

type Content = {
  chipTag: string; chipText: string;
  h1a: string; h1b: string;
  sub: string;
  ctaPrimary: string; ctaSecondary: string;
  pick: string;
  shots: Shot[];
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    chipTag: "Dostupni",
    chipText: "Web aplikacije · Sajtovi · Dizajn · Marketing",
    h1a: "Vašem biznisu ne treba sajt.",
    h1b: "Treba mu sistem.",
    sub: "Web aplikacije koje vode vaš posao, sajtovi koje sami uređujete i marketing koji dovodi upite. Sve iz jedne ruke, iz Mostara za cijeli region.",
    ctaPrimary: "Besplatne konsultacije",
    ctaSecondary: "Šta smo napravili",
    pick: "Izaberite projekat",
    shots: [
      {
        name: "Maximum Rent a Car", short: "Maximum", cat: "Web aplikacija · Iznajmljivanje vozila",
        alt: "Naslovna stranica sajta za iznajmljivanje vozila", open: "Pogledajte projekat",
        stat: { label: "Učitavanje sajta", value: "3,2 s", bar: 15, foot: ["ranije 21,6 s", "Maximum Rent a Car"] },
        note: { title: "Nova rezervacija", detail: "VW Golf 8 · 10. do 13. jula", status: "Potvrđeno" },
      },
      {
        name: "Adnan Gosto · IFBB Pro", short: "Adnan Gosto", cat: "Web aplikacija · Coaching",
        alt: "Adnan Gosto, platforma za IFBB Pro trenera", open: "Pogledajte projekat",
        stat: { label: "Klijent", value: "IFBB Pro", foot: ["višestruki prvak BiH", "Adnan Gosto"] },
        note: { title: "Nova prijava", detail: "Online coaching · 12 sedmica", status: "Primljeno" },
      },
      {
        name: "Roobet Rewards", short: "Roobet", cat: "UI/UX dizajn · Gaming platforma",
        alt: "Roobet, sistem nagrada za gaming platformu", open: "Pogledajte uživo",
        stat: { label: "Naš dio posla", value: "UI/UX", foot: ["sistem nagrada i nivoa", "Roobet"] },
        note: { title: "Novi nivo otključan", detail: "Gold · nagrada je spremna", status: "Preuzmi nagradu" },
      },
    ],
  },
  en: {
    chipTag: "Available",
    chipText: "Web apps · Websites · Design · Marketing",
    h1a: "Your business doesn't need a website.",
    h1b: "It needs a system.",
    sub: "Web apps that run your business, websites you can edit yourself, and marketing that brings inquiries. All from one team, from Mostar for the whole region.",
    ctaPrimary: "Free consultation",
    ctaSecondary: "See what we've built",
    pick: "Choose a project",
    shots: [
      {
        name: "Maximum Rent a Car", short: "Maximum", cat: "Web app · Car rental",
        alt: "Home page of a car rental website", open: "See the project",
        stat: { label: "Page load time", value: "3.2 s", bar: 15, foot: ["was 21.6 s", "Maximum Rent a Car"] },
        note: { title: "New booking", detail: "VW Golf 8 · July 10 to 13", status: "Confirmed" },
      },
      {
        name: "Adnan Gosto · IFBB Pro", short: "Adnan Gosto", cat: "Web app · Coaching",
        alt: "Adnan Gosto, a platform for an IFBB Pro coach", open: "See the project",
        stat: { label: "Client", value: "IFBB Pro", foot: ["multiple national champion", "Adnan Gosto"] },
        note: { title: "New sign up", detail: "Online coaching · 12 weeks", status: "Received" },
      },
      {
        name: "Roobet Rewards", short: "Roobet", cat: "UI/UX design · Gaming platform",
        alt: "Roobet, a rewards system for a gaming platform", open: "See it live",
        stat: { label: "Our part", value: "UI/UX", foot: ["rewards and tier system", "Roobet"] },
        note: { title: "New tier unlocked", detail: "Gold · reward is ready", status: "Claim reward" },
      },
    ],
  },
};

const META: { src: string; bar: "light" | "dark"; barColor?: string; href: string; statIcon: LucideIcon; noteIcon: LucideIcon }[] = [
  { src: "/portfolio/maximum-poslije-mob.webp", bar: "light", href: "/maximum", statIcon: Gauge, noteIcon: CarFront },
  { src: "/portfolio/gosto-mob.webp", bar: "dark", barColor: "#0A0A0A", href: "/portfolio", statIcon: Trophy, noteIcon: UserPlus },
  { src: "/portfolio/roobet-mob.webp", bar: "dark", barColor: "#191939", href: "https://roobet.com/", statIcon: PenTool, noteIcon: Gem },
];

const SLOTS = {
  left:   { x: "-160%", y: "3%", rotateY: -22, scale: 0.96 },
  center: { x: "-50%",  y: "0%", rotateY: 0,   scale: 1.07 },
  right:  { x: "60%",   y: "3%", rotateY: 22,  scale: 0.96 },
} as const;

const CYCLE = 5600;
const EASE = [0.22, 1, 0.36, 1] as const;
const CARD_SHADOW = "0 1px 2px rgba(15,23,42,0.05), 0 18px 40px -16px rgba(15,23,42,0.22)";

export function Hero() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;
  const prefersReduced = useReducedMotion() ?? false;
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(prefersReduced), [prefersReduced]);

  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const [touched, setTouched] = useState(false);
  const auto = !reduce && !hold && !touched;

  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const tiltX = useSpring(tx, { stiffness: 90, damping: 18 });
  const tiltY = useSpring(ty, { stiffness: 90, damping: 18 });

  const go = useCallback((i: number) => { setActive(((i % 3) + 3) % 3); setTouched(true); }, []);

  useEffect(() => {
    if (!auto) return;
    const id = window.setTimeout(() => {
      if (!document.hidden) setActive((a) => (a + 1) % 3);
    }, CYCLE);
    return () => window.clearTimeout(id);
  }, [auto, active]);

  const slotOf = (i: number) => (i === active ? "center" : i === (active + 2) % 3 ? "left" : "right");

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ty.set(((e.clientX - r.left) / r.width - 0.5) * 9);
    tx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
  };
  const onLeave = () => { tx.set(0); ty.set(0); setHold(false); };
  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 40 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
    go(active + (info.offset.x < 0 ? 1 : -1));
  };

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { duration: 0.6, delay, ease: EASE },
  });

  const shot = d.shots[active];
  const meta = META[active];
  const StatIcon = meta.statIcon;
  const NoteIcon = meta.noteIcon;
  const swap = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: reduce ? 0 : 0.35, ease: EASE },
  };
  const external = meta.href.startsWith("http");

  return (
    <section className="hero-light relative bg-white">
      <div className="relative overflow-hidden"
           style={{ background: "linear-gradient(180deg, #D9E4F0 0%, #E7EEF6 34%, #F4F7FB 68%, #FFFFFF 100%)" }}>

      <motion.div {...rise(0.35)} className="pointer-events-none absolute left-[3%] xl:left-[6%] top-[300px] hidden lg:block">
        <div className="float-y" style={{ animationDuration: "6s" }}>
          <div className="w-[230px] -rotate-[6deg] rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left" style={{ boxShadow: CARD_SHADOW }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active} {...swap}>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0F3554] text-white"><StatIcon size={14} /></span>
                  <span className="text-[12px] font-medium text-[#64748B]">{shot.stat.label}</span>
                </div>
                <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] text-[#0F172A]">{shot.stat.value}</p>
                {shot.stat.bar !== undefined ? (
                  <div className="mt-3 space-y-1.5">
                    <div className="h-1.5 rounded-full bg-[#16A34A]" style={{ width: `${shot.stat.bar}%` }} />
                    <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]" />
                  </div>
                ) : (
                  <div className="mt-3 h-px w-full bg-[#E5E7EB]" />
                )}
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-[#94A3B8]">{shot.stat.foot[0]}</span>
                  <span className="font-medium text-[#475569]">{shot.stat.foot[1]}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.div {...rise(0.45)} className="pointer-events-none absolute right-[3%] xl:right-[6%] top-[230px] hidden lg:block">
        <div className="float-y" style={{ animationDuration: "7s", animationDelay: "0.8s" }}>
          <div className="w-[240px] rotate-[6deg] rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left" style={{ boxShadow: CARD_SHADOW }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active} {...swap}>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F1F5F9] text-[#0F3554]"><NoteIcon size={17} /></span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#0F172A]">{shot.note.title}</span>
                    <span className="block text-[11.5px] text-[#64748B]">{shot.note.detail}</span>
                  </span>
                </div>
                <div className="mt-3.5 flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-3 py-2 text-[12.5px] font-semibold text-white">
                  <Check size={14} strokeWidth={3} /> {shot.note.status}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-5xl mx-auto px-6 pt-32 sm:pt-36 lg:pt-40 text-center">

        <motion.div {...rise(0)} className="flex justify-center">
          <a
            href="#usluge"
            className="group inline-flex items-center gap-2.5 rounded-full border border-[#E5E7EB] bg-white
                       pl-1.5 pr-3.5 sm:pr-4 py-1.5 text-[12px] sm:text-[13px] text-[#0F172A] whitespace-nowrap
                       transition-colors duration-200 hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> {d.chipTag}
            </span>
            <span className="font-medium">{d.chipText}</span>
            <ArrowRight size={14} className="hidden sm:block text-[#6B7280] transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        <motion.h1
          {...rise(0.06)}
          className="mt-8 text-[40px] leading-[1.08] sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.035em] text-[#0F172A]"
          style={{ textWrap: "balance" }}
        >
          {d.h1a}
          <span className="block text-[#0F3554]">
            <svg viewBox="0 0 24 24" aria-hidden
                 className="hidden sm:inline-block h-[0.6em] w-[0.6em] mr-[0.16em] align-[0.02em]">
              <rect x="2"  y="13" width="5" height="9"  rx="1.5" fill="currentColor" opacity=".45" />
              <rect x="9.5" y="8" width="5" height="14" rx="1.5" fill="currentColor" opacity=".7" />
              <rect x="17" y="2"  width="5" height="20" rx="1.5" fill="currentColor" />
            </svg>
            {d.h1b}
          </span>
        </motion.h1>

        <motion.p {...rise(0.12)} className="mx-auto mt-7 max-w-2xl text-[17px] sm:text-lg leading-relaxed text-[#475569]">
          {d.sub}
        </motion.p>

        <motion.div {...rise(0.18)} className="relative mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <svg aria-hidden viewBox="0 0 120 70" fill="none"
               className="pointer-events-none absolute right-[calc(50%+188px)] top-[-14px] hidden md:block w-[104px] text-[#94A3B8]">
            <path d="M6 8 C 10 44, 46 64, 104 52" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="5 6" />
            <path d="M96 44 L106 52 L95 59" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <a
            href="#kontakt"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-3.5
                       text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#B91C1C]
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
          >
            {d.ctaPrimary}
            <ArrowRight size={16} />
          </a>
          <a
            href="#portfolio"
            className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-3.5
                       text-[15px] font-semibold text-[#0F172A] transition-colors duration-200 hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
          >
            {d.ctaSecondary}
          </a>
        </motion.div>
      </div>

      <motion.div {...rise(0.28)} className="relative mx-auto mt-14 sm:mt-16 max-w-5xl px-4 sm:px-6">
        <motion.div
          onPointerMove={onMove}
          onPointerEnter={(e) => { if (e.pointerType === "mouse") setHold(true); }}
          onPointerLeave={onLeave}
          onPanEnd={onPanEnd}
          style={{ perspective: "1100px", touchAction: "pan-y" }}
          className="relative h-[300px] sm:h-[440px] lg:h-[520px] overflow-hidden"
        >
          <motion.div className="absolute inset-0" style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}>
            {META.map((m, i) => {
              const slot = slotOf(i);
              const side = slot !== "center";
              return (
                <motion.button
                  key={m.src}
                  type="button"
                  onClick={() => side && go(i)}
                  tabIndex={side ? 0 : -1}
                  aria-label={side ? d.shots[i].name : undefined}
                  aria-hidden={!side}
                  initial={false}
                  animate={SLOTS[slot]}
                  transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE }}
                  className={`absolute left-1/2 top-2 block w-[31%] max-w-[290px] text-left ${side ? "cursor-pointer" : "cursor-default"}`}
                  style={{ zIndex: slot === "center" ? 3 : 1, transformStyle: "preserve-3d" }}
                >
                  <span className="relative block">
                    <motion.span aria-hidden className="absolute inset-y-[1%] -right-[3%] left-[3%] rounded-[15.5%/7%] bg-[#C9CDD3]"
                                 initial={false} animate={{ opacity: slot === "left" ? 1 : 0 }} transition={{ duration: 0.4 }} />
                    <motion.span aria-hidden className="absolute inset-y-[1%] -left-[3%] right-[3%] rounded-[15.5%/7%] bg-[#C9CDD3]"
                                 initial={false} animate={{ opacity: slot === "right" ? 1 : 0 }} transition={{ duration: 0.4 }} />
                    <span className="relative block transition-[filter] duration-500" style={{ filter: side ? "saturate(0.85)" : "none" }}>
                      <PhoneMockup src={m.src} alt={d.shots[i].alt} bar={m.bar} barColor={m.barColor} priority={i === 0} />
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
             style={{
               backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
               maskImage: "linear-gradient(to bottom, transparent 0%, black 65%)",
               WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 65%)",
             }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
             style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 55%, #FFFFFF 100%)" }} />

        <div className="absolute inset-x-0 bottom-3 sm:bottom-6 z-10 flex flex-col items-center gap-3 px-4">
          <div role="tablist" aria-label={d.pick}
               className="flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white p-1"
               style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.05), 0 10px 24px -14px rgba(15,23,42,0.3)" }}>
            {d.shots.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.short}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => go(i)}
                  className={`relative overflow-hidden rounded-full px-3 sm:px-4 py-1.5 text-[12.5px] sm:text-[13px] font-semibold transition-colors duration-300 ${on ? "text-white" : "text-[#475569] hover:text-[#0F172A]"}`}
                >
                  {on && (
                    <motion.span layoutId="hero-pill" className="absolute inset-0 rounded-full bg-[#0F172A]"
                                 transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }} />
                  )}
                  {on && auto && (
                    <span key={`p${active}`} aria-hidden className="hero-progress absolute bottom-0 left-0 h-[2px] bg-[#DC2626]"
                          style={{ animationDuration: `${CYCLE}ms` }} />
                  )}
                  <span className="relative">{s.short}</span>
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.a
              key={active}
              {...swap}
              href={meta.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group inline-flex items-center gap-2 text-[13px] text-[#64748B] transition-colors hover:text-[#0F172A]"
            >
              <span className="hidden sm:inline">{shot.cat}</span>
              <span aria-hidden className="hidden text-[#CBD5E1] sm:inline">·</span>
              <span className="font-semibold text-[#0F172A] underline decoration-[#CBD5E1] underline-offset-4 group-hover:decoration-[#0F172A]">{shot.open}</span>
              <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </motion.a>
          </AnimatePresence>
        </div>
      </motion.div>

      </div>
    </section>
  );
}
