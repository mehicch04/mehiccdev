"use client";

import { useState } from "react";
import { Gauge, MessageCircle, Wallet } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { PageHero } from "@/components/ui/PageHero";
import { About } from "@/components/sections/About";
import { Clients } from "@/components/sections/Clients";
import { Process } from "@/components/sections/Process";
import { Booking } from "@/components/sections/Booking";

const ICONS = [MessageCircle, Wallet, Gauge];

const T = {
  bs: {
    eyebrow: "O nama", h1: "Mali tim,", h1b: "direktan kontakt",
    sub: "mehiccdev je studio iz Mostara. Radite direktno sa ljudima koji prave vaš projekat, bez posrednika i bez čekanja na odgovor.",
    primary: "Zakažite poziv", secondary: "Pogledajte projekte",
    why: "Zašto klijenti biraju nas",
    items: [
      { t: "Direktno sa developerom", v: "Isti dan", l: "odgovor na poruku", d: "Ne pričate sa prodavcem nego sa onim ko piše kod vašeg projekta." },
      { t: "Plaćate jednom", v: "0 KM", l: "mjesečne pretplate", d: "Aplikacija je vaša. Održavanje uzimate samo ako vam zatreba." },
      { t: "Brzina koja prodaje", v: "3,2 s", l: "umjesto 21,6 s", d: "Toliko se sada otvara Maximum Rent a Car na telefonu." },
    ],
  },
  en: {
    eyebrow: "About", h1: "A small team,", h1b: "direct contact",
    sub: "mehiccdev is a studio from Mostar. You work directly with the people building your project, with no middlemen and no waiting for answers.",
    primary: "Book a call", secondary: "See our projects",
    why: "Why clients pick us",
    items: [
      { t: "Straight to the developer", v: "Same day", l: "reply to your message", d: "You don't talk to a salesperson, you talk to the person writing your code." },
      { t: "Pay once", v: "€0", l: "monthly subscription", d: "The app is yours. Maintenance only if you need it." },
      { t: "Speed that sells", v: "3.2 s", l: "instead of 21.6 s", d: "That's how fast Maximum Rent a Car now opens on a phone." },
    ],
  },
};

function Why() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  const [i, setI] = useState(0);
  const x = d.items[i];
  const Icon = ICONS[i];
  return (
    <>
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.why}</p>
      <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-2xl bg-[#F1F5F9] p-1.5">
        {d.items.map((it, k) => {
          const I = ICONS[k];
          return (
            <button key={it.t} type="button" onClick={() => setI(k)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-center text-[11.5px] font-semibold leading-tight transition-colors ${k === i ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}>
              <I size={17} /> {it.t}
            </button>
          );
        })}
      </div>
      <div className="mt-5 rounded-2xl bg-[#0F172A] p-6 text-white">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Icon size={18} /></span>
        <p className="mt-4 text-[38px] font-semibold leading-none tracking-[-0.03em] text-[#4ADE80]">{x.v}</p>
        <p className="mt-1 text-[13px] text-[#94A3B8]">{x.l}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-[#E2E8F0]">{x.d}</p>
      </div>
    </>
  );
}

export function AboutPage() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  return (
    <main className="relative bg-white">
      <PageHero eyebrow={d.eyebrow} h1={d.h1} h1b={d.h1b} sub={d.sub}
        primary={{ label: d.primary, href: "#zakazi" }} secondary={{ label: d.secondary, href: "/portfolio" }} aside={<Why />} />
      <About />
      <Clients />
      <Process />
      <Booking />
    </main>
  );
}
