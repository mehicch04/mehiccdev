"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { CalendarDays, Check, ChevronsLeftRight, Instagram, Mail, MessageCircle, PhoneMissed } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

type Lang = "bs" | "en";
type App = "viber" | "call" | "ig" | "mail" | "wa";
type Bar = { from: number; to: number; kind: "n" | "g" | "s"; label: string };
type Content = {
  aria: string; old: string; neu: string; drag: string;
  file: string; cols: string[]; rows: { c: string[]; mark?: "r" | "y" }[]; dup: string;
  ntf: { app: App; t: string; m: string; w: string }[];
  notes: [string, string, string];
  chat: string[];
  cal: string; legend: [string, string, string];
  fleet: { name: string; bars: Bar[] }[];
  list: string; tabs: [string, string];
  bookings: { car: string; who: string; price: string; fresh?: boolean }[];
  confirmed: string; fresh: string;
  okT: string; okS: string; chip: string;
};

const FLEET = (b: { svc: string; nw: string }) => [
  { name: "VW Golf 8", bars: [{ from: 9, to: 12, kind: "n" as const, label: "Marko P." }, { from: 14, to: 17, kind: "g" as const, label: b.nw }] },
  { name: "Škoda Octavia", bars: [{ from: 8, to: 9, kind: "n" as const, label: "Selma" }, { from: 15, to: 19, kind: "n" as const, label: "Lejla K." }] },
  { name: "VW Passat", bars: [{ from: 11, to: 13, kind: "s" as const, label: b.svc }, { from: 17, to: 21, kind: "n" as const, label: "Kenan" }] },
  { name: "Audi A4 Avant", bars: [{ from: 8, to: 11, kind: "n" as const, label: "Ivana S." }, { from: 13, to: 16, kind: "n" as const, label: "Damir" }] },
  { name: "Toyota RAV4", bars: [{ from: 10, to: 13, kind: "n" as const, label: "Ena" }, { from: 18, to: 21, kind: "n" as const, label: "Sara M." }] },
];

const T: Record<Lang, Content> = {
  bs: {
    aria: "Uporedite rad bez sistema i sa sistemom",
    old: "Bez sistema", neu: "Sa sistemom", drag: "Povucite",
    file: "rezervacije_FINAL_v3.xlsx",
    cols: ["Vozilo", "Ime", "Od", "Do", "Telefon", "Plaćeno"],
    rows: [
      { c: ["Golf 8", "Marko ??", "10.07", "13.07", "061 ...", "?"] },
      { c: ["Octavia", "Lejla K.", "15.07", "19.07", "", "DA"] },
      { c: ["Golf 8", "Amar (insta)", "11.07", "14.07", "062 4..", "NE"], mark: "r" },
      { c: ["Passat", "???", "17.07", "", "", ""] },
      { c: ["A4", "Ivana", "20.07", "23.07", "pozvati!", "pola"], mark: "y" },
      { c: ["RAV4", "Damir (preko Ene)", "24.07", "", "", ""] },
    ],
    dup: "DUPLO?!",
    ntf: [
      { app: "viber", t: "Viber", m: "Je li Golf slobodan za vikend?", w: "sada" },
      { app: "call", t: "Propušteni pozivi (3)", m: "+387 62 ...", w: "2 min" },
      { app: "ig", t: "Instagram", m: "Cijena za 7 dana??", w: "9 min" },
      { app: "mail", t: "Mail", m: "Re: Re: Re: rezervacija", w: "1 h" },
      { app: "wa", t: "WhatsApp", m: "Ima li neko auto od petka?", w: "1 h" },
    ],
    notes: ["Nazvati Marka za Golf!!", "Ko ima ključ od Octavie?", "Vratiti kauciju Ivani"],
    chat: ["Dobar dan, ima li slobodno auto od petka?", "Provjerim pa javim", "Jeste li provjerili?", "Halo?"],
    cal: "Kalendar vozila · jul", legend: ["Potvrđeno", "Novo", "Servis"],
    fleet: FLEET({ svc: "Servis", nw: "Amar H. · novo" }),
    list: "Rezervacije", tabs: ["Na čekanju 0", "Potvrđene 12"],
    bookings: [
      { car: "VW Golf 8", who: "Amar H. · 14. do 17. 7.", price: "380 KM", fresh: true },
      { car: "Škoda Octavia", who: "Lejla K. · 15. do 19. 7.", price: "450 KM" },
      { car: "Toyota RAV4", who: "Sara M. · 18. do 21. 7.", price: "420 KM" },
    ],
    confirmed: "Potvrđeno", fresh: "Novo",
    okT: "Rezervacija potvrđena", okS: "Gost je dobio email i WhatsApp", chip: "Nema duplih termina",
  },
  en: {
    aria: "Compare working without the system and with it",
    old: "Without the system", neu: "With the system", drag: "Drag",
    file: "bookings_FINAL_v3.xlsx",
    cols: ["Vehicle", "Name", "From", "To", "Phone", "Paid"],
    rows: [
      { c: ["Golf 8", "Marko ??", "07/10", "07/13", "061 ...", "?"] },
      { c: ["Octavia", "Lejla K.", "07/15", "07/19", "", "YES"] },
      { c: ["Golf 8", "Amar (insta)", "07/11", "07/14", "062 4..", "NO"], mark: "r" },
      { c: ["Passat", "???", "07/17", "", "", ""] },
      { c: ["A4", "Ivana", "07/20", "07/23", "call!", "half"], mark: "y" },
      { c: ["RAV4", "Damir (via Ena)", "07/24", "", "", ""] },
    ],
    dup: "DOUBLE?!",
    ntf: [
      { app: "viber", t: "Viber", m: "Is the Golf free this weekend?", w: "now" },
      { app: "call", t: "Missed calls (3)", m: "+387 62 ...", w: "2 min" },
      { app: "ig", t: "Instagram", m: "Price for 7 days??", w: "9 min" },
      { app: "mail", t: "Mail", m: "Re: Re: Re: booking", w: "1 h" },
      { app: "wa", t: "WhatsApp", m: "Any car free from Friday?", w: "1 h" },
    ],
    notes: ["Call Marko about the Golf!!", "Who has the Octavia key?", "Return Ivana's deposit"],
    chat: ["Hi, is there a car free from Friday?", "Let me check and get back to you", "Did you check?", "Hello?"],
    cal: "Vehicle calendar · July", legend: ["Confirmed", "New", "Service"],
    fleet: FLEET({ svc: "Service", nw: "Amar H. · new" }),
    list: "Bookings", tabs: ["Pending 0", "Confirmed 12"],
    bookings: [
      { car: "VW Golf 8", who: "Amar H. · July 14 to 17", price: "€195", fresh: true },
      { car: "Škoda Octavia", who: "Lejla K. · July 15 to 19", price: "€230" },
      { car: "Toyota RAV4", who: "Sara M. · July 18 to 21", price: "€215" },
    ],
    confirmed: "Confirmed", fresh: "New",
    okT: "Booking confirmed", okS: "The guest got an email and WhatsApp", chip: "No double bookings",
  },
};

const DAYS = Array.from({ length: 14 }, (_, i) => i + 8);
const TODAY = 11;
const EASE = [0.22, 1, 0.36, 1] as const;
const CARD = "0 1px 2px rgba(15,23,42,0.06), 0 18px 36px -18px rgba(15,23,42,0.32)";
const DEEP = "0 24px 50px -20px rgba(15,23,42,0.6)";
const APP: Record<App, { bg: string; I: typeof Mail }> = {
  viber: { bg: "#7360F2", I: MessageCircle },
  call: { bg: "#DC2626", I: PhoneMissed },
  ig: { bg: "#C13584", I: Instagram },
  mail: { bg: "#475569", I: Mail },
  wa: { bg: "#25D366", I: MessageCircle },
};

type Box = { left?: number; right?: number; top?: number; bottom?: number; width?: number; rotate?: number };
const LAYOUT: Record<"w" | "m", { W: number; H: number; start: number; show: number; xl: Box; dup: Box; ntf: Box; a: Box; b?: Box; c?: Box; chat?: Box; list?: Box; gantt: Box; chip?: Box; ok: Box }> = {
  w: {
    W: 1100, H: 420, start: 50, show: 4,
    xl: { left: 40, top: 70, width: 440, rotate: -1.6 }, dup: { left: 236, top: 232, rotate: 3 },
    ntf: { left: 282, top: 22, width: 270, rotate: 1.5 },
    a: { left: 352, top: 262, rotate: 5 }, b: { left: 108, top: 316, rotate: -6 }, c: { left: 820, top: 286, rotate: -3 },
    chat: { left: 600, top: 62, width: 280, rotate: -2 },
    list: { left: 36, top: 70, width: 470 },
    gantt: { left: 572, top: 66, width: 500 }, chip: { left: 586, top: 362 }, ok: { right: 24, bottom: 24 },
  },
  m: {
    W: 360, H: 520, start: 52, show: 3,
    xl: { left: -120, top: 250, width: 420, rotate: -3 }, dup: { left: 92, top: 348, rotate: 3 },
    ntf: { left: 12, top: 58, width: 236, rotate: 1 },
    a: { left: 18, top: 412, rotate: 5 },
    gantt: { left: 194, top: 58, width: 420 }, ok: { right: 10, bottom: 14, width: 150 },
  },
};

const pos = (b: Box, extra?: CSSProperties): CSSProperties => ({
  position: "absolute", left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width,
  transform: b.rotate ? `rotate(${b.rotate}deg)` : undefined, ...extra,
});

function useWidth(ref: RefObject<HTMLDivElement>) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

function Sheet({ d, b }: { d: Content; b: Box }) {
  return (
    <div style={pos(b, { boxShadow: CARD })} className="overflow-hidden rounded-[10px] border border-[#D9DEE5] bg-white text-[11.5px]">
      <div className="flex h-[30px] items-center gap-1.5 border-b border-[#D9DEE5] bg-[#EEF0F3] px-2.5 text-[11px] font-medium text-[#475569]">
        <i className="block h-2 w-2 rounded-full bg-[#CBD5E1]" /><i className="block h-2 w-2 rounded-full bg-[#CBD5E1]" /><i className="block h-2 w-2 rounded-full bg-[#CBD5E1]" />
        <span className="ml-2">{d.file}</span>
      </div>
      <table className="w-full border-collapse tabular-nums">
        <tbody>
          <tr>{["", "A", "B", "C", "D", "E", "F"].map((h, i) => <th key={i} className="whitespace-nowrap border border-[#E5E8EC] bg-[#F7F8FA] px-[7px] py-[5px] text-left text-[10px] font-semibold text-[#64748B]">{h}</th>)}</tr>
          <tr>
            <td className="w-[22px] border border-[#E5E8EC] bg-[#F7F8FA] text-center text-[10px] text-[#94A3B8]">1</td>
            {d.cols.map((c) => <td key={c} className="whitespace-nowrap border border-[#E5E8EC] bg-[#F7F8FA] px-[7px] py-[6px] text-[10.5px] font-semibold text-[#64748B]">{c}</td>)}
          </tr>
          {d.rows.map((r, i) => (
            <tr key={i}>
              <td className="border border-[#E5E8EC] bg-[#F7F8FA] text-center text-[10px] text-[#94A3B8]">{i + 2}</td>
              {r.c.map((c, k) => (
                <td key={k} className={`whitespace-nowrap border border-[#E5E8EC] px-[7px] py-[6px] ${r.mark === "r" && k < 4 ? "bg-[#FEE2E2] font-semibold text-[#B91C1C]" : r.mark === "y" && k < 2 ? "bg-[#FEF9C3] text-[#334155]" : c.includes("?") ? "text-[#94A3B8]" : "text-[#334155]"}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Note({ text, b, tone }: { text: string; b: Box; tone: "y" | "p" | "g" }) {
  const bg = tone === "y" ? "#FDE68A" : tone === "p" ? "#FBCFE8" : "#BBF7D0";
  return (
    <div style={pos(b, { background: bg, boxShadow: "0 14px 26px -14px rgba(0,0,0,0.35)" })} className="w-[150px] px-3.5 pb-[18px] pt-3.5 text-[14px] font-medium leading-[1.3] text-[#3F3A2E]">
      <span className="absolute -top-2 left-1/2 block h-4 w-[46px] -translate-x-1/2 -rotate-3 bg-white/55" />
      {text}
    </div>
  );
}

function Inbox({ d, b, show, tick }: { d: Content; b: Box; show: number; tick: number }) {
  const items = Array.from({ length: show }, (_, i) => {
    const n = tick - i;
    return { id: n, it: d.ntf[((n % d.ntf.length) + d.ntf.length) % d.ntf.length] };
  });
  return (
    <div style={pos(b)} className="flex flex-col gap-[7px]">
      <span className="absolute -right-2.5 -top-2.5 z-10 grid h-6 min-w-[24px] place-items-center rounded-full border-2 border-[#F6F4F0] bg-[#DC2626] px-1 text-[11px] font-bold tabular-nums text-white">{Math.min(99, 14 + tick)}</span>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map(({ id, it }) => {
          const a = APP[it.app];
          return (
            <motion.div key={id} layout initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: EASE }}
              style={{ boxShadow: "0 10px 24px -14px rgba(15,23,42,0.35)" }}
              className="flex items-start gap-2.5 rounded-[14px] border border-[#E7E5E0] bg-white/95 px-[11px] py-[9px]">
              <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[7px] text-white" style={{ background: a.bg }}><a.I size={14} /></span>
              <span className="min-w-0 flex-1">
                <span className="flex justify-between gap-2 text-[11.5px] font-semibold text-[#0F172A]">{it.t}<em className="not-italic font-medium text-[10.5px] text-[#94A3B8]">{it.w}</em></span>
                <span className="mt-px block truncate text-[11px] text-[#475569]">{it.m}</span>
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function Chat({ d, b }: { d: Content; b: Box }) {
  return (
    <div style={pos(b)} className="h-[220px] rounded-[14px] border border-[#E1DBD1] bg-[#EFEAE2] p-3">
      {d.chat.map((m, i) => (
        <span key={i} className={`mb-[7px] block max-w-[78%] rounded-[10px] px-[9px] py-1.5 text-[11.5px] leading-snug text-[#1F2937] ${i === 1 ? "ml-auto bg-[#D9FDD3]" : "bg-white"}`}>{m}</span>
      ))}
    </div>
  );
}

function Gantt({ d, b, compact, grow }: { d: Content; b: Box; compact: boolean; grow: boolean }) {
  const col = compact ? 76 : 108;
  return (
    <div style={pos(b, { boxShadow: CARD })} className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white">
      <div className="flex items-center justify-between border-b border-[#EEF2F6] px-4 py-[13px]">
        <span className="flex items-center gap-2 whitespace-nowrap text-[13.5px] font-semibold text-[#0F172A]"><CalendarDays size={15} className="text-[#DC2626]" />{d.cal}</span>
        {!compact && (
          <span className="flex gap-3 text-[11px] text-[#64748B]">
            {d.legend.map((l, i) => (
              <span key={l} className="flex items-center gap-1.5">
                <i className="block h-[9px] w-[9px] rounded-[3px]" style={{ background: i === 0 ? "#0F172A" : i === 1 ? "#16A34A" : "#CBD5E1" }} />{l}
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="grid text-[10.5px] tabular-nums" style={{ gridTemplateColumns: `${col}px repeat(${DAYS.length}, minmax(0, 1fr))` }}>
        <span className="border-b border-[#EEF2F6]" />
        {DAYS.map((x) => <span key={x} className={`border-b border-[#EEF2F6] py-[7px] text-center ${x === TODAY ? "font-bold text-[#DC2626]" : "text-[#94A3B8]"}`}>{x}</span>)}
        {d.fleet.map((v) => (
          <Row key={v.name} name={v.name} bars={v.bars} compact={compact} grow={grow} />
        ))}
      </div>
    </div>
  );
}

function Row({ name, bars, compact, grow }: { name: string; bars: Bar[]; compact: boolean; grow: boolean }) {
  return (
    <>
      <span className={`flex h-11 items-center whitespace-nowrap border-b border-[#F3F5F8] font-semibold text-[#0F172A] ${compact ? "px-2 text-[10.5px]" : "px-3.5 text-[11.5px]"}`}>{name}</span>
      {DAYS.map((x) => {
        const bar = bars.find((r) => r.from === x);
        const n = bar ? bar.to - bar.from + 1 : 0;
        return (
          <span key={x} className="relative h-11 border-b border-l border-[#F3F5F8]">
            {bar && (
              <motion.span
                initial={bar.kind === "g" ? { scaleX: 0 } : false}
                animate={bar.kind === "g" ? { scaleX: grow ? 1 : 0 } : undefined}
                transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
                className={`absolute left-0.5 top-[9px] z-[2] flex h-[26px] origin-left items-center overflow-hidden whitespace-nowrap rounded-[7px] px-2 text-[10.5px] font-semibold ${bar.kind === "n" ? "bg-[#0F172A] text-white" : bar.kind === "g" ? "bg-[#16A34A] text-white" : "text-[#64748B]"}`}
                style={{
                  width: `calc(${n * 100}% + ${n - 1}px - 4px)`,
                  background: bar.kind === "s" ? "repeating-linear-gradient(135deg,#E2E8F0 0 6px,#F1F5F9 6px 12px)" : undefined,
                  
                }}>
                {bar.label}
              </motion.span>
            )}
          </span>
        );
      })}
    </>
  );
}

function List({ d, b }: { d: Content; b: Box }) {
  return (
    <div style={pos(b)}>
      <div className="flex items-end justify-between">
        <span className="text-[19px] font-semibold tracking-[-0.02em] text-[#0F172A]">{d.list}</span>
        <span className="flex gap-1.5">
          {d.tabs.map((t, i) => <span key={t} className={`rounded-full border px-2.5 py-1 text-[10.5px] ${i === 1 ? "border-[#0F172A] bg-[#0F172A] text-white" : "border-[#E2E8F0] text-[#334155]"}`}>{t}</span>)}
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {d.bookings.map((r) => (
          <div key={r.car} className={`flex items-center justify-between gap-3 rounded-[12px] border px-3.5 py-3 text-[12px] ${r.fresh ? "border-[#86EFAC] bg-[#F0FDF4]" : "border-[#EEF2F6] bg-white"}`}>
            <span>
              <span className="flex items-center gap-2 text-[12.5px] font-semibold text-[#0F172A]">{r.car}{r.fresh && <em className="rounded-[5px] bg-[#FEF3C7] px-1.5 py-px text-[9.5px] font-bold not-italic uppercase text-[#B45309]">{d.fresh}</em>}</span>
              <span className="mt-0.5 block text-[11px] text-[#64748B]">{r.who}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="font-semibold tabular-nums text-[#0F172A]">{r.price}</span>
              <span className="inline-flex items-center gap-1 rounded-[7px] bg-[#DCFCE7] px-2 py-1 text-[10.5px] font-semibold text-[#15803D]"><Check size={11} strokeWidth={3} />{d.confirmed}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toast({ d, b, show }: { d: Content; b: Box; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.4, ease: EASE }}
          style={pos(b, { boxShadow: DEEP })} className="z-[4] flex items-start gap-[11px] rounded-[16px] bg-[#0F172A] py-[11px] pl-[11px] pr-4 text-white">
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-[#16A34A]"><Check size={16} strokeWidth={3} /></span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold">{d.okT}</span>
            <span className="mt-px block text-[11px] leading-snug text-[#94A3B8]">{d.okS}</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Canvas({ W, H, s, children }: { W: number; H: number; s: number; children: ReactNode }) {
  return <div aria-hidden className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${s})` }}>{children}</div>;
}

function Handle({ x, d, onKey, hint }: { x: MotionValue<number>; d: Content; onKey: (v: number) => void; hint: boolean }) {
  const left = useTransform(x, (v) => `${v}%`);
  const [now, setNow] = useState(Math.round(x.get()));
  useMotionValueEvent(x, "change", (v) => setNow(Math.round(v)));
  return (
    <motion.div className="pointer-events-none absolute inset-y-0 z-[6] w-0" style={{ left }}>
      <span className="absolute inset-y-0 -left-px w-0.5 bg-white" style={{ boxShadow: "0 0 0 1px rgba(15,23,42,0.08), 0 0 24px rgba(15,23,42,0.18)" }} />
      <button type="button" role="slider" aria-label={d.aria} aria-valuemin={3} aria-valuemax={97} aria-valuenow={now}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 20 : 5;
          const map: Record<string, number> = { ArrowLeft: now - step, ArrowRight: now + step, Home: 3, End: 97 };
          if (!(e.key in map)) return;
          e.preventDefault();
          onKey(map[e.key]);
        }}
        className="pointer-events-auto absolute left-0 top-1/2 grid h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-white text-[#0F172A] outline-none transition-transform focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2 active:scale-95"
        style={{ boxShadow: "0 0 0 1px rgba(15,23,42,0.1), 0 12px 28px -8px rgba(15,23,42,0.4)" }}>
        <ChevronsLeftRight size={22} />
      </button>
      <AnimatePresence>
        {hint && (
          <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="absolute left-0 top-[calc(50%+40px)] -translate-x-1/2 whitespace-nowrap rounded-[8px] bg-[#0F172A] px-2.5 py-1 text-[11.5px] font-semibold text-white">
            {d.drag}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RcCompare() {
  const { lang } = useLanguage();
  const d = T[lang === "en" ? "en" : "bs"];
  const reduce = useReducedMotion() ?? false;
  const box = useRef<HTMLDivElement>(null);
  const width = useWidth(box);
  const wide = useWide();
  const L = LAYOUT[wide ? "w" : "m"];
  const s = width ? width / L.W : 0;

  const x = useMotionValue(50);
  const clip = useTransform(x, (v) => `inset(0 0 0 ${v}%)`);
  const seen = useInView(box, { once: true, amount: 0.45 });
  const live = useInView(box, { amount: 0.2 });
  const [touched, setTouched] = useState(false);
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState(true);
  const dragging = useRef(false);
  const sweep = useRef<ReturnType<typeof animate> | null>(null);
  const touchedRef = useRef(false);

  useEffect(() => { if (!touchedRef.current) x.set(L.start); }, [L.start, x]);

  useEffect(() => {
    if (!seen || reduce || touchedRef.current) return;
    sweep.current = animate(x, [L.start, 76, 26, L.start], { duration: 2.8, delay: 0.6, times: [0, 0.36, 0.76, 1], ease: "easeInOut" });
    return () => sweep.current?.stop();
  }, [seen, reduce, x, L.start]);

  useEffect(() => {
    if (!live || reduce) return;
    const a = window.setInterval(() => setTick((v) => v + 1), 3200);
    let t = 0;
    const loop = (on: boolean) => {
      setToast(on);
      t = window.setTimeout(() => loop(!on), on ? 3800 : 1300);
    };
    loop(true);
    return () => { window.clearInterval(a); window.clearTimeout(t); };
  }, [live, reduce]);

  const take = () => {
    sweep.current?.stop();
    touchedRef.current = true;
    if (!touched) setTouched(true);
  };
  const place = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    x.set(Math.min(97, Math.max(3, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div ref={box}
      className="relative mx-auto aspect-[360/520] w-full max-w-[460px] touch-pan-y select-none overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white lg:aspect-[1100/420] lg:max-w-none lg:rounded-[28px]"
      style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 40px 80px -50px rgba(15,23,42,0.35)" }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        take();
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        if (e.pointerType === "mouse") place(e.clientX);
      }}
      onPointerMove={(e) => { if (dragging.current) place(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}>
      <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: s ? 1 : 0, background: "#F6F4F0", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 31px, rgba(15,23,42,0.035) 31px 32px)" }}>
        <Canvas W={L.W} H={L.H} s={s}>
          <Sheet d={d} b={L.xl} />
          {L.b && <Note text={d.notes[1]} b={L.b} tone="p" />}
          {L.chat && <Chat d={d} b={L.chat} />}
          {L.c && <Note text={d.notes[2]} b={L.c} tone="g" />}
          <Inbox d={d} b={L.ntf} show={L.show} tick={tick} />
          <span style={pos(L.dup, {})} className="z-[5] rounded-[7px] bg-[#DC2626] px-[9px] py-[5px] text-[11px] font-bold text-white">{d.dup}</span>
          <Note text={d.notes[0]} b={L.a} tone="y" />
        </Canvas>
      </div>
      <motion.div className="absolute inset-0 bg-white transition-opacity duration-500" style={{ clipPath: clip, opacity: s ? 1 : 0 }}>
        <Canvas W={L.W} H={L.H} s={s}>
          {L.list && <List d={d} b={L.list} />}
          <Gantt d={d} b={L.gantt} compact={!wide} grow={seen || reduce} />
          {L.chip && (
            <span style={pos(L.chip)} className="inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-[11px] py-1.5 text-[12px] font-semibold text-[#15803D]"><Check size={13} strokeWidth={3} />{d.chip}</span>
          )}
          <Toast d={d} b={L.ok} show={toast || reduce} />
        </Canvas>
      </motion.div>
      <span className="pointer-events-none absolute left-3 top-3.5 z-[5] inline-flex h-7 items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 text-[11.5px] font-semibold text-[#334155] lg:left-[18px] lg:top-[18px] lg:h-[30px] lg:text-[12.5px]">
        <i className="block h-[7px] w-[7px] rounded-full bg-[#DC2626]" />{d.old}
      </span>
      <span className="pointer-events-none absolute right-3 top-3.5 z-[5] inline-flex h-7 items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 text-[11.5px] font-semibold text-[#334155] lg:right-[18px] lg:top-[18px] lg:h-[30px] lg:text-[12.5px]">
        <i className="block h-[7px] w-[7px] rounded-full bg-[#16A34A]" />{d.neu}
      </span>
      <Handle x={x} d={d} hint={!touched} onKey={(v) => { take(); x.set(Math.min(97, Math.max(3, v))); }} />
    </div>
  );
}
