"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircle, Plus } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { waLink } from "@/lib/contact";

type Content = {
  label: string; h: string; accent: string;
  askTitle: string; askSub: string; askBtn: string; askMail: string;
  items: { q: string; a: string }[];
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    label: "Česta pitanja",
    h: "Pitanja koja",
    accent: "nam najčešće postavljate",
    askTitle: "Niste našli odgovor?",
    askSub: "Pišite nam direktno. Odgovaramo u roku od 24 sata, najčešće isti dan.",
    askBtn: "WhatsApp",
    askMail: "Pošaljite upit",
    items: [
      { q: "Koliko košta sajt ili aplikacija?", a: "Web aplikacije kreću od 1.000 KM (oko €500) i plaćate ih jednom. Tačnu cijenu dobijete nakon besplatne konsultacije, kad znamo šta vam tačno treba." },
      { q: "Da li plaćam mjesečnu pretplatu?", a: "Ne. Aplikaciju plaćate jednom i ona je vaša. Održavanje je po želji: 100 KM mjesečno ili 50 KM po satu, samo kad vam zatreba. Hosting se plaća zasebno, po stvarnoj potrošnji." },
      { q: "Koliko traje izrada?", a: "Zavisi od obima posla. Rok dobijete u ponudi nakon konsultacije, a napredak pratite cijelo vrijeme." },
      { q: "Mogu li sam mijenjati tekst, slike i cijene?", a: "Da. Dobijete jednostavan panel i uputstvo, pa za uobičajene izmjene ne trebate programera." },
      { q: "Radite li i marketing?", a: "Da. Nedim vodi društvene mreže i reklame, a paketi kreću od 60 KM mjesečno, bez ugovorne obaveze. Uz svaku aplikaciju prvi mjesec marketinga je besplatan." },
      { q: "Radite li samo za firme iz Mostara?", a: "Ne. Radimo za klijente iz cijele BiH i regiona, a sve se može dogovoriti online." },
    ],
  },
  en: {
    label: "FAQ",
    h: "Questions",
    accent: "we hear most often",
    askTitle: "Didn't find your answer?",
    askSub: "Message us directly. We reply within 24 hours, usually the same day.",
    askBtn: "WhatsApp",
    askMail: "Send an inquiry",
    items: [
      { q: "How much does a website or app cost?", a: "Web apps start at €500 (about 1,000 KM) and you pay once. You get an exact price after a free consultation, once we know exactly what you need." },
      { q: "Do I pay a monthly subscription?", a: "No. You pay for the app once and it's yours. Maintenance is optional: €50 a month or €25 an hour, only when you need it. Hosting is billed separately, based on actual usage." },
      { q: "How long does it take?", a: "It depends on the scope. You get the deadline in the quote after the consultation, and you can follow the progress the whole time." },
      { q: "Can I change text, photos and prices myself?", a: "Yes. You get a simple panel and a guide, so everyday changes don't need a developer." },
      { q: "Do you do marketing too?", a: "Yes. Nedim runs social media and ads, and packages start at €30 a month with no contract commitment. With every app, the first month of marketing is free." },
      { q: "Do you only work with companies from Mostar?", a: "No. We work with clients from all over Bosnia and Herzegovina and the region, and everything can be arranged online." },
    ],
  },
};

export function Faq() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState<number | null>(0);
  const wa = waLink(lang);

  return (
    <section id="cesta-pitanja" data-dark className="relative scroll-mt-24 text-white" style={{ background: "#0F172A" }}>
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8FB3D9]">{d.label}</p>
          <h2 className="mt-4 text-[32px] leading-[1.12] sm:text-[44px] font-semibold tracking-[-0.03em]">
            {d.h} <span className="text-[#8FB3D9]">{d.accent}</span>
          </h2>
          <div className="mt-8 flex items-center gap-4 rounded-[20px] border border-[#E5E7EB] bg-white p-5" style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
            <span className="flex shrink-0 -space-x-3">
              {["/team/bakir.jpg", "/team/nedim.jpg"].map((src) => (
                <span key={src} className="relative h-11 w-11 overflow-hidden rounded-full ring-[3px] ring-white">
                  <Image src={src} alt="" fill sizes="44px" className="object-cover" />
                </span>
              ))}
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-[#0F172A]">{d.askTitle}</span>
              <span className="mt-0.5 block text-[13.5px] leading-snug text-[#64748B]">{d.askSub}</span>
              <span className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#15803D] hover:text-[#166534]">
                    <MessageCircle size={14} /> {d.askBtn}
                  </a>
                )}
                <a href="#kontakt" className="text-[13.5px] font-semibold text-[#0F3554] underline decoration-[#CBD5E1] underline-offset-4 hover:decoration-[#0F3554]">
                  {d.askMail}
                </a>
              </span>
            </span>
          </div>
        </div>

        <ul className="border-t border-white/10">
          {d.items.map((it, i) => {
            const on = open === i;
            return (
              <li key={it.q} className="border-b border-white/10">
                <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : i)}
                        className="group flex w-full items-center justify-between gap-6 py-5 text-left">
                  <span className={`text-[16px] sm:text-[17px] font-semibold transition-colors ${on ? "text-white" : "text-[#CBD5E1] group-hover:text-white"}`}>{it.q}</span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${on ? "rotate-45 border-white bg-white text-[#0F172A]" : "border-white/15 text-[#94A3B8] group-hover:border-white/30"}`}>
                    <Plus size={16} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <p className="pb-6 pr-12 text-[15px] leading-[1.7] text-[#94A3B8]">{it.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
