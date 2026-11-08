"use client";

import { useLanguage } from "@/components/ui/LanguageProvider";
import { PageHero } from "@/components/ui/PageHero";
import { SaasTeaser } from "@/components/sections/SaasTeaser";

const T = {
  bs: {
    eyebrow: "Flagship · rani pristup otvoren", h1: "Platforma za", h1b: "oglašavanje nekretnina",
    sub: "Gradimo platformu za agencije i vlasnike nekretnina u regiji: AI opisi oglasa, automatski uvoz iz XML-a i kalkulator kredita na svakom oglasu.",
    primary: "Prijavite se za rani pristup", secondary: "Zakažite poziv",
  },
  en: {
    eyebrow: "Flagship · early access open", h1: "A platform for", h1b: "real estate listings",
    sub: "We're building a platform for agencies and property owners in the region: AI listing descriptions, automatic XML import and a loan calculator on every listing.",
    primary: "Join early access", secondary: "Book a call",
  },
};

export function FlagshipPage() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  return (
    <main className="relative bg-white">
      <PageHero eyebrow={d.eyebrow} h1={d.h1} h1b={d.h1b} sub={d.sub}
        primary={{ label: d.primary, href: "#saas" }} secondary={{ label: d.secondary, href: "/zakazi" }} />
      <SaasTeaser />
    </main>
  );
}
