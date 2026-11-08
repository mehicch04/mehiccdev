"use client";

import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { PageHero } from "@/components/ui/PageHero";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { PHONE_DIAL, PHONE_DISPLAY, waLink } from "@/lib/contact";

const T = {
  bs: {
    eyebrow: "Kontakt", h1: "Pišite nam,", h1b: "odgovaramo isti dan",
    sub: "Pošaljite poruku preko forme, WhatsAppa ili emaila. Ako vam je lakše razgovarati, zakažite poziv od 30 minuta.",
    primary: "Zakažite poziv", secondary: "Pošaljite poruku",
    fast: "Najbrži put do nas",
    wa: "WhatsApp", waSub: "Odgovor najčešće za par minuta",
    call: "Pozovite", mail: "Email", mailSub: "Za ponude i dokumente",
  },
  en: {
    eyebrow: "Contact", h1: "Write to us,", h1b: "we reply the same day",
    sub: "Send a message through the form, WhatsApp or email. If you'd rather talk, book a 30 minute call.",
    primary: "Book a call", secondary: "Send a message",
    fast: "The fastest way to reach us",
    wa: "WhatsApp", waSub: "Usually answered in minutes",
    call: "Call us", mail: "Email", mailSub: "For quotes and documents",
  },
};

function Quick() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  const wa = waLink(lang);
  const row = "group flex items-center gap-4 rounded-2xl border p-4 transition-colors";
  return (
    <>
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.fast}</p>
      <div className="mt-3 space-y-2.5">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`${row} border-[#BBF7D0] bg-[#F0FDF4] hover:border-[#16A34A]`}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#16A34A] text-white"><MessageCircle size={19} /></span>
            <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold text-[#0F172A]">{d.wa}</span><span className="block text-[13px] text-[#15803D]">{d.waSub}</span></span>
            <ArrowUpRight size={17} className="text-[#15803D] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        )}
        {PHONE_DIAL && (
          <a href={`tel:${PHONE_DIAL}`} className={`${row} border-[#E2E8F0] hover:border-[#0F172A]`}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0F172A] text-white"><Phone size={18} /></span>
            <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold text-[#0F172A]">{d.call}</span><span className="block text-[13px] text-[#64748B]">{PHONE_DISPLAY}</span></span>
            <ArrowUpRight size={17} className="text-[#64748B] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        )}
        <a href="mailto:bakir.mehic@mehiccdev.com" className={`${row} border-[#E2E8F0] hover:border-[#0F172A]`}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#EEF3F8] text-[#0F3554]"><Mail size={18} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold text-[#0F172A]">{d.mail}</span><span className="block truncate text-[13px] text-[#64748B]">bakir.mehic@mehiccdev.com</span></span>
          <ArrowUpRight size={17} className="text-[#64748B] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </>
  );
}

export function ContactPage() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  return (
    <main className="relative bg-white">
      <PageHero eyebrow={d.eyebrow} h1={d.h1} h1b={d.h1b} sub={d.sub}
        primary={{ label: d.primary, href: "/zakazi" }} secondary={{ label: d.secondary, href: "#kontakt" }} aside={<Quick />} />
      <Contact bare />
      <Faq />
    </main>
  );
}
