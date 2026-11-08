import { Resend } from "resend";
import type { Booking } from "@/lib/db";
import { sarajevoToUtc, stamp } from "@/lib/calendar";

export const OWNER = "bakir.mehic@mehiccdev.com";
export const SITE = "https://mehiccdev.com";
const WA_OWNER = "https://wa.me/38762784029";
const F = "font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif";

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SOFT = /(j|lj|nj|č|ć|dž|đ|š|ž)$/i;
const SHIFT: Record<string, string> = { k: "č", g: "ž", h: "š", c: "č" };

export function vocative(full: string) {
  const n = full.trim().split(/\s+/)[0] ?? "";
  if (n.length < 2 || !/^[A-Za-zČĆŽŠĐčćžšđ]+$/.test(n)) return n;
  const low = n.toLowerCase();
  if (/[aeiou]$/.test(low)) return n;
  if (SOFT.test(low)) return `${n}u`;
  const last = low.slice(-1);
  if (SHIFT[last]) return `${n.slice(0, -1)}${n.slice(-1) === last ? SHIFT[last] : SHIFT[last].toUpperCase()}e`;
  return `${n}e`;
}

export function ics(b: Booking) {
  const start = sarajevoToUtc(b.date, b.time);
  const end = new Date(start.getTime() + 30 * 60000);
  const line = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const title = b.lang === "en" ? "Call with mehiccdev (Bakir Mehić)" : "Poziv sa mehiccdev (Bakir Mehić)";
  return Buffer.from([
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//mehiccdev//zakazi//BS", "CALSCALE:GREGORIAN", "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${b.id}@mehiccdev.com`,
    `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${line(title)}`,
    `DESCRIPTION:${line(b.meet ? `${b.meet}\n\n${b.name}, ${b.phone}` : `${b.name}, ${b.phone}`)}`,
    `LOCATION:${line(b.meet ?? "Google Meet")}`,
    `ORGANIZER;CN=Bakir Mehić:mailto:${OWNER}`,
    `ATTENDEE;CN=${line(b.name)};RSVP=TRUE:mailto:${b.email}`,
    "BEGIN:VALARM", "TRIGGER:-PT30M", "ACTION:DISPLAY", `DESCRIPTION:${line(title)}`, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n"));
}

const btn = (href: string, label: string, bg: string) =>
  `<a href="${esc(href)}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;font-size:14px;margin:0 8px 8px 0">${label}</a>`;

const shell = (inner: string) => `
  <div style="background:#F4F7FB;padding:28px 12px;${F}">
    <div style="max-width:500px;margin:0 auto;background:#ffffff;border:1px solid #E2E8F0;border-radius:18px;overflow:hidden">
      <div style="background:#0F172A;padding:20px 26px;color:#ffffff;font-size:18px;font-weight:700">mehicc<span style="color:#DC2626">dev</span></div>
      <div style="padding:26px">${inner}</div>
    </div>
  </div>`;

const tag = (text: string, bg: string, fg: string) =>
  `<span style="display:inline-block;background:${bg};color:${fg};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 9px;border-radius:999px">${text}</span>`;

type Kind = "received" | "approved" | "declined" | "cancelled";

const COPY = {
  bs: {
    received: { s: "Zaprimili smo vaš zahtjev za poziv", tag: "Čeka potvrdu", h: "Zaprimili smo vaš zahtjev", p: "Hvala vam. Pregledaćemo termin i potvrditi ga najkasnije u roku od 24 sata. Potvrdu sa linkom za poziv dobijate na ovaj email." },
    approved: { s: "Vaš poziv je potvrđen", tag: "Potvrđeno", h: "Vaš poziv je potvrđen", p: "Vidimo se u dogovorenom terminu. Link za poziv je ispod, a pozivnica je u prilogu pa termin možete dodati u kalendar." },
    declined: { s: "Izabrani termin nije dostupan", tag: "Termin nije dostupan", h: "Izabrani termin nije dostupan", p: "Nažalost, ovaj termin više nije slobodan. Izaberite drugi termin koji vam odgovara i odmah ćemo ga pregledati." },
    cancelled: { s: "Poziv je otkazan", tag: "Otkazano", h: "Poziv je otkazan", p: "Morali smo otkazati ovaj termin, izvinjavamo se. Izaberite novi termin koji vam odgovara." },
    hi: (n: string) => `Zdravo ${vocative(n)},`,
    when: "Termin", dur: "30 minuta, Google Meet", join: "Uđite u poziv", pick: "Izaberite novi termin",
    change: "Pitanja ili promjena termina? Odgovorite na ovaj email ili nam", wa: "pišite na WhatsApp", bye: "Pozdrav,",
  },
  en: {
    received: { s: "We received your call request", tag: "Awaiting confirmation", h: "We received your request", p: "Thank you. We'll review the time and confirm it within 24 hours. You'll get the confirmation with the call link at this email." },
    approved: { s: "Your call is confirmed", tag: "Confirmed", h: "Your call is confirmed", p: "See you at the agreed time. The call link is below, and the invitation is attached so you can add it to your calendar." },
    declined: { s: "The selected time is not available", tag: "Time not available", h: "The selected time is not available", p: "Unfortunately this time is no longer free. Pick another time that suits you and we'll review it right away." },
    cancelled: { s: "Your call was cancelled", tag: "Cancelled", h: "Your call was cancelled", p: "We had to cancel this call, sorry about that. Please pick a new time that suits you." },
    hi: (n: string) => `Hi ${n.trim().split(/\s+/)[0]},`,
    when: "When", dur: "30 minutes, Google Meet", join: "Join the call", pick: "Pick a new time",
    change: "Questions or need another time? Reply to this email or", wa: "message us on WhatsApp", bye: "Best regards,",
  },
};

const TAGS: Record<Kind, [string, string]> = {
  received: ["#FEF3C7", "#92400E"],
  approved: ["#DCFCE7", "#15803D"],
  declined: ["#FEE2E2", "#B91C1C"],
  cancelled: ["#FEE2E2", "#B91C1C"],
};

export function clientMail(kind: Kind, b: Booking) {
  const c = COPY[b.lang];
  const k = c[kind];
  const [bg, fg] = TAGS[kind];
  const strike = kind === "declined" || kind === "cancelled" ? "text-decoration:line-through;color:#94A3B8" : "color:#0F172A";
  const action =
    kind === "approved" && b.meet ? `<div style="margin-top:20px">${btn(b.meet, c.join, "#DC2626")}</div>` :
    kind === "declined" || kind === "cancelled" ? `<div style="margin-top:20px">${btn(`${SITE}/zakazi`, c.pick, "#DC2626")}</div>` : "";
  const html = shell(`
    ${tag(k.tag, bg, fg)}
    <p style="margin:14px 0 4px;font-size:16px;color:#0F172A;font-weight:600">${esc(c.hi(b.name))}</p>
    <p style="margin:0 0 18px;font-size:20px;color:#0F172A;font-weight:700;line-height:1.3">${k.h}</p>
    <div style="background:#F8FAFC;border-radius:14px;padding:14px 16px">
      <p style="margin:0;font-size:12px;color:#94A3B8;font-weight:600">${c.when}</p>
      <p style="margin:4px 0 0;font-size:16px;font-weight:700;${strike}">${esc(b.label)}</p>
      <p style="margin:2px 0 0;font-size:13.5px;color:#64748B">${c.dur}</p>
    </div>
    <p style="margin:18px 0 0;font-size:14.5px;line-height:1.6;color:#475569">${k.p}</p>
    ${action}
    <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#64748B">${c.change} <a href="${WA_OWNER}" style="color:#16A34A;font-weight:600">${c.wa}</a>.</p>
    <p style="margin:20px 0 0;font-size:14px;color:#0F172A">${c.bye}<br><strong>Bakir Mehić</strong><br><span style="color:#64748B">mehiccdev, Mostar</span></p>`);
  return { subject: k.s, html };
}

export function ownerMail(o: {
  tag: string; title: string; sub?: string; name: string; email: string; phone: string; note?: string; noteLabel: string; meta?: string; admin?: string; topic?: string; site?: string;
}) {
  const wa = `https://wa.me/${o.phone.replace(/\D/g, "")}`;
  return `
  <div style="background:#F4F7FB;padding:24px 12px;${F}">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #E2E8F0;border-radius:18px;overflow:hidden">
      <div style="padding:22px 24px 18px;border-bottom:1px solid #EEF2F6">
        ${tag(esc(o.tag), "#FEE2E2", "#B91C1C")}
        <p style="margin:12px 0 0;font-size:20px;font-weight:700;color:#0F172A;line-height:1.3">${esc(o.title)}</p>
        ${o.sub ? `<p style="margin:4px 0 0;font-size:14px;color:#64748B">${esc(o.sub)}</p>` : ""}
      </div>
      <div style="padding:20px 24px 8px">
        <p style="margin:0;font-size:16px;font-weight:600;color:#0F172A">${esc(o.name)}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#475569">${esc(o.phone)} &nbsp;·&nbsp; <a href="mailto:${esc(o.email)}" style="color:#0F3554">${esc(o.email)}</a></p>
        ${o.meta ? `<p style="margin:4px 0 0;font-size:13px;color:#94A3B8">${esc(o.meta)}</p>` : ""}
        ${o.topic || o.site ? `<p style="margin:12px 0 0;font-size:13.5px;color:#475569">${o.topic ? `<span style="display:inline-block;background:#EEF3F8;color:#0F3554;font-weight:600;padding:4px 9px;border-radius:8px;margin-right:8px">${esc(o.topic)}</span>` : ""}${o.site ? `<a href="${esc(o.site)}" style="color:#0F3554;font-weight:600">${esc(o.site.replace(/^https?:\/\//, ""))}</a>` : ""}</p>` : ""}
        ${o.note ? `<div style="margin-top:16px;background:#F8FAFC;border-radius:12px;padding:12px 14px"><p style="margin:0 0 4px;font-size:12px;color:#94A3B8;font-weight:600">${esc(o.noteLabel)}</p><p style="margin:0;font-size:14px;color:#0F172A;white-space:pre-wrap;line-height:1.5">${esc(o.note)}</p></div>` : ""}
        <div style="margin-top:18px">${o.admin ? btn(o.admin, "Otvori u admin panelu", "#0F172A") : btn(`mailto:${o.email}`, "Odgovori na email", "#0F172A")}${btn(wa, "WhatsApp", "#16A34A")}</div>
      </div>
    </div>
  </div>`;
}

export function mailer() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const resend = new Resend(key);
  const from = process.env.UPIT_EMAIL_FROM ?? "onboarding@resend.dev";
  const to = process.env.UPIT_EMAIL_TO ?? OWNER;
  return {
    to,
    async send(o: { to: string; subject: string; html: string; replyTo?: string; ics?: Buffer }) {
      const r = await resend.emails.send({
        from, to: o.to, subject: o.subject, html: o.html, replyTo: o.replyTo,
        attachments: o.ics ? [{ filename: "poziv-mehiccdev.ics", content: o.ics }] : undefined,
      });
      if (r.error) throw new Error(r.error.message);
    },
  };
}
