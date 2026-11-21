"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type L = "bs" | "en";

const LIST: { name: string; img: string; href: string; live: boolean; cat: Record<L, string> }[] = [
  { name: "Maximum Rent a Car", img: "/portfolio/maximum-poslije.webp", href: "/maximum", live: true, cat: { bs: "Sistem za online rezervacije vozila", en: "Online vehicle booking system" } },
  { name: "OxyBaric Mostar", img: "/portfolio/oxybaric.webp", href: "/portfolio", live: true, cat: { bs: "Digitalna prezentacija klinike", en: "Digital presence for a clinic" } },
  { name: "Adnan Gosto", img: "/portfolio/gosto-hero.webp", href: "/portfolio", live: false, cat: { bs: "Platforma za online coaching", en: "Online coaching platform" } },
  { name: "Roobet Rewards", img: "/portfolio/roobet.webp", href: "https://roobet.com/", live: true, cat: { bs: "Dizajn programa nagrada", en: "Rewards program design" } },
];

const T = {
  bs: { label: "Radili smo za", all: "Svi projekti", live: "Uživo", build: "U izradi" },
  en: { label: "We've worked with", all: "All projects", live: "Live", build: "In progress" },
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function Clients() {
  const { lang } = useLanguage();
  const l: L = lang === "en" ? "en" : "bs";
  const d = T[l];
  const reduce = useReducedMotion() ?? false;

  return (
    <section aria-label={d.label} className="strip relative bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.label}</p>
          <a href="/portfolio" className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#0F172A] transition-colors hover:text-[#0F3554]">
            {d.all} <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
          {LIST.map((c, i) => {
            const ext = c.href.startsWith("http");
            return (
              <motion.li key={c.name} className="min-w-0"
                initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}>
                <a href={c.href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-4">
                  <span className="relative block aspect-[16/10] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] transition-[box-shadow,border-color] duration-300 group-hover:border-[#CBD5E1] group-hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.45)]">
                    <Image src={c.img} alt={c.name} fill sizes="(max-width: 1024px) 45vw, 270px" quality={80}
                           className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                    <span className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[10.5px] font-semibold ${c.live ? "text-[#15803D]" : "text-[#B45309]"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.live ? "bg-[#16A34A]" : "bg-[#F59E0B]"}`} />{c.live ? d.live : d.build}
                    </span>
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-2">
                    <span className="min-w-0 text-[14.5px] font-semibold leading-snug tracking-[-0.01em] text-[#0F172A] sm:text-[15px]">{c.name}</span>
                    <ArrowUpRight size={15} className="shrink-0 text-[#94A3B8] transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0F172A]" />
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-[#64748B]">{c.cat[l]}</span>
                </a>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
