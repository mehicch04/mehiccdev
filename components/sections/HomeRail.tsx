"use client";

import { useLanguage } from "@/components/ui/LanguageProvider";
import { SectionRail } from "@/components/ui/SectionRail";

const ITEMS = {
  bs: [
    { id: "usluge",        label: "Usluge" },
    { id: "portfolio",     label: "Portfolio" },
    { id: "rezultati",     label: "Rezultati" },
    { id: "proces",        label: "Proces" },
    { id: "cjenovnik",     label: "Cjenovnik" },
    { id: "vrijednost",    label: "Vrijednost" },
    { id: "saas",          label: "Flagship" },
    { id: "o-nama",        label: "O nama" },
    { id: "cesta-pitanja", label: "Pitanja" },
    { id: "kontakt",       label: "Kontakt" },
  ],
  en: [
    { id: "usluge",        label: "Services" },
    { id: "portfolio",     label: "Portfolio" },
    { id: "rezultati",     label: "Results" },
    { id: "proces",        label: "Process" },
    { id: "cjenovnik",     label: "Pricing" },
    { id: "vrijednost",    label: "Value" },
    { id: "saas",          label: "Flagship" },
    { id: "o-nama",        label: "About" },
    { id: "cesta-pitanja", label: "FAQ" },
    { id: "kontakt",       label: "Contact" },
  ],
} as const;

export function HomeRail() {
  const { lang } = useLanguage();
  return <SectionRail items={ITEMS[(lang as "bs" | "en")] ?? ITEMS.bs} />;
}
