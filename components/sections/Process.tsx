"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, MessageSquare, FileCheck2, PackageCheck, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Content = {
  label: string; h: string; accent: string; sub: string;
  steps: { t: string; d: string; meta: string }[];
  ctaText: string; cta: string;
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    label: "Kako radimo",
    h: "Od prve poruke",
    accent: "do gotovog projekta",
    sub: "Četiri koraka, bez iznenađenja. U svakom trenutku znate gdje je projekat i šta slijedi.",
    steps: [
      { t: "Pošaljete upit", d: "Napišete šta vam treba, svojim riječima. Ne treba vam nikakvo tehničko znanje.", meta: "2 minute" },
      { t: "Besplatna konsultacija", d: "Javimo se u roku od 24 sata i zajedno prođemo kroz ideju, bez ikakve obaveze.", meta: "do 24 sata" },
      { t: "Ponuda i plan", d: "Dobijete jasnu cijenu, rok i plan rada. Krećemo tek kad se složite.", meta: "jasna cijena" },
      { t: "Izrada i predaja", d: "Pratite napredak, sve testiramo i predajemo gotov projekat sa uputstvom za korištenje.", meta: "testirano" },
    ],
    ctaText: "Prvi korak traje dvije minute.",
    cta: "Zakažite poziv",
  },
  en: {
    label: "How we work",
    h: "From the first message",
    accent: "to a finished project",
    sub: "Four steps, no surprises. At any moment you know where the project stands and what comes next.",
    steps: [
      { t: "You send an inquiry", d: "Tell us what you need in your own words. No technical knowledge needed.", meta: "2 minutes" },
      { t: "Free consultation", d: "We get back to you within 24 hours and go through the idea together, with no obligation.", meta: "within 24 hours" },
      { t: "Quote and plan", d: "You get a clear price, a deadline and a work plan. We start only once you agree.", meta: "clear price" },
      { t: "Build and handover", d: "You follow the progress, we test everything and hand over a finished project with a user guide.", meta: "tested" },
    ],
    ctaText: "The first step takes two minutes.",
    cta: "Book a call",
  },
};

const ICONS: LucideIcon[] = [MessageSquare, Clock, FileCheck2, PackageCheck];

export function Process() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;
  const prefersReduced = useReducedMotion() ?? false;
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(prefersReduced), [prefersReduced]);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.55"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const tip = useTransform(p, (v) => `${Math.min(1, Math.max(0, v)) * 100}%`);
  const [reached, setReached] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const n = [0, 1, 2, 3].filter((i) => v >= Math.max(0.02, i / 3 - 0.03)).length;
    setReached((r) => (r === n ? r : n));
  });

  const done = reduce ? 4 : reached;

  return (
    <section id="proces" className="relative scroll-mt-24 overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.label}</p>
          <h2 className="mt-4 text-[32px] leading-[1.12] sm:text-[44px] font-semibold tracking-[-0.03em] text-[#0F172A]" style={{ textWrap: "balance" }}>
            {d.h} <span className="text-[#0F3554]">{d.accent}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#475569]">{d.sub}</p>
        </div>

        <div ref={ref} className="relative mt-16">
          <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[23px] hidden h-[3px] rounded-full bg-[#E2E8F0] lg:block">
            <motion.div className="absolute inset-y-0 left-0 right-0 origin-left rounded-full bg-[#0F172A]" style={{ scaleX: reduce ? 1 : p }} />
            <motion.span className="absolute top-0 h-[3px] w-[22px] -translate-x-1/2 rounded-full bg-[#DC2626]" style={{ left: reduce ? "100%" : tip }} />
          </div>
          <div aria-hidden className="absolute bottom-6 left-[23px] top-6 w-[3px] rounded-full bg-[#E2E8F0] lg:hidden">
            <motion.div className="absolute inset-0 origin-top rounded-full bg-[#0F172A]" style={{ scaleY: reduce ? 1 : p }} />
          </div>

          <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-8">
            {d.steps.map((s, i) => {
              const on = i < done;
              const Icon = ICONS[i];
              return (
                <li key={s.t} className="flex gap-5 lg:flex-col lg:items-center lg:text-center">
                  <span className={`relative grid h-[49px] w-[49px] shrink-0 place-items-center rounded-full border-[3px] transition-colors duration-500 ${on ? "border-[#0F172A] bg-[#0F172A] text-white" : "border-[#E2E8F0] bg-white text-[#94A3B8]"}`}>
                    <Icon size={18} />
                    <span className={`absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full text-[10.5px] font-bold transition-colors duration-500 ${on ? "bg-[#DC2626] text-white" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>{i + 1}</span>
                  </span>
                  <div className="min-w-0 pt-1 lg:pt-5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors duration-500 ${on ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>{s.meta}</span>
                    <h3 className={`mt-3 text-[19px] font-semibold tracking-[-0.01em] transition-colors duration-500 ${on ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>{s.t}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-[#475569] lg:mx-auto lg:max-w-[250px]">{s.d}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <p className="text-[15px] font-medium text-[#334155]">{d.ctaText}</p>
          <a href="#zakazi"
             className="group inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
            {d.cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
