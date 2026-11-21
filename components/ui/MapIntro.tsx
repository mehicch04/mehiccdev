"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Logo } from "@/components/ui/Logo";
import { W_CITIES, W_DOTS } from "@/components/ui/geo";

const EASE = [0.22, 1, 0.36, 1] as const;
const VB = { x: 60, y: 20, w: 880, h: 300 };
const DOTS_D = W_DOTS.filter(([, y]) => y < VB.y + VB.h + 10).map(([x, y]) => `M${x} ${y}h0`).join("");
const [MX, MY] = W_CITIES.mo;

type From = "ny" | "la" | "sd" | "yo";
type Flag = "us" | "jp" | "ba";
const FROM: { k: From; p: readonly [number, number]; c: string; flag: Flag; side: "up" | "down" | "left" }[] = [
  { k: "ny", p: W_CITIES.ny, c: "#DC2626", flag: "us", side: "up" },
  { k: "la", p: [W_CITIES.la[0] - 4, W_CITIES.la[1] - 7], c: "#DC2626", flag: "us", side: "left" },
  { k: "sd", p: [W_CITIES.sd[0] + 6, W_CITIES.sd[1] + 9], c: "#DC2626", flag: "us", side: "down" },
  { k: "yo", p: W_CITIES.yo, c: "#F59E0B", flag: "jp", side: "down" },
];
const CITY: Record<From, string> = { ny: "New York", la: "Los Angeles", sd: "San Diego", yo: "Yokohama" };
const TXT = {
  bs: { us: "SAD", jp: "Japan", ba: "BiH", from: "Znanje iz SAD i Japana", to: "sada u Mostaru", skip: "Preskoči" },
  en: { us: "USA", jp: "Japan", ba: "BiH", from: "Know-how from the US and Japan", to: "now in Mostar", skip: "Skip" },
};
const pct = ([x, y]: readonly [number, number]) => ({ left: `${((x - VB.x) / VB.w) * 100}%`, top: `${((y - VB.y) / VB.h) * 100}%` });
const arc = ([x, y]: readonly [number, number]) => `M${x} ${y} Q${(x + MX) / 2} ${Math.min(y, MY) - 80} ${MX} ${MY}`;
const SIDE = {
  up: "-translate-x-1/2 -translate-y-[calc(100%+14px)]",
  down: "-translate-x-1/2 translate-y-[14px]",
  left: "-translate-x-[calc(100%+14px)] -translate-y-[85%]",
};

function FlagIcon({ f }: { f: Flag }) {
  if (f === "jp") return (
    <svg viewBox="0 0 18 12" className="h-[10px] w-[15px] shrink-0 rounded-[2px] sm:h-3 sm:w-[18px]" aria-hidden>
      <rect width="18" height="12" fill="#FFFFFF" /><circle cx="9" cy="6" r="3.4" fill="#BC002D" />
    </svg>
  );
  if (f === "ba") return (
    <svg viewBox="0 0 18 12" className="h-[10px] w-[15px] shrink-0 rounded-[2px] sm:h-3 sm:w-[18px]" aria-hidden>
      <rect width="18" height="12" fill="#002395" /><path d="M5 0h9v12z" fill="#FECB00" />
    </svg>
  );
  return (
    <svg viewBox="0 0 18 12" className="h-[10px] w-[15px] shrink-0 rounded-[2px] sm:h-3 sm:w-[18px]" aria-hidden>
      <rect width="18" height="12" fill="#FFFFFF" />
      {[0, 2, 4, 6, 8, 10].map((y) => <rect key={y} y={y} width="18" height="1" fill="#B22234" />)}
      <rect width="8" height="6.5" fill="#3C3B6E" />
    </svg>
  );
}

function Chip({ name, country, flag, tone, className = "" }: { name: string; country: string; flag: Flag; tone: string; className?: string }) {
  return (
    <span className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/15 bg-[#0F1A30] py-1 pl-1.5 pr-2 sm:gap-2 sm:py-1.5 sm:pl-2 sm:pr-2.5 ${className}`}>
      <FlagIcon f={flag} />
      <span className="text-[10.5px] font-semibold text-white sm:text-[13.5px]">{name}</span>
      <span className="text-[9.5px] font-medium sm:text-[11.5px]" style={{ color: tone }}>{country}</span>
    </span>
  );
}

export function MapIntro({ onDone }: { onDone?: () => void }) {
  const { lang } = useLanguage();
  const d = TXT[lang === "en" ? "en" : "bs"];
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(0);
  const finish = useCallback(() => setShow(false), []);
  const end = useCallback(() => {
    document.documentElement.removeAttribute("data-map");
    onDone?.();
  }, [onDone]);

  useEffect(() => {
    if (!document.documentElement.hasAttribute("data-map")) { setShow(false); return; }
    try { sessionStorage.setItem("mehiccdev-map", "1"); } catch {}
    const at = [450, 800, 1150, 1500, 2000, 3050];
    const t = at.map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    t.push(window.setTimeout(finish, 4300));
    return () => t.forEach(window.clearTimeout);
  }, [finish]);

  const arcs = step >= 5;
  const home = step >= 6;

  return (
    <AnimatePresence onExitComplete={end}>
      {show && (
        <motion.div key="intro" role="presentation" onClick={finish}
          className="map-intro fixed inset-0 z-[70] cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#0B1324] px-4 text-white"
          exit={{ opacity: 0, transition: { duration: 0.55, ease: EASE } }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <Logo variant="dark" mark className="h-[24px] w-auto sm:h-[28px]" markClassName="h-[32px] w-auto sm:h-[38px]" />
          </motion.div>

          <motion.div className="relative mt-8 w-[118%] max-w-[1040px] sm:mt-10 sm:w-full"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: home ? 1.05 : 1 }}
            transition={{ duration: home ? 1.2 : 0.6, ease: EASE }} style={{ transformOrigin: `${pct(W_CITIES.mo).left} ${pct(W_CITIES.mo).top}` }}>
            <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="block w-full [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]" aria-hidden>
              <path d={DOTS_D} stroke="#24324D" strokeWidth={4.2} strokeLinecap="round" fill="none" />
              {FROM.map(({ k, p }, i) => (
                <motion.path key={k} d={arc(p)} fill="none" stroke="#8FB3D9" strokeWidth={1.8} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }} animate={arcs ? { pathLength: 1, opacity: 0.9 } : {}}
                  transition={{ duration: 0.95, delay: i * 0.08, ease: EASE }} />
              ))}
              {FROM.map(({ k, p, c }, i) => (
                <motion.g key={k} initial={{ opacity: 0, scale: 0.3 }} animate={step > i ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.35, ease: EASE }} style={{ transformOrigin: `${p[0]}px ${p[1]}px` }}>
                  <motion.circle cx={p[0]} cy={p[1]} r={6} fill="none" stroke={c} strokeWidth={2}
                    initial={{ opacity: 0 }} animate={step > i ? { r: [6, 20], opacity: [0.8, 0] } : {}} transition={{ duration: 0.8, ease: "easeOut" }} />
                  <circle cx={p[0]} cy={p[1]} r={6.5} fill={c} stroke="#FFFFFF" strokeWidth={2.5} />
                </motion.g>
              ))}
              <motion.circle cx={MX} cy={MY} fill="none" stroke="#16A34A" strokeWidth={2}
                initial={{ r: 6, opacity: 0 }} animate={home ? { r: [6, 24], opacity: [0.9, 0] } : {}} transition={{ duration: 0.9, ease: "easeOut" }} />
              <motion.circle cx={MX} cy={MY} fill="#16A34A" stroke="#FFFFFF" strokeWidth={2.5}
                initial={{ r: 0 }} animate={{ r: home ? 10 : arcs ? 6 : 0 }} transition={{ duration: 0.4, ease: EASE }} />
            </svg>

            {FROM.map(({ k, p, flag, side }, i) => (
              <div key={k} className="pointer-events-none absolute hidden sm:block" style={pct(p)}>
                <div className={SIDE[side]}>
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={step > i ? { opacity: home ? 0.55 : 1, y: 0 } : {}} transition={{ duration: 0.4, ease: EASE }}>
                    <Chip name={CITY[k]} country={d[flag]} flag={flag} tone={flag === "jp" ? "#FBBF24" : "#F87171"} />
                  </motion.div>
                </div>
              </div>
            ))}
            <div className="pointer-events-none absolute hidden sm:block" style={pct(W_CITIES.mo)}>
              <div className={SIDE.down}>
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={home ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ duration: 0.45, ease: EASE }}>
                  <Chip name="Mostar" country={d.ba} flag="ba" tone="#4ADE80" className="border-[#16A34A]/60" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="mt-6 grid w-full max-w-[340px] grid-cols-2 gap-2 sm:hidden">
            {FROM.map(({ k, flag }, i) => (
              <motion.div key={k} initial={{ opacity: 0, y: 6 }} animate={step > i ? { opacity: home ? 0.55 : 1, y: 0 } : {}} transition={{ duration: 0.4, ease: EASE }}>
                <Chip name={CITY[k]} country={d[flag]} flag={flag} tone={flag === "jp" ? "#FBBF24" : "#F87171"} className="justify-center" />
              </motion.div>
            ))}
            <motion.div className="col-span-2 flex justify-center" initial={{ opacity: 0, y: 6 }} animate={home ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, ease: EASE }}>
              <Chip name="Mostar" country={d.ba} flag="ba" tone="#4ADE80" className="border-[#16A34A]/60" />
            </motion.div>
          </div>

          <div className="mt-8 h-[56px] text-center sm:mt-10">
            <motion.p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8FB3D9] sm:text-[13px]"
              initial={{ opacity: 0 }} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={{ duration: 0.4 }}>{d.from}</motion.p>
            <motion.p className="mt-1.5 text-[22px] font-semibold tracking-[-0.02em] sm:text-[28px]"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: home ? 1 : 0, y: home ? 0 : 8 }} transition={{ duration: 0.45, ease: EASE }}>{d.to}</motion.p>
          </div>

          <span className="absolute bottom-6 right-6 text-[12px] font-medium text-[#64748B] transition-colors hover:text-white">{d.skip}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
