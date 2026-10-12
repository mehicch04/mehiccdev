"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/components/ui/LanguageProvider";

const LABELS = {
  bs: { services: "Usluge", portfolio: "Portfolio", about: "O nama", saas: "Flagship", pricing: "Cjenovnik", contact: "Kontakt", solutions: "Rješenja", portfolioAll: "Sve reference" },
  en: { services: "Services", portfolio: "Portfolio", about: "About", saas: "Flagship", pricing: "Pricing", contact: "Contact", solutions: "Solutions", portfolioAll: "All references" },
};

const SOLUTIONS = [
  {
    href: "/rjesenja/rent-a-car",
    label: { bs: "Rent a Car sistem", en: "Car rental system" },
    desc:  { bs: "Rezervacije, flota i kalendar", en: "Bookings, fleet and calendar" },
    isNew: true,
  },
];

export function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solOpen,    setSolOpen]    = useState(false);
  const [solAccOpen, setSolAccOpen] = useState(false);
  const { lang, setLang }           = useLanguage();
  const L = LABELS[(lang as "bs" | "en")] ?? LABELS.bs;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV_LINKS = [
    { label: L.about,     href: "/#o-nama"    },
    { label: L.pricing,   href: "/#cjenovnik", promo: true },
    { label: L.saas,      href: "/#saas"      },
  ];

  return (
    <>
      <header className={cn(
        "fixed top-0 inset-x-0 z-50 border-b transition-[background-color,border-color] duration-300",
        scrolled ? "bg-white border-[#E5E7EB]" : "bg-transparent border-transparent"
      )}>
        <nav className="max-w-7xl mx-auto h-16 px-6 lg:px-8 flex items-center justify-between">
          <a href="/" className="flex items-center" aria-label="mehiccdev, naslovna">
            <Logo className="h-[17px] w-auto" />
          </a>

          <ul className="hidden lg:flex items-center gap-1">
            <li className="relative"
                onMouseEnter={() => setSolOpen(true)}
                onMouseLeave={() => setSolOpen(false)}>
              <button
                type="button"
                onClick={() => setSolOpen((v) => !v)}
                aria-expanded={solOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]
                           transition-colors duration-200"
              >
                {L.solutions}
                <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                <ChevronDown size={13} className={`transition-transform duration-200 ${solOpen ? "rotate-180" : ""}`} />
              </button>

              {solOpen && (
                <div className="absolute left-0 top-full pt-2 w-72">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]
                                  lg:backdrop-blur-xl shadow-2xl shadow-black/25 p-2">
                    {SOLUTIONS.map((s) => (
                      <a key={s.href} href={s.href}
                         onClick={() => setSolOpen(false)}
                         className="flex flex-col gap-0.5 px-3.5 py-3 rounded-xl
                                    transition-colors duration-200 hover:bg-[var(--surface)]">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--text)]">
                            {s.label[(lang as "bs" | "en")] ?? s.label.bs}
                          </span>
                          {"isNew" in s && s.isNew && (
                            <span className="px-1.5 py-0.5 rounded-full bg-brand-600 text-white
                                             text-[9px] font-extrabold uppercase tracking-wider">
                              {lang === "en" ? "New" : "Novo"}
                            </span>
                          )}
                        </span>
                        <span className="text-[12px] text-[var(--text-muted)]">
                          {s.desc[(lang as "bs" | "en")] ?? s.desc.bs}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </li>

            <li>
              <a href="/portfolio"
                 className="px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)]
                            hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all duration-200">
                {L.portfolio}
              </a>
            </li>

            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)]
                             hover:text-[var(--text)] hover:bg-[var(--surface)]
                             transition-all duration-200"
                >
                  {link.label}
                  {"promo" in link && link.promo && (
                    <span className="absolute -top-0.5 right-0 w-[15px] h-[15px] rounded-full
                                     flex items-center justify-center
                                     bg-red-500 text-white text-[8px] font-extrabold
                                     shadow-sm shadow-red-500/40 animate-pulse pointer-events-none"
                          aria-label="Akcijske cijene">
                      %
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center rounded-full border border-[var(--border)]
                            bg-[var(--surface)] p-0.5"
                 role="group" aria-label="Language">
              <span aria-hidden
                    className={`absolute top-0.5 bottom-0.5 left-0.5 w-8 rounded-full
                                bg-brand-600/15 border border-brand-600/35
                                transition-transform duration-300 ease-out
                                ${lang === "en" ? "translate-x-8" : ""}`} />
              <button onClick={() => setLang("bs")} aria-label="Bosanski"
                      className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-full
                                  transition-opacity duration-200 ${lang === "en" ? "opacity-45 hover:opacity-80" : ""}`}>
                <FlagBA />
              </button>
              <button onClick={() => setLang("en")} aria-label="English"
                      className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-full
                                  transition-opacity duration-200 ${lang === "bs" ? "opacity-45 hover:opacity-80" : ""}`}>
                <FlagGB />
              </button>
            </div>

            <a
              href="/#kontakt"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                         bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-bold
                         shadow-lg shadow-brand-600/25
                         transition-all duration-200 hover:shadow-xl hover:shadow-brand-600/40
                         hover:-translate-y-0.5"
            >
              {L.contact}
              <ArrowUpRight size={14} />
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)]
                         hover:bg-[var(--surface)] transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[74px] inset-x-3 z-40 lg:hidden
                       rounded-2xl border border-[var(--border)]
                       bg-[var(--bg)] shadow-2xl shadow-black/20 overflow-hidden"
          >
            <nav className="px-5 py-4 flex flex-col">
              <button
                type="button"
                onClick={() => setSolAccOpen((v) => !v)}
                aria-expanded={solAccOpen}
                className="flex items-center justify-between text-[15px] font-semibold text-[var(--text)] py-3.5
                           border-b border-[var(--border)]"
              >
                {L.solutions}
                <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                <ChevronDown size={15} className={`text-[var(--text-muted)] transition-transform duration-200 ${solAccOpen ? "rotate-180" : ""}`} />
              </button>
              {solAccOpen && (
                <div className="flex flex-col border-b border-[var(--border)]">
                  {SOLUTIONS.map((s) => (
                    <a key={s.href} href={s.href} onClick={() => setMobileOpen(false)}
                       className="flex items-center justify-between py-3 pl-3 text-[14px] text-[var(--text-muted)]">
                      {s.label[(lang as "bs" | "en")] ?? s.label.bs}
                      <ArrowUpRight size={13} />
                    </a>
                  ))}
                </div>
              )}

              <a href="/portfolio" onClick={() => setMobileOpen(false)}
                 className="flex items-center justify-between text-[15px] font-semibold text-[var(--text)] py-3.5
                            border-b border-[var(--border)]">
                {L.portfolio}
                <ArrowUpRight size={14} className="text-[var(--text-muted)]" />
              </a>

              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between text-[15px] font-semibold text-[var(--text)] py-3.5
                             border-b border-[var(--border)] last:border-0"
                >
                  <span className="relative inline-block">
                    {link.label}
                    {"promo" in link && link.promo && (
                      <span className="absolute -top-1.5 -right-4 w-[15px] h-[15px] rounded-full
                                       flex items-center justify-center
                                       bg-red-500 text-white text-[8px] font-extrabold pointer-events-none"
                            aria-label="Akcijske cijene">
                        %
                      </span>
                    )}
                  </span>
                  <ArrowUpRight size={14} className="text-[var(--text-muted)]" />
                </a>
              ))}
              <a
                href="/#kontakt"
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl
                           bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold
                           shadow-lg shadow-brand-600/25 transition-all"
              >
                {L.contact} <ArrowUpRight size={15} />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FlagBA() {
  return (
    <svg width="20" height="14" viewBox="0 0 40 28" aria-hidden className="rounded-[3px]">
      <rect width="40" height="28" fill="#002395" />
      <path d="M10 0 L30 0 L30 28 Z" fill="#FECB00" />
      <circle cx="7.5"  cy="4"    r="2.6" fill="#fff" />
      <circle cx="11.5" cy="9.5"  r="2.6" fill="#fff" />
      <circle cx="15.5" cy="15"   r="2.6" fill="#fff" />
      <circle cx="19.5" cy="20.5" r="2.6" fill="#fff" />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden className="rounded-[3px]">
      <rect width="20" height="14" fill="#012169" />
      <path d="M0 0 L20 14 M20 0 L0 14" stroke="#fff" strokeWidth="2.6" />
      <path d="M0 0 L20 14 M20 0 L0 14" stroke="#C8102E" strokeWidth="1.1" />
      <path d="M10 0 V14 M0 7 H20" stroke="#fff" strokeWidth="4.4" />
      <path d="M10 0 V14 M0 7 H20" stroke="#C8102E" strokeWidth="2.4" />
    </svg>
  );
}
