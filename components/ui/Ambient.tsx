"use client";

import { useEffect } from "react";

const SEL = ".hero-light, #o-nama, #rezultati, #portfolio, #vrijednost, #isplati, #kontakt, #razlika, #paketi, #pitanja, #upit";

export function Ambient() {
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let ev: PointerEvent | null = null;
    let lit: HTMLElement | null = null;

    const run = () => {
      raf = 0;
      if (!ev) return;
      const t = ev.target instanceof Element ? (ev.target.closest(SEL) as HTMLElement | null) : null;
      if (lit && lit !== t) lit.classList.remove("amb-on");
      if (t) {
        const r = t.getBoundingClientRect();
        t.style.setProperty("--mx", `${Math.round(ev.clientX - r.left)}px`);
        t.style.setProperty("--my", `${Math.round(ev.clientY - r.top)}px`);
        t.classList.add("amb-on");
      }
      lit = t;
    };

    const onMove = (e: PointerEvent) => {
      ev = e;
      if (!raf) raf = requestAnimationFrame(run);
    };
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      lit?.classList.remove("amb-on");
      lit = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  return null;
}
