"use client";

import { Mail, MapPin, Instagram, Linkedin, ArrowUp, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Logo } from "@/components/ui/Logo";
import { Horizon } from "@/components/ui/Horizon";
import { EmailLink } from "@/components/ui/EmailLink";

const INSTAGRAM = "https://www.instagram.com/mehiccdev";

const TEAM = [
  { name: "Bakir Mehić", email: "bakir.mehic@mehiccdev.com", linkedin: "https://www.linkedin.com/in/bakir-mehic-qa-engineer/" },
  { name: "Nedim Kupusija", email: "nedim.kupusija@mehiccdev.com", linkedin: "https://www.linkedin.com/in/nedim-kupusija-4632a533b/" },
];

const T = {
  bs: {
    tagline: "Sajt, aplikacija i marketing iz jedne ruke. Građeno u Mostaru, za cijeli region.",
    location: "Mostar, Bosna i Hercegovina",
    status: "Dostupni za nove projekte",
    navHeading: "Navigacija",
    solHeading: "Rješenja",
    contactHeading: "Kontakt",
    roles: ["Development", "Marketing"],
    nav: [
      { label: "O nama", href: "/#o-nama" },
      { label: "Rezultati", href: "/#rezultati" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Cjenovnik", href: "/#cjenovnik" },
      { label: "Flagship", href: "/#saas" },
      { label: "Kontakt", href: "/#kontakt" },
    ],
    solutions: [
      { label: "Sistem za rent a car", href: "/rjesenja/rent-a-car" },
      { label: "Sistem u pokretu", href: "/#rent-a-car" },
      { label: "Maximum Rent a Car, primjer", href: "/maximum" },
      { label: "Platforma za nekretnine", href: "/#saas" },
    ],
    rights: "Sva prava zadržana.",
    madeIn: "Dizajnirano i razvijeno u Mostaru",
    toTop: "Na vrh",
  },
  en: {
    tagline: "Website, app and marketing from one team. Built in Mostar, for the whole region.",
    location: "Mostar, Bosnia and Herzegovina",
    status: "Available for new projects",
    navHeading: "Navigation",
    solHeading: "Solutions",
    contactHeading: "Contact",
    roles: ["Development", "Marketing"],
    nav: [
      { label: "About", href: "/#o-nama" },
      { label: "Results", href: "/#rezultati" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Pricing", href: "/#cjenovnik" },
      { label: "Flagship", href: "/#saas" },
      { label: "Contact", href: "/#kontakt" },
    ],
    solutions: [
      { label: "Car rental system", href: "/rjesenja/rent-a-car" },
      { label: "The system in action", href: "/#rent-a-car" },
      { label: "Maximum Rent a Car, case study", href: "/maximum" },
      { label: "Real estate platform", href: "/#saas" },
    ],
    rights: "All rights reserved.",
    madeIn: "Designed and built in Mostar",
    toTop: "Back to top",
  },
} as const;

const link = "text-[13.5px] text-[#94A3B8] transition-colors hover:text-white";
const head = "mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]";

export function Footer() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0F172A]">
      <Horizon />
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-8 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.3fr]">
          <div>
            <a href="/" className="inline-flex" aria-label="mehiccdev">
              <Logo variant="dark" className="h-6 w-auto" mark markClassName="h-11 w-11" />
            </a>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-[#94A3B8]">{d.tagline}</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#16A34A]/40 bg-[#16A34A]/10 px-3 py-1 text-[12px] font-semibold text-[#4ADE80]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ADE80]" /> {d.status}
            </span>
            <p className="mt-4 flex items-center gap-2 text-[12.5px] text-[#94A3B8]"><MapPin size={13} /> {d.location}</p>
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="mehiccdev Instagram"
               className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/[0.06]">
              <Instagram size={15} /> @mehiccdev
            </a>
          </div>

          <nav aria-label={d.navHeading}>
            <p className={head}>{d.navHeading}</p>
            <ul className="flex flex-col gap-2.5">
              {d.nav.map((l) => <li key={l.href}><a href={l.href} className={link}>{l.label}</a></li>)}
            </ul>
          </nav>

          <nav aria-label={d.solHeading}>
            <p className={head}>{d.solHeading}</p>
            <ul className="flex flex-col gap-2.5">
              {d.solutions.map((l) => <li key={l.label}><a href={l.href} className={link}>{l.label}</a></li>)}
            </ul>
          </nav>

          <div>
            <p className={head}>{d.contactHeading}</p>
            <ul className="flex flex-col gap-5">
              {TEAM.map((m, i) => (
                <li key={m.email}>
                  <p className="text-[13.5px] font-semibold text-white">{m.name} <span className="font-normal text-[#64748B]">· {d.roles[i]}</span></p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <EmailLink email={m.email} wrapClassName="min-w-0" className={`inline-flex min-w-0 max-w-full items-center gap-1.5 ${link}`}>
                      <Mail size={13} className="shrink-0" /> <span className="truncate">{m.email}</span>
                    </EmailLink>
                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} LinkedIn`}
                       className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 text-[#94A3B8] transition-colors hover:border-[#0A66C2] hover:text-white">
                      <Linkedin size={13} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-[12px] text-[#64748B]">© {year} mehiccdev. {d.rights}</p>
          <p className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]"><ArrowUpRight size={12} /> {d.madeIn}</p>
          <a href="#" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#94A3B8] transition-colors hover:text-white">
            {d.toTop} <ArrowUp size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}
