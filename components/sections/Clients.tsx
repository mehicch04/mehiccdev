"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

const LIST = [
  { name: "Maximum Rent a Car", img: "/portfolio/maximum-poslije.webp", href: "/maximum", cat: { bs: "Web aplikacija", en: "Web app" } },
  { name: "OxyBaric Mostar", img: "/portfolio/oxybaric.png", href: "https://oxybaricmostar.ba", cat: { bs: "Web sajt", en: "Website" } },
  { name: "Adnan Gosto", img: "/portfolio/gosto-coaching.webp", href: "/portfolio", cat: { bs: "Coaching platforma", en: "Coaching platform" } },
  { name: "Roobet Rewards", img: "/portfolio/roobet.png", href: "https://roobet.com/", cat: { bs: "UI/UX dizajn", en: "UI/UX design" } },
];

const T = {
  bs: { label: "Radili smo za" },
  en: { label: "We've worked with" },
};

export function Clients() {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "bs";
  const d = T[l];
  const reduce = useReducedMotion() ?? false;
  const [hover, setHover] = useState<number | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 26, mass: 0.6 });
  const y = useSpring(my, { stiffness: 260, damping: 26, mass: 0.6 });

  const track = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    mx.set(e.clientX + 24);
    my.set(e.clientY - 190);
  };

  return (
    <section aria-label={d.label} className="strip relative bg-white py-10 sm:py-12 border-y border-[#F1F5F9]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
        <p className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.label}</p>
        <ul className="grid flex-1 grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:gap-x-2" onPointerMove={track}>
          {LIST.map((c, i) => {
            const external = c.href.startsWith("http");
            const dim = hover !== null && hover !== i;
            return (
              <li key={c.name} className="min-w-0">
                <a
                  href={c.href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onPointerEnter={(e) => { if (e.pointerType === "mouse") { track(e); setHover(i); } }}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(null)}
                  className={`group block rounded-xl px-0 py-1 transition-opacity duration-300 lg:px-3 ${dim ? "opacity-35" : "opacity-100"}`}
                >
                  <span className="block text-[16px] sm:text-[17px] font-semibold tracking-[-0.01em] text-[#0F172A]">
                    {c.name}
                    <ArrowUpRight size={15} className="ml-1 inline-block -translate-y-px text-[#94A3B8] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0F172A]" />
                  </span>
                  <span className="mt-0.5 block text-[12.5px] text-[#64748B]">{c.cat[l]}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <AnimatePresence>
        {hover !== null && (
          <motion.div
            key="peek"
            aria-hidden
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            exit={{ opacity: 0, scale: 0.92, rotate: -4 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed left-0 top-0 z-[60] hidden w-[300px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white md:block"
            style={{ x, y, boxShadow: "0 1px 2px rgba(15,23,42,0.06), 0 28px 56px -24px rgba(15,23,42,0.45)" }}
          >
            <span className="flex items-center gap-1.5 border-b border-[#F1F5F9] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" />
              <span className="ml-1.5 truncate text-[10.5px] text-[#94A3B8]">{LIST[hover].name}</span>
            </span>
            <span className="relative block aspect-[16/10]">
              {LIST.map((c, i) => (
                <Image key={c.img} src={c.img} alt="" fill sizes="300px"
                       className={`object-cover object-top transition-opacity duration-200 ${i === hover ? "opacity-100" : "opacity-0"}`} />
              ))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
