import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

type Og = { eyebrow: string; h1: string; h2: string; sub: string; chips: string[]; phone: string };

const root = process.cwd();
const asset = (p: string) => readFile(join(root, p));

export async function renderOg({ eyebrow, h1, h2, sub, chips, phone }: Og) {
  const [w800, w500, img] = await Promise.all([
    asset("assets/og/inter-800.ttf"),
    asset("assets/og/inter-500.ttf"),
    asset(`public/og/${phone}`),
  ]);
  const src = `data:image/jpeg;base64,${img.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Inter", background: "linear-gradient(180deg, #D9E4F0 0%, #E7EEF6 40%, #FFFFFF 100%)", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 56px 72px", width: 780 }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: -1.2 }}>
            <span style={{ color: "#0F172A" }}>mehicc</span>
            <span style={{ color: "#DC2626" }}>dev</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 500, color: "#0F172A" }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: "#16A34A" }} />
              {eyebrow}
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 22, fontSize: Math.max(h1.length, h2.length) > 22 ? 54 : 64, fontWeight: 800, letterSpacing: -2.4, lineHeight: 1.04 }}>
              <span style={{ color: "#0F172A" }}>{h1}</span>
              <span style={{ color: "#0F3554" }}>{h2}</span>
            </div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 24, fontWeight: 500, color: "#475569", lineHeight: 1.4, maxWidth: 640 }}>{sub}</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {chips.map((c) => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "#FFFFFF", border: "1px solid #E5E7EB", fontSize: 18, fontWeight: 500, color: "#0F172A" }}>
                <span style={{ color: "#16A34A", fontWeight: 800 }}>✓</span>{c}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", position: "absolute", right: 70, top: 70, width: 300, height: 600, padding: 10, borderRadius: 54, background: "#0F172A", boxShadow: "0 30px 60px -20px rgba(15,23,42,0.45)" }}>
          <div style={{ display: "flex", width: "100%", height: "100%", borderRadius: 44, overflow: "hidden", background: "#FFFFFF" }}>
            <img src={src} alt="" width={280} height={513} style={{ objectFit: "cover", objectPosition: "top" }} />
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: w500, weight: 500, style: "normal" },
        { name: "Inter", data: w800, weight: 800, style: "normal" },
      ],
    }
  );
}
