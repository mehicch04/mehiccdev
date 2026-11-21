"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Gauge } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Booking } from "@/components/sections/Booking";
import { Backdrop, BrowserFrame, Fade, Lightbox, PhoneMockup, type ZoomState } from "@/components/ui/kit";
import { Actions, CATS, PROJECTS, Shot, StatusPill, T, name, type Cat, type L } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const on = () => setFine(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return fine;
}

function HeroMock({ lang, d, live }: { lang: L; d: (typeof T)["bs"]; live: boolean }) {
  const top = PROJECTS[0];
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 140, damping: 18 });
  const sy = useSpring(py, { stiffness: 140, damping: 18 });
  const ry = useTransform(sx, [-1, 1], [-14, -4]);
  const rx = useTransform(sy, [-1, 1], [5, -1]);
  const cx = useTransform(sx, [-1, 1], [-10, 10]);
  const cy = useTransform(sy, [-1, 1], [-8, 8]);

  return (
    <div ref={ref} className="relative pb-10 pr-2 [perspective:1400px] sm:pr-4"
         onPointerMove={(e) => {
           if (!live || e.pointerType !== "mouse") return;
           const r = ref.current!.getBoundingClientRect();
           px.set(((e.clientX - r.left) / r.width) * 2 - 1);
           py.set(((e.clientY - r.top) / r.height) * 2 - 1);
         }}
         onPointerLeave={() => { px.set(0); py.set(0); }}>
      <motion.a href={top.caseHref} aria-label={top.title} className="block [transform-style:preserve-3d]" style={{ rotateY: live ? ry : -9, rotateX: live ? rx : 3 }}>
        <BrowserFrame url={top.url}>
          <span className="relative block aspect-[16/10]">
            <Image src={top.desk!} alt={top.title} fill priority sizes="(max-width:1024px) 92vw, 600px" quality={85} className="object-cover object-top" />
          </span>
        </BrowserFrame>
      </motion.a>
      <motion.div className="absolute -bottom-2 right-0 w-[24%]" style={live ? { x: cx, y: cy } : undefined}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease: EASE }}>
        <PhoneMockup src={top.mob!} alt={top.title} sizes="(max-width:640px) 24vw, 160px" priority />
      </motion.div>
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
                  className="absolute -left-2 top-[16%] sm:-left-8">
        <div className="pf-float flex items-center gap-2.5 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 sm:px-3.5 sm:py-2.5" style={{ boxShadow: "0 18px 36px -18px rgba(15,23,42,.35)" }}>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#DCFCE7] text-[#16A34A] sm:h-8 sm:w-8"><Check size={15} /></span>
          <span className="text-[11.5px] leading-tight sm:text-[12.5px]">
            <b className="block font-semibold text-[#0F172A]">{lang === "en" ? "Booking confirmed" : "Rezervacija potvrđena"}</b>
            <span className="text-[#64748B]">VW Passat · 3 {lang === "en" ? "days" : "dana"}</span>
          </span>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
                  className="absolute bottom-[20%] -left-1 sm:-left-6">
        <div className="pf-float flex items-center gap-2.5 rounded-2xl bg-[#0F172A] px-3 py-2 text-white sm:px-3.5 sm:py-2.5" style={{ animationDelay: "1.4s", boxShadow: "0 18px 36px -18px rgba(15,23,42,.5)" }}>
          <Gauge size={17} className="text-[#4ADE80]" />
          <span className="text-[11.5px] leading-tight sm:text-[12.5px]"><b className="block font-semibold tabular-nums">{d.proofV}</b><span className="text-[#94A3B8]">{d.proof}</span></span>
        </div>
      </motion.div>
    </div>
  );
}

export function PortfolioPage() {
  const { lang: raw } = useLanguage();
  const lang: L = raw === "en" ? "en" : "bs";
  const d = T[lang];
  const reduce = useReducedMotion() ?? false;
  const fine = useFinePointer();
  const live = fine && !reduce;

  const [zoom, setZoom] = useState<ZoomState>(null);
  const close = useCallback(() => setZoom(null), []);
  const [cat, setCat] = useState<Cat>("all");
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const rows = useRef<Record<string, HTMLDivElement | null>>({});

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 300, damping: 30, mass: 0.6 });
  const y = useSpring(my, { stiffness: 300, damping: 30, mass: 0.6 });
  const vx = useMotionValue(0);
  const tilt = useSpring(useTransform(vx, [-40, 40], [-9, 5]), { stiffness: 200, damping: 20 });

  const counts = useMemo(() => {
    const c: Record<Cat, number> = { all: PROJECTS.length, app: 0, web: 0, design: 0, product: 0 };
    PROJECTS.forEach((p) => { c[p.cat] += 1; });
    return c;
  }, []);
  const shown = PROJECTS.filter((p) => cat === "all" || p.cat === cat);
  const hp = hover ? PROJECTS.find((p) => p.id === hover) ?? null : null;

  const toggle = (id: string) => {
    const next = open === id ? null : id;
    setOpen(next);
    setHover(null);
    if (next) {
      window.setTimeout(() => {
        const el = rows.current[next];
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top < 80 || r.top > window.innerHeight * 0.55) {
          window.scrollTo({ top: window.scrollY + r.top - 96, behavior: reduce ? "auto" : "smooth" });
        }
      }, 60);
    }
  };

  return (
    <main className="relative bg-white">
      <section className="hero-light relative">
        <Backdrop>
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-14 pt-28 sm:pb-16 sm:pt-36 lg:grid-cols-[1fr_1.1fr] lg:px-8">
            <Fade>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12.5px] font-medium text-[#0F172A]">
                <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-60 motion-reduce:hidden" /><span className="relative h-1.5 w-1.5 rounded-full bg-[#16A34A]" /></span>
                {d.eyebrow} · {PROJECTS.length} {d.projects}
              </span>
              <h1 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.035em] text-[#0F172A] sm:text-[50px]" style={{ textWrap: "balance" }}>
                {d.h1} <span className="text-[#0F3554]">{d.h1b}</span>
              </h1>
              <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#475569] sm:text-[16.5px]">{d.k1}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#projekti" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1E293B]">
                  {d.ctaSecondary} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </a>
                <a href="#zakazi" className="inline-flex items-center justify-center rounded-xl bg-[#DC2626] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">{d.ctaPrimary}</a>
              </div>
            </Fade>
            <Fade delay={0.1}><HeroMock lang={lang} d={d} live={live} /></Fade>
          </div>
        </Backdrop>
      </section>

      <section id="projekti" className="strip mx-auto max-w-6xl scroll-mt-20 px-6 pb-24 pt-8 sm:pt-10 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#0F172A] pb-4">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-[32px]">
            {d.all} <sup className="text-[14px] tabular-nums text-[#94A3B8]">{shown.length}</sup>
          </h2>
          <p className="text-[13px] text-[#64748B]">{fine ? d.hover : d.tap}</p>
        </div>

        <div className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          <LayoutGroup id="pf-cats">
            <ul className="flex w-max gap-1.5 py-4" role="tablist" aria-label={d.all}>
              {CATS.map((c) => {
                const on = cat === c;
                return (
                  <li key={c}>
                    <button type="button" role="tab" aria-selected={on} disabled={counts[c] === 0}
                            onClick={() => { setCat(c); setOpen(null); }}
                            className={`relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors disabled:opacity-40 ${on ? "text-white" : "text-[#475569] hover:text-[#0F172A]"}`}>
                      {on && <motion.span layoutId="pf-pill" className="absolute inset-0 rounded-full bg-[#0F172A]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                      <span className="relative">{d.cats[c]}</span>
                      <span className={`relative rounded-full px-1.5 text-[11px] tabular-nums ${on ? "bg-white/15 text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>{counts[c]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>
        </div>

        <div className="hidden grid-cols-[64px_1.6fr_1fr_1fr_120px_40px] gap-4 border-b border-[#E5E7EB] py-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8] lg:grid">
          <span>#</span><span>{d.colP}</span><span>{d.colT}</span><span>{d.colI}</span><span>{d.colS}</span><span />
        </div>

        <div ref={list} className="relative"
             onPointerMove={(e) => {
               if (!live) return;
               const r = list.current!.getBoundingClientRect();
               const nx = e.clientX - r.left;
               const ny = e.clientY - r.top;
               if (!hover) {
                 x.jump(nx);
                 y.jump(ny);
                 vx.set(0);
               } else {
                 vx.set(nx - mx.get());
               }
               mx.set(nx);
               my.set(ny);
             }}
             onPointerLeave={() => setHover(null)}>
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => {
              const on = open === p.id;
              const dim = live && hover !== null && hover !== p.id && open === null;
              return (
                <motion.div key={p.id} layout={!reduce} ref={(el) => { rows.current[p.id] = el; }}
                            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : Math.min(i, 5) * 0.06, ease: EASE }}
                            className="relative border-b border-[#E5E7EB]">
                  <span aria-hidden className={`pointer-events-none absolute inset-y-0 -left-3 -right-3 origin-left rounded-2xl bg-[#F4F7FB] sm:-left-5 sm:-right-5 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${on ? "scale-x-100" : "scale-x-0"}`} />
                  <button type="button" onClick={() => toggle(p.id)} aria-expanded={on} aria-controls={`pf-${p.id}`}
                          onPointerEnter={(e) => {
                            if (e.pointerType !== "mouse") return;
                            if (live && !hover) {
                              const r = list.current!.getBoundingClientRect();
                              const nx = e.clientX - r.left;
                              const ny = e.clientY - r.top;
                              mx.set(nx); my.set(ny); x.jump(nx); y.jump(ny); vx.set(0);
                            }
                            setHover(p.id);
                          }}
                          onFocus={() => setHover(null)}
                          className={`group relative grid w-full grid-cols-[32px_1fr_auto] items-center gap-3 py-5 text-left transition-opacity duration-300 sm:grid-cols-[40px_1fr_auto] sm:gap-4 sm:py-6 lg:grid-cols-[64px_1.6fr_1fr_1fr_120px_40px] lg:py-7 ${dim ? "opacity-40" : "opacity-100"}`}>
                    <span className={`text-[13px] font-semibold tabular-nums transition-colors ${on ? "text-[#DC2626]" : "text-[#94A3B8] group-hover:text-[#0F172A]"}`}>{String(PROJECTS.indexOf(p) + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[20px] font-semibold tracking-[-0.02em] text-[#0F172A] transition-transform duration-300 ease-out group-hover:translate-x-2 sm:text-[28px] lg:text-[30px]">{name(p, lang)}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-2 lg:hidden">
                        <StatusPill s={p.status} d={d} />
                        <span className="text-[12.5px] text-[#64748B]">{p.type[lang]} · {p.industry[lang]}</span>
                      </span>
                    </span>
                    <span className="hidden text-[14px] text-[#475569] lg:block">{p.type[lang]}</span>
                    <span className="hidden text-[14px] text-[#475569] lg:block">{p.industry[lang]}</span>
                    <span className="hidden lg:block"><StatusPill s={p.status} d={d} /></span>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-300 ${on ? "rotate-90 border-[#0F172A] bg-[#0F172A] text-white" : "border-[#E5E7EB] text-[#0F172A] group-hover:border-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white"}`}>
                      <ArrowUpRight size={15} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div id={`pf-${p.id}`} key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE }} className="relative overflow-hidden">
                        <div className="grid gap-8 pb-10 sm:pl-14 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:pl-[80px]">
                          <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.1, ease: EASE }}
                                      className="rounded-[22px] px-5 pb-12 pt-6 sm:px-8 sm:pt-7" style={{ background: `linear-gradient(150deg, ${p.accent}, #0F172A)` }}>
                            <Shot p={p} d={d} onZoom={setZoom} sizes="(max-width:1024px) 90vw, 560px" />
                          </motion.div>
                          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.2, ease: EASE }} className="flex flex-col">
                            <p className="text-[15.5px] leading-relaxed text-[#334155]">{p.desc[lang]}</p>
                            {p.stats && (
                              <dl className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
                                {p.stats.map((s, k) => (
                                  <motion.div key={s.v} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.3 + k * 0.08, ease: EASE }}
                                              className="rounded-2xl bg-white p-3 ring-1 ring-[#E5E7EB] sm:p-3.5">
                                    <dd className="text-[18px] font-semibold tabular-nums text-[#0F172A] sm:text-[19px]">{s.v}</dd>
                                    <dt className="mt-0.5 text-[11px] leading-snug text-[#64748B] sm:text-[11.5px]">{s.l[lang]}</dt>
                                  </motion.div>
                                ))}
                              </dl>
                            )}
                            <ul className="mt-5 flex flex-wrap gap-1.5">
                              {p.scope[lang].map((s) => <li key={s} className="rounded-full bg-[#EEF3F8] px-2.5 py-1 text-[11.5px] font-medium text-[#0F3554]">{s}</li>)}
                            </ul>
                            <div className="mt-auto pt-7"><Actions p={p} d={d} /></div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {shown.length === 0 && <p className="py-16 text-center text-[15px] text-[#64748B]">{d.empty}</p>}

          {live && (
            <motion.div aria-hidden style={{ x, y, rotate: tilt }} className="pointer-events-none absolute left-0 top-0 z-20">
              <AnimatePresence>
                {hp && open === null && (
                  <motion.div key="pf-prev" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.18, ease: EASE }}
                              className="w-[300px] -translate-y-1/2 translate-x-8 overflow-hidden rounded-2xl border-[3px] border-white"
                              style={{ boxShadow: "0 30px 60px -24px rgba(15,23,42,.5)", background: hp.accent }}>
                    <span className="relative block aspect-[16/10]">
                      {PROJECTS.map((q) => (
                        <span key={q.id} className={`absolute inset-0 transition-opacity duration-200 ${q.id === hp.id ? "opacity-100" : "opacity-0"}`} style={{ background: q.accent }}>
                          {q.desk
                            ? <Image src={q.desk} alt="" fill sizes="300px" className="object-cover object-top" />
                            : <span className="grid h-full place-items-center text-[13px] font-semibold text-white/80">{d.soon}</span>}
                        </span>
                      ))}
                    </span>
                    <span className="flex items-center justify-between bg-white px-3 py-2 text-[11.5px] font-semibold text-[#0F172A]">
                      {name(hp, lang)} <span className="inline-flex items-center gap-1 text-[#DC2626]">{d.open} <ArrowUpRight size={12} /></span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <Fade>
          <a href="/kontakt" className="group relative mt-14 flex items-center justify-between gap-6 overflow-hidden rounded-[22px] bg-[#0F172A] p-7 text-white sm:p-9">
            <span aria-hidden className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-[#13203A] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100" />
            <div className="relative">
              <p className="text-[21px] font-semibold tracking-tight sm:text-[26px]">{d.nextTitle}</p>
              <p className="mt-1.5 text-[14px] text-[#94A3B8] sm:text-[14.5px]">{d.nextSub}</p>
            </div>
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#DC2626] transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-105"><ArrowRight size={18} /></span>
          </a>
        </Fade>
      </section>

      <Booking />
      <Lightbox zoom={zoom} onClose={close} closeLabel={d.close} />
    </main>
  );
}
