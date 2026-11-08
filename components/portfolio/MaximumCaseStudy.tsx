"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Star, Moon, Sun, Play, ClipboardCheck, CarFront, FileText, Languages, Gauge, ShieldCheck, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Booking } from "@/components/sections/Booking";
import { Backdrop, Head, Fade, BrowserFrame, PhoneMockup, Lightbox, SOFT, preloadImage, type ZoomState } from "@/components/ui/kit";

const T = {
  bs: {
    eyebrow: "Case study · Rent a car",
    h1a: "Maximum SaaS,",
    h1b: "digitalna transformacija rent-a-cara",
    sub: "Rent-a-car firma iz Mostara koja je rezervacije vodila kroz poruke i svesku dobila je sistem koji radi sam. Gost bira vozilo i datume, sistem provjerava dostupnost, vlasnik potvrđuje jednim klikom.",
    meta: ["Next.js i TypeScript", "Dvojezično, HR i EN", "Uživo od 2026."],
    visit: "Otvorite sajt",
    premiumTag: "Premium paket",
    stats: [
      { n: 100, dec: 0, suf: "", l: "Google ocjena performansi" },
      { n: 3.2, dec: 1, suf: " s", l: "učitavanje na telefonu, ranije 21,6 s" },
      { n: 0, dec: 0, suf: "", l: "duplih rezervacija od lansiranja" },
      { n: 2, dec: 0, suf: "", l: "jezika za domaće i strane goste" },
    ],
    compare: {
      label: "Prije i poslije",
      h1: "Ista firma,",
      h2: "dva različita sajta",
      sub: "Lijevo je sajt koji je Maximum imao ranije, desno je onaj koji danas radi. Kliknite na sliku za uvećanje.",
      beforeTag: "Prije",
      afterTag: "Poslije",
      beforeTitle: "Stari sajt",
      afterTitle: "Novi sistem",
      beforeNote: "Forma je samo slala upit, dostupnost se provjeravala ručno.",
      afterNote: "Gost vidi slobodna vozila, bira datume i dobija potvrdu.",
      beforeSpeed: "21,6 s",
      afterSpeed: "3,2 s",
      speedLabel: "učitavanje na telefonu",
      hint: "Kliknite za uvećanje",
      phoneLabel: "Isti sajt na telefonu",
      phoneNote: "Više od pola gostiju dolazi s telefona, pa je i ovdje razlika najveća.",
      phoneBefore: "Forma je zauzimala cijeli ekran, sadržaj je počinjao tek ispod nje.",
      phoneAfter: "Ponuda, ocjena i rezervacija odmah na prvom ekranu.",
    },
    admin: {
      label: "Admin panel",
      h1: "Panel koji vlasnik",
      h2: "drži u ruci",
      sub: "Ovoga prije nije bilo. Rezervacije su se vodile ručno, a sada sve stoji na jednom mjestu, isto na računaru i na telefonu.",
      dark: "Tamna tema",
      light: "Svijetla tema",
      deskCap: "Na računaru · pregled svih rezervacija na čekanju",
      mobCap: "Na telefonu · potvrda dok ste kod vozila",
      note: "Prikazani podaci su testni unosi, ne stvarni gosti.",
      hint: "Kliknite za uvećanje",
    },
    bentoLabel: "Moduli sistema",
    bentoH1: "Šta sve",
    bentoH2: "sistem radi",
    ctaH: "Vodite rent-a-car firmu?",
    ctaSub: "Isti sistem prilagođavamo vašoj floti. Cijene i paketi su na jednoj stranici.",
    ctaBtn: "Pogledajte sistem i cijene",
    imgAlt: "Maximum Rent a Car, naslovna stranica",
    modules: [
      { k: "checkin", t: "Smart preuzimanje i povrat", d: "Preuzimanje i vraćanje vozila prolaze kroz isti tok: stanje goriva, kilometraža, bilješka o oštećenju i potpis. Sve ostaje uz rezervaciju, pa naknadnih rasprava nema." },
      { k: "fleet", t: "Pregled flote uživo", d: "Vlasnik u jednom pogledu vidi koje je vozilo na terenu, koje se vraća danas i koje kasni. Kašnjenja se boje, pa se primijete bez traženja." },
      { k: "pdf", t: "Ugovori se pišu sami", d: "Iz potvrđene rezervacije nastaje gotov ugovor s podacima gosta, vozila i termina. Bez prekucavanja i bez grešaka u imenima." },
      { k: "lang", t: "Dvojezično od prvog dana", d: "Domaći i strani gosti čitaju istu ponudu na svom jeziku." },
      { k: "speed", t: "Brzina kao funkcija", d: "Stranica se otvara ispod tri sekunde na mobilnoj mreži, jer gost koji čeka odlazi kod konkurencije." },
      { k: "secure", t: "Provjere na serveru", d: "Ista pravila važe u pregledniku i na serveru, pa se dupla rezervacija ne može provući ni zaobilaznim putem." },
    ],
    ctaContact: "Zakažite poziv",
    watch: "Pogledajte sistem u pokretu",
    watchMeta: "1 min",
    close: "Zatvori",
  },
  en: {
    eyebrow: "Case study · Car rental",
    h1a: "Maximum SaaS,",
    h1b: "digital transformation of a car rental company",
    sub: "A car rental company from Mostar that ran bookings through chat messages and a notebook now has a system that runs itself. The guest picks a vehicle and dates, the system checks availability, the owner confirms in one click.",
    meta: ["Next.js and TypeScript", "Bilingual, HR and EN", "Live since 2026"],
    visit: "Open the site",
    premiumTag: "Premium package",
    stats: [
      { n: 100, dec: 0, suf: "", l: "Google performance score" },
      { n: 3.2, dec: 1, suf: " s", l: "mobile load time, was 21.6 s" },
      { n: 0, dec: 0, suf: "", l: "double bookings since launch" },
      { n: 2, dec: 0, suf: "", l: "languages for local and foreign guests" },
    ],
    compare: {
      label: "Before and after",
      h1: "The same company,",
      h2: "two very different websites",
      sub: "On the left, the website Maximum used before. On the right, the one running today. Click an image to enlarge.",
      beforeTag: "Before",
      afterTag: "After",
      beforeTitle: "The old website",
      afterTitle: "The new system",
      beforeNote: "The form only sent a request, availability was checked by hand.",
      afterNote: "The guest sees free vehicles, picks dates and gets a confirmation.",
      beforeSpeed: "21.6 s",
      afterSpeed: "3.2 s",
      speedLabel: "mobile load time",
      hint: "Click to enlarge",
      phoneLabel: "The same site on a phone",
      phoneNote: "More than half of the guests arrive on a phone, so the difference matters most here.",
      phoneBefore: "The form filled the whole screen, content started below it.",
      phoneAfter: "The offer, rating and booking are right on the first screen.",
    },
    admin: {
      label: "Admin panel",
      h1: "A panel the owner",
      h2: "keeps in hand",
      sub: "This did not exist before. Bookings were tracked by hand, and now everything sits in one place, the same on a computer and on a phone.",
      dark: "Dark theme",
      light: "Light theme",
      deskCap: "On a computer · all pending bookings at a glance",
      mobCap: "On a phone · confirm while standing by the car",
      note: "The data shown are test entries, not real guests.",
      hint: "Click to enlarge",
    },
    bentoLabel: "System modules",
    bentoH1: "What the",
    bentoH2: "system does",
    ctaH: "Running a car rental company?",
    ctaSub: "We adapt the same system to your fleet. Pricing and packages are on one page.",
    ctaBtn: "See the system and pricing",
    imgAlt: "Maximum Rent a Car home page",
    modules: [
      { k: "checkin", t: "Smart check in and check out", d: "Pickup and return follow the same flow: fuel level, mileage, damage note and signature. It all stays attached to the booking, so there are no arguments later." },
      { k: "fleet", t: "Live fleet overview", d: "The owner sees at a glance which car is out, which returns today and which is running late. Delays are colour coded, so nothing has to be searched for." },
      { k: "pdf", t: "Contracts write themselves", d: "A confirmed booking turns into a finished contract with guest, vehicle and date details. No retyping and no misspelled names." },
      { k: "lang", t: "Bilingual from day one", d: "Local and foreign guests read the same offer in their own language." },
      { k: "speed", t: "Speed as a feature", d: "The page opens in under three seconds on mobile data, because a guest who waits goes to a competitor." },
      { k: "secure", t: "Server-side checks", d: "The same rules apply in the browser and on the server, so a double booking cannot slip through a back door either." },
    ],
    ctaContact: "Book a call",
    watch: "Watch the system in action",
    watchMeta: "1 min",
    close: "Close",
  },
} as const;

const SITE = "https://maximum-rent.vercel.app";
const IMG = {
  hero: "/portfolio/maximum-poslije.webp",
  heroMob: "/portfolio/maximum-hero-mob.webp",
  before: "/portfolio/maximum-prije.webp",
  after: "/portfolio/maximum-poslije.webp",
  beforeMob: "/portfolio/maximum-prije-mob.webp",
  afterMob: "/portfolio/maximum-poslije-mob.webp",
  admin: { light: "/portfolio/maximum-admin-desktop-svijetla.webp", dark: "/portfolio/maximum-admin-desktop-tamna.webp" },
  adminMob: { light: "/portfolio/maximum-admin-mob-svijetla.webp", dark: "/portfolio/maximum-admin-mob-tamna.webp" },
};
const MODULE_ICONS: Record<string, LucideIcon> = { checkin: ClipboardCheck, fleet: CarFront, pdf: FileText, lang: Languages, speed: Gauge, secure: ShieldCheck };

type Copy = (typeof T)["bs"] | (typeof T)["en"];
type Zoom = (z: ZoomState) => void;

const fmt = (n: number, dec: number, lang: string) => n.toFixed(dec).replace(".", lang === "en" ? "." : ",");

function Shot({ src, alt, url, onZoom, ratio = "aspect-[16/10]" }: { src: string; alt: string; url?: string; onZoom: Zoom; ratio?: string }) {
  return (
    <button type="button" onPointerEnter={() => preloadImage(src)} onClick={() => onZoom({ src, alt })} aria-label={alt} className="block w-full cursor-zoom-in text-left">
      <BrowserFrame url={url}>
        <span className={`relative block ${ratio}`}>
          <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 1100px" quality={85} className="object-cover object-top" />
        </span>
      </BrowserFrame>
    </button>
  );
}

function PhoneShot({ src, alt, bar, onZoom, className = "w-full" }: { src: string; alt: string; bar?: "light" | "dark"; onZoom: Zoom; className?: string }) {
  return (
    <button type="button" onPointerEnter={() => preloadImage(src)} onClick={() => onZoom({ src, alt, phone: true })} aria-label={alt} className={`block cursor-zoom-in ${className}`}>
      <PhoneMockup src={src} alt={alt} bar={bar} />
    </button>
  );
}

function Hero({ d, lang, onZoom }: { d: Copy; lang: string; onZoom: Zoom }) {
  return (
    <section className="hero-light relative bg-white">
      <Backdrop>
        <div className="mx-auto max-w-5xl px-6 pt-36 sm:pt-40 text-center">
          <Fade className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12.5px] font-medium text-[#0F172A]">{d.eyebrow}</span>
            <a href="/rjesenja/rent-a-car#paketi" className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12.5px] font-medium text-[#0F172A] hover:bg-[#F9FAFB]">
              <Star size={12} className="fill-[#16A34A] text-[#16A34A]" /> {d.premiumTag} <ArrowUpRight size={12} />
            </a>
          </Fade>
          <Fade delay={0.05}>
            <h1 className="mt-7 text-[38px] leading-[1.08] sm:text-6xl font-semibold tracking-[-0.035em] text-[#0F172A]" style={{ textWrap: "balance" }}>
              {d.h1a} <span className="block text-[#0F3554]">{d.h1b}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[#475569]">{d.sub}</p>
            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-[#64748B]">
              {d.meta.map((m, i) => <span key={m} className="flex items-center gap-3">{i > 0 && <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />}{m}</span>)}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={SITE} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1E293B]">
                {d.visit} <ArrowUpRight size={16} />
              </a>
              <a href="/rjesenja/rent-a-car#paketi"
                 className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F9FAFB]">
                {d.ctaBtn} <ArrowRight size={16} />
              </a>
            </div>
            <a href="/rjesenja/rent-a-car#kako-radi" className="group mt-6 inline-flex items-center gap-2.5 text-[14px] font-medium text-[#475569] transition-colors hover:text-[#0F172A]">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-[#CBD5E1] bg-white text-[#0F172A] transition-colors group-hover:border-[#0F172A]">
                <Play size={11} fill="currentColor" className="ml-[1px]" />
              </span>
              <span className="underline decoration-[#CBD5E1] underline-offset-4 group-hover:decoration-[#0F172A]">{d.watch}</span>
              <span className="text-[#94A3B8]">· {d.watchMeta}</span>
            </a>
          </Fade>
        </div>

        <Fade delay={0.12} className="relative mx-auto mt-14 max-w-5xl px-6 pb-10">
          <div className="relative pr-[9%] sm:pr-[12%]">
            <Shot src={IMG.hero} alt={d.imgAlt} url="maximum-rent.vercel.app" onZoom={onZoom} />
            <PhoneShot src={IMG.heroMob} alt={d.imgAlt} bar="dark" onZoom={onZoom} className="absolute -bottom-6 right-0 w-[24%] sm:w-[21%]" />
          </div>
        </Fade>
      </Backdrop>

      <div className="mx-auto max-w-5xl px-6 pt-10">
        <dl className="grid grid-cols-2 overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white lg:grid-cols-4" style={{ boxShadow: SOFT }}>
          {d.stats.map((s, i) => (
            <div key={s.l} className={`p-5 sm:p-6 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""} border-[#F1F5F9]`}>
              <dd className="text-[28px] leading-none font-semibold tracking-tight text-[#0F172A] tabular-nums">{fmt(s.n, s.dec, lang)}{s.suf}</dd>
              <dt className="mt-2 text-[13px] leading-snug text-[#64748B]">{s.l}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Compare({ d, onZoom }: { d: Copy; onZoom: Zoom }) {
  const c = d.compare;
  const cols = [
    { tag: c.beforeTag, title: c.beforeTitle, note: c.beforeNote, speed: c.beforeSpeed, src: IMG.before, mob: IMG.beforeMob, phone: c.phoneBefore, after: false },
    { tag: c.afterTag, title: c.afterTitle, note: c.afterNote, speed: c.afterSpeed, src: IMG.after, mob: IMG.afterMob, phone: c.phoneAfter, after: true },
  ];
  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Head label={c.label} h={c.h1} accent={c.h2} sub={c.sub} />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {cols.map((x) => (
            <Fade key={x.tag} className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${x.after ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F1F5F9] text-[#475569]"}`}>{x.tag}</span>
                  <span className="text-[15px] font-semibold text-[#0F172A]">{x.title}</span>
                </span>
                <span className="text-right">
                  <span className={`block text-[18px] font-semibold tabular-nums ${x.after ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>{x.speed}</span>
                  <span className="block text-[11px] text-[#64748B]">{c.speedLabel}</span>
                </span>
              </div>
              <div className="mt-5"><Shot src={x.src} alt={`${x.tag} · ${x.title}`} onZoom={onZoom} /></div>
              <p className="mt-4 text-[14px] leading-relaxed text-[#475569]">{x.note}</p>
            </Fade>
          ))}
        </div>

        <Fade className="mt-6 rounded-[20px] border border-[#E5E7EB] bg-[#F8FAFC] p-6 sm:p-9">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[16px] font-semibold text-[#0F172A]">{c.phoneLabel}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#64748B]">{c.phoneNote}</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:gap-12 mx-auto max-w-lg">
            {cols.map((x) => (
              <div key={x.tag} className="text-center">
                <PhoneShot src={x.mob} alt={`${x.tag} · ${c.phoneLabel}`} onZoom={onZoom} className="mx-auto w-full max-w-[200px]" />
                <span className={`mt-4 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${x.after ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#E2E8F0] text-[#475569]"}`}>{x.tag}</span>
                <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">{x.phone}</p>
              </div>
            ))}
          </div>
        </Fade>
      </div>
    </section>
  );
}

function Admin({ d, onZoom }: { d: Copy; onZoom: Zoom }) {
  const a = d.admin;
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const opts = [
    { v: "light" as const, l: a.light, I: Sun },
    { v: "dark" as const, l: a.dark, I: Moon },
  ];
  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Head label={a.label} h={a.h1} accent={a.h2} sub={a.sub} />
        <div className="mt-8 flex justify-center">
          <div role="tablist" className="inline-flex rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-1">
            {opts.map(({ v, l, I }) => (
              <button key={v} role="tab" aria-selected={theme === v} onClick={() => setTheme(v)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${theme === v ? "bg-[#0F172A] text-white" : "text-[#475569] hover:text-[#0F172A]"}`}>
                <I size={14} /> {l}
              </button>
            ))}
          </div>
        </div>
        <Fade className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <figure>
            <Shot src={IMG.admin[theme]} alt={a.deskCap} url="maximum-rent.vercel.app/admin" onZoom={onZoom} />
            <figcaption className="mt-3 text-[13px] text-[#64748B]">{a.deskCap}</figcaption>
          </figure>
          <figure className="mx-auto w-[210px]">
            <PhoneShot src={IMG.adminMob[theme]} alt={a.mobCap} bar={theme} onZoom={onZoom} />
            <figcaption className="mt-3 text-center text-[13px] text-[#64748B]">{a.mobCap}</figcaption>
          </figure>
        </Fade>
        <p className="mt-8 text-center text-[12.5px] text-[#94A3B8]">{a.note}</p>
      </div>
    </section>
  );
}

function Modules({ d }: { d: Copy }) {
  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Head label={d.bentoLabel} h={d.bentoH1} accent={d.bentoH2} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {d.modules.map((m, i) => {
            const Icon = MODULE_ICONS[m.k];
            const tone = i === 0 ? "navy" : i === d.modules.length - 1 ? "ocean" : "plain";
            const dark = tone !== "plain";
            return (
              <li key={m.k}
                  className={`rounded-[20px] p-6 sm:p-7 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 ${
                    tone === "navy" ? "bg-[#0F172A]" : tone === "ocean" ? "bg-[#0F3554]" : "border border-[#E5E7EB] bg-white hover:border-[#CBD5E1]"}`}
                  style={dark ? { boxShadow: "0 1px 2px rgba(15,23,42,0.06), 0 24px 48px -28px rgba(15,23,42,0.5)" } : undefined}>
                <div className="flex items-center justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${dark ? "bg-white/10 text-[#4ADE80]" : "bg-[#EEF3F8] text-[#0F3554]"}`}><Icon size={20} /></span>
                  <span className={`text-[12px] font-semibold tabular-nums ${dark ? "text-white/40" : "text-[#CBD5E1]"}`}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className={`mt-5 text-[16px] font-semibold ${dark ? "text-white" : "text-[#0F172A]"}`}>{m.t}</p>
                <p className={`mt-2 text-[14px] leading-relaxed ${dark ? "text-[#CBD5E1]" : "text-[#64748B]"}`}>{m.d}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Cta({ d }: { d: Copy }) {
  return (
    <section className="relative bg-white">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <Fade className="flex flex-col gap-6 rounded-[24px] bg-[#0F172A] px-7 py-9 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[24px] font-semibold tracking-tight text-white">{d.ctaH}</p>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#94A3B8]">{d.ctaSub}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#zakazi" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
              {d.ctaContact} <ArrowRight size={15} />
            </a>
            <a href="/rjesenja/rent-a-car#paketi" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]">
              {d.ctaBtn} <ArrowRight size={15} />
            </a>
          </div>
        </Fade>
      </div>
    </section>
  );
}

export function MaximumCaseStudy() {
  const { lang } = useLanguage();
  const d: Copy = T[(lang as "bs" | "en")] ?? T.bs;
  const [zoom, setZoom] = useState<ZoomState>(null);
  return (
    <main className="relative bg-white">
      <Hero d={d} lang={lang} onZoom={setZoom} />
      <Compare d={d} onZoom={setZoom} />
      <Admin d={d} onZoom={setZoom} />
      <Modules d={d} />
      <Cta d={d} />
      <Booking />
      <Lightbox zoom={zoom} onClose={() => setZoom(null)} closeLabel={d.close} />
    </main>
  );
}
