"use client";

import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, CircleCheck, Minus, Star, LayoutDashboard, Car, Crown, Rocket, TrendingUp,
  CalendarClock, Wrench, ShieldCheck, Gift, type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Swipe } from "@/components/ui/Swipe";

type AppPlan = { name: string; tag: string; price: string; alt?: string; kmNote?: string; oldPrice?: string; promoNote?: string; discountBadge?: string; ctaLabel?: string; monthly: string; from?: boolean; gift: string; features: string[] };
type MktPlan = { alt?: string; name: string; tag: string; price: string; note: string; features: string[] };
type PricingData = {
  eyebrow: string; heading: string; headingAccent: string; subtitle: string;
  tabApps: string; tabAppsSub: string; tabMkt: string; tabMktSub: string; tabGift: string; tabsLabel: string;
  buildLabel: string; once: string; monthlyLabel: string; monthlySub: string;
  afterHeading: string; afterSub: string;
  afterTitle: string; afterAccent: string; afterGift: string; freeTitle: string; freeSub: string; defaultTag: string;
  afterBoxes: { label: string; price: string; alt?: string; per: string; sub: string; free?: boolean }[];
  hostingNote: string;
  rcBanner: { eyebrow: string; title: string; desc: string; cta: string };
  perMonth: string; from: string; popular: string;
  giftPre: string; giftPost: string; cta: string; appNote: string; apps: AppPlan[];
  mktEyebrow: string; mktHeading: string; mktSubtitle: string; mktCta: string; mktNote: string; mkt: MktPlan[];
  shortSub: string; fullLink: string; compareOpen: string; compareClose: string; compareHead: string; rcLink: string; once2: string;
  compareApps: Row[]; compareMkt: Row[];
};
type Row = { l: string; v: (boolean | string)[] };

const PRICING: Record<"bs" | "en", PricingData> = {
  bs: {
    eyebrow: "CJENOVNIK",
    heading: "Jasne cijene,",
    headingAccent: "bez sitnih slova",
    tabApps: "Web aplikacije", tabAppsSub: "plaćate jednom", tabMkt: "Marketing", tabMktSub: "mjesečno", tabGift: "1. mjesec gratis", tabsLabel: "Vrsta usluge",
    subtitle:
      "Gradimo aplikaciju koja vodi vaš biznis, od rezervacija i evidencije klijenata do internog alata za vaš tim. Uz svaki paket dobijate i mjesec besplatnog marketing paketa Rast.",
    buildLabel: "Razvoj (jednokratno)",
    once: "jednokratno",
    monthlyLabel: "Hosting + podrška · opciono",
    monthlySub: "nije obavezno, samo ako želite našu podršku i održavanje",
    afterHeading: "Nakon isporuke",
    afterSub: "Sistem je vaš i radi sam. Podršku uzimate tek kad procijenite da vam treba, a otkazujete je kad god želite.",
    afterTitle: "Mjesečno održavanje",
    afterAccent: "nije obavezno",
    afterGift: "Uz Business paket prva 2 mjeseca podrške dobijate besplatno.",
    freeTitle: "Bez obavezne pretplate",
    freeSub: "Održavanje samo po želji",
    defaultTag: "Zadano",
    afterBoxes: [
      { label: "Bez održavanja", price: "0 KM", per: "/mj", sub: "Sistem radi sam i ne plaćate ništa mjesečno, dok vi ne odlučite drugačije.", free: true },
      { label: "Mjesečna podrška", price: "100 KM", alt: "oko €50", per: "/mj", sub: "do 4 sata mjesečno za izmjene, nadogradnje i pomoć · prioritetno javljanje" },
      { label: "Po potrebi", price: "50 KM", alt: "oko €25", per: "/h", sub: "plaćate samo kada nešto zatreba, po utrošenom vremenu" },
    ],
    hostingNote: "Hosting se plaća zasebno, po stvarnoj potrošnji, i kod većine sajtova je to vrlo mali iznos.",
    rcBanner: {
      eyebrow: "Za rent a car firme",
      title: "Imate rent a car firmu?",
      desc: "Napravili smo poseban paket sa svojim cijenama, prema veličini flote, i sve je objašnjeno na jednom mjestu.",
      cta: "Pogledajte rent a car sistem",
    },
    perMonth: "/mj",
    from: "od",
    popular: "Najpopularniji",
    giftPre: "Gratis marketing paket",
    giftPost: "za prvi mjesec",
    cta: "Zatraži ponudu",
    appNote:
      "Cijene su početne, a finalna ponuda ovisi o obimu i složenosti aplikacije. Uz svaku aplikaciju prvi mjesec marketinga je besplatan; nastavlja se samo uz vašu saglasnost.",
    apps: [
      {
        name: "Starter", tag: "Jedan alat koji rješava jedan problem, npr. evidencija ili jednostavan katalog.",
        price: "1.000 KM", alt: "oko €500", from: true, monthly: "50", gift: "Start",
        features: [
          "Jedna glavna funkcija (npr. katalog vozila ili evidencija klijenata)",
          "Vi i vaš tim se prijavljujete lozinkom",
          "Dodavanje, izmjena i brisanje podataka kroz jednostavan panel",
          "Forma preko koje vam klijenti šalju upite na email",
          "Radi savršeno na mobitelu i računaru",
          "Hosting, SSL i domena podešeni, ništa tehničko ne radite vi",
        ],
      },
      {
        name: "Business", tag: "Web aplikacija za rezervacije i termine. Gost bira datum i šalje upit, vi potvrđujete iz panela. Za sve što se iznajmljuje ili zakazuje.",
        price: "1.800 KM", alt: "oko €920", from: true, ctaLabel: "Zakažimo razgovor", monthly: "75", gift: "Rast",
        features: [
          "2 mjeseca besplatne podrške nakon isporuke, za sve nejasnoće i probleme",
          "SVE iz Startera, plus:",
          "Više povezanih dijelova (katalog, upiti i admin panel)",
          "Više uloga: vlasnik vidi sve, osoblje samo svoje",
          "Galerija slika s učitavanjem i pregledom",
          "Kalendar zauzetosti, pa se termini ne mogu preklopiti",
          "Obavijesti na email i WhatsApp kad stigne nova rezervacija",
          "Dvojezično (BS + EN) za domaće i strane klijente",
          "SEO + Google vidljivost",
        ],
      },
      {
        name: "Premium", tag: "Aplikacija bez ograničenja, kreirana tačno oko vašeg procesa.",
        price: "2.800 KM", alt: "oko €1.430", monthly: "100", from: true, gift: "Dominacija",
        features: [
          "SVE iz Business paketa, plus:",
          "Neograničeni dijelovi i funkcije po vašoj želji",
          "Online plaćanje i depozit",
          "Povezivanje s drugim alatima (Google Calendar, računovodstvo, API)",
          "Automatizacije: sistem sam radi rutinske poslove umjesto vas",
          "Detaljne dozvole po članu tima",
          "Prioritetna podrška i dedikovani developer",
        ],
      },
    ],
    shortSub: "Aplikaciju plaćate jednom i ona je vaša. Marketing mjesečno, samo dok vam koristi.",
    fullLink: "Uporedite pakete i održavanje",
    compareOpen: "Uporedite pakete",
    compareClose: "Sakrij poređenje",
    compareHead: "Šta dobijate",
    rcLink: "Primjer: rent a car sistem",
    once2: "jednokratno",
    compareApps: [
      { l: "Radi savršeno na telefonu i računaru", v: [true, true, true] },
      { l: "Sami mijenjate tekst, slike i cijene", v: [true, true, true] },
      { l: "Upiti klijenata stižu direktno vama", v: [true, true, true] },
      { l: "Bez mjesečne pretplate", v: [true, true, true] },
      { l: "Online rezervacije bez duplih termina", v: [false, true, true] },
      { l: "WhatsApp obavijest za svaku rezervaciju", v: [false, true, true] },
      { l: "Na dva jezika, za domaće i strane goste", v: [false, true, true] },
      { l: "Besplatna podrška nakon predaje", v: [false, "2 mjeseca", "2 mjeseca"] },
      { l: "Online plaćanje i depozit", v: [false, false, true] },
      { l: "Lični developer i prioritetna podrška", v: [false, false, true] },
    ],
    compareMkt: [
      { l: "Društvene mreže", v: ["1 mreža", "Instagram i Facebook", "Instagram i Facebook"] },
      { l: "Objava mjesečno", v: ["8", "16", "do 30"] },
      { l: "Stories i Reels", v: [false, true, true] },
      { l: "Reklame koje dovode upite", v: [false, "1 kampanja", "više kampanja"] },
      { l: "Plan objava za cijeli mjesec", v: [false, true, true] },
      { l: "Snimanje Reels videa", v: [false, false, true] },
      { l: "Odgovaramo na komentare i poruke", v: [false, false, true] },
      { l: "Mjesečni izvještaj", v: ["osnovni", "detaljan", "detaljan"] },
      { l: "Bez ugovorne obaveze", v: [true, true, true] },
    ],
    mktEyebrow: "Gratis prvi mjesec",
    mktHeading: "Marketing paketi",
    mktSubtitle: "Prvi mjesec je gratis uz svaku aplikaciju. Nakon toga nastavljate samo ako želite:",
    mktCta: "Više o paketu",
    mktNote:
      "Marketing paketi su opcionalni. Budžet za reklame, koji ide direktno Meti i Googleu, plaća se zasebno.",
    mkt: [
      {
        name: "Start", tag: "Osnovno prisustvo da vas ljudi nađu.", price: "60 KM", alt: "oko €30", note: "bez ugovorne obaveze",
        features: ["1 platforma (Instagram ili Facebook)", "8 objava mjesečno", "Postavka Google Business profila", "Osnovni mjesečni izvještaj"],
      },
      {
        name: "Rast", tag: "Aktivan rast i prve reklame koje donose upite.", price: "150 KM", alt: "oko €75", note: "budžet za reklame zaseban",
        features: ["2 platforme (Instagram + Facebook)", "16 objava + Stories / Reels", "1 aktivna reklamna kampanja", "Mjesečna content strategija", "Analytics + mjesečni izvještaj"],
      },
      {
        name: "Dominacija", tag: "Pun nastup: dominacija u vašem gradu.", price: "250 KM", alt: "oko €125", note: "budžet za reklame zaseban",
        features: ["SVE iz paketa Rast, plus:", "Pun content kalendar (do 30 objava)", "Više reklamnih kampanja (Meta + Google)", "Reels produkcija + community management", "Strateški pozivi + prioritetna podrška"],
      },
    ],
  },
  en: {
    eyebrow: "PRICING",
    heading: "Clear prices,",
    headingAccent: "no fine print",
    tabApps: "Web apps", tabAppsSub: "paid once", tabMkt: "Marketing", tabMktSub: "monthly", tabGift: "1st month free", tabsLabel: "Type of service",
    subtitle:
      "We build the app that runs your business, from bookings and client records to an internal tool for your team. Every package includes a free month of our Rast marketing package.",
    buildLabel: "Development, paid once",
    once: "paid once",
    monthlyLabel: "Hosting + support · optional",
    monthlySub: "not required, only if you want our support and maintenance",
    afterHeading: "After launch",
    afterSub: "The system is yours and runs on its own. You add support only when you feel you need it, and cancel it whenever you want.",
    afterTitle: "Monthly maintenance",
    afterAccent: "is optional",
    afterGift: "With the Business package, the first 2 months of support are free.",
    freeTitle: "No required monthly fee",
    freeSub: "Maintenance is up to you",
    defaultTag: "Default",
    afterBoxes: [
      { label: "No maintenance", price: "€0", per: "/mo", sub: "The system runs on its own and you pay nothing monthly, until you decide otherwise.", free: true },
      { label: "Monthly support", price: "€50", alt: "about 100 KM", per: "/mo", sub: "up to 4 hours a month for changes, upgrades and help · priority response" },
      { label: "As needed", price: "€25", alt: "about 50 KM", per: "/h", sub: "you pay only when you need something, for the time spent" },
    ],
    hostingNote: "Hosting is billed separately based on actual usage, and for most sites it is a very small amount.",
    rcBanner: {
      eyebrow: "For car rental companies",
      title: "Running a car rental company?",
      desc: "We built a dedicated package with its own pricing based on fleet size, explained on one page.",
      cta: "See the car rental system",
    },
    perMonth: "/mo",
    from: "from",
    popular: "Most popular",
    giftPre: "Free marketing package",
    giftPost: "for the first month",
    cta: "Request a quote",
    appNote:
      "Prices are starting points, and the final quote depends on the scope and complexity of the app. With every app the first month of marketing is free; it continues only with your consent.",
    apps: [
      {
        name: "Starter", tag: "One tool that solves one problem, e.g. records or a simple catalog.",
        price: "€500", alt: "about 1,000 KM", from: true, monthly: "50", gift: "Start",
        features: [
          "One main feature (e.g. vehicle catalog or client records)",
          "You and your team log in with a password",
          "Add, edit and delete data through a simple panel",
          "A form your clients use to send you inquiries by email",
          "Works perfectly on mobile and desktop",
          "Hosting, SSL and domain set up, no tech work for you",
        ],
      },
      {
        name: "Business", tag: "A web app for bookings and appointments. The guest picks a date and sends a request, you confirm it from the panel. For anything you rent out or schedule.",
        price: "€920", alt: "about 1,800 KM", from: true, ctaLabel: "Let\u0027s talk", monthly: "75", gift: "Growth",
        features: [
          "2 months of free support after launch, for any questions or issues",
          "EVERYTHING in Starter, plus:",
          "Multiple connected parts (catalog + inquiries + admin panel)",
          "Multiple roles: owner sees all, staff see their own",
          "Image gallery with upload and preview",
          "An availability calendar, so bookings cannot overlap",
          "Email and WhatsApp alerts on every new booking",
          "Bilingual (BS + EN) for local and foreign clients",
          "SEO + Google visibility",
        ],
      },
      {
        name: "Premium", tag: "An app without limits, built exactly around your process.",
        price: "€1,430", alt: "about 2,800 KM", monthly: "100", from: true, gift: "Domination",
        features: [
          "EVERYTHING in Business, plus:",
          "Unlimited parts and features to your spec",
          "Online payment and deposit",
          "Connections to other tools (Google Calendar, accounting, API)",
          "Automations: the system handles routine work for you",
          "Detailed permissions per team member",
          "Priority support and a dedicated developer",
        ],
      },
    ],
    shortSub: "You pay for the app once and it's yours. Marketing is monthly, only while it works for you.",
    fullLink: "Compare plans and maintenance",
    compareOpen: "Compare packages",
    compareClose: "Hide comparison",
    compareHead: "What you get",
    rcLink: "Example: car rental system",
    once2: "paid once",
    compareApps: [
      { l: "Works perfectly on phones and computers", v: [true, true, true] },
      { l: "You edit text, photos and prices yourself", v: [true, true, true] },
      { l: "Client inquiries come straight to you", v: [true, true, true] },
      { l: "No monthly subscription", v: [true, true, true] },
      { l: "Online bookings with no double booking", v: [false, true, true] },
      { l: "WhatsApp alert for every booking", v: [false, true, true] },
      { l: "Two languages, for local and foreign guests", v: [false, true, true] },
      { l: "Free support after handover", v: [false, "2 months", "2 months"] },
      { l: "Online payment and deposit", v: [false, false, true] },
      { l: "Personal developer and priority support", v: [false, false, true] },
    ],
    compareMkt: [
      { l: "Social networks", v: ["1 network", "Instagram and Facebook", "Instagram and Facebook"] },
      { l: "Posts per month", v: ["8", "16", "up to 30"] },
      { l: "Stories and Reels", v: [false, true, true] },
      { l: "Ads that bring inquiries", v: [false, "1 campaign", "multiple campaigns"] },
      { l: "A posting plan for the whole month", v: [false, true, true] },
      { l: "Reels video production", v: [false, false, true] },
      { l: "We reply to comments and messages", v: [false, false, true] },
      { l: "Monthly report", v: ["basic", "detailed", "detailed"] },
      { l: "No contract commitment", v: [true, true, true] },
    ],
    mktEyebrow: "Free first month",
    mktHeading: "Marketing packages",
    mktSubtitle: "The first month is free with every app. After that, you continue only if you want to:",
    mktCta: "Learn more",
    mktNote:
      "Marketing packages are optional. The budget that goes directly to Meta/Google for ads is paid separately.",
    mkt: [
      {
        name: "Start", tag: "Basic presence so people can find you.", price: "€30", alt: "about 60 KM", note: "no contract commitment",
        features: ["1 platform (Instagram or Facebook)", "8 posts per month", "Google Business profile setup", "Basic monthly report"],
      },
      {
        name: "Growth", tag: "Active growth and first ads that bring inquiries.", price: "€75", alt: "about 150 KM", note: "ad budget separate",
        features: ["2 platforms (Instagram + Facebook)", "16 posts + Stories / Reels", "1 active ad campaign", "Monthly content strategy", "Analytics + monthly report"],
      },
      {
        name: "Domination", tag: "Full presence: dominate your city.", price: "€125", alt: "about 250 KM", note: "ad budget separate",
        features: ["EVERYTHING in Growth, plus:", "Full content calendar (up to 30 posts)", "Multiple ad campaigns (Meta + Google)", "Reels production + community management", "Strategy calls + priority support"],
      },
    ],
  },
};

const APP_ICONS: LucideIcon[] = [LayoutDashboard, Car, Crown];
const MKT_ICONS: LucideIcon[] = [Rocket, TrendingUp, Star];
const isHeader = (f: string) => f.startsWith("SVE") || f.startsWith("EVERYTHING");

function Head({ eyebrow, h, accent, sub, dark = false }: { eyebrow: string; h: string; accent?: string; sub: string; dark?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={`text-[13px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#8FB3D9]" : "text-[#64748B]"}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-[32px] leading-[1.12] sm:text-[44px] font-semibold tracking-[-0.03em] ${dark ? "text-white" : "text-[#0F172A]"}`} style={{ textWrap: "balance" }}>
        {h}{accent && <> <span className={dark ? "text-[#8FB3D9]" : "text-[#0F3554]"}>{accent}</span></>}
      </h2>
      <p className={`mx-auto mt-5 max-w-xl text-[16px] leading-relaxed ${dark ? "text-[#94A3B8]" : "text-[#475569]"}`}>{sub}</p>
    </div>
  );
}

type CardPlan = { name: string; tag: string; price: string; alt?: string; per?: string; note: string; features: string[]; cta: string };

function PlanCard({ plan, icon: Icon, featured, d, link }: { plan: CardPlan; icon: LucideIcon; featured: boolean; d: PricingData; link?: boolean }) {
  return (
    <article
      className={`group relative flex flex-col rounded-[24px] border p-6 transition-[transform,border-color] duration-300 sm:p-7 lg:hover:-translate-y-1.5 ${featured ? "border-white/15" : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"}`}
      style={featured ? { background: "linear-gradient(165deg, #1D4E78 0%, #0F3554 60%, #0C2B45 100%)", boxShadow: "0 30px 60px -30px rgba(0,0,0,0.6)" } : undefined}
    >
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 place-items-center rounded-xl text-white ${featured ? "bg-white/15" : "bg-white/[0.06]"}`}><Icon size={17} /></span>
        <h3 className="text-[19px] font-semibold text-white">{plan.name}</h3>
        {featured && <span className="ml-auto rounded-md bg-[#DC2626] px-2 py-0.5 text-[11px] font-semibold text-white">{d.popular}</span>}
      </div>
      <p className={`mt-3 line-clamp-2 text-[14px] leading-relaxed ${featured ? "text-[#C7D7E8]" : "text-[#94A3B8]"}`}>{plan.tag}</p>
      <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[13px] text-[#94A3B8]">{d.from}</span>
        <span className="text-[40px] font-semibold leading-none tracking-tight text-white tabular-nums sm:text-[42px]">{plan.price}</span>
        {plan.per && <span className="text-[15px] text-[#94A3B8]">{plan.per}</span>}
      </p>
      <p className={`mt-2 text-[12.5px] ${featured ? "text-[#C7D7E8]" : "text-[#94A3B8]"}`}>{[plan.note, plan.alt].filter(Boolean).join(" · ")}</p>
      {link && (
        <a href="/rjesenja/rent-a-car" className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-white/20">
          <Car size={14} /> {d.rcLink} <ArrowUpRight size={13} />
        </a>
      )}
      <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
        {plan.features.filter((f) => !isHeader(f)).slice(0, 4).map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[14px] leading-snug text-[#E2E8F0]"><CircleCheck size={16} className="mt-0.5 shrink-0 text-[#4ADE80]" />{f}</li>
        ))}
      </ul>
      <a href="#zakazi"
         className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14px] font-semibold transition-colors ${featured ? "bg-[#DC2626] text-white hover:bg-[#B91C1C]" : "bg-white text-[#0F172A] hover:bg-[#E2E8F0]"}`}
         style={{ marginTop: 28 }}>
        {plan.cta} <ArrowRight size={15} />
      </a>
    </article>
  );
}

function Compare({ rows, names, head }: { rows: Row[]; names: string[]; head: string }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-[24px] border border-white/[0.08] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[560px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            <th className="px-5 py-4 font-semibold text-[#94A3B8]">{head}</th>
            {names.map((n, i) => <th key={n} className={`px-4 py-4 text-center font-semibold ${i === 1 ? "bg-white/[0.04] text-white" : "text-[#CBD5E1]"}`}>{n}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.l} className="border-b border-white/[0.06] last:border-0">
              <td className="px-5 py-3.5 text-[#E2E8F0]">{r.l}</td>
              {r.v.map((v, i) => (
                <td key={i} className={`px-4 py-3.5 text-center ${i === 1 ? "bg-white/[0.04]" : ""}`}>
                  {v === true ? <Check size={17} strokeWidth={2.5} className="mx-auto text-[#4ADE80]" />
                    : v === false ? <Minus size={16} className="mx-auto text-[#334155]" />
                    : <span className="text-[13px] font-medium text-white">{v}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompareBlock({ open, setOpen, d, rows, names, reduce }: { open: boolean; setOpen: (v: boolean) => void; d: PricingData; rows: Row[]; names: string[]; reduce: boolean }) {
  return (
    <>
      <div className="mt-8 flex justify-center">
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.04]">
          {open ? d.compareClose : d.compareOpen} <ChevronDown size={16} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="cmp" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <Compare rows={rows} names={names} head={d.compareHead} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Pricing({ full = false, bare = false }: { full?: boolean; bare?: boolean }) {
  const { lang } = useLanguage();
  const d = PRICING[(lang as "bs" | "en")] ?? PRICING.bs;
  const reduce = useReducedMotion() ?? false;
  const [tab, setTab] = useState<"apps" | "mkt">("apps");
  const [open, setOpen] = useState(false);
  const AFTER_ICONS: LucideIcon[] = [ShieldCheck, CalendarClock, Wrench];
  const tabs = [
    { id: "apps" as const, label: d.tabApps, sub: d.tabAppsSub },
    { id: "mkt" as const, label: d.tabMkt, sub: d.tabMktSub, gift: d.tabGift },
  ];
  const swap = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <section id="cjenovnik" data-dark className="relative scroll-mt-24 overflow-hidden"
             style={{ background: "linear-gradient(180deg, #0B1324 0%, #0F172A 50%, #0B1324 100%)" }}>
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        {!bare && <Head dark eyebrow={d.eyebrow} h={d.heading} accent={d.headingAccent} sub={d.shortSub} />}

        <div className={`${bare ? "" : "mt-10 "}flex justify-center`}>
          <div role="tablist" aria-label={d.tabsLabel} className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5">
            {tabs.map((t) => {
              const on = tab === t.id;
              return (
                <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => { setTab(t.id); setOpen(false); }}
                        className="relative min-w-[150px] rounded-xl px-5 py-2.5 text-center sm:min-w-[190px]">
                  {on && (
                    <motion.span layoutId="price-tab" className="absolute inset-0 rounded-xl bg-white"
                                 transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }} />
                  )}
                  <span className={`relative block text-[14.5px] font-semibold transition-colors ${on ? "text-[#0F172A]" : "text-white"}`}>{t.label}</span>
                  <span className={`relative block text-[12px] transition-colors ${on ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
                    {t.sub}
                    {t.gift && <span className={`font-semibold ${on ? "text-[#15803D]" : "text-[#4ADE80]"}`}> · {t.gift}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {tab === "apps" ? (
            <motion.div key="apps" {...swap}>
              <div className="mt-12">
                <Swipe bp="lg" dark grid="lg:grid-cols-3 lg:items-stretch lg:gap-5" item="w-[86%] sm:w-[58%]">
                  {d.apps.map((plan, i) => (
                    <PlanCard key={plan.name} icon={APP_ICONS[i]} featured={i === 1} d={d} link={i === 1}
                      plan={{ name: plan.name, tag: plan.tag, price: plan.price, alt: plan.alt, note: d.once2, features: plan.features, cta: plan.ctaLabel ?? d.cta }} />
                  ))}
                </Swipe>
              </div>
              {full && <CompareBlock open={open} setOpen={setOpen} d={d} rows={d.compareApps} names={d.apps.map((x) => x.name)} reduce={reduce} />}
              <p className="mx-auto mt-6 max-w-2xl text-center text-[13px] leading-relaxed text-[#94A3B8]">{d.appNote}</p>

              {full && (
              <div id="odrzavanje" className="mx-auto mt-16 max-w-5xl scroll-mt-24">
                <p className="text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8FB3D9]">{d.afterHeading}</p>
                <h3 className="mt-3 text-center text-[26px] font-semibold tracking-[-0.02em] text-white sm:text-[32px]">
                  {d.afterTitle} <span className="text-[#4ADE80]">{d.afterAccent}</span>
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-center text-[14.5px] leading-relaxed text-[#94A3B8]">{d.afterSub}</p>
                <div className="mt-8">
                <Swipe bp="md" dark grid="md:grid-cols-3 md:gap-4" item="w-[82%] sm:w-[60%]">
                  {d.afterBoxes.map((b, i) => {
                    const Icon = AFTER_ICONS[i];
                    return (
                      <div key={b.label}
                           className={`relative flex h-full flex-col rounded-[20px] border p-6 transition-transform duration-300 md:hover:-translate-y-1 ${b.free ? "border-[#4ADE80]/40 bg-[#16A34A]/[0.10]" : "border-white/[0.08] bg-white/[0.03]"}`}>
                        {b.free && <span className="absolute right-4 top-4 rounded-full bg-[#16A34A] px-2.5 py-0.5 text-[11px] font-semibold text-white">{d.defaultTag}</span>}
                        <span className={`grid h-10 w-10 place-items-center rounded-xl ${b.free ? "bg-[#16A34A] text-white" : "bg-white/[0.06] text-white"}`}><Icon size={18} /></span>
                        <p className="mt-4 text-[14px] font-semibold text-white">{b.label}</p>
                        <p className="mt-1 flex items-baseline gap-1.5">
                          <span className={`text-[28px] font-semibold tracking-tight tabular-nums ${b.free ? "text-[#4ADE80]" : "text-white"}`}>{b.price}</span>
                          <span className="text-[13px] text-[#94A3B8]">{b.per}</span>
                          {b.alt && <span className="text-[12px] text-[#64748B]">· {b.alt}</span>}
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-[#94A3B8]">{b.sub}</p>
                      </div>
                    );
                  })}
                </Swipe>
                </div>
                <p className="mt-5 text-center text-[13px] text-[#CBD5E1]"><Gift size={14} className="mr-1.5 inline -translate-y-px text-[#4ADE80]" />{d.afterGift}</p>
                <p className="mt-2 text-center text-[12.5px] text-[#64748B]">{d.hostingNote}</p>
              </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="mkt" {...swap}>
              <div className="mt-12">
                <Swipe bp="lg" dark grid="lg:grid-cols-3 lg:items-stretch lg:gap-5" item="w-[86%] sm:w-[58%]">
                  {d.mkt.map((plan, i) => (
                    <PlanCard key={plan.name} icon={MKT_ICONS[i]} featured={i === 1} d={d}
                      plan={{ name: plan.name, tag: plan.tag, price: plan.price, alt: plan.alt, per: d.perMonth, note: plan.note, features: plan.features, cta: d.mktCta }} />
                  ))}
                </Swipe>
              </div>
              {full && <CompareBlock open={open} setOpen={setOpen} d={d} rows={d.compareMkt} names={d.mkt.map((x) => x.name)} reduce={reduce} />}
              <p className="mx-auto mt-6 max-w-2xl text-center text-[13px] leading-relaxed text-[#94A3B8]">{d.mktNote}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!full && (
          <div className="mt-10 flex justify-center">
            <a href="/cjenovnik" className="group inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.04]">
              {d.fullLink} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        )}

        {full && (
        <a href="/rjesenja/rent-a-car"
           className="group mx-auto mt-12 flex max-w-3xl flex-col gap-5 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-6 transition-colors hover:border-white/20 sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#0F3554] text-white"><Car size={22} /></span>
          <span className="flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8FB3D9]">{d.rcBanner.eyebrow}</span>
            <span className="mt-1 block text-[17px] font-semibold text-white">{d.rcBanner.title}</span>
            <span className="mt-1 block text-[13.5px] leading-relaxed text-[#94A3B8]">{d.rcBanner.desc}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-[#0F172A] transition-colors group-hover:bg-[#E2E8F0]">
            {d.rcBanner.cta} <ArrowRight size={15} />
          </span>
        </a>
        )}
      </div>
    </section>
  );
}
