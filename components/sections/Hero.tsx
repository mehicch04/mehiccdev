"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, CarFront, Gauge, Play } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { PhoneMockup } from "@/components/ui/kit";

type Content = {
  announceTag: string; announceText: string;
  h1a: string; h1b: string;
  sub: string;
  ctaPrimary: string; ctaSecondary: string;
  shots: { left: string; center: string; right: string };
  cardSpeed: { label: string; value: string; was: string; client: string };
  cardBooking: { title: string; detail: string; status: string };
  watch: string; watchMeta: string;
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    announceTag: "Novo",
    announceText: "Rezervacioni sistem za rent a car firme",
    h1a: "Vašem biznisu ne treba sajt.",
    h1b: "Treba mu sistem.",
    sub: "Web aplikacije koje primaju rezervacije, sajtovi koje sami uređujete i marketing koji dovodi upite. Sve iz jedne ruke, iz Mostara za cijeli region.",
    ctaPrimary: "Besplatne konsultacije",
    ctaSecondary: "Šta smo napravili",
    shots: {
      left: "Adnan Gosto, platforma za IFBB Pro trenera",
      center: "Naslovna stranica sajta za iznajmljivanje vozila",
      right: "Roobet, sistem nagrada za gaming platformu",
    },
    cardSpeed: { label: "Učitavanje sajta", value: "3,2 s", was: "ranije 21,6 s", client: "Maximum Rent a Car" },
    watch: "Pogledajte sistem u pokretu", watchMeta: "1 min",
    cardBooking: { title: "Nova rezervacija", detail: "VW Golf 8 · 10. do 13. jula", status: "Potvrđeno" },
  },
  en: {
    announceTag: "New",
    announceText: "Booking system for car rental companies",
    h1a: "Your business doesn't need a website.",
    h1b: "It needs a system.",
    sub: "Web apps that take bookings, websites you can edit yourself, and marketing that brings inquiries. All from one team, from Mostar for the whole region.",
    ctaPrimary: "Free consultation",
    ctaSecondary: "See what we\u0027ve built",
    shots: {
      left: "Adnan Gosto, a platform for an IFBB Pro coach",
      center: "Home page of a car rental website",
      right: "Roobet, a rewards system for a gaming platform",
    },
    cardSpeed: { label: "Page load time", value: "3.2 s", was: "was 21.6 s", client: "Maximum Rent a Car" },
    watch: "Watch the system in action", watchMeta: "1 min",
    cardBooking: { title: "New booking", detail: "VW Golf 8 · July 10 to 13", status: "Confirmed" },
  },
};

export function Hero() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;
  const reduce = useReducedMotion() ?? false;

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: reduce
      ? { duration: 0 }
      : { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="hero-light relative bg-white">
      <div className="relative overflow-hidden"
           style={{ background: "linear-gradient(180deg, #D9E4F0 0%, #E7EEF6 34%, #F4F7FB 68%, #FFFFFF 100%)" }}>

        <div aria-hidden className="pointer-events-none absolute -left-[12%] top-0 h-[70%] w-[38%] -skew-x-[24deg] opacity-60"
             style={{ background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)" }} />
        <div aria-hidden className="pointer-events-none absolute right-[-8%] top-0 h-[60%] w-[26%] -skew-x-[24deg] opacity-50"
             style={{ background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35]"
             style={{
               backgroundImage: "linear-gradient(to right, rgba(15,53,84,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,53,84,0.06) 1px, transparent 1px)",
               backgroundSize: "56px 56px",
               maskImage: "linear-gradient(to bottom, black 0%, transparent 60%)",
               WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 60%)",
             }} />

      <motion.div
        {...rise(0.35)}
        className="pointer-events-none absolute left-[3%] xl:left-[6%] top-[300px] hidden lg:block"
      >
        <div className="float-y" style={{ animationDuration: "6s" }}>
        <div
          className="w-[230px] -rotate-[6deg] rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left"
          style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.05), 0 18px 40px -16px rgba(15,23,42,0.22)" }}
        >
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0F3554] text-white"><Gauge size={14} /></span>
            <span className="text-[12px] font-medium text-[#64748B]">{d.cardSpeed.label}</span>
          </div>
          <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.03em] text-[#0F172A]">{d.cardSpeed.value}</p>
          <div className="mt-3 space-y-1.5">
            <div className="h-1.5 w-[15%] rounded-full bg-[#16A34A]" />
            <div className="h-1.5 w-full rounded-full bg-[#E5E7EB]" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-[#94A3B8]">{d.cardSpeed.was}</span>
            <span className="font-medium text-[#475569]">{d.cardSpeed.client}</span>
          </div>
        </div>
        </div>
      </motion.div>

      <motion.div
        {...rise(0.45)}
        className="pointer-events-none absolute right-[3%] xl:right-[6%] top-[230px] hidden lg:block"
      >
        <div className="float-y" style={{ animationDuration: "7s", animationDelay: "0.8s" }}>
        <div
          className="w-[240px] rotate-[6deg] rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left"
          style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.05), 0 18px 40px -16px rgba(15,23,42,0.22)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F1F5F9] text-[#0F3554]"><CarFront size={17} /></span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-[#0F172A]">{d.cardBooking.title}</span>
              <span className="block text-[11.5px] text-[#64748B]">{d.cardBooking.detail}</span>
            </span>
          </div>
          <div className="mt-3.5 flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-3 py-2 text-[12.5px] font-semibold text-white">
            <Check size={14} strokeWidth={3} /> {d.cardBooking.status}
          </div>
        </div>
        </div>
      </motion.div>

      <div className="relative max-w-5xl mx-auto px-6 pt-32 sm:pt-36 lg:pt-40 text-center">

        <motion.div {...rise(0)} className="flex justify-center">
          <a
            href="/rjesenja/rent-a-car"
            className="group inline-flex items-center gap-2.5 rounded-full border border-[#E5E7EB] bg-white
                       pl-1.5 pr-3.5 sm:pr-4 py-1.5 text-[12px] sm:text-[13px] text-[#0F172A] whitespace-nowrap
                       transition-colors duration-200 hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
          >
            <span className="rounded-full bg-[#16A34A] px-2.5 py-0.5 text-[11px] font-semibold text-white">
              {d.announceTag}
            </span>
            <span className="font-medium">{d.announceText}</span>
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

        <motion.p
          {...rise(0.12)}
          className="mx-auto mt-7 max-w-2xl text-[17px] sm:text-lg leading-relaxed text-[#475569]"
        >
          {d.sub}
        </motion.p>

        <motion.div
          {...rise(0.18)}
          className="relative mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
        >
          <svg aria-hidden viewBox="0 0 120 70" fill="none"
               className="pointer-events-none absolute right-[calc(50%+188px)] top-[-14px] hidden md:block w-[104px] text-[#94A3B8]">
            <path d="M6 8 C 10 44, 46 64, 104 52" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeDasharray="5 6" />
            <path d="M96 44 L106 52 L95 59" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <a
            href="#kontakt"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-3.5
                       text-[15px] font-semibold text-white
                       transition-colors duration-200 hover:bg-[#B91C1C]
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
          >
            {d.ctaPrimary}
            <ArrowRight size={16} />
          </a>
          <a
            href="#portfolio"
            className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-3.5
                       text-[15px] font-semibold text-[#0F172A]
                       transition-colors duration-200 hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
          >
            {d.ctaSecondary}
          </a>
        </motion.div>

        <motion.div {...rise(0.24)} className="mt-6 flex justify-center">
          <a
            href="#rent-a-car"
            onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("demo:watch")); }}
            className="group inline-flex items-center gap-2.5 text-[14px] font-medium text-[#475569]
                       transition-colors duration-200 hover:text-[#0F172A]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A]
                             transition-colors duration-200 group-hover:border-[#0F172A]">
              <Play size={11} fill="currentColor" className="ml-[1px]" />
            </span>
            <span className="underline decoration-[#CBD5E1] underline-offset-4 transition-colors duration-200 group-hover:decoration-[#0F172A]">
              {d.watch}
            </span>
            <span className="text-[#94A3B8]">· {d.watchMeta}</span>
          </a>
        </motion.div>
      </div>

      <motion.div {...rise(0.28)} className="relative mx-auto mt-16 sm:mt-20 max-w-5xl px-4 sm:px-6">
        <div style={{ perspective: "1100px" }} className="relative flex items-start justify-center gap-[2%] pt-2
                        h-[300px] sm:h-[440px] lg:h-[520px] overflow-hidden">
          <div className="w-[33%] max-w-[290px] mt-[4%]" style={{ transform: "rotateY(-22deg)", transformOrigin: "100% 50%" }}>
            <div className="relative"><span aria-hidden className="absolute inset-y-[1%] -right-[3%] left-[3%] rounded-[15.5%/7%] bg-[#C9CDD3]" /><div className="relative"><PhoneMockup src="/portfolio/gosto-mob.webp" alt={d.shots.left} bar="dark" barColor="#0A0A0A" /></div></div>
          </div>

          <div className="relative z-10 w-[35%] max-w-[310px]">
            <PhoneMockup src="/portfolio/maximum-poslije-mob.webp" alt={d.shots.center} priority />
          </div>

          <div className="w-[33%] max-w-[290px] mt-[4%]" style={{ transform: "rotateY(22deg)", transformOrigin: "0% 50%" }}>
            <div className="relative"><span aria-hidden className="absolute inset-y-[1%] -left-[3%] right-[3%] rounded-[15.5%/7%] bg-[#C9CDD3]" /><div className="relative"><PhoneMockup src="/portfolio/roobet-mob.webp" alt={d.shots.right} bar="dark" barColor="#191939" /></div></div>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
             style={{
               backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
               maskImage: "linear-gradient(to bottom, transparent 0%, black 65%)",
               WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 65%)",
             }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
             style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 55%, #FFFFFF 100%)" }} />
      </motion.div>

      </div>
    </section>
  );
}
