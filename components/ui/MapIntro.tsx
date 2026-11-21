"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { Logo } from "@/components/ui/Logo";
import dynamic from "next/dynamic";

const EASE = [0.22, 1, 0.36, 1] as const;
const DONE = 4900;
const TXT = {
  bs: { from: "Znanje iz SAD i Japana", to: "sada u Mostaru", skip: "Preskoči" },
  en: { from: "Know-how from the US and Japan", to: "now in Mostar", skip: "Skip" },
};
const Globe = dynamic(() => import("@/components/ui/Globe"), { ssr: false });

export function MapIntro({ onDone }: { onDone?: () => void }) {
  const { lang } = useLanguage();
  const l: "bs" | "en" = lang === "en" ? "en" : "bs";
  const d = TXT[l];
  const [show, setShow] = useState(true);
  const [size, setSize] = useState(0);
  const [step, setStep] = useState(0);
  const finish = useCallback(() => setShow(false), []);
  const end = useCallback(() => {
    document.documentElement.removeAttribute("data-map");
    onDone?.();
  }, [onDone]);

  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const ready = useCallback(() => {
    if (started.current) return;
    started.current = true;
    timers.current.forEach(window.clearTimeout);
    timers.current = [window.setTimeout(() => setStep(1), 300), window.setTimeout(() => setStep(2), 3500), window.setTimeout(finish, DONE)];
  }, [finish]);

  useEffect(() => {
    if (!document.documentElement.hasAttribute("data-map")) { setShow(false); return; }
    try { sessionStorage.setItem("mehiccdev-map", "1"); } catch {}
    setSize(Math.round(Math.min(window.innerWidth * 0.86, window.innerHeight * 0.52, 520)));
    timers.current = [window.setTimeout(finish, 3000)];
    return () => timers.current.forEach(window.clearTimeout);
  }, [finish]);

  return (
    <AnimatePresence onExitComplete={end}>
      {show && (
        <motion.div key="intro" role="presentation" onClick={finish}
          className="map-intro fixed inset-0 z-[70] cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#0B1324] px-4 text-white"
          exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE } }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <Logo variant="dark" mark className="h-[24px] w-auto sm:h-[28px]" markClassName="h-[32px] w-auto sm:h-[38px]" />
          </motion.div>
          <motion.div className="mt-8" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: size ? 1 : 0, scale: size ? 1 : 0.94 }} transition={{ duration: 0.8, ease: EASE }}>
            {size > 0 && <Globe size={size} lang={l} onReady={ready} />}
          </motion.div>
          <div className="mt-8 h-[60px] text-center">
            <motion.p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8FB3D9] sm:text-[13px]"
              initial={{ opacity: 0 }} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={{ duration: 0.4 }}>{d.from}</motion.p>
            <motion.p className="mt-1.5 text-[22px] font-semibold tracking-[-0.02em] sm:text-[28px]"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 8 }} transition={{ duration: 0.45, ease: EASE }}>{d.to}</motion.p>
          </div>
          <span className="absolute bottom-6 right-6 text-[12px] font-medium text-[#64748B] transition-colors hover:text-white">{d.skip}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
