"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, Check, Star, ZoomIn, Dumbbell } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Lightbox, preloadImage } from "@/components/ui/kit";

const SCREEN_DESKTOP = "/portfolio/maximum-poslije.webp";
const SCREEN_MOBILE  = "/portfolio/maximum-admin-mob-svijetla.webp";
const FEATURE_URL    = "https://maximum-rent.vercel.app";

type Mini = { title: string; cat: string; desc: string; live?: boolean };
type Content = {
  label: string; heading: string; headingAccent: string; subtitle: string;
  badge: string; title: string; desc: string;
  stats: { v: string; l: string }[];
  features: string[];
  ctaLive: string; ctaWant: string; allLink: string; ctaCase: string; livePill: string; buildPill: string;
  zoomHint: string; closeLabel: string;
  minis: Mini[];
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    label: "Naš rad",
    heading: "Projekti koji",
    headingAccent: "rade posao",
    subtitle: "Gotovi projekti rade uživo za stvarne klijente, a na nekima još radimo. Slobodno otvorite i probajte.",
    badge: "Naš najveći projekat · Business paket",
    title: "Maximum Rent a Car",
    desc: "Kompletna web aplikacija za iznajmljivanje vozila. Gost izabere auto i datume, sistem provjeri dostupnost i spriječi dupla rezervisanja, a vlasnik sve potvrđuje u dva klika iz svog privatnog panela.",
    stats: [
      { v: "3,2s", l: "učitavanje na telefonu, prije 21,6s" },
      { v: "100", l: "Google ocjena performansi" },
      { v: "2", l: "jezika, HR i EN" },
      { v: "24/7", l: "prima upite i dok vlasnik spava" },
    ],
    features: [
      "Pretraga slobodnih vozila po datumima, bez duplih rezervacija",
      "Vlasnik sam mijenja vozila, cijene i slike, bez zvanja developera",
      "Upit stiže odmah na Telegram i WhatsApp, gost dobija automatski email",
      "Dvojezično HR/EN, građeno prvo za telefon",
    ],
    ctaLive: "Pogledaj uživo",
    ctaCase: "Pogledajte detaljnije",
    ctaWant: "Želim ovakvu aplikaciju",
    allLink: "Pogledaj sve projekte",
    livePill: "Uživo",
    buildPill: "U izradi",
    zoomHint: "Klikni za uvećanje",
    closeLabel: "Zatvori",
    minis: [
      { title: "OxyBaric Mostar", cat: "Web sajt · Medicina", desc: "Medicinski sajt koji dovodi pacijente iz Google pretrage." },
      { title: "Roobet Rewards", cat: "UI/UX Dizajn · Crypto Casino", desc: "Dizajn sistema nagrada za gaming platformu, s nivoima i napretkom koji igrača vodi naprijed.", live: true },
      { title: "Adnan Gosto · IFBB Pro", cat: "Web aplikacija · Bodybuilding coaching", desc: "Platforma za IFBB Pro trenera i višestrukog prvaka BiH, s prijavama klijenata i admin panelom za vođenje saradnji." },
    ],
  },
  en: {
    label: "Our work",
    heading: "Projects that",
    headingAccent: "do the job",
    subtitle: "Finished projects run live for real clients, and a few are still in the works. Feel free to open and try them.",
    badge: "Our biggest build · Business package",
    title: "Maximum Rent a Car",
    desc: "A complete car rental web application. Guests pick a car and dates, the system checks availability and prevents double bookings, and the owner confirms everything in two clicks from a private panel.",
    stats: [
      { v: "3.2s", l: "mobile load time, was 21.6s" },
      { v: "100", l: "Google performance score" },
      { v: "2", l: "languages, HR and EN" },
      { v: "24/7", l: "takes inquiries while the owner sleeps" },
    ],
    features: [
      "Search available cars by dates, with no double bookings",
      "The owner updates cars, prices and photos without calling a developer",
      "Inquiries arrive instantly on Telegram and WhatsApp, guests get an automatic email",
      "Bilingual HR and EN, built for phones first",
    ],
    ctaLive: "See it live",
    ctaCase: "See the full case study",
    ctaWant: "I want an app like this",
    allLink: "See all projects",
    livePill: "Live",
    buildPill: "In progress",
    zoomHint: "Click to enlarge",
    closeLabel: "Close",
    minis: [
      { title: "OxyBaric Mostar", cat: "Custom Website · Medicine", desc: "A medical site that brings patients in from Google search." },
      { title: "Roobet Rewards", cat: "UI/UX Design · Crypto Casino", desc: "Rewards system design for a gaming platform, with tiers and progression that pull players forward.", live: true },
      { title: "Adnan Gosto · IFBB Pro", cat: "Web app · Bodybuilding coaching", desc: "A platform for an IFBB Pro coach and multiple national champion, with client sign-ups and an admin panel to manage coaching." },
    ],
  },
};

const MINI_META = [
  { img: "/portfolio/oxybaric.png", href: "https://oxybaricmostar.ba" },
  { img: "/portfolio/roobet.png",   href: "https://roobet.com/" },
  { img: "/portfolio/gosto-coaching.webp", href: "#kontakt" },
];

type Zoom = { src: string; alt: string; phone: boolean } | null;

export function Portfolio() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;
  const [zoom, setZoom] = useState<Zoom>(null);
  const closeZoom = useCallback(() => setZoom(null), []);

  return (
    <section id="portfolio" className="relative bg-white scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.label}</p>
          <h2 className="mt-4 text-[32px] leading-[1.12] sm:text-[44px] font-semibold tracking-[-0.03em] text-[#0F172A]">
            {d.heading} <span className="text-[#0F3554]">{d.headingAccent}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#475569]">{d.subtitle}</p>
        </div>

        <article className="mt-12 grid overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white lg:grid-cols-[1fr_1.05fr]">

          <div className="p-6 sm:p-9">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
              <Star size={12} className="fill-[#0F3554] text-[#0F3554]" /> {d.badge}
            </p>
            <h3 className="mt-3 text-[26px] font-semibold tracking-tight text-[#0F172A]">{d.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#475569]">{d.desc}</p>

            <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-y-5 border-y border-[#F1F5F9] py-5">
              {d.stats.map((s, i) => (
                <div key={s.l} className={`pr-3 ${i > 0 ? "sm:border-l sm:border-[#F1F5F9] sm:pl-4 lg:border-l-0 lg:pl-0 xl:border-l xl:pl-4" : ""}`}>
                  <dd className="text-[20px] font-semibold tracking-tight text-[#0F172A] tabular-nums">{s.v}</dd>
                  <dt className="mt-0.5 text-[11.5px] leading-snug text-[#64748B]">{s.l}</dt>
                </div>
              ))}
            </dl>

            <ul className="mt-6 space-y-2.5">
              {d.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[14px] leading-snug text-[#334155]">
                  <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#16A34A]" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/maximum"
                 className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#1E293B]">
                {d.ctaCase} <ArrowRight size={15} />
              </a>
              <a href={FEATURE_URL} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-5 py-3 text-[14px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F9FAFB]">
                {d.ctaLive} <ArrowUpRight size={15} />
              </a>
              <a href="#kontakt"
                 className="px-1 text-[14px] font-medium text-[#475569] underline decoration-[#CBD5E1] underline-offset-4 transition-colors hover:text-[#0F172A] hover:decoration-[#0F172A]">
                {d.ctaWant}
              </a>
            </div>
          </div>

          <div className="relative border-t lg:border-t-0 lg:border-l border-[#E5E7EB] bg-[#F8FAFC] p-6 sm:p-9 flex items-center">
            <div className="relative w-full pb-[12%]">
              <button type="button" onPointerEnter={() => preloadImage(SCREEN_DESKTOP)} onClick={() => setZoom({ src: SCREEN_DESKTOP, alt: d.title, phone: false })}
                      aria-label={`${d.title} · ${d.zoomHint}`}
                      className="group block w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white text-left cursor-zoom-in">
                <span className="flex items-center gap-1.5 border-b border-[#F1F5F9] px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" />
                  <span className="ml-2 min-w-0 truncate text-[10.5px] text-[#94A3B8]">maximum-rent.vercel.app</span>
                  <span className="ml-auto flex items-center gap-1 text-[10.5px] text-[#64748B] opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn size={11} /> {d.zoomHint}
                  </span>
                </span>
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image src={SCREEN_DESKTOP} alt={d.title} fill sizes="(max-width: 1024px) 100vw, 640px" quality={85} className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
                </span>
              </button>

              <button type="button" onPointerEnter={() => preloadImage(SCREEN_MOBILE)} onClick={() => setZoom({ src: SCREEN_MOBILE, alt: `${d.title} · admin`, phone: true })}
                      aria-label={`${d.title} · admin · ${d.zoomHint}`}
                      className="absolute bottom-0 right-[4%] w-[27%] cursor-zoom-in"
                      style={{ containerType: "inline-size" }}>
                <span className="block bg-black"
                      style={{ borderRadius: "15cqw", padding: "2.6cqw", boxShadow: "0 18px 40px -18px rgba(15,23,42,0.45)" }}>
                  <span className="relative block overflow-hidden bg-white aspect-[1179/2556]" style={{ borderRadius: "12cqw" }}>
                    <Image src={SCREEN_MOBILE} alt={`${d.title} · admin`} fill sizes="(max-width: 1024px) 30vw, 180px" quality={85} className="object-cover object-top transition-transform duration-500 ease-out hover:scale-[1.05]" />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </article>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {d.minis.map((m, i) => {
            const meta = MINI_META[i];
            const external = meta.href.startsWith("http");
            const body = (
              <>
                <span className="relative block aspect-[16/10] overflow-hidden border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {meta.img ? (
                    <Image src={meta.img} alt={m.title} fill sizes="(max-width: 640px) 100vw, 400px"
                           className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.05]" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                      <span className="flex flex-col items-center gap-2 text-[#94A3B8]">
                        <Dumbbell size={26} />
                        <span className="text-[12px] font-medium">{m.cat}</span>
                      </span>
                    </span>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#0F172A]">
                    <span className={`h-1.5 w-1.5 rounded-full ${m.live ? "bg-[#16A34A]" : "bg-[#F59E0B]"}`} /> {m.live ? d.livePill : d.buildPill}
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="text-[12px] font-medium text-[#64748B]">{m.cat}</span>
                  <span className="mt-1 flex items-start justify-between gap-3">
                    <span className="text-[16px] font-semibold text-[#0F172A]">{m.title}</span>
                    {m.live && <ArrowUpRight size={17} className="mt-0.5 shrink-0 text-[#94A3B8] transition-colors group-hover:text-[#0F172A]" />}
                  </span>
                  <span className="mt-1.5 text-[13.5px] leading-relaxed text-[#64748B]">{m.desc}</span>
                </span>
              </>
            );
            const cls = "group flex flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white transition-colors hover:border-[#CBD5E1]";
            return m.live ? (
              <a key={m.title} href={meta.href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{body}</a>
            ) : (
              <div key={m.title} className={cls}>{body}</div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <a href="/portfolio" className="group inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-[14px] font-semibold text-[#0F172A] transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]">
            {d.allLink} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>

      <Lightbox zoom={zoom} onClose={closeZoom} closeLabel={d.closeLabel} />
    </section>
  );
}
