import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rateLimit";
import { isBot } from "@/lib/spam";
import { isE164 } from "@/lib/phone";

export const runtime = "nodejs";

const SLOTS = ["11:00", "12:00", "13:00", "14:00"];
const OWNER = "bakir.mehic@mehiccdev.com";

type Body = {
  name?: string; email?: string; note?: string; website?: string; phone?: string; t?: number;
  date?: string; time?: string; label?: string; lang?: string;
};

const SOFT = /(j|lj|nj|č|ć|dž|đ|š|ž)$/i;
const SHIFT: Record<string, string> = { k: "č", g: "ž", h: "š", c: "č" };

function vocative(full: string) {
  const n = full.trim().split(/\s+/)[0] ?? "";
  if (n.length < 2 || !/^[A-Za-zČĆŽŠĐčćžšđ]+$/.test(n)) return n;
  const low = n.toLowerCase();
  if (/[aeiou]$/.test(low)) return n;
  if (SOFT.test(low)) return `${n}u`;
  const last = low.slice(-1);
  if (SHIFT[last]) return `${n.slice(0, -1)}${n.slice(-1) === last ? SHIFT[last] : SHIFT[last].toUpperCase()}e`;
  return `${n}e`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function sarajevoToUtc(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Sarajevo", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(new Date(guess)).map((p) => [p.type, p.value]),
  );
  const local = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess - (local - guess));
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function ics(o: { start: Date; title: string; desc: string; email: string; name: string; url?: string }) {
  const end = new Date(o.start.getTime() + 30 * 60000);
  const line = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//mehiccdev//zakazi//BS", "CALSCALE:GREGORIAN", "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${stamp(o.start)}-${Math.random().toString(36).slice(2)}@mehiccdev.com`,
    `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(o.start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${line(o.title)}`, `DESCRIPTION:${line(o.desc)}`,
    o.url ? `LOCATION:${line(o.url)}` : "LOCATION:Google Meet",
    `ORGANIZER;CN=Bakir Mehić:mailto:${OWNER}`,
    `ATTENDEE;CN=${line(o.name)};RSVP=TRUE:mailto:${o.email}`,
    "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", "DESCRIPTION:Poziv za 30 minuta", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

function clientMail(l: "bs" | "en", o: { name: string; label: string; meet?: string; wa: string }) {
  const t = l === "en"
    ? { s: `Your call with mehiccdev: ${o.label}`, hi: `Hi ${o.name.trim().split(/\s+/)[0]},`, p: "Your call is booked. Here are the details:", when: "When", dur: "30 minutes", where: "Where", link: o.meet ? "Google Meet, join with the link below" : "Google Meet, we'll send the link before the call", btn: "Join the call", cal: "The invitation is attached, so you can add it to your calendar.", change: "Need a different time? Just reply to this email or message us on WhatsApp.", wa: "Message on WhatsApp", bye: "See you soon," }
    : { s: `Vaš poziv sa mehiccdev: ${o.label}`, hi: `Zdravo ${vocative(o.name)},`, p: "Vaš poziv je zakazan. Evo detalja:", when: "Termin", dur: "30 minuta", where: "Gdje", link: o.meet ? "Google Meet, uđite preko linka ispod" : "Google Meet, link šaljemo prije poziva", btn: "Uđite u poziv", cal: "Pozivnica je u prilogu, pa termin možete dodati u svoj kalendar.", change: "Ne odgovara vam termin? Samo odgovorite na ovaj email ili nam pišite na WhatsApp.", wa: "Pišite na WhatsApp", bye: "Vidimo se," };
  const f = "font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif";
  const html = `
  <div style="background:#F4F7FB;padding:32px 16px;${f}">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E2E8F0">
      <div style="background:#0F172A;padding:24px 28px;color:#ffffff;font-size:18px;font-weight:700">mehicc<span style="color:#DC2626">dev</span></div>
      <div style="padding:28px">
        <p style="margin:0 0 6px;font-size:16px;color:#0F172A;font-weight:600">${esc(t.hi)}</p>
        <p style="margin:0 0 20px;font-size:15px;color:#475569">${t.p}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;background:#F8FAFC;border-radius:14px">
          <tr><td style="padding:14px 16px 6px;color:#64748B;width:80px">${t.when}</td><td style="padding:14px 16px 6px;color:#0F172A;font-weight:700">${esc(o.label)}</td></tr>
          <tr><td style="padding:6px 16px;color:#64748B"></td><td style="padding:0 16px 6px;color:#475569">${t.dur}</td></tr>
          <tr><td style="padding:6px 16px 14px;color:#64748B">${t.where}</td><td style="padding:6px 16px 14px;color:#0F172A">${t.link}</td></tr>
        </table>
        ${o.meet ? `<a href="${esc(o.meet)}" style="display:block;margin-top:20px;background:#DC2626;color:#ffffff;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px">${t.btn}</a>` : ""}
        <p style="margin:20px 0 0;font-size:13.5px;color:#64748B">${t.cal}</p>
        <p style="margin:8px 0 0;font-size:13.5px;color:#64748B">${t.change} <a href="${o.wa}" style="color:#16A34A;font-weight:600">${t.wa}</a></p>
        <p style="margin:24px 0 0;font-size:14px;color:#0F172A">${t.bye}<br><strong>Bakir Mehić</strong><br><span style="color:#64748B">mehiccdev, Mostar</span></p>
      </div>
    </div>
  </div>`;
  return { subject: t.s, html };
}

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

  if (isBot({ website: body.website, t: body.t, name: body.name, text: body.note })) {
    return NextResponse.json({ ok: true });
  }

  if (!rateLimit(`zakazi:${ip}`, 3).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name  = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 160);
  const note  = (body.note ?? "").trim().slice(0, 600);
  const phone = (body.phone ?? "").trim();
  const date  = (body.date ?? "").trim();
  const time  = (body.time ?? "").trim();
  const label = (body.label ?? `${date} ${time}`).trim().slice(0, 80);
  const l     = body.lang === "en" ? "en" : "bs";

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (name.length < 2 || !emailOk || !isE164(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !SLOTS.includes(time)) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  const start = sarajevoToUtc(date, time);
  if (start.getTime() < Date.now()) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to     = process.env.UPIT_EMAIL_TO   ?? OWNER;
  const from   = process.env.UPIT_EMAIL_FROM ?? "onboarding@resend.dev";
  const meet   = process.env.MEET_LINK || undefined;

  if (!apiKey) {
    console.error("[zakazi] RESEND_API_KEY nije podešen. Termin:", { name, email, phone, date, time, note });
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  const waClient = `https://wa.me/${phone.replace(/\D/g, "")}`;
  const waOwner = "https://wa.me/38762784029";
  const invite = Buffer.from(ics({
    start, name, email, url: meet,
    title: l === "en" ? "Call with mehiccdev (Bakir Mehić)" : "Poziv sa mehiccdev (Bakir Mehić)",
    desc: `${name}, ${phone}, ${email}${note ? `\n\n${note}` : ""}${meet ? `\n\n${meet}` : ""}`,
  }));
  const attachments = [{ filename: "poziv-mehiccdev.ics", content: invite }];
  const resend = new Resend(apiKey);

  try {
    const r = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Novi termin: ${label} (${name})`,
      attachments,
      html: `
        <h2 style="font-family:system-ui,sans-serif">Novi zakazani poziv sa mehiccdev.com</h2>
        <table style="font-family:system-ui,sans-serif;font-size:14px">
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Termin</td><td><strong>${esc(label)}</strong> (${date} ${time})</td></tr>
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Ime</td><td><strong>${esc(name)}</strong></td></tr>
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Email</td><td><strong>${esc(email)}</strong></td></tr>
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Telefon</td><td><strong>${esc(phone)}</strong> · <a href="${waClient}">WhatsApp</a></td></tr>
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Jezik</td><td><strong>${l.toUpperCase()}</strong></td></tr>
        </table>
        <p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${esc(note) || "Bez napomene."}</p>`,
    });
    if (r.error) throw r.error;
  } catch (err) {
    console.error("[zakazi] Slanje nije uspjelo:", err, { name, email, phone, date, time });
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  try {
    const m = clientMail(l, { name, label, meet, wa: waOwner });
    const r = await resend.emails.send({ from, to: email, replyTo: OWNER, subject: m.subject, html: m.html, attachments });
    if (r.error) console.error("[zakazi] Potvrda klijentu nije poslana:", r.error);
  } catch (err) {
    console.error("[zakazi] Potvrda klijentu nije poslana:", err);
  }

  return NextResponse.json({ ok: true });
}
