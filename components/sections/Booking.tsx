"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, Loader2, Video } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { waLink } from "@/lib/contact";
import { toE164 } from "@/lib/phone";
import { PhoneInput } from "@/components/ui/PhoneInput";

type Lang = "bs" | "en";

const T = {
  bs: {
    eyebrow: "Besplatne konsultacije",
    h: "Zakažite poziv",
    sub: "Izaberite dan i vrijeme. Za 30 minuta dobijete okvirnu cijenu i rok, bez obaveze.",
    role: "Osnivač, mehiccdev",
    title: "Upoznavanje i plan projekta",
    meta: ["30 minuta", "Google Meet ili telefon", "Pon, sri, pet i sub, 11 do 15h"],
    thisWeek: "Ova sedmica",
    nextWeek: "Sljedeća sedmica",
    s1: "Izaberite dan",
    s2: "Izaberite vrijeme",
    s3: "Vaši podaci",
    months: ["januar", "februar", "mart", "april", "maj", "juni", "juli", "august", "septembar", "oktobar", "novembar", "decembar"],
    days: ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"],
    dayLong: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"],
    tz: "Vrijeme: Sarajevo (CET)",
    taken: "Zauzeto",
    legend: ["Slobodno", "Još malo termina", "Popunjeno"],
    pick: "Izaberite vrijeme",
    cont: "Nastavi sa",
    at: "u",
    dur: "30 minuta",
    name: "Ime i prezime",
    email: "Email",
    note: "Kratko o projektu (nije obavezno)",
    phone: "Broj telefona (WhatsApp)",
    confirm: "Pošalji zahtjev",
    errTaken: "Ovaj termin je upravo zauzet. Izaberite drugi.",
    change: "Promijeni termin",
    doneH: "Zahtjev je poslan",
    doneP: "Na email vam stiže potvrda prijema, a link za poziv šaljemo čim odobrimo termin.",
    errInput: "Unesite ime, ispravan email i broj telefona.",
    errSend: "Slanje nije uspjelo.",
    wa: "Pišite nam na WhatsApp",
    prev: "Prethodni mjesec",
    next: "Sljedeći mjesec",
  },
  en: {
    eyebrow: "Free consultation",
    h: "Book a call",
    sub: "Pick a day and time. In 30 minutes you get a rough price and timeline, no obligation.",
    role: "Founder, mehiccdev",
    title: "Intro and project plan",
    meta: ["30 minutes", "Google Meet or phone", "Mon, Wed, Fri and Sat, 11am to 3pm"],
    thisWeek: "This week",
    nextWeek: "Next week",
    s1: "Pick a day",
    s2: "Pick a time",
    s3: "Your details",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    dayLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    tz: "Time: Sarajevo (CET)",
    taken: "Booked",
    legend: ["Available", "Few slots left", "Fully booked"],
    pick: "Pick a time",
    cont: "Continue with",
    at: "at",
    dur: "30 minutes",
    name: "Full name",
    email: "Email",
    note: "About your project (optional)",
    phone: "Phone number (WhatsApp)",
    confirm: "Send request",
    errTaken: "This time was just booked. Please pick another one.",
    change: "Change time",
    doneH: "Request sent",
    doneP: "You'll get an email confirming we received it, and the call link as soon as we approve the time.",
    errInput: "Enter your name, a valid email and your phone number.",
    errSend: "Sending failed.",
    wa: "Message us on WhatsApp",
    prev: "Previous month",
    next: "Next month",
  },
};

const OPEN = [1, 3, 5, 6];
const SLOTS = ["11:00", "12:00", "13:00", "14:00"];
const RANGE: [number, number][] = [[0.62, 0.9], [0.4, 0.65], [0.2, 0.4], [0.05, 0.2]];
const WEEK = 604800000;

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const pad = (n: number) => String(n).padStart(2, "0");
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monday = (d: Date) => { const x = day0(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
const rand = (seed: number) => {
  let t = (seed + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function plural(n: number, l: Lang) {
  if (l === "en") return `${n} ${n === 1 ? "slot" : "slots"} left`;
  const w = n % 10 === 1 && n % 100 !== 11 ? "slobodan termin" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "slobodna termina" : "slobodnih termina";
  return `Još ${n} ${w}`;
}

type Status = "off" | "full" | "few" | "open";

export function Booking({ id = "zakazi" }: { id?: string }) {
  const { lang } = useLanguage();
  const l: Lang = lang === "en" ? "en" : "bs";
  const d = T[l];
  const wa = waLink(l);

  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(day0(new Date())), []);
  const [real, setReal] = useState<Record<string, string[]>>({});
  useEffect(() => {
    fetch("/api/zakazi/slots", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { slots: [] }))
      .then((j: { slots: { d: string; t: string }[] }) => {
        const m: Record<string, string[]> = {};
        j.slots.forEach(({ d: k, t }) => { (m[k] ??= []).push(t); });
        setReal(m);
      })
      .catch(() => {});
  }, []);

  const first = useMemo(() => {
    if (!today) return null;
    const x = new Date(today);
    do x.setDate(x.getDate() + 1); while (!OPEN.includes(x.getDay()));
    return x;
  }, [today]);
  const base = first ? monday(first).getTime() : 0;

  const weeks = useMemo(() => new Map<number, Record<string, string[]>>(), [today]);
  const week = (m: Date) => {
    const t = m.getTime();
    const hit = weeks.get(t);
    if (hit) return hit;
    const w = Math.max(0, Math.round((t - base) / WEEK));
    const [lo, hi] = RANGE[w] ?? [0, 0];
    const f = lo + rand(hash(`w${key(m)}`)) * (hi - lo);
    const out: Record<string, string[]> = {};
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const x = new Date(m); x.setDate(x.getDate() + i);
      if (!OPEN.includes(x.getDay())) continue;
      const k = key(x);
      let busy = SLOTS.filter((_, j) => rand(hash(`${k}|${j}`)) < f);
      if (!busy.length && w <= 1) busy = [SLOTS[Math.floor(rand(hash(`${k}|min`)) * SLOTS.length)]];
      out[k] = busy;
      if (today && x > today) days.push(k);
    }
    let free = days.reduce((a, k) => a + SLOTS.length - out[k].length, 0);
    for (let i = days.length - 1; i >= 0 && free < 2; i--) {
      while (out[days[i]].length > 1 && free < 2) { out[days[i]] = out[days[i]].slice(1); free++; }
    }
    weeks.set(t, out);
    return out;
  };
  const busy = (x: Date) => {
    const base0 = week(monday(x))[key(x)] ?? SLOTS;
    const r = real[key(x)];
    return r ? SLOTS.filter((t) => base0.includes(t) || r.includes(t)) : base0;
  };
  const status = (x: Date): Status => {
    if (!today || x <= today || !OPEN.includes(x.getDay())) return "off";
    const n = busy(x).length;
    return n >= SLOTS.length ? "full" : n >= 2 ? "few" : "open";
  };

  const firstFree = useMemo(() => {
    if (!first) return null;
    const x = new Date(first);
    for (let i = 0; i < 90 && (status(x) === "off" || status(x) === "full"); i++) x.setDate(x.getDate() + 1);
    return x;
  }, [first, real]);

  const [view, setView] = useState<Date | null>(null);
  const [sel, setSel] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [step, setStep] = useState<"pick" | "form" | "done">("pick");
  const [form, setForm] = useState({ name: "", email: "", note: "", website: "", code: "387", phone: "" });
  const opened = useRef(0);
  useEffect(() => { if (step === "form") opened.current = Date.now(); }, [step]);
  const [err, setErr] = useState<"" | "input" | "send" | "taken">("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!firstFree || sel) return;
    setSel(firstFree);
    setView(new Date(firstFree.getFullYear(), firstFree.getMonth(), 1));
  }, [firstFree]);

  const cells = useMemo(() => {
    if (!view || !today) return Array<null>(35).fill(null);
    const y = view.getFullYear(), m = view.getMonth();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const n = new Date(y, m + 1, 0).getDate();
    const all = [...Array<null>(offset).fill(null), ...Array.from({ length: n }, (_, i) => new Date(y, m, i + 1))];
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < all.length; i += 7) rows.push(all.slice(i, i + 7));
    return rows.filter((r) => r.some((x) => x && x > today)).flat();
  }, [view, today]);

  const [weekFree, weekTotal] = useMemo(() => {
    if (!today || !base) return [0, 0];
    let f = 0, t = 0;
    for (let i = 0; i < 7; i++) {
      const x = new Date(base); x.setDate(x.getDate() + i);
      if (status(x) !== "off") { f += SLOTS.length - busy(x).length; t += SLOTS.length; }
    }
    return [f, t];
  }, [today, base, real]);

  const ready = !!(today && view && sel);
  const thisWeek = !!today && monday(today).getTime() === base;
  const taken = sel ? busy(sel) : [];
  const canPrev = !!(view && firstFree) && view.getFullYear() * 12 + view.getMonth() > firstFree.getFullYear() * 12 + firstFree.getMonth();
  const move = (k: number) => view && setView(new Date(view.getFullYear(), view.getMonth() + k, 1));
  const when = sel ? (l === "en" ? `${d.dayLong[sel.getDay()]}, ${d.months[sel.getMonth()]} ${sel.getDate()}` : `${d.dayLong[sel.getDay()]}, ${sel.getDate()}. ${d.months[sel.getMonth()]}`) : "";

  const submit = async () => {
    if (!sel || !slot) return;
    const phone = toE164(form.code, form.phone);
    if (form.name.trim().length < 2 || !isEmail(form.email.trim()) || !phone) { setErr("input"); return; }
    setErr("");
    setSending(true);
    try {
      const r = await fetch("/api/zakazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, note: form.note, website: form.website, phone, t: Date.now() - opened.current, date: key(sel), time: slot, label: `${when} ${d.at} ${slot}`, lang: l }),
      });
      if (r.status === 409) {
        setReal((m) => ({ ...m, [key(sel)]: [...(m[key(sel)] ?? []), slot] }));
        setSlot(null);
        setStep("pick");
        setErr("taken");
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      setReal((m) => ({ ...m, [key(sel)]: [...(m[key(sel)] ?? []), slot] }));
      setStep("done");
    } catch {
      setErr("send");
    } finally {
      setSending(false);
    }
  };

  const Num = ({ n, on }: { n: number; on: boolean }) => (
    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${on ? "bg-[#0F172A] text-white" : "bg-[#E2E8F0] text-[#64748B]"}`}>{n}</span>
  );
  const input = "w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0F172A]";

  return (
    <section id={id} className="relative scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.eyebrow}</p>
          <h2 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#0F172A] sm:text-[46px]">{d.h}</h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-[#475569]">{d.sub}</p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.3fr)_minmax(0,0.9fr)]" style={{ boxShadow: "0 40px 80px -50px rgba(15,23,42,0.45)" }}>
          <div className="flex flex-col bg-[#0F172A] p-6 text-white sm:p-8">
            <div className="flex items-center gap-3.5">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl"><Image src="/team/bakir.jpg" alt="Bakir Mehić" fill sizes="48px" className="object-cover" /></span>
              <span>
                <span className="block text-[16px] font-semibold">Bakir Mehić</span>
                <span className="block text-[13px] text-[#94A3B8]">{d.role}</span>
              </span>
            </div>
            <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.02em]">{d.title}</h3>
            <ul className="mt-4 space-y-2.5 text-[14px] text-[#CBD5E1]">
              {[Clock, Video, CalendarDays].map((Icon, i) => (
                <li key={i} className="flex items-center gap-3"><Icon size={16} className="shrink-0 text-[#8FB3D9]" /> {d.meta[i]}</li>
              ))}
            </ul>
            <div className="mt-7 rounded-2xl bg-white/[0.05] p-4 lg:mt-auto">
              <p className="text-[13px] font-semibold">{thisWeek ? d.thisWeek : d.nextWeek}</p>
              <div className="mt-2.5 flex gap-[3px]">
                {Array.from({ length: weekTotal || 16 }, (_, i) => (
                  <span key={i} className={`h-2 flex-1 rounded-[2px] ${ready && i < weekTotal - weekFree ? "bg-[#DC2626]" : "bg-white/20"}`} />
                ))}
              </div>
              <p className={`mt-2.5 text-[12.5px] font-semibold text-[#FCA5A5] transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}>{plural(weekFree, l)}</p>
            </div>
          </div>

          <div className="border-b border-[#EEF2F6] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2.5"><Num n={1} on={step === "pick"} /><p className="text-[14px] font-semibold text-[#0F172A]">{d.s1}</p></div>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-[16px] font-semibold capitalize text-[#0F172A]">{view ? `${d.months[view.getMonth()]} ${view.getFullYear()}` : " "}</p>
              <div className="flex gap-1.5">
                <button type="button" disabled={!canPrev} onClick={() => move(-1)} aria-label={d.prev} className="grid h-9 w-9 place-items-center rounded-xl border border-[#E2E8F0] text-[#0F172A] transition-colors hover:bg-[#F8FAFC] disabled:text-[#CBD5E1] disabled:hover:bg-transparent"><ChevronLeft size={17} /></button>
                <button type="button" disabled={!ready} onClick={() => move(1)} aria-label={d.next} className="grid h-9 w-9 place-items-center rounded-xl border border-[#E2E8F0] text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"><ChevronRight size={17} /></button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[11.5px] font-semibold text-[#94A3B8]">
              {d.days.map((x) => <span key={x}>{x}</span>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {cells.map((x, i) => {
                const cell = "grid aspect-square place-items-center rounded-xl text-[14px] font-semibold tabular-nums transition-colors";
                if (!x) return <span key={i} className={ready ? "" : `${cell} bg-[#F8FAFC]`} />;
                const st = status(x);
                const on = !!sel && key(sel) === key(x);
                if (st === "off") return <span key={i} className={`${cell} font-medium text-[#CBD5E1]`}>{x.getDate()}</span>;
                if (st === "full") return <span key={i} title={d.legend[2]} className={`${cell} bg-[#F1F5F9] text-[#94A3B8] line-through`}>{x.getDate()}</span>;
                const tone = on ? "bg-[#0F172A] text-white" : st === "few" ? "bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA]" : "bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]";
                return <button key={i} type="button" onClick={() => { setSel(x); setSlot(null); setStep("pick"); setErr(""); }} className={`${cell} ${tone}`}>{x.getDate()}</button>;
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-[#64748B]">
              {["bg-[#DCFCE7]", "bg-[#FEE2E2]", "bg-[#F1F5F9]"].map((c, i) => (
                <span key={c} className="inline-flex items-center gap-1.5"><span className={`h-3 w-3 rounded ${c}`} /> {d.legend[i]}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            {step === "pick" && (
              <>
                <div className="flex items-center gap-2.5"><Num n={2} on /><p className="text-[14px] font-semibold text-[#0F172A]">{d.s2}</p></div>
                <p className="mt-5 min-h-[24px] text-[16px] font-semibold text-[#0F172A]">{when}</p>
                <p className="mt-0.5 text-[12.5px] text-[#64748B]">{d.tz}</p>
                {err === "taken" && <p className="mt-2 text-[12.5px] font-medium text-[#DC2626]">{d.errTaken}</p>}
                <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
                  {SLOTS.map((t) => {
                    if (!ready) return <span key={t} className="h-[48px] rounded-xl bg-[#F8FAFC]" />;
                    const on = slot === t;
                    return taken.includes(t) ? (
                      <span key={t} className="flex items-center justify-between rounded-xl border border-dashed border-[#E2E8F0] px-4 py-3 text-[14px] text-[#94A3B8]">
                        <span className="line-through">{t}</span><span className="text-[11.5px] font-semibold">{d.taken}</span>
                      </span>
                    ) : (
                      <button key={t} type="button" onClick={() => setSlot(t)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-[14px] font-semibold transition-colors ${on ? "border-[#0F172A] bg-[#0F172A] text-white" : "border-[#CBD5E1] text-[#0F172A] hover:border-[#0F172A]"}`}>
                        {t}{on ? <Check size={16} strokeWidth={2.5} /> : <span className="h-2 w-2 rounded-full bg-[#16A34A]" />}
                      </button>
                    );
                  })}
                </div>
                <button type="button" disabled={!slot} onClick={() => setStep("form")}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] lg:mt-auto">
                  {slot ? `${d.cont} ${slot}` : d.pick} <ArrowRight size={16} />
                </button>
              </>
            )}

            {step === "form" && (
              <>
                <div className="flex items-center gap-2.5"><Num n={3} on /><p className="text-[14px] font-semibold text-[#0F172A]">{d.s3}</p></div>
                <div className="mt-5 rounded-xl bg-[#F8FAFC] px-4 py-3">
                  <p className="text-[14.5px] font-semibold text-[#0F172A]">{when}</p>
                  <p className="text-[13px] text-[#64748B]">{d.at} {slot}, {d.dur}</p>
                </div>
                <div className="mt-4 space-y-2.5">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={d.name} autoComplete="name" className={input} />
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={d.email} type="email" autoComplete="email" className={input} />
                  <PhoneInput code={form.code} number={form.phone} onCode={(v) => setForm({ ...form, code: v })} onNumber={(v) => setForm({ ...form, phone: v })} placeholder={d.phone} />
                  <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={d.note} className={input} />
                  <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
                </div>
                {err && (
                  <p className="mt-3 text-[12.5px] font-medium text-[#DC2626]">
                    {err === "input" ? d.errInput : d.errSend}
                    {err === "send" && wa && <> <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#16A34A] underline underline-offset-2">{d.wa}</a></>}
                  </p>
                )}
                <button type="button" disabled={sending} onClick={submit}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-70 lg:mt-auto">
                  {d.confirm} {sending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                </button>
                <button type="button" onClick={() => { setStep("pick"); setErr(""); }} className="mt-3 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#64748B] transition-colors hover:text-[#0F172A]">
                  <ArrowLeft size={14} /> {d.change}
                </button>
              </>
            )}

            {step === "done" && (
              <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[#DCFCE7] text-[#16A34A]"><Check size={26} strokeWidth={2.5} /></span>
                <p className="mt-5 text-[18px] font-semibold text-[#0F172A]">{d.doneH}</p>
                <p className="mt-1.5 text-[14px] text-[#475569]">{when} {d.at} {slot}</p>
                <p className="mt-4 max-w-[240px] text-[13px] leading-relaxed text-[#64748B]">{d.doneP}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
