"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { animate, motion, AnimatePresence, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowRight, Car, CircleCheck, Handshake, Clock, Globe, LayoutDashboard, ShieldCheck, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Kind = "web" | "app" | "rc";
type L = "bs" | "en";
type Tier = { name: string; for: string; tag: string; price: number; old?: number; featured?: boolean; base?: string; time: string; items: string[] };
type Copy = {
  eyebrow: string; h: string; sub: string; s1: string; s2: string; s2rc: string; s3: string; calc: string;
  valueLabel: (u: string) => string; extraLabel: string; pkg: string; more: string; back: string; day: string; days: string;
  yearA: string; yearB: string; your: string; introPrice: string; startPrice: string; once: string; start: string; end: string;
  daily: string; ready: string; gets: string; roiA: string; roiB: string; popular: string; cta: string; ctaInq: string; foot: string;
  howT: string; how: { t: string; d: string }[];
  always: string[]; kinds: Record<Kind, { label: string; sub: string; unit: string }>; tiers: Record<Kind, Tier[]>;
};

const RATE = 1.95583;
const ICON: Record<Kind, LucideIcon> = { web: Globe, app: LayoutDashboard, rc: Car };
const ROI: Record<Kind, { value: number; extra: number; max: number; vmax: number }> = {
  web: { value: 150, extra: 3, max: 20, vmax: 600 },
  app: { value: 60, extra: 12, max: 60, vmax: 300 },
  rc: { value: 180, extra: 6, max: 30, vmax: 600 },
};
const PRICES: Record<Kind, { price: number; old?: number }[]> = {
  web: [{ price: 690 }, { price: 990, old: 1290 }, { price: 1490 }],
  app: [{ price: 990 }, { price: 1790, old: 2290 }, { price: 2890 }],
  rc: [{ price: 1390 }, { price: 1990, old: 2490 }, { price: 2990, old: 3490 }],
};
const EASE = [0.22, 1, 0.36, 1] as const;

const withPrices = (k: Kind, t: Omit<Tier, "price" | "old">[]): Tier[] => t.map((x, i) => ({ ...x, ...PRICES[k][i], featured: i === 1 }));

const COPY: Record<L, Copy> = {
  bs: {
    eyebrow: "Cjenovnik", h: "Složite paket i odmah vidite cijenu.",
    sub: "Bez čekanja na ponudu. Cijena koju vidite je cijena koju plaćate, a na pozivu je samo potvrdimo.",
    s1: "Šta vam treba?", s2: "Koji obim vam treba?", s2rc: "Koliko vozila imate?", s3: "Kada vam se vrati uloženo?", calc: "kalkulator povrata",
    valueLabel: (u) => `Jedan ${u} donosi`, extraLabel: "Novih upita mjesečno",
    pkg: "paket", more: "Više mjesečno", back: "Vraća se za", day: "dan", days: "dana",
    yearA: "Više u prvoj godini", yearB: "Bez provizije po rezervaciji. Računica je okvirna i zavisi od vašeg posla.",
    your: "Vaš paket", introPrice: "uvodna cijena", startPrice: "početna cijena", once: "jednokratno", start: "Na početku", end: "Po predaji",
    daily: "dnevno u prvoj godini", ready: "gotovo za", gets: "Šta dobijate",
    roiA: "Po vašoj računici paket se vraća za", roiB: "", popular: "Najčešće", cta: "Zakažite besplatan poziv", ctaInq: "Zatražite ponudu za ovaj paket",
    foot: "0 KM mjesečno. Podrška samo ako je želite, 100 KM/mj.",
    howT: "Kako ide saradnja",
    how: [
      { t: "Besplatan poziv", d: "Pokažemo vam sistem uživo i potvrdimo cijenu." },
      { t: "50% i kreće izrada", d: "Dobijate link i pratite napredak svake sedmice." },
      { t: "Testirate, pa platite ostatak", d: "Ostatak plaćate tek kad ste zadovoljni." },
    ],
    always: ["Domena i podaci su vaši", "0 KM mjesečno, bez pretplate", "Plaćanje 50% na početku, 50% po predaji", "Bez provizije po rezervaciji"],
    kinds: {
      web: { label: "Sajt", sub: "prezentacija i upiti", unit: "posao" },
      app: { label: "Web aplikacija", sub: "rezervacije, termini, panel", unit: "termin" },
      rc: { label: "Rent a car sistem", sub: "po veličini flote", unit: "najam" },
    },
    tiers: {
      web: withPrices("web", [
        { name: "Vizitka", for: "Za obrte i male firme", tag: "Jedna stranica koja prodaje.", time: "7 do 10 dana",
          items: ["Jedna stranica sa svim bitnim informacijama", "Forma za upite, stiže vam na email", "Dugme za poziv i WhatsApp", "Google mapa i radno vrijeme", "Prilagođeno telefonu", "Domena i SSL podešeni"] },
        { name: "Sajt", for: "Za firme koje rastu", tag: "Pravi sajt firme sa svim uslugama.", time: "2 do 3 sedmice", base: "Sve iz Vizitke, plus:",
          items: ["Do 6 stranica (usluge, o nama, galerija, kontakt)", "Dva jezika po vašem izboru", "Sami mijenjate tekst i slike", "Google Business profil i osnovni SEO", "Brzina 90+ na Google mjerenju", "1 mjesec podrške gratis"] },
        { name: "Sajt Plus", for: "Za firme sa ponudom", tag: "Sajt s katalogom i blogom.", time: "3 do 4 sedmice", base: "Sve iz paketa Sajt, plus:",
          items: ["Neograničeno stranica", "Tri jezika po vašem izboru", "Katalog ili meni s cijenama", "Blog za bolju poziciju na Googleu", "Analitika posjeta", "2 mjeseca podrške gratis"] },
      ]),
      app: withPrices("app", [
        { name: "Starter", for: "Evidencija, katalog, upiti", tag: "Jedan alat koji rješava jedan problem.", time: "2 do 3 sedmice",
          items: ["Jedna glavna funkcija (katalog, evidencija ili upiti)", "Prijava lozinkom za vas i tim", "Panel za dodavanje i izmjenu podataka", "Forma preko koje klijenti šalju upite", "Prilagođeno telefonu i računaru"] },
        { name: "Business", for: "Sve što se iznajmljuje ili zakazuje", tag: "Rezervacije i termini bez telefoniranja.", time: "3 do 5 sedmica", base: "Sve iz Startera, plus:",
          items: ["Kalendar zauzetosti, bez duplih termina", "Gost bira termin, vi potvrđujete jednim klikom", "Admin panel s ulogama za vlasnika i osoblje", "Email i WhatsApp obavijest za svaku rezervaciju", "Do 4 jezika po vašem izboru", "SEO i Google vidljivost", "2 mjeseca podrške gratis"] },
        { name: "Premium", for: "Online plaćanje i automatizacije", tag: "Aplikacija tačno oko vašeg procesa.", time: "5 do 8 sedmica", base: "Sve iz Business paketa, plus:",
          items: ["Online plaćanje i depozit", "Povezivanje s Google Calendarom i drugim alatima", "Automatizacije rutinskih poslova", "Detaljne dozvole po članu tima", "Prioritetna podrška"] },
      ]),
      rc: withPrices("rc", [
        { name: "Start", for: "3 do 9 vozila", tag: "Katalog vozila i forma za rezervaciju.", time: "2 do 3 sedmice",
          items: ["Sajt s katalogom vozila i cijenama", "Forma za rezervaciju, upit stiže na email", "Dugme za poziv i WhatsApp", "Prilagođeno telefonu", "Izmjene vozila i cijena radimo mi, po satu"] },
        { name: "Pro", for: "10 do 20 vozila", tag: "Kompletan sistem kao kod Maximuma.", time: "3 do 4 sedmice", base: "Sve iz Start paketa, plus:",
          items: ["Admin panel: sami mijenjate vozila, cijene i slike", "Kalendar dostupnosti po vozilu", "Gost vidi samo slobodna vozila, nema duplih termina", "Potvrda rezervacije jednim klikom", "Obavijest za svaki novi upit", "Do 4 jezika po vašem izboru", "2 mjeseca podrške gratis"] },
        { name: "Premium", for: "20+ vozila, više lokacija", tag: "Više poslovnica, jedan sistem.", time: "4 do 6 sedmica", base: "Sve iz Pro paketa, plus:",
          items: ["Više poslovnica u jednom panelu", "Flota i preuzimanje po poslovnici", "Različito mjesto preuzimanja i vraćanja", "Pristup za osoblje po poslovnici", "Prioritetna podrška"] },
      ]),
    },
  },
  en: {
    eyebrow: "Pricing", h: "Build your package and see the price right away.",
    sub: "No waiting for a quote. The price you see is the price you pay, and we simply confirm it on a call.",
    s1: "What do you need?", s2: "What scope do you need?", s2rc: "How many vehicles do you have?", s3: "When does it pay for itself?", calc: "payback calculator",
    valueLabel: (u) => `One ${u} brings`, extraLabel: "New inquiries a month",
    pkg: "package", more: "More per month", back: "Pays back in", day: "day", days: "days",
    yearA: "Extra in the first year", yearB: "No fee per booking. An estimate that depends on your business.",
    your: "Your package", introPrice: "launch price", startPrice: "starting price", once: "one time", start: "Upfront", end: "On delivery",
    daily: "a day in the first year", ready: "ready in", gets: "What you get",
    roiA: "By your numbers the package pays back in", roiB: "", popular: "Most chosen", cta: "Book a free call", ctaInq: "Request an offer for this package",
    foot: "€0 per month. Support only if you want it, €50/mo.",
    howT: "How it works",
    how: [
      { t: "Free call", d: "We show you the system live and confirm the price." },
      { t: "50% and we start", d: "You get a link and follow progress every week." },
      { t: "You test, then pay the rest", d: "You pay the rest only when you're happy." },
    ],
    always: ["Your domain and your data", "€0 per month, no subscription", "50% upfront, 50% on delivery", "No fee per booking"],
    kinds: {
      web: { label: "Website", sub: "presentation and inquiries", unit: "new job" },
      app: { label: "Web app", sub: "bookings, slots, admin panel", unit: "booking" },
      rc: { label: "Car rental system", sub: "by fleet size", unit: "rental" },
    },
    tiers: {
      web: withPrices("web", [
        { name: "Card", for: "For trades and small firms", tag: "One page that sells.", time: "7 to 10 days",
          items: ["One page with everything that matters", "Inquiry form straight to your email", "Call and WhatsApp buttons", "Google map and opening hours", "Built for phones", "Domain and SSL set up"] },
        { name: "Website", for: "For growing firms", tag: "A proper company site with all services.", time: "2 to 3 weeks", base: "Everything in Card, plus:",
          items: ["Up to 6 pages (services, about, gallery, contact)", "Two languages of your choice", "You edit text and photos yourself", "Google Business profile and basic SEO", "90+ speed on Google's test", "1 month of free support"] },
        { name: "Website Plus", for: "For firms with a catalogue", tag: "A site with a catalogue and a blog.", time: "3 to 4 weeks", base: "Everything in Website, plus:",
          items: ["Unlimited pages", "Three languages of your choice", "Catalogue or menu with prices", "Blog for better Google ranking", "Visitor analytics", "2 months of free support"] },
      ]),
      app: withPrices("app", [
        { name: "Starter", for: "Records, catalogue, inquiries", tag: "One tool that solves one problem.", time: "2 to 3 weeks",
          items: ["One main feature (catalogue, records or inquiries)", "Password login for you and your team", "Panel to add and edit data", "Form for client inquiries", "Works on phone and desktop"] },
        { name: "Business", for: "Anything rented or booked", tag: "Bookings and slots without phone calls.", time: "3 to 5 weeks", base: "Everything in Starter, plus:",
          items: ["Availability calendar, no double slots", "Guest picks a slot, you confirm in one click", "Admin panel with owner and staff roles", "Email and WhatsApp alert for each booking", "Up to 4 languages of your choice", "SEO and Google visibility", "2 months of free support"] },
        { name: "Premium", for: "Online payments and automation", tag: "An app built exactly around your process.", time: "5 to 8 weeks", base: "Everything in Business, plus:",
          items: ["Online payment and deposit", "Google Calendar and other tool integrations", "Automation of routine work", "Detailed permissions per team member", "Priority support"] },
      ]),
      rc: withPrices("rc", [
        { name: "Start", for: "3 to 9 vehicles", tag: "Vehicle catalogue and booking form.", time: "2 to 3 weeks",
          items: ["Site with vehicle catalogue and prices", "Booking form, inquiries go to your email", "Call and WhatsApp buttons", "Built for phones", "We make vehicle and price changes, billed hourly"] },
        { name: "Pro", for: "10 to 20 vehicles", tag: "The full system, like Maximum's.", time: "3 to 4 weeks", base: "Everything in Start, plus:",
          items: ["Admin panel: edit vehicles, prices and photos yourself", "Availability calendar per vehicle", "Guests see only free vehicles, no double bookings", "Confirm a booking in one click", "Alert for every new inquiry", "Up to 4 languages of your choice", "2 months of free support"] },
        { name: "Premium", for: "20+ vehicles, several locations", tag: "Several branches, one system.", time: "4 to 6 weeks", base: "Everything in Pro, plus:",
          items: ["Several branches in one panel", "Fleet and pickup per branch", "Different pickup and return locations", "Staff access per branch", "Priority support"] },
      ]),
    },
  },
};

const toEur = (km: number) => Math.round(km / RATE / 5) * 5;
const money = (km: number, l: L) => (l === "en" ? `€${toEur(km).toLocaleString("en-US")}` : `${km.toLocaleString("de-DE")} KM`);
const altMoney = (km: number, l: L) => (l === "en" ? `about ${km.toLocaleString("en-US")} KM` : `oko €${toEur(km).toLocaleString("de-DE")}`);
const perDay = (km: number, l: L) => (l === "en"
  ? `€${(km / RATE / 365).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  : `${(km / 365).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`);

const Ticker = memo(function Ticker({ value, lang, unit, className }: { value: number; lang: L; unit?: string; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => (unit ? `${Math.round(v)} ${unit}` : money(Math.round(v), lang)));
  useEffect(() => {
    if (reduce) { mv.set(value); return; }
    const c = animate(mv, value, { duration: 0.6, ease: EASE });
    return c.stop;
  }, [value, reduce, mv]);
  return <motion.span className={className}>{text}</motion.span>;
});

function Slider({ label, value, min, max, step, onChange, shown, lo, hi }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; shown: string; lo: string; hi: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block rounded-2xl border border-[#EEF2F6] bg-[#F8FAFC] px-4 pb-3 pt-4">
      <span className="flex items-center justify-between gap-3">
        <span className="truncate text-[13px] text-[#475569]">{label}</span>
        <span className="shrink-0 whitespace-nowrap text-[17px] font-semibold tabular-nums text-[#0F172A]">{shown}</span>
      </span>
      <span className="group relative mt-3 block h-6 touch-none">
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#E2E8F0]" />
        <span className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#0F172A]" style={{ width: `${pct}%` }} />
        <span className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0F172A] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.2)] transition-transform duration-150 group-active:scale-110 group-has-[:focus-visible]:ring-4 group-has-[:focus-visible]:ring-[#0F172A]/15"
              style={{ left: `${pct}%` }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} aria-label={label}
               className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </span>
      <span className="mt-1 flex justify-between text-[11px] tabular-nums text-[#94A3B8]"><span>{lo}</span><span>{hi}</span></span>
    </label>
  );
}

function Step({ n, title, right, children }: { n: string; title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] font-semibold text-[#0F172A]"><span className="mr-2 text-[#94A3B8]">{n}</span>{title}</p>
        {right}
      </div>
      {children}
    </div>
  );
}

export function PricingBuilder({ fixed, cta = "#zakazi", id = "cjenovnik", heading = true, embed = false }: { fixed?: Kind; cta?: string; id?: string; heading?: boolean; embed?: boolean }) {
  const { lang: raw } = useLanguage();
  const lang: L = raw === "en" ? "en" : "bs";
  const d = COPY[lang];
  const reduce = useReducedMotion() ?? false;
  const [kind, setKind] = useState<Kind>(fixed ?? "app");
  const [tier, setTier] = useState(1);
  const [value, setValue] = useState(ROI[fixed ?? "app"].value);
  const [extra, setExtra] = useState(ROI[fixed ?? "app"].extra);

  const Wrap = embed ? "div" : "section";
  const t = d.tiers[kind][tier];
  const r = ROI[kind];
  const monthly = value * extra;
  const days = Math.max(1, Math.ceil(t.price / (monthly / 30)));
  const year = Math.max(0, Math.round((monthly * 12 - t.price) / 10) * 10);
  const dayWord = days === 1 ? d.day : d.days;

  const pick = useCallback((k: Kind) => { setKind(k); setTier(1); setValue(ROI[k].value); setExtra(ROI[k].extra); }, []);
  const reveal = (i: number) => reduce ? {} : {
    initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" }, transition: { duration: 0.6, ease: EASE, delay: i * 0.08 },
  };
  const swap = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: reduce ? 0 : 0.28, ease: EASE } };

  return (
    <Wrap id={embed ? undefined : id} className={embed ? "relative" : "strip relative scroll-mt-24 bg-[#F8FAFC] py-20 sm:py-24"}>
      <div className={embed ? "" : "mx-auto max-w-6xl px-5 sm:px-6 lg:px-8"}>
        {heading && (
          <motion.div {...reveal(0)} className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{d.eyebrow}</p>
              <h2 className="mt-4 max-w-xl text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#0F172A] sm:text-[44px]" style={{ textWrap: "balance" }}>{d.h}</h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-[#475569]">{d.sub}</p>
          </motion.div>
        )}

        <div className={`${heading ? "mt-10 sm:mt-12" : ""} grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-stretch lg:gap-6`}>
          <div className="space-y-5 sm:space-y-6">
            {!fixed && (
              <motion.div {...reveal(1)}>
                <Step n="01" title={d.s1}>
                  <div role="radiogroup" aria-label={d.s1} className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                    {(Object.keys(d.kinds) as Kind[]).map((k) => {
                      const I = ICON[k]; const on = kind === k;
                      return (
                        <button key={k} type="button" role="radio" aria-checked={on} onClick={() => pick(k)}
                          className={`rounded-2xl border p-3 text-left transition-[border-color,box-shadow,transform] duration-200 active:scale-[0.98] sm:p-4 ${on ? "border-[#0F172A] shadow-[0_0_0_1px_#0F172A]" : "border-[#E2E8F0] hover:border-[#CBD5E1]"}`}>
                          <span className={`grid h-9 w-9 place-items-center rounded-xl transition-colors duration-200 ${on ? "bg-[#0F172A] text-white" : "bg-[#F1F5F9] text-[#0F172A]"}`}><I size={17} /></span>
                          <span className="mt-3 block text-[13px] font-semibold leading-tight text-[#0F172A] sm:text-[14.5px]">{d.kinds[k].label}</span>
                          <span className="hidden text-[12.5px] text-[#64748B] sm:block">{d.kinds[k].sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </Step>
              </motion.div>
            )}

            <motion.div {...reveal(2)}>
              <Step n={fixed ? "01" : "02"} title={kind === "rc" ? d.s2rc : d.s2}>
                <div role="radiogroup" aria-label={kind === "rc" ? d.s2rc : d.s2} className="mt-3 divide-y divide-[#F1F5F9]">
                  {d.tiers[kind].map((x, i) => {
                    const on = tier === i;
                    return (
                      <button key={kind + x.name} type="button" role="radio" aria-checked={on} onClick={() => setTier(i)}
                              className="group flex w-full items-center gap-3 py-3.5 text-left sm:gap-4">
                        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200 ${on ? "border-[#0F172A]" : "border-[#CBD5E1] group-hover:border-[#94A3B8]"}`}>
                          {on && <motion.span layoutId={`${id}-dot`} transition={{ type: "spring", stiffness: 500, damping: 32 }} className="h-2.5 w-2.5 rounded-full bg-[#0F172A]" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14.5px] font-semibold text-[#0F172A]">{x.name} <span className="font-normal text-[#64748B]">· {x.for}</span></span>
                          <span className="block text-[13px] text-[#64748B]">{x.tag}</span>
                        </span>
                        {x.featured && <span className="hidden rounded-full bg-[#16A34A]/10 px-2 py-0.5 text-[11px] font-semibold text-[#16A34A] sm:inline">{d.popular}</span>}
                        <span className="shrink-0 text-right">
                          <span className="block text-[15px] font-semibold tabular-nums text-[#0F172A]">{money(x.price, lang)}</span>
                          {x.old && <s className="block text-[11.5px] tabular-nums text-[#94A3B8]">{money(x.old, lang)}</s>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Step>
            </motion.div>

            <motion.div {...reveal(3)}>
              <Step n={fixed ? "02" : "03"} title={d.s3}
                    right={<span className="hidden items-center gap-1.5 text-[12px] font-medium text-[#16A34A] sm:flex"><TrendingUp size={14} />{d.calc}</span>}>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Slider label={d.valueLabel(d.kinds[kind].unit)} value={value} min={20} max={r.vmax} step={10} onChange={setValue}
                          shown={money(value, lang)} lo={money(20, lang)} hi={money(r.vmax, lang)} />
                  <Slider label={d.extraLabel} value={extra} min={1} max={r.max} step={1} onChange={setExtra}
                          shown={String(extra)} lo="1" hi={String(r.max)} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { l: `${t.name} ${d.pkg}`, v: <Ticker value={t.price} lang={lang} />, g: false },
                    { l: d.more, v: <Ticker value={monthly} lang={lang} />, g: false },
                    { l: d.back, v: <Ticker value={days} lang={lang} unit={dayWord} />, g: true },
                  ].map((x) => (
                    <div key={x.l} className={`flex h-[84px] flex-col justify-between rounded-2xl p-3 sm:h-[92px] sm:p-4 ${x.g ? "bg-[#16A34A] text-white" : "border border-[#EEF2F6] bg-[#F8FAFC] text-[#0F172A]"}`}>
                      <p className={`truncate text-[11px] sm:text-[12px] ${x.g ? "text-white/80" : "text-[#64748B]"}`}>{x.l}</p>
                      <span className="block whitespace-nowrap text-[15px] font-semibold tabular-nums sm:text-[19px]">{x.v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3.5 sm:flex-nowrap sm:px-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#16A34A] text-white"><TrendingUp size={18} /></span>
                  <span className="min-w-0 flex-1 basis-[calc(100%-56px)] sm:basis-auto">
                    <span className="block text-[13.5px] font-semibold text-[#0F172A]">{d.yearA}</span>
                    <span className="block text-[12px] leading-snug text-[#475569]">{d.yearB}</span>
                  </span>
                  <Ticker value={year} lang={lang} className="w-full shrink-0 whitespace-nowrap pl-14 text-[22px] font-semibold tabular-nums text-[#15803D] sm:w-auto sm:pl-0 sm:text-[24px]" />
                </div>
              </Step>
            </motion.div>
            {fixed && (
              <motion.div {...reveal(4)}>
                <Step n="03" title={d.howT} right={<Handshake size={16} className="text-[#64748B]" />}>
                  <ol className="relative mt-5 grid gap-4 sm:grid-cols-3">
                    <span aria-hidden className="absolute left-[15px] right-[15px] top-[15px] hidden h-px bg-[#E2E8F0] sm:block" />
                    {d.how.map((h, i) => (
                      <li key={h.t} className="relative flex gap-3 sm:block">
                        <span className={`relative grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[12.5px] font-semibold ${i === 2 ? "bg-[#16A34A] text-white" : "border border-[#E2E8F0] bg-white text-[#0F172A]"}`}>{i + 1}</span>
                        <span className="block sm:mt-3">
                          <span className="block text-[14px] font-semibold text-[#0F172A]">{h.t}</span>
                          <span className="mt-0.5 block text-[13px] leading-relaxed text-[#64748B]">{h.d}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </Step>
              </motion.div>
            )}
          </div>

          <motion.aside {...reveal(2)} className="flex flex-col">
            <div className="flex flex-1 flex-col overflow-hidden rounded-[28px] bg-[#0F172A] text-white shadow-[0_40px_80px_-40px_rgba(15,23,42,0.6)]">
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] text-[#94A3B8]">{d.your}</p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={kind + tier + lang} {...swap} className="truncate rounded-full bg-white/10 px-2.5 py-0.5 text-[12.5px] font-medium">{t.name} · {t.for}</motion.span>
                  </AnimatePresence>
                </div>
                <p className="mt-6 h-5 text-[13.5px] text-[#64748B]">
                  {t.old
                    ? <><s className="tabular-nums">{money(t.old, lang)}</s> <span className="ml-1 rounded-md bg-[#4ADE80]/15 px-1.5 py-0.5 text-[11.5px] font-semibold text-[#4ADE80]">{d.introPrice}</span></>
                    : d.startPrice}
                </p>
                <Ticker value={t.price} lang={lang} className="mt-2 block text-[46px] font-semibold leading-none tracking-[-0.035em] tabular-nums sm:text-[56px]" />
                <p className="mt-3 text-[13px] text-[#94A3B8]">{d.once} · {altMoney(t.price, lang)}</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-[11.5px] text-[#94A3B8]">{d.start}</p><Ticker value={Math.round(t.price / 2)} lang={lang} className="mt-1 block text-[17px] font-semibold tabular-nums" /></div>
                  <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-[11.5px] text-[#94A3B8]">{d.end}</p><Ticker value={Math.round(t.price / 2)} lang={lang} className="mt-1 block text-[17px] font-semibold tabular-nums" /></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#CBD5E1]">
                  <span className="flex items-center gap-2"><Zap size={14} className="text-[#FBBF24]" />{perDay(t.price, lang)} {d.daily}</span>
                  <span className="flex items-center gap-2"><Clock size={14} className="text-[#8FB3D9]" />{d.ready} {t.time}</span>
                </div>

                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8FB3D9]">{d.gets}</p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.ul key={kind + tier + lang} {...swap} className="mt-4 space-y-2.5">
                      {t.base && <li className="text-[13px] font-semibold text-white">{t.base}</li>}
                      {t.items.map((f, i) => (
                        <motion.li key={f} initial={reduce ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: reduce ? 0 : 0.04 * i, ease: EASE }}
                                   className="flex items-start gap-2.5 text-[13.5px] leading-snug text-[#E2E8F0]">
                          <CircleCheck size={16} className="mt-px shrink-0 text-[#4ADE80]" />{f}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </AnimatePresence>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#4ADE80]/25 bg-[#16A34A]/10 px-4 py-3">
                  <TrendingUp size={18} className="shrink-0 text-[#4ADE80]" />
                  <p className="text-[13px] text-[#D1FAE5]">{d.roiA} <span className="font-semibold tabular-nums text-white">{days} {dayWord}</span>.</p>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2.5 pt-6">
                  {d.always.map((a) => <p key={a} className="flex items-start gap-2 text-[12px] leading-snug text-[#94A3B8]"><ShieldCheck size={14} className="mt-px shrink-0 text-[#4ADE80]" />{a}</p>)}
                </div>
              </div>
              <a href={cta} className="group flex items-center justify-center gap-2 bg-[#DC2626] px-6 py-4 text-[15px] font-semibold transition-colors hover:bg-[#B91C1C]">
                {fixed ? d.ctaInq : d.cta} <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
            <p className="mt-4 text-center text-[12.5px] text-[#64748B]">{d.foot}</p>
          </motion.aside>
        </div>
      </div>
    </Wrap>
  );
}
