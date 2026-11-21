"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, X, Plus, CalendarClock, Wrench, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { COPY, type RcCopy } from "@/components/rjesenja/rentACarCopy";
import { RcForm } from "@/components/rjesenja/RcForm";
import { RcCompare } from "@/components/rjesenja/RcCompare";
import { SystemDemo } from "@/components/sections/SystemDemo";
import { Booking } from "@/components/sections/Booking";
import { Backdrop, Head, Fade, BrowserFrame, SOFT } from "@/components/ui/kit";
import { PricingBuilder } from "@/components/sections/PricingBuilder";

function Hero({ c }: { c: RcCopy }) {
  const h = c.hero;
  const cs = c.caseStudy;
  return (
    <section className="hero-light relative bg-white">
      <Backdrop>
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-28 sm:pt-32 lg:px-8 lg:pb-24">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
            <Fade>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12.5px] font-medium text-[#0F172A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> {h.eyebrow}
              </span>
              <h1 className="mt-6 text-[36px] font-semibold leading-[1.05] tracking-[-0.042em] text-[#0F172A] sm:text-[56px] lg:text-[48px] xl:text-[54px]" style={{ textWrap: "balance" }}>
                {h.h1a} <span className="block text-[#0F3554]">{h.h1b.replace(/-/g, "\u2011")}<span className="text-[#DC2626]">.</span></span>
              </h1>
            </Fade>
            <Fade delay={0.08}>
              <p className="max-w-xl text-[17px] text-[#475569]">{h.sub}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#upit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
                  {h.ctaPrimary} <ArrowRight size={16} />
                </a>
                <a href="#paketi" className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F9FAFB]">
                  {h.ctaSecondary}
                </a>
              </div>
            </Fade>
          </div>

          <Fade delay={0.12} className="mt-10 lg:mt-12">
            <RcCompare />
          </Fade>

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <ul className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6 lg:shrink-0 lg:flex-nowrap">
              {h.points.map((p) => (
                <li key={p} className="flex items-center gap-2 whitespace-nowrap text-[14px] text-[#334155]"><Check size={15} strokeWidth={2.5} className="text-[#16A34A]" /> {p}</li>
              ))}
            </ul>
            <a href="/maximum" className="group flex w-full items-center gap-5 rounded-[16px] border border-[#E5E7EB] bg-white/80 p-4 transition-colors hover:border-[#CBD5E1] lg:w-auto lg:min-w-0 lg:max-w-[520px]" style={{ boxShadow: SOFT }}>
              <span className="hidden shrink-0 border-r border-[#F1F5F9] pr-5 sm:block">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{cs.label}</span>
                <span className="mt-0.5 block text-[14px] font-semibold text-[#0F172A]">Maximum Rent a Car</span>
              </span>
              <dl className="grid flex-1 grid-cols-3 gap-3">
                {cs.stats.map((x) => (
                  <div key={x.l}>
                    <dd className="text-[18px] font-semibold tracking-tight text-[#0F172A] tabular-nums">{x.v}</dd>
                    <dt className="text-[11px] leading-snug text-[#64748B]">{x.l}</dt>
                  </div>
                ))}
              </dl>
              <ArrowUpRight size={16} className="shrink-0 text-[#94A3B8] transition-colors group-hover:text-[#0F172A]" />
            </a>
          </div>
        </div>
      </Backdrop>
    </section>
  );
}

function Difference({ c }: { c: RcCopy }) {
  const d = c.compare;
  const sides = [
    { tag: d.tabOld, title: d.stepsTitleOld, data: d.old, neu: false },
    { tag: d.tabNew, title: d.stepsTitleNew, data: d.neu, neu: true },
  ];
  return (
    <section id="razlika" className="relative bg-white scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Head label={d.label} h={d.heading1} accent={d.headingAccent} sub={d.sub} />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {sides.map((s) => (
            <Fade key={s.tag} className={`rounded-[20px] p-6 sm:p-8 ${s.neu ? "border-[1.5px] border-[#0F172A] bg-white" : "border border-[#E5E7EB] bg-[#F8FAFC]"}`}>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.neu ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#E2E8F0] text-[#475569]"}`}>{s.tag}</span>
              <p className="mt-4 text-[18px] font-semibold text-[#0F172A]">{s.title}</p>
              <ol className="mt-5 space-y-4">
                {s.data.steps.map((st, i) => (
                  <li key={st.t} className="flex gap-3.5">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${s.neu ? "bg-[#0F172A] text-white" : "bg-white text-[#64748B] border border-[#E5E7EB]"}`}>{i + 1}</span>
                    <span>
                      <span className="block text-[14.5px] font-semibold text-[#0F172A]">{st.t}</span>
                      <span className="block text-[13.5px] leading-relaxed text-[#64748B]">{st.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-[#E5E7EB] pt-6">
                {s.data.stats.map((x) => (
                  <div key={x.l}>
                    <dd className={`text-[20px] font-semibold tracking-tight ${s.neu ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>{x.v}</dd>
                    <dt className="text-[12.5px] leading-snug text-[#64748B]">{x.l}</dt>
                  </div>
                ))}
              </dl>
            </Fade>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[12.5px] leading-relaxed text-[#94A3B8]">{d.note}</p>
      </div>
    </section>
  );
}

function CaseStudy({ c }: { c: RcCopy }) {
  const s = c.caseStudy;
  return (
    <section id="case-study" className="relative bg-white scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Fade className="grid overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white lg:grid-cols-[1.1fr_1fr]">
          <div className="border-b border-[#E5E7EB] bg-[#F8FAFC] p-6 sm:p-9 lg:border-b-0 lg:border-r">
            <BrowserFrame url="maximum-rent.vercel.app">
              <span className="relative block aspect-[16/10]">
                <Image src="/portfolio/maximum-poslije.webp" alt={s.imageAlt} fill sizes="(max-width: 1024px) 100vw, 620px" quality={85} className="object-cover object-top" />
              </span>
            </BrowserFrame>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-9">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{s.label}</p>
            <h2 className="mt-3 text-[28px] leading-[1.15] font-semibold tracking-tight text-[#0F172A]">{s.heading1} <span className="text-[#0F3554]">{s.headingAccent}</span></h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#475569]">{s.desc}</p>
            <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-[#F1F5F9] py-5">
              {s.stats.map((x) => (
                <div key={x.l}>
                  <dd className="text-[22px] font-semibold tracking-tight text-[#0F172A] tabular-nums">{x.v}</dd>
                  <dt className="mt-0.5 text-[12px] leading-snug text-[#64748B]">{x.l}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[12.5px] text-[#94A3B8]">{s.note}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/maximum" className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-[14px] font-semibold text-white hover:bg-[#1E293B]">{s.caseLink} <ArrowRight size={15} /></a>
              <a href={s.ctaHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-5 py-3 text-[14px] font-semibold text-[#0F172A] hover:bg-[#F9FAFB]">{s.cta} <ArrowUpRight size={15} /></a>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );
}

function Packages({ c }: { c: RcCopy }) {
  const p = c.packages;
  const sp = p.support;
  const after = [
    { I: ShieldCheck, l: sp.freeLabel, price: sp.freePrice, per: sp.freePer, d: sp.freeDesc, x: "", free: true },
    { I: CalendarClock, l: sp.subLabel, price: sp.subPrice, per: sp.subPer, d: sp.subDesc, x: sp.subAnchor, free: false },
    { I: Wrench, l: sp.hourLabel, price: sp.hourPrice, per: sp.hourPer, d: sp.hourDesc, x: "", free: false },
  ];
  return (
    <section id="paketi" className="relative bg-white scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Head label={p.label} h={p.heading1} accent={p.headingAccent} />
        <div className="mt-12">
          <PricingBuilder embed fixed="rc" cta="#upit" id="rc-paketi" heading={false} />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[13px] text-[#64748B]">{p.note}</p>

        <div className="mx-auto mt-16 max-w-5xl">
          <p className="text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{p.afterHeading}</p>
          <h3 className="mt-3 text-center text-[26px] font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-[32px]">
            {p.afterTitle} <span className="text-[#16A34A]">{p.afterAccent}</span>
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-center text-[14.5px] leading-relaxed text-[#475569]">{p.afterSub}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {after.map(({ I, l, price, per, d, x, free }) => (
              <div key={l} className={`relative flex flex-col rounded-[20px] border p-6 ${free ? "border-[#86EFAC] bg-[#F0FDF4]" : "border-[#E5E7EB] bg-white"}`} style={{ boxShadow: SOFT }}>
                {free && <span className="absolute right-4 top-4 rounded-full bg-[#16A34A] px-2.5 py-0.5 text-[11px] font-semibold text-white">{p.defaultTag}</span>}
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${free ? "bg-[#16A34A] text-white" : "bg-[#EEF3F8] text-[#0F3554]"}`}><I size={18} /></span>
                <p className="mt-4 text-[14px] font-semibold text-[#0F172A]">{l}</p>
                <p className="mt-1 flex items-baseline gap-1"><span className={`text-[28px] font-semibold tracking-tight ${free ? "text-[#16A34A]" : "text-[#0F172A]"}`}>{price}</span><span className="text-[13px] text-[#64748B]">{per}</span></p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">{d}</p>
                {x && <p className="mt-1.5 text-[12.5px] text-[#94A3B8]">{x}</p>}
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-[12.5px] leading-relaxed text-[#64748B]">{sp.hostingNote}</p>
        </div>
      </div>
    </section>
  );
}

function Ownership({ c }: { c: RcCopy }) {
  const o = c.comparison;
  return (
    <section id="poredjenje" className="relative bg-white scroll-mt-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Head label={o.label} h={o.heading1} accent={o.headingAccent} sub={o.body} />
        <Fade className="mt-12 overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white" >
          <div className="grid grid-cols-2 border-b border-[#E5E7EB] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-[0.12em]">
            <p className="px-5 py-3.5 text-[#94A3B8] sm:px-6">{o.colA}</p>
            <p className="border-l border-[#E5E7EB] px-5 py-3.5 text-[#0F172A] sm:px-6">{o.colB}</p>
          </div>
          {o.rows.map((r) => (
            <div key={r.a} className="grid grid-cols-2 border-b border-[#F1F5F9] last:border-b-0">
              <p className="flex items-start gap-2.5 px-5 py-4 text-[14px] text-[#475569] sm:px-6"><X size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#94A3B8]" />{r.a}</p>
              <p className="flex items-start gap-2.5 border-l border-[#F1F5F9] px-5 py-4 text-[14px] font-medium text-[#0F172A] sm:px-6"><Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[#16A34A]" />{r.b}</p>
            </div>
          ))}
        </Fade>
      </div>
    </section>
  );
}

function Faq({ c }: { c: RcCopy }) {
  const f = c.faq;
  return (
    <section id="pitanja" className="relative bg-white scroll-mt-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Head label={f.label} h={f.heading1} accent={f.headingAccent} />
        <div className="mt-12 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
          {f.items.map((it) => (
            <details key={it.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16px] font-semibold text-[#0F172A] [&::-webkit-details-marker]:hidden">
                {it.q}
                <Plus size={18} className="shrink-0 text-[#64748B] transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="pb-5 pr-10 text-[15px] leading-relaxed text-[#475569]">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RentACarSections() {
  const { lang } = useLanguage();
  const c = COPY[lang === "en" ? "en" : "bs"];
  return (
    <main className="relative bg-white">
      <Hero c={c} />
      <Difference c={c} />
      <SystemDemo onPage />
      <CaseStudy c={c} />
      <Packages c={c} />
      <Ownership c={c} />
      <RcForm c={c} />
      <Faq c={c} />
      <Booking />
    </main>
  );
}
