import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const SLOTS = ["11:00", "12:00", "13:00", "14:00"];

type Body = {
  name?: string; email?: string; note?: string; website?: string;
  date?: string; time?: string; label?: string; lang?: string;
};

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ?? "unknown";

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (body.website && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (!rateLimit(`zakazi:${ip}`, 3).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name  = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 160);
  const note  = (body.note ?? "").trim().slice(0, 600);
  const date  = (body.date ?? "").trim();
  const time  = (body.time ?? "").trim();
  const label = (body.label ?? `${date} ${time}`).trim().slice(0, 80);
  const lang  = body.lang === "en" ? "EN" : "BS";

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (name.length < 2 || !emailOk || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !SLOTS.includes(time)) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to     = process.env.UPIT_EMAIL_TO   ?? "bakir.mehic@mehiccdev.com";
  const from   = process.env.UPIT_EMAIL_FROM ?? "onboarding@resend.dev";

  if (!apiKey) {
    console.error("[zakazi] RESEND_API_KEY nije podešen. Termin:", { name, email, date, time, note });
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Novi termin: ${label} (${name})`,
      html: `
        <h2 style="font-family:system-ui,sans-serif">Novi zakazani poziv sa mehiccdev.com</h2>
        <table style="font-family:system-ui,sans-serif;font-size:14px">
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Termin</td><td><strong>${esc(label)}</strong> (${date} ${time})</td></tr>
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Ime</td><td><strong>${esc(name)}</strong></td></tr>
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Email</td><td><strong>${esc(email)}</strong></td></tr>
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Jezik</td><td><strong>${lang}</strong></td></tr>
        </table>
        <p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${esc(note) || "Bez napomene."}</p>`,
    });
  } catch (err) {
    console.error("[zakazi] Slanje nije uspjelo:", err, { name, email, date, time });
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
