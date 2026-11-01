"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "mehiccdev-intro";
const NAME = "mehiccdev";
const GLYPHS = "01<>/{}[]#$%&*+=?;:ABCDEFxz";
const CURSOR = '<span class="intro-cur"></span>';

const COPY = {
  bs: { connect: "povezivanje sa serverom", load: "učitavanje stranica" },
  en: { connect: "connecting to server", load: "loading pages" },
};

export const INTRO_SCRIPT = `try{if(!sessionStorage.getItem("${KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){var d=document.documentElement;d.setAttribute("data-intro","");setTimeout(function(){d.removeAttribute("data-intro")},9000)}}catch(e){}`;

const clamp = (x: number) => Math.max(0, Math.min(1, x));

function decode(t: number, start: number, step: number) {
  let h = "";
  for (let i = 0; i < NAME.length; i++) {
    if (t >= start + i * step) h += `<span${i >= 6 ? ' class="r"' : ""}>${NAME[i]}</span>`;
    else h += `<span class="s">${GLYPHS[Math.floor(Math.random() * GLYPHS.length)]}</span>`;
  }
  return h;
}

export function IntroLoader() {
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const skip = useRef<(() => void) | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el || !html.hasAttribute("data-intro")) {
      setGone(true);
      return;
    }

    const timers: number[] = [];
    let raf = 0;
    let out = false;

    const finish = () => {
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      html.removeAttribute("data-intro");
      setGone(true);
    };

    const reveal = () => {
      if (out) return;
      out = true;
      el.classList.add("out");
      timers.push(window.setTimeout(finish, 900));
    };

    skip.current = reveal;
    const onKey = () => reveal();
    window.addEventListener("keydown", onKey);

    if (performance.now() > 3000) {
      reveal();
    } else {
      let bs = false;
      try { bs = localStorage.getItem("mehiccdev-lang") === "bs"; } catch {}
      const c = bs ? COPY.bs : COPY.en;

      const lines: [number, string][] = [
        [0.15, '<span class="intro-p">$</span> ssh deploy@mehiccdev.com'],
        [0.55, `<span class="intro-g">→</span> ${c.connect} … <span class="intro-ok">ok</span>`],
        [0.85, '<span class="intro-g">→</span> GET /  <span class="intro-ok">200 OK</span>  <span class="intro-g">· 38 ms</span>'],
        [1.15, `<span class="intro-g">→</span> ${c.load}  <span class="intro-ok">[BAR]</span> <span class="intro-ok">[PC]</span>`],
      ];

      const rows = Array.from(el.querySelectorAll<HTMLDivElement>(".intro-ln"));
      const dec = el.querySelector<HTMLDivElement>(".intro-dec");
      const last: string[] = [];
      const t0 = performance.now();

      const paint = (i: number, s: string) => {
        if (last[i] !== s && rows[i]) {
          rows[i].innerHTML = s;
          last[i] = s;
        }
      };

      const frame = (now: number) => {
        const t = (now - t0) / 1000;
        let active = -1;
        lines.forEach(([at], i) => { if (t >= at) active = i; });

        lines.forEach(([at, tpl], i) => {
          if (t < at) {
            if (i > 0) paint(i, "");
            return;
          }
          let full = tpl;
          if (tpl.includes("[BAR]")) {
            const k = clamp((t - 1.2) / 0.6);
            const n = Math.round(k * 12);
            full = tpl.replace("[BAR]", "█".repeat(n) + "░".repeat(12 - n)).replace("[PC]", `${Math.round(k * 100)}%`);
          }
          const p = clamp((t - at) / 0.25);
          const plain = full.replace(/<[^>]+>/g, "");
          const cur = i === active && t < 1.9 ? CURSOR : "";
          paint(i, (p < 1 ? plain.slice(0, Math.round(plain.length * p)) : full) + cur);
        });

        if (dec && t > 1.9 && t < 2.9) dec.innerHTML = decode(t, 2.05, 0.08);
        if (t >= 2.85) reveal();
        if (!out) raf = requestAnimationFrame(frame);
      };

      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      skip.current = null;
      el.classList.remove("out");
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="intro-root" aria-hidden="true" onClick={() => skip.current?.()}>
      <div className="intro">
        <div className="intro-term">
          <div className="intro-bar">
            <i /><i /><i />
            <span>deploy@mehiccdev: ~</span>
          </div>
          <div className="intro-tx">
            <div className="intro-ln" dangerouslySetInnerHTML={{ __html: `<span class="intro-p">$</span> ${CURSOR}` }} />
            <div className="intro-ln" dangerouslySetInnerHTML={{ __html: "" }} />
            <div className="intro-ln" dangerouslySetInnerHTML={{ __html: "" }} />
            <div className="intro-ln" dangerouslySetInnerHTML={{ __html: "" }} />
            <div className="intro-dec" dangerouslySetInnerHTML={{ __html: "" }} />
          </div>
        </div>
      </div>
      <div className="intro-scan" />
    </div>
  );
}
