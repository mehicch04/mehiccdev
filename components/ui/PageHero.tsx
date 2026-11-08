"use client";

import { ArrowRight } from "lucide-react";
import { Backdrop, Fade, FLOAT } from "@/components/ui/kit";

type Link = { label: string; href: string };

export function PageHero({ eyebrow, h1, h1b, sub, primary, secondary, aside }: {
  eyebrow: string; h1: string; h1b?: string; sub: string; primary: Link; secondary?: Link; aside?: React.ReactNode;
}) {
  return (
    <section className="hero-light relative bg-white">
      <Backdrop>
        <div className={`mx-auto max-w-6xl px-6 pb-20 pt-36 sm:pt-40 lg:px-8 ${aside ? "grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]" : ""}`}>
          <Fade>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12.5px] font-medium text-[#0F172A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> {eyebrow}
            </span>
            <h1 className="mt-6 max-w-3xl text-[40px] leading-[1.05] sm:text-[58px] font-semibold tracking-[-0.035em] text-[#0F172A]" style={{ textWrap: "balance" }}>
              {h1} {h1b && <span className="block text-[#0F3554]">{h1b}</span>}
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#475569]">{sub}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href={primary.href} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
                {primary.label} <ArrowRight size={16} />
              </a>
              {secondary && (
                <a href={secondary.href} className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F9FAFB]">
                  {secondary.label}
                </a>
              )}
            </div>
          </Fade>
          {aside && (
            <Fade delay={0.1}>
              <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-6 sm:p-7" style={{ boxShadow: FLOAT }}>{aside}</div>
            </Fade>
          )}
        </div>
      </Backdrop>
    </section>
  );
}
