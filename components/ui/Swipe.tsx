"use client";

import { Children, useRef, useState } from "react";

const TRACK = {
  md: "md:mx-0 md:grid md:overflow-visible md:px-0 md:pb-0",
  lg: "lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0",
};
const ITEM = { md: "md:w-auto", lg: "lg:w-auto" };
const DOTS = { md: "md:hidden", lg: "lg:hidden" };

export function Swipe({
  children, bp = "md", grid = "", item = "w-[86%]", dark = false, label = "",
}: {
  children: React.ReactNode; bp?: "md" | "lg"; grid?: string; item?: string; dark?: boolean; label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const items = Children.toArray(children);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    const x = el.scrollLeft + el.clientWidth * 0.35;
    let k = 0;
    kids.forEach((c, i) => { if (c.offsetLeft - kids[0].offsetLeft <= x) k = i; });
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) k = kids.length - 1;
    setAt(k);
  };

  const go = (k: number) => {
    const el = ref.current;
    const c = el?.children[k] as HTMLElement | undefined;
    if (el && c) el.scrollTo({ left: c.offsetLeft - (el.children[0] as HTMLElement).offsetLeft, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        aria-label={label || undefined}
        className={`-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${TRACK[bp]} ${grid}`}
      >
        {items.map((c, k) => (
          <div key={k} className={`flex shrink-0 snap-start [&>*]:w-full ${item} ${ITEM[bp]}`}>{c}</div>
        ))}
      </div>
      {items.length > 1 && (
        <div className={`mt-4 flex justify-center gap-1.5 ${DOTS[bp]}`}>
          {items.map((_, k) => (
            <button key={k} type="button" aria-label={`${k + 1} / ${items.length}`} onClick={() => go(k)}
              className={`h-1.5 rounded-full transition-all duration-300 ${k === at ? `w-6 ${dark ? "bg-white" : "bg-[#0F172A]"}` : `w-1.5 ${dark ? "bg-white/25" : "bg-[#CBD5E1]"}`}`} />
          ))}
        </div>
      )}
    </div>
  );
}
