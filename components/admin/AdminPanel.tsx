"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, Check, Globe, ChevronLeft, ChevronRight, Clock, Inbox, Loader2, LogOut, Mail, MessageCircle, Phone, RefreshCw, Send, Video, X } from "lucide-react";
import { Znak } from "@/components/ui/Logo";
import { googleCalendarUrl } from "@/lib/calendar";
import type { Booking, Status } from "@/lib/db";

const OPEN = [1, 3, 5, 6];
const SLOTS = ["11:00", "12:00", "13:00", "14:00"];
const MONTHS = ["januar", "februar", "mart", "april", "maj", "juni", "juli", "august", "septembar", "oktobar", "novembar", "decembar"];
const DAY_LONG = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];
const DAY_SHORT = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

const ST: Record<Status, { l: string; bg: string; fg: string; bar: string }> = {
  pending: { l: "Na čekanju", bg: "bg-[#FEE2E2]", fg: "text-[#B91C1C]", bar: "border-[#DC2626]" },
  approved: { l: "Odobreno", bg: "bg-[#DCFCE7]", fg: "text-[#15803D]", bar: "border-[#16A34A]" },
  declined: { l: "Odbijeno", bg: "bg-[#F1F5F9]", fg: "text-[#64748B]", bar: "border-[#CBD5E1]" },
  cancelled: { l: "Otkazano", bg: "bg-[#F1F5F9]", fg: "text-[#64748B]", bar: "border-[#CBD5E1]" },
};

const pad = (n: number) => String(n).padStart(2, "0");
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const monday = (d: Date) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const plus = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startWeek = () => { const t = new Date(); return t.getDay() === 0 ? plus(monday(t), 7) : monday(t); };
const longDay = (s: string) => { const d = parse(s); return `${DAY_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`; };
const sent = (ms: number) => { const d = new Date(ms); return `${d.getDate()}. ${MONTHS[d.getMonth()]} u ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const active = (b: Booking) => b.status === "pending" || b.status === "approved";

function Pill({ s }: { s: Status }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${ST[s].bg} ${ST[s].fg}`}>{ST[s].l}</span>;
}

function Login({ onIn }: { onIn: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) }).catch(() => null);
    setBusy(false);
    if (r?.ok) return onIn();
    setErr(r?.status === 503 ? "ADMIN_PASSWORD nije podešen na Vercelu." : r?.status === 429 ? "Previše pokušaja. Probaj za 10 minuta." : "Pogrešna lozinka.");
  };
  return (
    <div className="grid min-h-screen place-items-center bg-[#0F172A] px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[24px] bg-white p-8">
        <Znak className="h-9 w-auto" />
        <p className="mt-6 text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">Admin panel</p>
        <p className="mt-1 text-[14px] text-[#64748B]">Termini i zahtjevi za pozive</p>
        <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Lozinka" autoComplete="current-password"
          className="mt-6 w-full rounded-xl border border-[#CBD5E1] px-4 py-3 text-[14px] text-[#0F172A] outline-none focus:border-[#0F172A]" />
        {err && <p className="mt-2 text-[13px] font-medium text-[#DC2626]">{err}</p>}
        <button type="submit" disabled={busy || !pw} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60">
          {busy && <Loader2 size={16} className="animate-spin" />} Prijava
        </button>
      </form>
    </div>
  );
}

function Detail({ b, meetDefault, onSaved, onClose, toast }: { b: Booking; meetDefault: string; onSaved: (b: Booking) => void; onClose: () => void; toast: (s: string) => void }) {
  const [meet, setMeet] = useState(b.meet ?? meetDefault);
  const [busy, setBusy] = useState<"" | "approve" | "decline" | "cancel">("");
  const [err, setErr] = useState("");

  const act = async (action: "approve" | "decline" | "cancel") => {
    if (action === "decline" && !window.confirm(`Odbiti termin za ${b.name}? Klijent dobija email da izabere novi termin.`)) return;
    if (action === "cancel" && !window.confirm(`Otkazati poziv sa ${b.name}? Klijent dobija email o otkazivanju.`)) return;
    setBusy(action); setErr("");
    const r = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, action, meet }) }).catch(() => null);
    setBusy("");
    if (!r?.ok) {
      setErr(r?.status === 422 ? "Unesi ispravan link koji počinje sa https://" : "Akcija nije uspjela. Probaj ponovo.");
      return;
    }
    const j = (await r.json()) as { booking: Booking; mailed: boolean };
    onSaved(j.booking);
    const what = action === "approve" ? (b.status === "approved" ? "Link je poslan ponovo" : "Termin je odobren") : action === "decline" ? "Termin je odbijen" : "Poziv je otkazan";
    toast(j.mailed ? `${what}, klijent je dobio email.` : `${what}, ali email klijentu nije poslan.`);
  };

  const wa = `https://wa.me/${b.phone.replace(/\D/g, "")}`;
  const contact = "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors";

  return (
    <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-6">
      <div className="flex items-center justify-between">
        <Pill s={b.status} />
        <button type="button" onClick={onClose} aria-label="Zatvori" className="grid h-8 w-8 place-items-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"><X size={17} /></button>
      </div>
      <p className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">{b.name}</p>
      <p className="mt-1 text-[15px] font-semibold text-[#0F172A]">{longDay(b.date)} u {b.time}</p>
      <p className="text-[13px] text-[#64748B]">30 minuta, Google Meet{b.lang === "en" ? ", na engleskom" : ""}</p>

      {(b.topic || b.site) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {b.topic && <span className="rounded-lg bg-[#EEF3F8] px-2.5 py-1 text-[12.5px] font-semibold text-[#0F3554]">{b.topic}</span>}
          {b.site && <a href={b.site} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0F3554] underline decoration-[#CBD5E1] underline-offset-4 hover:text-[#0F172A]"><Globe size={13} /> {b.site.replace(/^https?:\/\//, "")}</a>}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <a href={wa} target="_blank" rel="noopener noreferrer" className={`${contact} bg-[#16A34A] text-white hover:bg-[#15803D]`}><MessageCircle size={15} /> WhatsApp</a>
        <a href={`tel:${b.phone}`} className={`${contact} border border-[#E2E8F0] text-[#0F172A] hover:border-[#0F172A]`}><Phone size={15} /> Pozovi</a>
        <a href={`mailto:${b.email}`} className={`${contact} border border-[#E2E8F0] text-[#0F172A] hover:border-[#0F172A]`}><Mail size={15} /> Email</a>
      </div>
      <div className="mt-3 space-y-1 text-[13.5px] text-[#475569]">
        <p>{b.phone}</p>
        <p className="break-all">{b.email}</p>
      </div>
      {b.note && (
        <div className="mt-4 rounded-xl bg-[#F8FAFC] px-4 py-3">
          <p className="text-[12px] font-semibold text-[#94A3B8]">O projektu</p>
          <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-[#0F172A]">{b.note}</p>
        </div>
      )}
      <p className="mt-4 text-[12.5px] text-[#94A3B8]">Zahtjev poslan {sent(b.createdAt)}</p>

      <div className="mt-5 border-t border-[#EEF2F6] pt-5">
        {(b.status === "pending" || b.status === "approved") && (
          <>
            <label className="text-[13px] font-semibold text-[#0F172A]" htmlFor={`meet-${b.id}`}>Link za poziv</label>
            <input id={`meet-${b.id}`} value={meet} onChange={(e) => setMeet(e.target.value)} placeholder="https://meet.google.com/..."
              className="mt-2 w-full rounded-xl border border-[#CBD5E1] px-4 py-3 text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#0F172A]" />
            <p className="mt-1.5 text-[12px] text-[#94A3B8]">Klijent dobija ovaj link u emailu, sa pozivnicom za kalendar.</p>
            {err && <p className="mt-2 text-[12.5px] font-medium text-[#DC2626]">{err}</p>}
          </>
        )}

        {b.status === "pending" && (
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" disabled={!!busy} onClick={() => act("approve")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#15803D] disabled:opacity-60">
              {busy === "approve" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />} Odobri i pošalji link
            </button>
            <button type="button" disabled={!!busy} onClick={() => act("decline")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FECACA] px-5 py-3 text-[14px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60">
              {busy === "decline" && <Loader2 size={15} className="animate-spin" />} Odbij termin
            </button>
          </div>
        )}

        {b.status === "approved" && (
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" disabled={!!busy} onClick={() => act("approve")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#1E293B] disabled:opacity-60">
              {busy === "approve" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Pošalji link ponovo
            </button>
            <div className="flex gap-2">
              <a href={googleCalendarUrl(b)} target="_blank" rel="noopener noreferrer" className={`${contact} border border-[#E2E8F0] text-[#0F172A] hover:border-[#0F172A]`}><CalendarPlus size={15} /> Google Kalendar</a>
              {b.meet && <a href={b.meet} target="_blank" rel="noopener noreferrer" className={`${contact} border border-[#E2E8F0] text-[#0F172A] hover:border-[#0F172A]`}><Video size={15} /> Otvori Meet</a>}
            </div>
            <button type="button" disabled={!!busy} onClick={() => act("cancel")} className="mt-1 text-[13px] font-semibold text-[#DC2626] hover:underline disabled:opacity-60">Otkaži poziv</button>
          </div>
        )}

        {(b.status === "declined" || b.status === "cancelled") && (
          <p className="rounded-xl bg-[#F8FAFC] px-4 py-3 text-[13.5px] leading-relaxed text-[#64748B]">
            {b.status === "declined" ? "Termin je odbijen." : "Poziv je otkazan."} Klijent je dobio email sa linkom da izabere novi termin.
          </p>
        )}
      </div>
    </div>
  );
}

export function AdminPanel() {
  const [auth, setAuth] = useState<"check" | "out" | "in">("check");
  const [data, setData] = useState<Booking[]>([]);
  const [meetDefault, setMeetDefault] = useState("");
  const [mailOn, setMailOn] = useState(true);
  const [fail, setFail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [wk, setWk] = useState(startWeek);
  const [tab, setTab] = useState<"pending" | "upcoming" | "past" | "closed">("pending");
  const [note, setNote] = useState("");
  const jumped = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/bookings", { cache: "no-store" }).catch(() => null);
    setLoading(false);
    if (r?.status === 401) { setAuth("out"); return; }
    setAuth("in");
    if (!r?.ok) { setFail(r?.status === 503 ? "Baza nije podešena. Na Vercelu poveži Upstash Redis (Storage)." : "Učitavanje nije uspjelo."); return; }
    const j = (await r.json()) as { bookings: Booking[]; meet: string; mail: boolean };
    setFail(""); setData(j.bookings); setMeetDefault(j.meet); setMailOn(j.mail);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = new URLSearchParams(window.location.search).get("b"); if (id) setSel(id); }, []);
  useEffect(() => {
    if (jumped.current || !sel) return;
    const b = data.find((x) => x.id === sel);
    if (b) { setWk(monday(parse(b.date))); jumped.current = true; }
  }, [sel, data]);

  const toast = (s: string) => { setNote(s); window.setTimeout(() => setNote(""), 4000); };
  const saved = (b: Booking) => setData((d) => d.map((x) => (x.id === b.id ? b : x)));
  const logout = async () => { await fetch("/api/admin/login", { method: "DELETE" }); setAuth("out"); };

  const today = key(new Date());
  const lists = useMemo(() => ({
    pending: data.filter((b) => b.status === "pending"),
    upcoming: data.filter((b) => b.status === "approved" && b.date >= today),
    past: data.filter((b) => b.status === "approved" && b.date < today).reverse(),
    closed: data.filter((b) => b.status === "declined" || b.status === "cancelled").reverse(),
  }), [data, today]);

  const thisWeek = useMemo(() => {
    const s = key(startWeek()), e = key(plus(startWeek(), 6));
    return data.filter((b) => b.status === "approved" && b.date >= today && b.date >= s && b.date <= e).length;
  }, [data, today]);
  const next = lists.upcoming[0];

  const days = OPEN.map((dow) => plus(wk, dow - 1));
  const at = useMemo(() => {
    const m: Record<string, Booking> = {};
    data.filter(active).forEach((b) => { m[`${b.date} ${b.time}`] ??= b; });
    return m;
  }, [data]);
  const end = plus(wk, 5);
  const weekLabel = wk.getMonth() === end.getMonth()
    ? `${wk.getDate()}. do ${end.getDate()}. ${MONTHS[end.getMonth()]}`
    : `${wk.getDate()}. ${MONTHS[wk.getMonth()]} do ${end.getDate()}. ${MONTHS[end.getMonth()]}`;
  const current = data.find((b) => b.id === sel) ?? null;

  if (auth === "check") return <div className="grid min-h-screen place-items-center bg-[#F4F7FB]"><Loader2 className="animate-spin text-[#94A3B8]" /></div>;
  if (auth === "out") return <Login onIn={load} />;

  const TABS: [typeof tab, string][] = [["pending", "Na čekanju"], ["upcoming", "Predstojeći"], ["past", "Prošli"], ["closed", "Odbijeni"]];
  const stat = "rounded-[20px] border border-[#E2E8F0] bg-white p-5";

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Znak className="h-7 w-auto" />
            <span className="rounded-lg bg-[#0F172A] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={load} aria-label="Osvježi" className="grid h-9 w-9 place-items-center rounded-xl border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button type="button" onClick={logout} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC]">
              <LogOut size={15} /> Odjava
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {fail && <p className="mb-4 rounded-xl bg-[#FEE2E2] px-4 py-3 text-[13.5px] font-medium text-[#B91C1C]">{fail}</p>}
        {!mailOn && <p className="mb-4 rounded-xl bg-[#FEF3C7] px-4 py-3 text-[13.5px] font-medium text-[#92400E]">Emailovi se ne šalju dok RESEND_API_KEY nije podešen na Vercelu.</p>}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button type="button" onClick={() => setTab("pending")} className={`${stat} text-left`}>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"><Inbox size={15} /> Na čekanju</p>
            <p className={`mt-2 text-[30px] font-semibold leading-none tabular-nums ${lists.pending.length ? "text-[#DC2626]" : "text-[#0F172A]"}`}>{lists.pending.length}</p>
          </button>
          <div className={stat}>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"><Check size={15} /> Ove sedmice</p>
            <p className="mt-2 text-[30px] font-semibold leading-none tabular-nums text-[#0F172A]">{thisWeek}</p>
          </div>
          <div className={stat}>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"><Video size={15} /> Predstojeći</p>
            <p className="mt-2 text-[30px] font-semibold leading-none tabular-nums text-[#0F172A]">{lists.upcoming.length}</p>
          </div>
          <button type="button" disabled={!next} onClick={() => next && setSel(next.id)} className="col-span-2 rounded-[20px] bg-[#0F172A] p-5 text-left text-white lg:col-span-1">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-[#8FB3D9]"><Clock size={15} /> Sljedeći poziv</p>
            {next ? (
              <>
                <p className="mt-2 truncate text-[17px] font-semibold">{next.name}</p>
                <p className="text-[13px] text-[#94A3B8]">{longDay(next.date)} u {next.time}</p>
              </>
            ) : <p className="mt-2 text-[15px] text-[#94A3B8]">Nema zakazanih poziva</p>}
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[17px] font-semibold text-[#0F172A]">Kalendar</p>
                  <p className="text-[13px] text-[#64748B]">{weekLabel} {end.getFullYear()}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setWk(startWeek())} className="h-9 rounded-xl border border-[#E2E8F0] px-3 text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC]">Danas</button>
                  <button type="button" onClick={() => setWk(plus(wk, -7))} aria-label="Prethodna sedmica" className="grid h-9 w-9 place-items-center rounded-xl border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]"><ChevronLeft size={17} /></button>
                  <button type="button" onClick={() => setWk(plus(wk, 7))} aria-label="Sljedeća sedmica" className="grid h-9 w-9 place-items-center rounded-xl border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]"><ChevronRight size={17} /></button>
                </div>
              </div>

              <div className="-mx-5 mt-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                <div className="grid min-w-[560px] grid-cols-[52px_repeat(4,minmax(0,1fr))] gap-2">
                  <span />
                  {days.map((d) => {
                    const isToday = key(d) === today;
                    return (
                      <div key={key(d)} className={`rounded-xl px-3 py-2 ${isToday ? "bg-[#0F172A] text-white" : "text-[#0F172A]"}`}>
                        <p className={`text-[11.5px] font-semibold uppercase tracking-[0.08em] ${isToday ? "text-[#8FB3D9]" : "text-[#94A3B8]"}`}>{DAY_SHORT[d.getDay()]}</p>
                        <p className="text-[18px] font-semibold tabular-nums">{d.getDate()}.</p>
                      </div>
                    );
                  })}
                  {SLOTS.map((t) => (
                    <Fragment key={t}>
                      <p className="pt-3 text-[12.5px] font-semibold tabular-nums text-[#94A3B8]">{t}</p>
                      {days.map((d) => {
                        const b = at[`${key(d)} ${t}`];
                        const past = key(d) < today;
                        if (!b) return <div key={key(d)} className={`min-h-[68px] rounded-xl ${past ? "bg-[#F8FAFC]" : "border border-dashed border-[#E2E8F0]"}`} />;
                        return (
                          <button key={key(d)} type="button" onClick={() => setSel(b.id)}
                            className={`min-h-[68px] rounded-xl border-l-[3px] px-3 py-2 text-left transition-shadow ${ST[b.status].bar} ${ST[b.status].bg} ${sel === b.id ? "ring-2 ring-[#0F172A] ring-offset-1" : "hover:shadow-md"} ${past ? "opacity-60" : ""}`}>
                            <p className="truncate text-[13.5px] font-semibold text-[#0F172A]">{b.name}</p>
                            <p className={`text-[11.5px] font-semibold ${ST[b.status].fg}`}>{ST[b.status].l}</p>
                          </button>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-[#64748B]">
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded border-l-[3px] border-[#DC2626] bg-[#FEE2E2]" /> Čeka odobrenje</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded border-l-[3px] border-[#16A34A] bg-[#DCFCE7]" /> Odobreno</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-dashed border-[#CBD5E1]" /> Slobodno</span>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 sm:p-6">
              <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
                {TABS.map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setTab(k)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${tab === k ? "bg-[#0F172A] text-white" : "text-[#64748B] hover:bg-[#F1F5F9]"}`}>
                    {l} <span className={`rounded-full px-1.5 text-[11.5px] tabular-nums ${tab === k ? "bg-white/15" : "bg-[#F1F5F9]"}`}>{lists[k].length}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 divide-y divide-[#EEF2F6]">
                {lists[tab].length === 0 && <p className="py-10 text-center text-[14px] text-[#94A3B8]">Nema ništa ovdje.</p>}
                {lists[tab].map((b) => {
                  const d = parse(b.date);
                  return (
                    <button key={b.id} type="button" onClick={() => { setSel(b.id); setWk(monday(d)); }}
                      className={`flex w-full items-center gap-4 rounded-xl px-2 py-3 text-left transition-colors ${sel === b.id ? "bg-[#F1F5F9]" : "hover:bg-[#F8FAFC]"}`}>
                      <span className="grid h-12 w-12 shrink-0 place-content-center rounded-xl bg-[#F1F5F9] text-center leading-none">
                        <span className="text-[10.5px] font-semibold uppercase text-[#94A3B8]">{DAY_SHORT[d.getDay()]}</span>
                        <span className="mt-1 text-[17px] font-semibold tabular-nums text-[#0F172A]">{d.getDate()}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-semibold text-[#0F172A]">{b.name}</span>
                        <span className="block truncate text-[12.5px] text-[#64748B]">{longDay(b.date)} u {b.time} · {b.phone}</span>
                      </span>
                      <span className="hidden sm:block"><Pill s={b.status} /></span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              {current ? (
                <Detail key={current.id} b={current} meetDefault={meetDefault} onSaved={saved} onClose={() => setSel(null)} toast={toast} />
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#CBD5E1] p-8 text-center">
                  <p className="text-[15px] font-semibold text-[#0F172A]">Izaberi termin</p>
                  <p className="mt-1 text-[13.5px] text-[#64748B]">Klikni na termin u kalendaru ili listi da vidiš detalje i odobriš ga.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {current && (
        <div className="fixed inset-0 z-40 flex items-end bg-[#0F172A]/40 lg:hidden" onClick={() => setSel(null)}>
          <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-[28px] bg-white" onClick={(e) => e.stopPropagation()}>
            <Detail key={current.id} b={current} meetDefault={meetDefault} onSaved={saved} onClose={() => setSel(null)} toast={toast} />
          </div>
        </div>
      )}

      {note && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <p className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3 text-[13.5px] font-semibold text-white shadow-lg"><Check size={16} className="text-[#4ADE80]" /> {note}</p>
        </div>
      )}
    </div>
  );
}
