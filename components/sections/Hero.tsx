"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Globe, Instagram, Mail, MessageCircle, Mouse, Reply, Send, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { DRAW_A, DRAW_D, DRAW_T, GLINTS, SIL, STARS, TRAIL } from "@/components/sections/heroScene";
import { Logo } from "@/components/ui/Logo";

type Lang = "bs" | "en";
type Src = "wa" | "ig" | "web" | "viber" | "mail";
type Out = "ck" | "send" | "reply";
type Text = { msg: string; title: string; a: string; b: string; steps: [string, string, string] };
type Copy = {
  know: string; knowLong: string; about: string;
  status: string; city: string;
  h1a: string; h1b: string; h1u: string;
  sub: string; cta: string; cta2: string;
  meta: string; year: string;
  incoming: string; customers: string; system: string;
  onBridge: (n: number) => string; handled: (n: number) => string;
  hint: string; hintTouch: string; now: string; tap: string;
  quote: [string, string];
  src: Record<Src, string>;
  items: Text[];
};
type Row = { id: number; i: number; time: string };
type Tok = { t: number; prev: number; ok: boolean; tin: number; tout: number };

const T: Record<Lang, Copy> = {
  bs: {
    status: "Dostupni za nove projekte", city: "Mostar", know: "Iskustvo iz SAD i Japana", knowLong: "Iskustvo iz New Yorka, LA, San Diega i Yokohame", about: "O nama",
    h1a: "Vašem biznisu ne treba sajt.", h1b: "Treba mu", h1u: "most do kupaca",
    sub: "Pravimo web aplikacije koje primaju upite sa svih strana i pretvaraju ih u potvrđene rezervacije. I u ponoć, i nedjeljom.",
    cta: "Besplatne konsultacije", cta2: "Pogledajte radove",
    meta: "Stari most", year: "1566.",
    incoming: "Dolazni upit", customers: "Vaši kupci", system: "Vaš sistem",
    onBridge: (n) => `${n} ${n === 1 ? "upit" : "upita"} na mostu`,
    handled: (n) => `${n} obrađeno danas`,
    hint: "Pređite mišem preko ikonice na mostu", hintTouch: "Dodirnite ikonicu na mostu",
    now: "Upravo na mostu", tap: "Dodirnite ikonicu",
    quote: ["„", "“"],
    src: { wa: "WhatsApp", ig: "Instagram", web: "Sajt", viber: "Viber", mail: "Email" },
    items: [
      { msg: "Je li Golf slobodan za vikend?", title: "Rezervacija potvrđena", a: "VW Golf 8 · 14. do 17. jula", b: "285 KM",
        steps: ["Upit primljen", "Termin upisan u kalendar", "Potvrda poslana na email i WhatsApp"] },
      { msg: "Koja je cijena za 7 dana?", title: "Ponuda poslana", a: "Škoda Octavia · 7 dana", b: "450 KM",
        steps: ["Upit primljen", "Cijena izračunata za 7 dana", "Ponuda poslana u poruke"] },
      { msg: "Rezervacija: VW Passat, 3 dana", title: "Rezervacija potvrđena", a: "VW Passat · 20. do 23. jula", b: "330 KM",
        steps: ["Rezervacija sa sajta", "Termin upisan u kalendar", "Potvrda poslana na email"] },
      { msg: "Imate li dječiju sjedalicu?", title: "Odgovoreno", a: "Audi A4 Avant · 18. jula", b: "+ dječija sjedalica",
        steps: ["Upit primljen", "Odgovor poslan kupcu", "Sjedalica dodana uz rezervaciju"] },
      { msg: "Upit za firmu, auto na 10 dana", title: "Ponuda poslana", a: "Toyota RAV4 · 10 dana", b: "1.150 KM",
        steps: ["Upit primljen", "Ponuda napravljena", "Ponuda poslana na email kao PDF"] },
    ],
  },
  en: {
    status: "Available for new projects", city: "Mostar", know: "Experience from the US and Japan", knowLong: "Experience from New York, LA, San Diego and Yokohama", about: "About us",
    h1a: "Your business doesn't need a website.", h1b: "It needs", h1u: "a bridge to customers",
    sub: "We build web apps that take inquiries from every channel and turn them into confirmed bookings. At midnight and on Sundays, too.",
    cta: "Free consultation", cta2: "See our work",
    meta: "Stari Most", year: "1566",
    incoming: "New inquiry", customers: "Your customers", system: "Your system",
    onBridge: (n) => `${n} on the bridge`,
    handled: (n) => `${n} handled today`,
    hint: "Hover an icon on the bridge", hintTouch: "Tap an icon on the bridge",
    now: "On the bridge right now", tap: "Tap an icon",
    quote: ["“", "”"],
    src: { wa: "WhatsApp", ig: "Instagram", web: "Website", viber: "Viber", mail: "Email" },
    items: [
      { msg: "Is the Golf free this weekend?", title: "Booking confirmed", a: "VW Golf 8 · July 14 to 17", b: "€145",
        steps: ["Inquiry received", "Dates added to the calendar", "Confirmation sent by email and WhatsApp"] },
      { msg: "What's the price for 7 days?", title: "Quote sent", a: "Škoda Octavia · 7 days", b: "€230",
        steps: ["Inquiry received", "Price calculated for 7 days", "Quote sent in messages"] },
      { msg: "Booking: VW Passat, 3 days", title: "Booking confirmed", a: "VW Passat · July 20 to 23", b: "€170",
        steps: ["Booked on the website", "Dates added to the calendar", "Confirmation sent by email"] },
      { msg: "Do you have a child seat?", title: "Answered", a: "Audi A4 Avant · July 18", b: "+ child seat",
        steps: ["Inquiry received", "Reply sent to the customer", "Child seat added to the booking"] },
      { msg: "Company inquiry, a car for 10 days", title: "Quote sent", a: "Toyota RAV4 · 10 days", b: "€590",
        steps: ["Inquiry received", "Quote prepared", "Quote emailed as a PDF"] },
    ],
  },
};

const SRC: Record<Src, { c: string; I: LucideIcon }> = {
  wa: { c: "#25D366", I: MessageCircle },
  ig: { c: "#C13584", I: Instagram },
  web: { c: "#2563EB", I: Globe },
  viber: { c: "#7360F2", I: MessageCircle },
  mail: { c: "#64748B", I: Mail },
};
const OUT: Record<Out, LucideIcon> = { ck: Check, send: Send, reply: Reply };
const ITEMS: { src: Src; who: string; out: Out }[] = [
  { src: "wa", who: "Amar H.", out: "ck" },
  { src: "ig", who: "lejla.k", out: "send" },
  { src: "web", who: "Kenan M.", out: "ck" },
  { src: "viber", who: "Ivana S.", out: "reply" },
  { src: "mail", who: "Marko P.", out: "send" },
];

const FRAMES = { m: { x: -262, y: -282, w: 560, h: 345 }, d: { x: -470, y: -340, w: 940, h: 403 } };
const CYCLE = 19000;
const START = 5200;
const MIN = 60000;
const EASE = [0.22, 1, 0.36, 1] as const;

const PATH: [number, number][] = (() => {
  const p: [number, number][] = [[-171, -184], [-152, -198], [-12, -225.63]];
  for (let k = 1; k <= 16; k++) {
    const t = k / 16;
    const u = 1 - t;
    p.push([24 * t - 12, u * u * -225.63 + 2 * u * t * -228 + t * t * -225.63]);
  }
  p.push([152, -198], [171, -184]);
  return p;
})();
const CUM = PATH.map((_, i) => i).reduce<number[]>((acc, i) => {
  acc.push(i ? acc[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]) : 0);
  return acc;
}, []);
const LEN = CUM[CUM.length - 1];

function pointAt(t: number): [number, number] {
  const d = t * LEN;
  let i = 1;
  while (i < CUM.length - 1 && CUM[i] < d) i++;
  const k = (d - CUM[i - 1]) / (CUM[i] - CUM[i - 1] || 1);
  return [PATH[i - 1][0] + (PATH[i][0] - PATH[i - 1][0]) * k, PATH[i - 1][1] + (PATH[i][1] - PATH[i - 1][1]) * k];
}

let fmt: Intl.DateTimeFormat | null = null;
function clock(ms: number) {
  if (!fmt) fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Sarajevo" });
  return fmt.format(new Date(ms));
}
function minutesToday(ms: number) {
  const [h, m] = clock(ms).split(":").map(Number);
  return h * 60 + m;
}

function Step({ state, text }: { state: "d" | "r" | "w"; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-[12px] ${state === "r" ? "font-semibold text-[#1D4ED8]" : state === "w" ? "text-[#94A3B8]" : "text-[#334155]"}`}>
      {state === "d" ? (
        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#16A34A] text-white"><Check size={10} strokeWidth={3.4} /></span>
      ) : state === "r" ? (
        <span className="most-spin h-4 w-4 shrink-0 rounded-full border-2 border-[#BFDBFE] border-t-[#2563EB]" />
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-full border-[1.5px] border-[#CBD5E1]" />
      )}
      <span className="min-w-0">{text}</span>
    </div>
  );
}

function Info({ i, ok, tin, tout, d }: { i: number; ok: boolean; tin: string; tout: string; d: Copy }) {
  const it = ITEMS[i];
  const tx = d.items[i];
  const S = SRC[it.src].I;
  const O = OUT[it.out];
  return (
    <>
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-white" style={{ background: ok ? "#16A34A" : SRC[it.src].c }}>
          {ok ? <O size={16} strokeWidth={2.4} /> : <S size={16} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold tracking-[-0.01em] text-[#0F172A]">{ok ? tx.title : `${d.incoming} · ${d.src[it.src]}`}</span>
          <span className="mt-px block text-[11.5px] text-[#64748B]">{it.who}{ok ? ` · ${d.src[it.src]}` : ""}</span>
        </span>
        <time className="self-start text-[11.5px] tabular-nums text-[#94A3B8]">{ok ? tout : tin}</time>
      </div>
      {ok ? (
        <div className="mt-2.5 text-[13px] leading-[1.45]">
          <span className="block font-semibold text-[#0F172A]">{tx.a}</span>
          <span className="font-bold text-[#15803D]">{tx.b}</span>
        </div>
      ) : (
        <div className="mt-2.5 text-[13px] leading-[1.45] text-[#334155]">{d.quote[0]}{tx.msg}{d.quote[1]}</div>
      )}
      <div className="mt-3 grid gap-[7px] border-t border-[#EEF2F6] pt-2.5">
        <Step state="d" text={`${tx.steps[0]} · ${tin}`} />
        <Step state={ok ? "d" : "r"} text={tx.steps[1]} />
        <Step state={ok ? "d" : "w"} text={tx.steps[2]} />
      </div>
    </>
  );
}

function Feed({ side, title, badge, rows, d }: { side: "l" | "r"; title: string; badge: React.ReactNode; rows: Row[]; d: Copy }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: side === "l" ? 0 : 0.12, ease: EASE }}
         className={`absolute bottom-[84px] z-10 hidden w-[244px] overflow-hidden rounded-[16px] border border-white/[0.14] bg-[#070C18]/[0.86] xl:block 2xl:w-[256px] ${side === "l" ? "left-10 2xl:left-16" : "right-10 2xl:right-16"}`}
         style={{ boxShadow: "0 24px 48px -20px rgba(0,0,0,0.8)" }}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.1] bg-white/[0.02] px-3 py-2.5">
        <span className="whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#8A9AB2]">{title}</span>
        <span className="flex items-center gap-1.5 whitespace-nowrap text-[11.5px] font-semibold text-[#4ADE80]">{badge}</span>
      </div>
      <div className="relative h-[165px] overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((r, idx) => {
            const it = ITEMS[r.i];
            const tx = d.items[r.i];
            const I = side === "l" ? SRC[it.src].I : OUT[it.out];
            return (
              <motion.div key={r.id} layout="position"
                          initial={{ opacity: 0, y: -18, backgroundColor: "rgba(74,222,128,0.10)" }}
                          animate={{ opacity: 1, y: 0, backgroundColor: "rgba(74,222,128,0)" }}
                          exit={{ opacity: 0, y: 10, transition: { duration: 0.5, ease: EASE } }}
                          transition={{ duration: 0.9, ease: EASE, opacity: { duration: 0.7, delay: 0.15 }, backgroundColor: { duration: 3 }, layout: { duration: 0.9, ease: EASE } }}
                          className={`flex h-[55px] items-center gap-2.5 px-3 ${idx > 0 ? "border-t border-white/[0.07]" : ""}`}>
                <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[8px] text-white" style={{ background: side === "l" ? SRC[it.src].c : "#16A34A" }}>
                  <I size={13} strokeWidth={2.4} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-2 whitespace-nowrap text-[12px] font-semibold text-[#F1F5F9]">
                    {side === "l" ? it.who : tx.title}
                    <span className="text-[10.5px] font-medium tabular-nums text-[#64748B]">{r.time}</span>
                  </span>
                  <span className="mt-px block truncate text-[11.5px] text-[#94A3B8]">{side === "l" ? tx.msg : tx.a}</span>
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function Hero() {
  const { lang } = useLanguage();
  const L: Lang = lang === "en" ? "en" : "bs";
  const d = T[L];

  const section = useRef<HTMLElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLButtonElement | null)[]>([]);
  const toks = useRef<Tok[]>(ITEMS.map(() => ({ t: 0, prev: -1, ok: false, tin: 0, tout: 0 })));
  const incRef = useRef(-1);
  const geo = useRef({ s: 1, ox: 0, oy: 0 });
  const paused = useRef(false);
  const visible = useRef(true);
  const acc = useRef(START);
  const live = useRef(0);
  const speed = useRef(1);
  const nextId = useRef(100);

  const [lit, setLit] = useState(false);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState("");
  const [left, setLeft] = useState<Row[]>([]);
  const [right, setRight] = useState<Row[]>([]);
  const [done, setDone] = useState(0);
  const [inc, setInc] = useState(0);
  const [tip, setTip] = useState<{ i: number; x: number; y: number; ax: number } | null>(null);
  const [sel, setSel] = useState(0);
  const [selOk, setSelOk] = useState(false);
  const [auto, setAuto] = useState(true);
  const [hinted, setHinted] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [fine, setFine] = useState(true);
  const pointer = useRef("mouse");

  const selRef = useRef(0);
  selRef.current = sel;

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const on = () => setFine(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.hasAttribute("data-most")) {
      setLit(true);
      return;
    }
    let id = 0;
    const start = () => {
      if (id) return;
      id = window.setTimeout(() => {
        try { sessionStorage.setItem("mehiccdev-intro", "1"); } catch {}
        html.removeAttribute("data-most");
        setLit(true);
      }, 1750);
    };
    if (!html.hasAttribute("data-map")) start();
    const mo = new MutationObserver(() => {
      if (!html.hasAttribute("data-most")) setLit(true);
      if (!html.hasAttribute("data-map")) start();
    });
    mo.observe(html, { attributes: true, attributeFilter: ["data-most", "data-map"] });
    return () => {
      window.clearTimeout(id);
      mo.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!lit) return;
    const id = window.setTimeout(() => setReady(true), reduce ? 0 : 1500);
    return () => window.clearTimeout(id);
  }, [lit, reduce]);

  useEffect(() => {
    const t0 = Date.now();
    setNow(clock(t0));
    setLeft([{ id: 1, i: 0, time: clock(t0 - 2 * MIN) }, { id: 2, i: 1, time: clock(t0 - 5 * MIN) }, { id: 3, i: 2, time: clock(t0 - 23 * MIN) }]);
    setRight([{ id: 4, i: 2, time: clock(t0 - MIN) }, { id: 5, i: 3, time: clock(t0 - 24 * MIN) }, { id: 6, i: 4, time: clock(t0 - 41 * MIN) }]);
    setDone(4 + Math.floor(minutesToday(t0) / 60));
    toks.current.forEach((k, i) => {
      const t = (START / CYCLE + i / ITEMS.length) % 1;
      k.tin = t0 - t * CYCLE;
      k.tout = k.tin + CYCLE / 2;
    });
    const id = window.setInterval(() => setNow(clock(Date.now())), 15000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const sec = section.current;
    const el = top.current;
    if (!sec || !el) return;
    const fit = () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        sec.style.removeProperty("--tb");
        return;
      }
      sec.style.setProperty("--tb", `${Math.round(el.offsetTop + el.offsetHeight + 28)}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    ro.observe(sec);
    return () => ro.disconnect();
  }, []);

  const measure = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const f = window.matchMedia("(min-width: 640px)").matches ? FRAMES.d : FRAMES.m;
    const s = Math.min(cw / f.w, ch / f.h);
    geo.current = { s, ox: (cw - f.w * s) / 2 - f.x * s, oy: ch - f.h * s - f.y * s };
  }, []);

  const place = useCallback((i: number) => {
    const el = box.current;
    if (!el) return null;
    const [x, y] = pointAt(toks.current[i].t);
    const g = geo.current;
    const px = g.ox + x * g.s;
    const py = g.oy + y * g.s;
    const w = 288;
    const lx = Math.max(12, Math.min(el.clientWidth - w - 12, px - w / 2));
    return { i, x: lx, y: py + 24, ax: px - lx };
  }, []);

  const draw = useCallback(() => {
    const g = geo.current;
    const base = acc.current / CYCLE;
    let n = 0;
    toks.current.forEach((k, i) => {
      const t = reduce ? (i / ITEMS.length + 0.1) % 1 : (base + i / ITEMS.length) % 1;
      const el = els.current[i];
      const [x, y] = pointAt(t);
      if (el) {
        el.style.transform = `translate3d(${(g.ox + x * g.s).toFixed(1)}px, ${(g.oy + y * g.s).toFixed(1)}px, 0)`;
        el.style.opacity = String(t < 0.05 ? t / 0.05 : t > 0.95 ? (1 - t) / 0.05 : 1);
      }
      const ok = t >= 0.5;
      const stamp = Date.now();
      if (k.prev >= 0 && k.prev > 0.9 && t < 0.1) {
        k.tin = stamp;
        setLeft((rows) => [{ id: nextId.current++, i, time: clock(stamp) }, ...rows.filter((r) => r.i !== i)].slice(0, 3));
      }
      if (k.prev >= 0 && k.prev < 0.96 && t >= 0.96) {
        setRight((rows) => [{ id: nextId.current++, i, time: clock(stamp) }, ...rows.filter((r) => r.i !== i)].slice(0, 3));
        setDone((v) => v + 1);
        live.current += 1;
      }
      if (ok !== k.ok) {
        k.ok = ok;
        if (ok && k.prev >= 0) k.tout = stamp;
        if (el) {
          if (ok) {
            el.setAttribute("data-ok", "");
            if (k.prev >= 0) {
              el.setAttribute("data-pop", "");
              window.setTimeout(() => el.removeAttribute("data-pop"), 500);
            }
          } else {
            el.removeAttribute("data-ok");
          }
        }
        if (i === selRef.current) setSelOk(ok);
      }
      if (!ok && t > 0.03) n++;
      k.prev = t;
      k.t = t;
    });
    if (incRef.current !== n) {
      incRef.current = n;
      setInc(n);
    }
  }, [reduce]);

  useEffect(() => {
    if (!ready) return;
    measure();
    draw();
    const ro = new ResizeObserver(() => {
      measure();
      draw();
      setTip(null);
    });
    if (box.current) ro.observe(box.current);
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.05 });
    if (section.current) io.observe(section.current);
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      if (!paused.current && visible.current && !reduce) {
        const target = live.current >= 10 ? 0.45 : 1;
        speed.current += (target - speed.current) * Math.min(1, dt / 2500);
        acc.current += dt * speed.current;
        draw();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [ready, reduce, measure, draw]);

  useEffect(() => {
    if (!ready || !auto || reduce) return;
    const id = window.setInterval(() => {
      if (!visible.current || window.matchMedia("(min-width: 1024px)").matches) return;
      const n = (selRef.current + 1) % ITEMS.length;
      setSel(n);
      setSelOk(toks.current[n].ok);
    }, 3800);
    return () => window.clearInterval(id);
  }, [ready, auto, reduce]);

  useEffect(() => {
    els.current.forEach((el, i) => {
      if (!el) return;
      if (i === sel && !window.matchMedia("(min-width: 1024px)").matches) el.setAttribute("data-on", "");
      else if (!tip || tip.i !== i) el.removeAttribute("data-on");
    });
  }, [sel, tip, ready]);

  const resumeAt = useRef(0);
  const pick = (i: number) => {
    setSel(i);
    setSelOk(toks.current[i].ok);
    setAuto(false);
    window.clearTimeout(resumeAt.current);
    resumeAt.current = window.setTimeout(() => setAuto(true), 9000);
  };

  const wide = () => window.matchMedia("(min-width: 1024px)").matches;
  const show = (i: number) => {
    if (!wide()) return;
    paused.current = true;
    els.current.forEach((el, j) => { if (el && j !== i) el.removeAttribute("data-on"); });
    els.current[i]?.setAttribute("data-on", "");
    setTip(place(i));
    setHinted(true);
  };
  const hide = () => {
    paused.current = false;
    els.current.forEach((el) => el?.removeAttribute("data-on"));
    setTip(null);
  };
  const tap = (i: number) => {
    if (!wide()) {
      pick(i);
      return;
    }
    if (pointer.current === "mouse") return;
    if (tip?.i === i) hide();
    else show(i);
  };

  useEffect(() => {
    if (!tip || fine) return;
    const off = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.(".most-tk")) hide();
    };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  });

  const k = toks.current;

  return (
    <section ref={section} data-hero aria-labelledby="hero-title"
             className="most-hero hero-light relative isolate flex flex-col overflow-hidden bg-[#0B1733] text-white lg:block lg:h-[100svh] lg:min-h-[680px] lg:max-h-[1180px]">
      <div aria-hidden className="most-brand absolute inset-x-0 top-[22%] z-20 flex flex-col items-center gap-3 lg:top-[26%]">
        <Logo variant="dark" mark className="h-[30px] w-auto sm:h-[36px]" markClassName="h-[40px] w-auto sm:h-[48px]" />
        <span className="text-[11px] uppercase tracking-[0.32em] text-[#94A3B8]">Mostar · 1566.</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[92px] z-10 hidden lg:block">
        <div className="most-in mx-auto max-w-7xl px-8 text-right text-[11px] uppercase leading-[1.9] tracking-[0.16em] text-[#64748B]" style={{ "--d": "0.5s" } as CSSProperties}>
          {d.meta} · <b className="font-semibold tracking-[0.08em] text-[#CBD5E1]">{d.year}</b>
          <br />
          {d.city} <b className="font-semibold tabular-nums tracking-[0.08em] text-[#CBD5E1]">{now || "     "}</b>
        </div>
      </div>

      <div ref={top} className="most-top relative z-10 order-1 mx-auto w-full max-w-5xl px-5 pt-[92px] sm:px-6 sm:text-center lg:pt-[96px]">
        <div className="most-in" style={{ "--d": "0.05s" } as CSSProperties}>
          <a href="/o-nama" className="group inline-flex h-8 items-center gap-2.5 rounded-full border border-white/[0.14] bg-[#050913]/40 pl-1.5 pr-3 text-[13px] font-medium text-[#CBD5E1] transition-colors duration-200 hover:border-white/30 hover:text-white">
            <span className="flex h-5 items-center gap-1 rounded-full bg-white/[0.08] px-1.5" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            </span>
            <span className="sm:hidden">{d.know}</span>
            <span className="hidden sm:inline">{d.knowLong}</span>
            <span className="flex items-center gap-1 border-l border-white/[0.14] pl-2.5 font-semibold text-white">
              {d.about}<ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </a>
        </div>
        <h1 id="hero-title" className={`most-h1 most-in mt-5 text-[40px] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-[54px] lg:leading-[1.02] lg:tracking-[-0.05em] ${L === "en" ? "lg:text-[56px]" : "lg:text-[62px]"}`}
            style={{ "--d": "0.12s" } as CSSProperties}>
          <span className="block text-[#9AABCA]">{d.h1a}</span>
          <span className="block">
            {d.h1b}{" "}
            <span className="relative whitespace-nowrap">
              {d.h1u}
              <span aria-hidden className="absolute inset-x-[2px] -bottom-[5px] h-[3px] rounded-full bg-[#DC2626]" />
            </span>
            .
          </span>
        </h1>
        <p className="most-in mt-5 max-w-[620px] text-[16px] text-[#C3CEE0] sm:mx-auto sm:text-[17px]" style={{ "--d": "0.22s", lineHeight: 1.6 } as CSSProperties}>
          {d.sub}
        </p>
        <div className="most-in mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center" style={{ "--d": "0.32s" } as CSSProperties}>
          <a href="#zakazi"
             className="cta-primary inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[14px] bg-[#DC2626] px-6 text-[15.5px] font-semibold text-white transition-colors duration-200 hover:bg-[#B91C1C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-[54px]"
            >
            {d.cta}
            <ArrowRight size={17} />
          </a>
          <a href="#portfolio"
             className="inline-flex h-[52px] items-center justify-center rounded-[14px] border border-white/20 px-6 text-[15.5px] font-semibold text-white transition-colors duration-200 hover:border-white/35 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-[54px]">
            {d.cta2}
          </a>
        </div>
      </div>

      <div ref={box} className="most-box order-2 mt-7 lg:mt-0">
        <Image src="/hero/most-sumrak.svg" alt="" width={1520} height={463} priority unoptimized draggable={false} className="most-img select-none" />
        <svg className="most-img" viewBox="-760 -400 1520 463" preserveAspectRatio="none" aria-hidden>
          <defs>
            <radialGradient id="most-glow" cx="0" cy="-40" r="250" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#F4B76A" stopOpacity="0.12" />
              <stop offset="1" stopColor="#F4B76A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect className="most-glow" x="-760" y="-280" width="1520" height="282" fill="url(#most-glow)" />
          <g className="most-sil" fill="#0B1733">
            {SIL.map((p) => <path key={p} d={p} />)}
          </g>
          {STARS.map(([x, y, r, dl]) => (
            <circle key={`${x}${y}`} className="most-tw" cx={x} cy={y} r={r} fill="#E8EEF7" style={{ animationDelay: `${dl}s` }} />
          ))}
          {GLINTS.map(([x, y, w, dl]) => (
            <path key={`${x}${y}`} className="most-gl" d={`M${x} ${y}h${w}`} stroke="#F2BD73" strokeWidth={1.6} strokeLinecap="round"
                  vectorEffect="non-scaling-stroke" style={{ animationDelay: `${dl}s` }} />
          ))}
          {DRAW_T.map((p, i) => (
            <path key={p} className="most-draw" d={p} pathLength={1} fill="none" stroke="#F4C27E" strokeWidth={1.4}
                  vectorEffect="non-scaling-stroke" style={{ "--d": `${0.55 + i * 0.12}s` } as CSSProperties} />
          ))}
          <path className="most-draw" d={DRAW_A} pathLength={1} fill="none" stroke="#FFD39A" strokeWidth={2.2} vectorEffect="non-scaling-stroke" />
          <path className="most-draw" d={DRAW_D} pathLength={1} fill="none" stroke="#FFD39A" strokeWidth={1.8} vectorEffect="non-scaling-stroke"
                style={{ "--d": "0.4s" } as CSSProperties} />
          <path className="most-trail" d={TRAIL} fill="none" stroke="#4ADE80" strokeWidth={1.6} strokeDasharray="1 6" strokeLinecap="round"
                vectorEffect="non-scaling-stroke" opacity={0.75} />
        </svg>

        <motion.div className="pointer-events-none absolute inset-0 z-[2]" initial={false} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.8 }}>
          {ITEMS.map((it, i) => {
            const S = SRC[it.src].I;
            const O = OUT[it.out];
            return (
              <button key={i} type="button" ref={(el) => { els.current[i] = el; }} tabIndex={ready ? 0 : -1}
                      aria-label={`${d.src[it.src]}, ${it.who}`} aria-describedby={tip?.i === i ? "most-tip" : undefined}
                      className="most-tk" style={{ "--c": SRC[it.src].c, "--ring": `${SRC[it.src].c}59`, pointerEvents: ready ? "auto" : "none" } as CSSProperties}
                      onPointerDown={(e) => { pointer.current = e.pointerType; }}
                      onPointerEnter={(e) => { if (e.pointerType === "mouse") show(i); }}
                      onPointerLeave={(e) => { if (e.pointerType === "mouse") hide(); }}
                      onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) show(i); }}
                      onBlur={() => { if (pointer.current !== "touch") hide(); }}
                      onClick={() => tap(i)}>
                <span className="dot">
                  <span className="a"><S size={15} strokeWidth={2.2} /></span>
                  <span className="b"><O size={15} strokeWidth={2.6} /></span>
                </span>
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {tip && (
            <motion.div key={tip.i} id="most-tip" role="tooltip"
                        initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.18, ease: EASE }}
                        className="pointer-events-none absolute left-0 top-0 z-30 w-[288px] rounded-[16px] bg-white p-3.5 text-[#0F172A]"
                        style={{ left: tip.x, top: tip.y, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.75)" }}>
              <span aria-hidden className="absolute -top-[6px] h-[13px] w-[13px] -translate-x-1/2 rotate-45 rounded-[2px] bg-white" style={{ left: tip.ax }} />
              <Info i={tip.i} ok={k[tip.i].ok} tin={clock(k[tip.i].tin)} tout={clock(k[tip.i].tout)} d={d} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {ready && (
        <>
          <Feed side="l" title={d.customers} rows={left} d={d}
                badge={<><span className="h-2 w-2 rounded-full bg-[#16A34A]" />{d.onBridge(inc)}</>} />
          <Feed side="r" title={d.system} rows={right} d={d}
                badge={<><Check size={12} strokeWidth={3} />{d.handled(done)}</>} />
        </>
      )}

      <AnimatePresence>
        {ready && !hinted && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                       className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[12px] text-[#8FA3BC] lg:inline-flex">
            <Mouse size={15} strokeWidth={1.8} />
            {fine ? d.hint : d.hintTouch}
          </motion.span>
        )}
      </AnimatePresence>

      <div className="relative z-10 order-3 mx-auto w-full max-w-md px-5 pb-9 pt-3 lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#8A9AB2]">{d.now}</span>
          <span className="text-[11.5px] text-[#64748B]">{d.tap}</span>
        </div>
        <div className="min-h-[178px] rounded-[16px] bg-white p-3.5 text-[#0F172A]">
          {ready ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${sel}${selOk ? "o" : "i"}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25, ease: EASE }}>
                <Info i={sel} ok={selOk} tin={clock(k[sel].tin)} tout={clock(k[sel].tout)} d={d} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="grid gap-3 py-1">
              <div className="race-sk h-8 w-2/3 rounded-[10px]" />
              <div className="race-sk h-4 w-5/6 rounded-md" />
              <div className="race-sk h-16 w-full rounded-[10px]" />
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {ITEMS.map((it, i) => (
            <button key={i} type="button" aria-label={`${d.src[it.src]}, ${it.who}`} onClick={() => pick(i)}
                    className={`h-[7px] rounded-full transition-[width,background-color] duration-300 ${i === sel ? "w-5 bg-white" : "w-[7px] bg-white/25"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
