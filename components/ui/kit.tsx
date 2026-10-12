"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock, ShieldCheck, Star, X, type LucideIcon } from "lucide-react";

export const SOFT  = "0 1px 2px rgba(15,23,42,0.04)";
export const LIFT  = "0 1px 2px rgba(15,23,42,0.06), 0 28px 56px -28px rgba(15,23,42,0.45)";
export const FLOAT = "0 1px 2px rgba(15,23,42,0.06), 0 18px 36px -18px rgba(15,23,42,0.28)";

export function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden"
         style={{ background: "linear-gradient(180deg, #D9E4F0 0%, #E7EEF6 34%, #F4F7FB 68%, #FFFFFF 100%)" }}>
      <div aria-hidden className="pointer-events-none absolute -left-[12%] top-0 h-[70%] w-[38%] -skew-x-[24deg] opacity-60"
           style={{ background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)" }} />
      <div aria-hidden className="pointer-events-none absolute right-[-8%] top-0 h-[60%] w-[26%] -skew-x-[24deg] opacity-50"
           style={{ background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35]"
           style={{
             backgroundImage: "linear-gradient(to right, rgba(15,53,84,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,53,84,0.06) 1px, transparent 1px)",
             backgroundSize: "56px 56px",
             maskImage: "linear-gradient(to bottom, black 0%, transparent 60%)",
             WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 60%)",
           }} />
      <div className="relative">{children}</div>
    </div>
  );
}

export function Head({ label, h, accent, sub, align = "center" }: {
  label: string; h: string; accent?: string; sub?: string; align?: "center" | "left";
}) {
  const c = align === "center";
  return (
    <div className={c ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{label}</p>
      <h2 className="mt-4 text-[32px] leading-[1.12] sm:text-[44px] font-semibold tracking-[-0.03em] text-[#0F172A]"
          style={{ textWrap: "balance" }}>
        {h}{accent && <> <span className="text-[#0F3554]">{accent}</span></>}
      </h2>
      {sub && <p className={`mt-5 text-[16px] leading-relaxed text-[#475569] ${c ? "mx-auto max-w-xl" : ""}`}>{sub}</p>}
    </div>
  );
}

export function Fade({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduce ? { duration: 0 } : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function BrowserFrame({ url, children }: { url?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white" style={{ boxShadow: FLOAT }}>
      <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" /><span className="h-2 w-2 rounded-full bg-[#E2E8F0]" />
        {url && <span className="ml-2 min-w-0 truncate text-[10.5px] text-[#94A3B8]">{url}</span>}
      </div>
      {children}
    </div>
  );
}

export type ZoomState = { src: string; alt: string; phone?: boolean } | null;

export function preloadImage(src: string) {
  if (typeof window === "undefined") return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function Lightbox({ zoom, onClose, closeLabel }: { zoom: ZoomState; onClose: () => void; closeLabel: string }) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setReady(false);
    if (!zoom) return;
    const html = document.documentElement;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    html.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); html.style.overflow = ""; };
  }, [zoom, onClose]);

  const show = (img: HTMLImageElement | null) => {
    if (!img) return;
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => setReady(true));
  };

  const setImg = (img: HTMLImageElement | null) => {
    imgRef.current = img;
    if (img && img.complete && img.naturalWidth) show(img);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {zoom && (
        <motion.div key="lightbox"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    onClick={onClose}
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/90 p-4 sm:p-8 cursor-zoom-out"
                    style={{ willChange: "opacity" }}>
          <button type="button" onClick={onClose} aria-label={closeLabel}
                  className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-xl border border-white/20 text-white/80 hover:text-white">
            <X size={18} />
          </button>
          {!ready && <span aria-hidden className="absolute h-7 w-7 animate-spin rounded-full border-2 border-white/25 border-t-white/80" />}
          <motion.img
            key={zoom.src}
            ref={setImg}
            src={zoom.src}
            alt={zoom.alt}
            decoding="async"
            draggable={false}
            onLoad={(e) => show(e.currentTarget)}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            className={`relative block h-auto w-auto cursor-default select-none bg-white object-contain ${zoom.phone ? "max-h-[88vh] max-w-full rounded-[2rem]" : "max-h-[88vh] max-w-[min(1200px,100%)] rounded-xl"}`}
            style={{ willChange: "transform, opacity", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.55)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const PHONE_SHADOW =
  "0 1px 2px rgba(15,23,42,0.08), 0 24px 50px -18px rgba(15,23,42,0.30)";

export function PhoneMockup({ src, alt, bar = "light", barColor, priority = false, sizes = "(max-width: 640px) 45vw, 320px" }: {
  src: string; alt: string; bar?: "light" | "dark"; barColor?: string; priority?: boolean; sizes?: string;
}) {
  const ink = bar === "dark" ? "#FFFFFF" : "#0F172A";

  return (
    <div style={{ containerType: "inline-size" }}>
      <div
        style={{
          borderRadius: "15.5cqw",
          padding: "1.1cqw",
          background: "linear-gradient(145deg, #F4F5F7 0%, #D9DCE1 45%, #EEF0F3 100%)",
          boxShadow: PHONE_SHADOW,
        }}
      >
        <div className="bg-black" style={{ borderRadius: "14.4cqw", padding: "1.9cqw" }}>
          <div className="relative overflow-hidden" style={{ borderRadius: "12.5cqw" }}>
            <div
              className={`relative flex items-center justify-between ${bar === "dark" ? "bg-[#0A0A0A]" : "bg-white"}`}
              style={{ height: "12.5cqw", paddingInline: "8cqw", ...(barColor ? { background: barColor } : {}) }}
            >
              <span className="font-semibold tracking-tight" style={{ color: ink, fontSize: "4.4cqw" }}>9:41</span>
              <span aria-hidden className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
                    style={{ top: "2.6cqw", width: "32%", height: "8.6cqw" }} />
              <span className="flex items-center" style={{ gap: "1.2cqw" }} aria-hidden>
                <svg viewBox="0 0 17 12" style={{ width: "5.2cqw" }}><g fill={ink}><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="4.5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="9" y="3" width="3" height="9" rx=".8"/><rect x="13.5" y="0" width="3" height="12" rx=".8"/></g></svg>
                <svg viewBox="0 0 26 12" style={{ width: "7.4cqw" }}><rect x=".75" y=".75" width="21.5" height="10.5" rx="3" fill="none" stroke={ink} strokeOpacity=".45" strokeWidth="1.5"/><rect x="2.5" y="2.5" width="15" height="7" rx="1.6" fill={ink}/><rect x="23.5" y="4" width="1.8" height="4" rx=".9" fill={ink} fillOpacity=".45"/></svg>
              </span>
            </div>
            <div className="relative aspect-[1179/2556] bg-white">
              <Image src={src} alt={alt} fill sizes={sizes} quality={85} priority={priority}
                     className="object-cover object-top" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const isHeader = (f: string) => f.startsWith("SVE") || f.startsWith("EVERYTHING");

export function NoSubscription({ title, sub, dark = false }: { title: string; sub: string; dark?: boolean }) {
  return (
    <div className={`mt-4 flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${dark ? "border-[#4ADE80]/25 bg-[#16A34A]/[0.12]" : "border-[#BBF7D0] bg-[#F0FDF4]"}`}>
      <ShieldCheck size={16} className={`shrink-0 ${dark ? "text-[#4ADE80]" : "text-[#16A34A]"}`} />
      <span className="min-w-0">
        <span className={`block truncate text-[12.5px] font-semibold leading-snug ${dark ? "text-white" : "text-[#14532D]"}`}>{title}</span>
        <span className={`block truncate text-[12px] leading-snug ${dark ? "text-[#BBF7D0]/80" : "text-[#15803D]"}`}>{sub}</span>
      </span>
    </div>
  );
}

export function PlanCard({
  icon: Icon, name, tag, priceLabel, from, price, per, oldPrice, discount, alt, note,
  promo, features, foot, cta, href, badge, variant, free,
}: {
  icon: LucideIcon; name: string; tag: string; priceLabel?: string; from?: string;
  price: string; per?: string; oldPrice?: string; discount?: string; alt?: string; note?: string;
  promo?: string; features: string[]; foot?: string; cta: string; href: string; badge?: string;
  variant: "dark" | "outline" | "plain" | "accent"; free?: { title: string; sub: string };
}) {
  const dark = variant === "dark";
  const txt   = dark ? "text-white" : "text-[#0F172A]";
  const muted = dark ? "text-[#94A3B8]" : "text-[#64748B]";
  const body  = dark ? "text-[#CBD5E1]" : "text-[#475569]";

  return (
    <article
      className={`relative flex flex-col rounded-[20px] p-6 sm:p-7 ${
        dark ? "bg-[#0F172A]"
             : variant === "accent" ? "bg-white border-2 border-[#0F3554]"
             : variant === "outline" ? "bg-white border-[1.5px] border-[#0F172A]"
             : "bg-white border border-[#E5E7EB]"}`}
      style={{ boxShadow: dark || variant === "accent" ? LIFT : SOFT }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${dark ? "bg-white/10 text-white" : "bg-[#EEF3F8] text-[#0F3554]"}`}>
          <Icon size={20} strokeWidth={2} />
        </span>
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A] px-2.5 py-1 text-[11px] font-semibold text-white">
            <Star size={11} fill="currentColor" /> {badge}
          </span>
        )}
      </div>
      <h3 className={`mt-4 text-[19px] font-semibold ${txt}`}>{name}</h3>
      <p className={`mt-1.5 text-[14px] leading-relaxed ${body}`}>{tag}</p>

      <div className={`mt-6 border-t pt-5 ${dark ? "border-white/10" : "border-[#F1F5F9]"}`}>
        {priceLabel && <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${muted}`}>{priceLabel}</p>}
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
          {from && <span className={`text-[14px] font-medium ${muted}`}>{from}</span>}
          <span className={`text-[34px] leading-none font-semibold tracking-tight tabular-nums ${txt}`}>{price}</span>
          {per && <span className={`text-[14px] font-medium ${muted}`}>{per}</span>}
          {oldPrice && <span className={`text-[15px] line-through ${muted}`}>{oldPrice}</span>}
          {discount && (
            <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${dark ? "bg-[#16A34A]/20 text-[#4ADE80]" : "bg-[#DCFCE7] text-[#15803D]"}`}>
              {discount}
            </span>
          )}
        </p>
        {(alt || note) && <p className={`mt-1.5 text-[12.5px] ${muted}`}>{[alt, note].filter(Boolean).join(" · ")}</p>}
        {promo && (
          <p className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium ${dark ? "bg-white/[0.06] text-[#E2E8F0]" : "bg-[#F8FAFC] text-[#334155]"}`}>
            <Clock size={12} /> {promo}
          </p>
        )}
        {free && <NoSubscription title={free.title} sub={free.sub} dark={dark} />}
      </div>

      <ul className="mt-6 space-y-2.5">
        {features.map((f) =>
          isHeader(f) ? (
            <li key={f} className={`pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${muted}`}>{f}</li>
          ) : (
            <li key={f} className={`flex items-start gap-2.5 text-[14px] leading-snug ${body}`}>
              <Check size={15} strokeWidth={2.5} className={`mt-0.5 shrink-0 ${dark ? "text-[#4ADE80]" : "text-[#16A34A]"}`} />
              {f}
            </li>
          )
        )}
      </ul>
      {foot && <p className={`mt-4 text-[12.5px] leading-relaxed ${muted}`}>{foot}</p>}

      <div className="mt-auto pt-7">
      <a
        href={href}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14px] font-semibold transition-colors ${
          dark || variant === "accent"
            ? "border border-transparent bg-[#DC2626] text-white hover:bg-[#B91C1C]"
            : variant === "outline"
              ? "border border-transparent bg-[#0F172A] text-white hover:bg-[#1E293B]"
              : "border border-[#E5E7EB] text-[#0F172A] hover:bg-[#F9FAFB]"
        }`}
      >
        {cta} <ArrowRight size={15} />
      </a>
      </div>
    </article>
  );
}
