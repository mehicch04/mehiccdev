"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

const SRC = "/demo/rent-a-car.html";

const T = {
  bs: {
    label: "Naš sistem za rent a car",
    h1: "Cijeli sistem za iznajmljivanje vozila,",
    accent: "na jednoj stranici",
    sub: "Sajt, kalendar dostupnosti i admin panel rade zajedno. Gost rezerviše sam, vi potvrđujete jednim klikom, a vozilo se zaključa za te datume.",
    cta: "Pogledajte sistem i cijene",
    priceTag: "Plaćate jednom, sistem ostaje vaš",
    ctaSub: "Paketi od 1.400 KM, bez mjesečne pretplate",
    frameTitle: "Prikaz rezervacijskog sistema za rent a car",
    pause: "Pauza", play: "Pokreni", replay: "Ispočetka",
    ctaPage: "Pogledajte pakete",
  },
  en: {
    label: "Our car rental system",
    h1: "A complete car rental system,",
    accent: "on one page",
    sub: "The website, availability calendar and admin panel work together. The guest books on their own, you confirm in one click, and the vehicle locks for those dates.",
    cta: "See the system and pricing",
    priceTag: "Pay once, the system stays yours",
    ctaSub: "Packages from €715, no monthly subscription",
    frameTitle: "Walkthrough of the car rental booking system",
    pause: "Pause", play: "Play", replay: "Replay",
    ctaPage: "See the packages",
  },
} as const;

export function SystemDemo({ onPage = false }: { onPage?: boolean }) {
  const { lang } = useLanguage();
  const l = (lang === "en" ? "en" : "bs") as "bs" | "en";
  const d = T[l];

  const wrapRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const [load,   setLoad]   = useState(false);
  const visibleRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const frameReady = useRef(false);
  const pendingReplay = useRef(false);

  const send = (msg: object) =>
    frameRef.current?.contentWindow?.postMessage(msg, window.location.origin);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setLoad(true); io.disconnect(); } },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    let idle = 0;
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(() => {
        if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setLoad(true), { timeout: 4000 });
        else setLoad(true);
      }, 1200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      io.disconnect();
      window.removeEventListener("load", start);
      window.clearTimeout(timer);
      if (idle && w.cancelIdleCallback) w.cancelIdleCallback(idle);
    };
  }, []);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el || !load) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const r = e.intersectionRatio;
        const fitsScreen = e.boundingClientRect.height <= window.innerHeight;
        const fullyIn = fitsScreen
          ? r >= 0.95
          : e.intersectionRect.height >= window.innerHeight * 0.9;

        if (fullyIn && !visibleRef.current) {
          visibleRef.current = true;
          send({ type: "visible" });
        } else if (r < 0.3 && visibleRef.current) {
          visibleRef.current = false;
          send({ type: "hidden" });
        }
      },
      { threshold: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  useEffect(() => {
    const unlock = () => send({ type: "unlock-audio" });
    const evs = ["pointerdown", "keydown", "touchend"] as const;
    evs.forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));
    return () => evs.forEach((ev) => window.removeEventListener(ev, unlock));
  }, []);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "demo-state") setPlaying(!!e.data.playing);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    const onWatch = () => {
      setLoad(true);
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sceneRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
      if (frameReady.current) {
        window.setTimeout(() => send({ type: "replay" }), smooth ? 650 : 0);
      } else {
        pendingReplay.current = true;
      }
    };
    window.addEventListener("demo:watch", onWatch);
    return () => window.removeEventListener("demo:watch", onWatch);
  }, []);

  useEffect(() => {
    if (!onPage || window.location.hash !== "#kako-radi") return;
    const t = window.setTimeout(() => window.dispatchEvent(new CustomEvent("demo:watch")), 500);
    return () => window.clearTimeout(t);
  }, [onPage]);

  useEffect(() => { send({ type: "lang", lang: l }); }, [l]);

  return (
    <section id={onPage ? "kako-radi" : "rent-a-car"} className="relative bg-white scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            {d.label}
          </p>
          <h2 className="mt-4 text-[32px] leading-[1.12] sm:text-5xl font-semibold tracking-[-0.03em] text-[#0F172A]"
              style={{ textWrap: "balance" }}>
            {d.h1} <span className="text-[#0F3554]">{d.accent}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[#475569]">
            {d.sub}
          </p>
        </div>

        <div
          ref={wrapRef}
          className="mt-14 sm:mt-16 -mx-6 sm:mx-0 overflow-hidden bg-white sm:rounded-[20px] border-y sm:border border-[#E5E7EB]"
          style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 24px 48px -24px rgba(15,23,42,0.18)" }}
        >
          <div ref={sceneRef} className="relative aspect-video bg-[#0F3554]">
            {load && (
              <iframe
                ref={frameRef}
                src={`${SRC}?embed&lang=${l}`}
                title={d.frameTitle}
                scrolling="no"
                onLoad={() => {
                  frameReady.current = true;
                  send({ type: "lang", lang: l });
                  if (pendingReplay.current) { pendingReplay.current = false; send({ type: "replay" }); }
                  else if (visibleRef.current) send({ type: "visible" });
                }}
                className="absolute inset-0 h-full w-full border-0"
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 px-5 sm:px-6 py-4 sm:py-5 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => send({ type: "toggle" })}
                  aria-label={playing ? d.pause : d.play}
                  title={playing ? d.pause : d.play}
                  className="grid h-10 w-10 place-items-center rounded-full bg-[#0F172A] text-white
                             transition-colors duration-200 hover:bg-[#1E293B]"
                >
                  {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => send({ type: "replay" })}
                  aria-label={d.replay}
                  title={d.replay}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#E5E7EB] text-[#475569]
                             transition-colors duration-200 hover:bg-[#F9FAFB] hover:text-[#0F172A]"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <span className="h-8 w-px bg-[#E5E7EB]" aria-hidden />

              <div className="min-w-0 text-left">
                <p className="text-[15px] font-semibold leading-tight text-[#0F172A]">{d.priceTag}</p>
                <p className="mt-0.5 text-[13px] leading-tight text-[#64748B]">{d.ctaSub}</p>
              </div>
            </div>

            <a
              href={onPage ? "#paketi" : "/rjesenja/rent-a-car"}
              className="sm:ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3
                         text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#1E293B]"
            >
              {onPage ? d.ctaPage : d.cta}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
