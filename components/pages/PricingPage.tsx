"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { PageHero } from "@/components/ui/PageHero";
import { Pricing } from "@/components/sections/Pricing";
import { Savings } from "@/components/sections/Savings";
import { Faq } from "@/components/sections/Faq";
import { Booking } from "@/components/sections/Booking";

const T = {
  bs: {
    eyebrow: "Cjenovnik", h1: "Cijene bez", h1b: "skrivenih troškova",
    sub: "Aplikaciju plaćate jednom i ona je vaša. Održavanje uzimate samo ako vam zatreba, a marketing mjesečno dok vam donosi upite.",
    primary: "Zakažite poziv", secondary: "Izračunajte isplativost",
    q: "Šta vam treba?", pick: "Preporuka za vas", from: "od", once: "jednom, bez pretplate", see: "Pogledajte paket", popular: "Najčešći izbor",
    opts: [
      { a: "Jedan alat, npr. evidencija ili katalog", name: "Starter", price: "1.000 KM", gets: ["Radi na telefonu i računaru", "Sami mijenjate sadržaj", "Upiti stižu direktno vama"] },
      { a: "Online rezervacije i termini", name: "Business", price: "1.800 KM", gets: ["Rezervacije bez duplih termina", "WhatsApp obavijest za svaku", "Na dva jezika"] },
      { a: "Sistem po mjeri cijelog procesa", name: "Premium", price: "2.800 KM", gets: ["Online plaćanje i depozit", "Lični developer", "Prioritetna podrška"] },
    ],
  },
  en: {
    eyebrow: "Pricing", h1: "Prices with no", h1b: "hidden costs",
    sub: "You pay for the app once and it's yours. Maintenance only if you need it, and marketing monthly while it brings you inquiries.",
    primary: "Book a call", secondary: "Calculate the return",
    q: "What do you need?", pick: "Our pick for you", from: "from", once: "one time, no subscription", see: "See the plan", popular: "Most popular",
    opts: [
      { a: "One tool, e.g. records or a catalog", name: "Starter", price: "€500", gets: ["Works on phone and desktop", "You edit the content", "Inquiries come straight to you"] },
      { a: "Online bookings and appointments", name: "Business", price: "€920", gets: ["Bookings with no double slots", "WhatsApp alert for each one", "In two languages"] },
      { a: "A system built around your process", name: "Premium", price: "€1,430", gets: ["Online payment and deposit", "Personal developer", "Priority support"] },
    ],
  },
};

function Picker() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  const [i, setI] = useState(1);
  const o = d.opts[i];
  return (
    <>
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.q}</p>
      <div className="mt-3 space-y-2">
        {d.opts.map((x, k) => (
          <button key={x.name} type="button" onClick={() => setI(k)}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[14px] font-semibold transition-colors ${k === i ? "border-[#0F172A] bg-[#0F172A] text-white" : "border-[#E2E8F0] text-[#0F172A] hover:border-[#94A3B8]"}`}>
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${k === i ? "border-white" : "border-[#CBD5E1]"}`}>{k === i && <span className="h-2 w-2 rounded-full bg-white" />}</span>
            {x.a}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-[#F4F7FB] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{d.pick}</p>
          {i === 1 && <span className="rounded-full bg-[#DC2626] px-2.5 py-0.5 text-[11px] font-semibold text-white">{d.popular}</span>}
        </div>
        <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">{o.name}</p>
        <p className="text-[14px] text-[#475569]"><span className="text-[#64748B]">{d.from}</span> <span className="text-[20px] font-semibold text-[#0F172A]">{o.price}</span> · {d.once}</p>
        <ul className="mt-3 space-y-1.5">
          {o.gets.map((g) => <li key={g} className="flex items-center gap-2 text-[13.5px] text-[#334155]"><Check size={15} strokeWidth={2.5} className="text-[#16A34A]" /> {g}</li>)}
        </ul>
        <a href="#cjenovnik" className="group mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0F3554] hover:text-[#0F172A]">
          {d.see} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </>
  );
}

export function PricingPage() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  return (
    <main className="relative bg-white">
      <PageHero eyebrow={d.eyebrow} h1={d.h1} h1b={d.h1b} sub={d.sub}
        primary={{ label: d.primary, href: "#zakazi" }} secondary={{ label: d.secondary, href: "#vrijednost" }} aside={<Picker />} />
      <Pricing full bare />
      <Savings />
      <Faq />
      <Booking />
    </main>
  );
}
