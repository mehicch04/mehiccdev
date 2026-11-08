"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronsLeftRight, Star } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Swipe } from "@/components/ui/Swipe";

type Mini = { title: string; cat: string; desc: string; live: boolean };
type Content = {
  label: string; heading: string; headingAccent: string; subtitle: string;
  badge: string; title: string; desc: string; before: string; after: string; drag: string;
  stats: { v: string; l: string }[];
  ctaCase: string; ctaLive: string; allLink: string; livePill: string; buildPill: string; open: string;
  minis: Mini[];
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    label: "Naš rad",
    heading: "Projekti koji",
    headingAccent: "rade posao",
    subtitle: "Gotovi projekti rade uživo za stvarne klijente, a na nekima još radimo. Povucite klizač i pogledajte razliku.",
    badge: "Naš najveći projekat · Business paket",
    title: "Maximum Rent a Car",
    desc: "Stari sajt je bio spor i nepregledan. Napravili smo kompletnu web aplikaciju: gost izabere auto i datume, sistem provjeri dostupnost, a vlasnik sve potvrđuje u dva klika.",
    before: "Prije", after: "Poslije", drag: "Povucite za poređenje",
    stats: [
      { v: "3,2 s", l: "učitavanje, ranije 21,6 s" },
      { v: "100", l: "Google ocjena performansi" },
      { v: "2", l: "jezika, HR i EN" },
      { v: "24/7", l: "prima upite i dok vlasnik spava" },
    ],
    ctaCase: "Pogledajte detaljnije",
    ctaLive: "Uživo",
    allLink: "Pogledaj sve projekte",
    livePill: "Uživo",
    buildPill: "U izradi",
    open: "Otvori",
    minis: [
      { title: "OxyBaric Mostar", cat: "Web sajt · Medicina", desc: "Medicinski sajt koji dovodi pacijente iz Google pretrage.", live: false },
      { title: "Roobet Rewards", cat: "UI/UX dizajn · Gaming", desc: "Sistem nagrada za gaming platformu, s nivoima i napretkom koji igrača vodi naprijed.", live: true },
      { title: "Adnan Gosto · IFBB Pro", cat: "Web aplikacija · Coaching", desc: "Platforma za IFBB Pro trenera, s prijavama klijenata i admin panelom za saradnje.", live: false },
    ],
  },
  en: {
    label: "Our work",
    heading: "Projects that",
    headingAccent: "do the job",
    subtitle: "Finished projects run live for real clients, and a few are still in the works. Drag the slider and see the difference.",
    badge: "Our biggest build · Business package",
    title: "Maximum Rent a Car",
    desc: "The old site was slow and cluttered. We built a complete web app: guests pick a car and dates, the system checks availability, and the owner confirms everything in two clicks.",
    before: "Before", after: "After", drag: "Drag to compare",
    stats: [
      { v: "3.2 s", l: "load time, was 21.6 s" },
      { v: "100", l: "Google performance score" },
      { v: "2", l: "languages, HR and EN" },
      { v: "24/7", l: "takes inquiries while the owner sleeps" },
    ],
    ctaCase: "See the case study",
    ctaLive: "Live",
    allLink: "See all projects",
    livePill: "Live",
    buildPill: "In progress",
    open: "Open",
    minis: [
      { title: "OxyBaric Mostar", cat: "Website · Medicine", desc: "A medical site that brings patients in from Google search.", live: false },
      { title: "Roobet Rewards", cat: "UI/UX design · Gaming", desc: "A rewards system for a gaming platform, with tiers and progression that pull players forward.", live: true },
      { title: "Adnan Gosto · IFBB Pro", cat: "Web app · Coaching", desc: "A platform for an IFBB Pro coach, with client sign-ups and an admin panel for coaching.", live: false },
    ],
  },
};

const MINI_META = [
  { img: "/portfolio/oxybaric.png", href: "/portfolio" },
  { img: "/portfolio/roobet.png", href: "https://roobet.com/" },
  { img: "/portfolio/gosto-coaching.webp", href: "/portfolio" },
];
const EASE = [0.22, 1, 0.36, 1] as const;

function Compare({ d }: { d: Content }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion() ?? false;
  const [pos, setPos] = useState(50);
  const [touched, setTouched] = useState(false);
  const drag = useRef(false);

  useEffect(() => {
    if (!inView || touched || reduce) return;
    const c = animate(50, [50, 22, 78, 50], { duration: 2.6, ease: "easeInOut", delay: 0.4, onUpdate: (v) => setPos(v) });
    return () => c.stop();
  }, [inView, touched, reduce]);

  const setFrom = (x: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={d.drag}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      onPointerDown={(e) => { drag.current = true; setTouched(true); e.currentTarget.setPointerCapture(e.pointerId); setFrom(e.clientX); }}
      onPointerMove={(e) => { if (drag.current) setFrom(e.clientX); }}
      onPointerUp={() => { drag.current = false; }}
      onPointerCancel={() => { drag.current = false; }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { setTouched(true); setPos((p) => Math.max(0, p - 5)); }
        if (e.key === "ArrowRight") { setTouched(true); setPos((p) => Math.min(100, p + 5)); }
      }}
      className="relative aspect-[16/10] cursor-ew-resize select-none overflow-hidden rounded-2xl bg-[#0B1220] outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      style={{ touchAction: "pan-y" }}
    >
      <Image src="/portfolio/maximum-poslije.webp" alt={`${d.title} · ${d.after}`} fill sizes="(max-width: 1024px) 100vw, 760px" quality={85} draggable={false} className="object-cover object-top" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src="/portfolio/maximum-prije.webp" alt={`${d.title} · ${d.before}`} fill sizes="(max-width: 1024px) 100vw, 760px" quality={85} draggable={false} className="object-cover object-top" />
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#0F172A]/85 px-3 py-1 text-[12px] font-semibold text-white">{d.before}</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#16A34A] px-3 py-1 text-[12px] font-semibold text-white">{d.after}</span>
      <div className="pointer-events-none absolute inset-y-0 w-[2px] -translate-x-1/2 bg-white" style={{ left: `${pos}%`, boxShadow: "0 0 0 1px rgba(15,23,42,0.15)" }}>
        <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#0F172A]" style={{ boxShadow: "0 8px 24px -6px rgba(0,0,0,0.5)" }}>
          <ChevronsLeftRight size={20} />
        </span>
      </div>
    </div>
  );
}

export function Portfolio() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;

  return (
    <section id="portfolio" data-dark className="relative scroll-mt-24 overflow-hidden text-white" style={{ background: "#0F172A" }}>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8FB3D9]">{d.label}</p>
            <h2 className="mt-4 text-[34px] leading-[1.1] sm:text-[48px] font-semibold tracking-[-0.03em]">
              {d.heading} <span className="text-[#8FB3D9]">{d.headingAccent}</span>
            </h2>
          </div>
          <p className="max-w-sm text-[16px] leading-relaxed text-[#94A3B8]">{d.subtitle}</p>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: EASE }}
          className="mt-14 grid gap-8 rounded-[32px] border border-white/[0.08] bg-[#111C2E] p-4 sm:p-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-10 lg:p-7"
        >
          <div className="flex flex-col gap-3">
            <Compare d={d} />
            <p className="flex items-center justify-center gap-2 text-[12.5px] text-[#64748B]"><ChevronsLeftRight size={14} /> {d.drag}</p>
          </div>
          <div className="flex flex-col px-2 pb-2 sm:px-0 lg:py-3 lg:pr-3">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#8FB3D9]">
              <Star size={12} className="fill-[#DC2626] text-[#DC2626]" /> {d.badge}
            </p>
            <h3 className="mt-3 text-[28px] font-semibold tracking-[-0.02em]">{d.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#94A3B8]">{d.desc}</p>
            <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08]">
              {d.stats.map((s, i) => (
                <div key={s.l} className="bg-[#111C2E] p-4">
                  <dd className={`text-[24px] font-semibold tracking-tight tabular-nums ${i === 0 ? "text-[#4ADE80]" : "text-white"}`}>{s.v}</dd>
                  <dt className="mt-0.5 text-[12px] leading-snug text-[#94A3B8]">{s.l}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
              <a href="/maximum" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-[#0F172A] transition-colors hover:bg-[#E2E8F0]">
                {d.ctaCase} <ArrowRight size={15} />
              </a>
              <a href="https://maximum-rent.vercel.app" target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.04]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" /> {d.ctaLive} <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </motion.article>

        <div className="mt-5">
        <Swipe bp="md" dark grid="md:grid-cols-3 md:gap-5" item="w-[84%] sm:w-[60%]">
          {d.minis.map((m, i) => {
            const meta = MINI_META[i];
            const ext = meta.href.startsWith("http");
            return (
              <motion.a
                key={m.title}
                href={meta.href}
                {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className="group flex flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111C2E] transition-colors duration-300 hover:border-white/20"
              >
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image src={meta.img} alt={m.title} fill sizes="(max-width: 768px) 100vw, 380px"
                         className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#0F172A]/85 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <span className={`h-1.5 w-1.5 rounded-full ${m.live ? "bg-[#4ADE80]" : "bg-[#F59E0B]"}`} /> {m.live ? d.livePill : d.buildPill}
                  </span>
                  <span className="absolute bottom-3 right-3 inline-flex translate-y-2 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0F172A] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {d.open} {ext ? <ArrowUpRight size={13} /> : <ArrowRight size={13} />}
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="text-[12px] font-medium text-[#8FB3D9]">{m.cat}</span>
                  <span className="mt-1 text-[17px] font-semibold">{m.title}</span>
                  <span className="mt-1.5 text-[13.5px] leading-relaxed text-[#94A3B8]">{m.desc}</span>
                </span>
              </motion.a>
            );
          })}
        </Swipe>
        </div>

        <div className="mt-10 flex justify-center">
          <a href="/portfolio" className="group inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.04]">
            {d.allLink} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
