"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Globe, LayoutDashboard, Megaphone, PenTool, Pencil, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Head, FLOAT } from "@/components/ui/kit";

type Item = { title: string; desc: string; tags: string[]; price?: string; link: string; caption: string };
type Content = {
  label: string; h: string; accent: string; sub: string;
  items: Item[];
  report: { title: string; sample: string; month: string; kpis: [string, string][]; chart: string; weeks: string[]; foot: string; lead: string };
  editChip: string;
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    label: "Usluge",
    h: "Sve što vam treba online,",
    accent: "iz jedne ruke",
    sub: "Ne morate posebno tražiti dizajnera, programera i nekoga za mreže. Radimo sve četiri stvari, i one rade zajedno.",
    items: [
      {
        title: "Web aplikacije",
        desc: "Aplikacija koja vodi vaš posao: rezervacije, evidencija klijenata ili interni alat za tim. Plaćate jednom i ona je vaša.",
        tags: ["Rezervacije i termini", "Admin panel", "Obavijesti na WhatsApp"],
        price: "od 1.000 KM", link: "Pogledajte primjer", caption: "Admin panel, Maximum Rent a Car",
      },
      {
        title: "Sajtovi",
        desc: "Brzi sajtovi koji se vide na Googlu i rade savršeno na telefonu. Tekst, cijene i slike mijenjate sami, bez programera.",
        tags: ["Prvo za telefon", "Google vidljivost", "Dvojezično"],
        link: "Otvorite sajt", caption: "OxyBaric Mostar, medicinski sajt",
      },
      {
        title: "UI/UX dizajn",
        desc: "Dizajn ekrana i toka korisnika prije nego što se napiše ijedna linija koda, da proizvod bude jasan i lak za korištenje.",
        tags: ["Prototip", "Dizajn sistem", "Mobilni ekrani"],
        link: "Pogledajte radove", caption: "Roobet Rewards, sistem nagrada",
      },
      {
        title: "Marketing",
        desc: "Društvene mreže i reklame koje se mogu pratiti. Znate šta je objavljeno, ko je to vidio i koliko je upita stiglo.",
        tags: ["Instagram i Facebook", "Meta i Google reklame", "Mjesečni izvještaj"],
        price: "od 60 KM mj.", link: "Pogledajte pakete", caption: "Primjer mjesečnog izvještaja, paket Rast",
      },
    ],
    report: {
      title: "Mjesečni izvještaj", sample: "Primjer", month: "Oktobar",
      kpis: [["16", "objava"], ["4", "reelsa"], ["1", "kampanja"]],
      chart: "Upiti po sedmicama", weeks: ["1. sed.", "2. sed.", "3. sed.", "4. sed."],
      foot: "Budžet za reklame ide direktno Meti i Googleu, vi ga kontrolišete.",
      lead: "Vodi Nedim Kupusija",
    },
    editChip: "Tekst i slike mijenjate sami",
  },
  en: {
    label: "Services",
    h: "Everything you need online,",
    accent: "from one team",
    sub: "No need to hunt for a designer, a developer and someone for social media. We do all four, and they work together.",
    items: [
      {
        title: "Web apps",
        desc: "An app that runs your business: bookings, client records or an internal tool for your team. You pay once and it's yours.",
        tags: ["Bookings and appointments", "Admin panel", "WhatsApp alerts"],
        price: "from €500", link: "See an example", caption: "Admin panel, Maximum Rent a Car",
      },
      {
        title: "Websites",
        desc: "Fast websites that show up on Google and work perfectly on phones. You change text, prices and photos yourself, no developer needed.",
        tags: ["Mobile first", "Google visibility", "Bilingual"],
        link: "Open the site", caption: "OxyBaric Mostar, medical website",
      },
      {
        title: "UI/UX design",
        desc: "Screens and user flows designed before a single line of code is written, so the product is clear and easy to use.",
        tags: ["Prototype", "Design system", "Mobile screens"],
        link: "See the work", caption: "Roobet Rewards, rewards system",
      },
      {
        title: "Marketing",
        desc: "Social media and ads you can actually track. You know what was posted, who saw it and how many inquiries came in.",
        tags: ["Instagram and Facebook", "Meta and Google ads", "Monthly report"],
        price: "from €30 a month", link: "See the packages", caption: "Sample monthly report, Growth package",
      },
    ],
    report: {
      title: "Monthly report", sample: "Sample", month: "October",
      kpis: [["16", "posts"], ["4", "reels"], ["1", "campaign"]],
      chart: "Inquiries per week", weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
      foot: "The ad budget goes straight to Meta and Google, and you stay in control of it.",
      lead: "Run by Nedim Kupusija",
    },
    editChip: "You edit text and photos yourself",
  },
};

const ICONS: LucideIcon[] = [LayoutDashboard, Globe, PenTool, Megaphone];
const HREFS = ["/maximum", "https://oxybaricmostar.ba", "/portfolio", "#cjenovnik"];
const BARS = [34, 47, 43, 66];
const EASE = [0.22, 1, 0.36, 1] as const;

function Browser({ url, src, alt }: { url: string; src: string; alt: string }) {
  return (
    <span className="block overflow-hidden rounded-xl border border-[#E5E7EB] bg-white" style={{ boxShadow: FLOAT }}>
      <span className="flex items-center gap-1.5 border-b border-[#F1F5F9] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" />
        <span className="ml-2 min-w-0 truncate text-[10.5px] text-[#94A3B8]">{url}</span>
      </span>
      <span className="relative block aspect-[16/10]">
        <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 620px" quality={85} className="object-cover object-top" />
      </span>
    </span>
  );
}

function Phone({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="absolute bottom-0 right-[5%] block w-[25%]" style={{ containerType: "inline-size" }}>
      <span className="block bg-black" style={{ borderRadius: "15cqw", padding: "2.6cqw", boxShadow: "0 18px 40px -18px rgba(15,23,42,0.45)" }}>
        <span className="relative block aspect-[1179/2556] overflow-hidden bg-white" style={{ borderRadius: "12cqw" }}>
          <Image src={src} alt={alt} fill sizes="160px" quality={85} className="object-cover object-top" />
        </span>
      </span>
    </span>
  );
}

function Report({ r }: { r: Content["report"] }) {
  return (
    <span className="block rounded-xl border border-[#E5E7EB] bg-white p-5 sm:p-6" style={{ boxShadow: FLOAT }}>
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0F172A] text-white"><Megaphone size={16} /></span>
          <span>
            <span className="block text-[14px] font-semibold text-[#0F172A]">{r.title}</span>
            <span className="block text-[12px] text-[#64748B]">{r.month}</span>
          </span>
        </span>
        <span className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#475569]">{r.sample}</span>
      </span>
      <span className="mt-5 grid grid-cols-3 gap-2.5">
        {r.kpis.map(([v, k]) => (
          <span key={k} className="rounded-xl bg-[#F4F7FB] px-3 py-3">
            <span className="block text-[24px] font-semibold leading-none tracking-tight text-[#0F172A] tabular-nums">{v}</span>
            <span className="mt-1.5 block text-[12px] text-[#64748B]">{k}</span>
          </span>
        ))}
      </span>
      <span className="mt-5 block rounded-xl border border-[#F1F5F9] p-4">
        <span className="block text-[12px] font-semibold text-[#475569]">{r.chart}</span>
        <span className="mt-4 flex h-[110px] items-end gap-3">
          {BARS.map((h, i) => (
            <span key={i} className="flex flex-1 flex-col items-center gap-2">
              <motion.span
                className={`block w-full rounded-t-md ${i === BARS.length - 1 ? "bg-[#0F3554]" : "bg-[#CBD5E1]"}`}
                initial={{ height: 0 }} animate={{ height: h }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: EASE }}
              />
              <span className="text-[10.5px] text-[#94A3B8]">{r.weeks[i]}</span>
            </span>
          ))}
        </span>
      </span>
      <span className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[12px] leading-snug text-[#64748B]">{r.foot}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-white"><Image src="/team/nedim.jpg" alt="" fill sizes="28px" className="object-cover" /></span>
          <span className="hidden text-[11.5px] font-medium text-[#475569] sm:block">{r.lead}</span>
        </span>
      </span>
    </span>
  );
}

function Preview({ i, d }: { i: number; d: Content }) {
  const cap = d.items[i].caption;
  if (i === 3) return <Report r={d.report} />;
  return (
    <span className="relative block pb-[9%]">
      {i === 0 && <Browser url="maximum-rent.vercel.app/admin" src="/portfolio/maximum-admin-desktop-svijetla.webp" alt={cap} />}
      {i === 1 && <Browser url="oxybaricmostar.ba" src="/portfolio/oxybaric.png" alt={cap} />}
      {i === 2 && <Browser url="roobet.com/rewards" src="/portfolio/roobet.png" alt={cap} />}
      {i === 0 && <Phone src="/portfolio/maximum-admin-mob-svijetla.webp" alt={cap} />}
      {i === 2 && <Phone src="/portfolio/roobet-mob.webp" alt={cap} />}
      {i === 1 && (
        <span className="absolute bottom-0 right-[5%] inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[12.5px] font-semibold text-[#0F172A]"
              style={{ boxShadow: FLOAT }}>
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#16A34A] text-white"><Pencil size={12} /></span>
          {d.editChip}
        </span>
      )}
    </span>
  );
}

export function Services() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);

  const fade = {
    initial: { opacity: 0, y: 14, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.985 },
    transition: { duration: reduce ? 0 : 0.4, ease: EASE },
  };

  return (
    <section id="usluge" className="relative bg-white scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Head label={d.label} h={d.h} accent={d.accent} sub={d.sub} />

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <ul className="border-t border-[#E5E7EB]">
            {d.items.map((it, i) => {
              const on = i === active;
              const Icon = ICONS[i];
              const href = HREFS[i];
              const external = href.startsWith("http");
              return (
                <li key={it.title} className="border-b border-[#E5E7EB]">
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setActive(i)}
                    className="group flex w-full items-center gap-4 py-5 text-left"
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${on ? "bg-[#0F172A] text-white" : "bg-[#EEF3F8] text-[#0F3554]"}`}>
                      <Icon size={19} />
                    </span>
                    <span className={`flex-1 text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] transition-colors duration-300 ${on ? "text-[#0F172A]" : "text-[#94A3B8] group-hover:text-[#475569]"}`}>
                      {it.title}
                    </span>
                    <span className="text-[12px] font-semibold tabular-nums text-[#94A3B8]">0{i + 1}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 sm:pl-[60px]">
                          <p className="text-[15px] leading-[1.7] text-[#475569]">{it.desc}</p>
                          <ul className="mt-4 flex flex-wrap gap-1.5">
                            {it.tags.map((t) => (
                              <li key={t} className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1.5 text-[12.5px] font-medium text-[#334155]">{t}</li>
                            ))}
                          </ul>
                          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                            {it.price && <span className="text-[14px] font-semibold text-[#0F172A]">{it.price}</span>}
                            <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                               className="group/l inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0F3554] underline decoration-[#CBD5E1] underline-offset-4 hover:decoration-[#0F3554]">
                              {it.link}
                              {external ? <ArrowUpRight size={14} /> : <ArrowRight size={14} className="transition-transform group-hover/l:translate-x-0.5" />}
                            </a>
                          </div>
                          <div className="mt-6 lg:hidden">
                            <Preview i={i} d={d} />
                            <p className="mt-3 text-[12.5px] text-[#64748B]">{it.caption}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          <div className="sticky top-28 hidden lg:block">
            <div className="relative rounded-[24px] border border-[#E5E7EB] bg-white p-8" style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={active} {...fade}>
                  <Preview i={active} d={d} />
                </motion.div>
              </AnimatePresence>
              <div className="mt-5 flex items-center justify-between gap-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p key={active} {...fade} className="text-[13px] text-[#64748B]">{d.items[active].caption}</motion.p>
                </AnimatePresence>
                <div className="flex items-center gap-1.5" aria-hidden>
                  {d.items.map((it, i) => (
                    <span key={it.title} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-[#0F172A]" : "w-1.5 bg-[#CBD5E1]"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
