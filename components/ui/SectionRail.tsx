"use client";

import { useEffect, useRef, useState } from "react";
export type RailItem = { id: string; label: string };

export function SectionRail({ items }: { items: readonly RailItem[] }) {
  const [active, setActive] = useState<string>(items[0].id);
  const [past, setPast]     = useState(false);
  const [onDark, setOnDark] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      setPast(window.scrollY > window.innerHeight * 0.8);
      const mid = window.innerHeight / 2;
      setOnDark(Array.from(document.querySelectorAll<HTMLElement>("[data-dark]")).some((el) => { const r = el.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }));
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      <div aria-hidden className="section-progress lg:hidden fixed top-[68px] inset-x-0 z-30 h-[2px] bg-transparent">
        <div ref={barRef}
             className="h-full origin-left bg-gradient-to-r from-brand-600 to-brand-400"
             style={{ transform: "scaleX(0)" }} />
      </div>

      <nav aria-label="Sekcije stranice"
           aria-hidden={!past}
           className={`section-rail ${onDark ? "rail-dark" : ""} hidden lg:flex fixed left-6 xl:left-10 top-1/2 -translate-y-1/2 z-30 flex-col gap-3
                       transition-[opacity,transform] duration-500
                       ${past ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none"}`}>
        {items.map((item) => {
          const on = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={on ? "true" : undefined}
              className="group flex items-center gap-3 outline-none"
            >
              <span
                className={`h-[2px] rounded-full transition-all duration-500
                            ${on ? "w-8 bg-brand-400" : "w-4 bg-[var(--border)] group-hover:w-6 group-hover:bg-brand-600/60"}`}
              />
              <span
                className={`text-[11.5px] font-semibold whitespace-nowrap transition-all duration-300
                            ${on
                              ? "opacity-100 text-[var(--text)]"
                              : "opacity-0 -translate-x-1 text-[var(--text-muted)] group-hover:opacity-100 group-hover:translate-x-0"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
