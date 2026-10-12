import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

type Body = {
  name?: string; email?: string; subject?: string; message?: string; website?: string;
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

  if (!rateLimit(`kontakt:${ip}`, 3).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name    = (body.name ?? "").trim();
  const email   = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (name.length < 2 || !emailOk || message.length < 5) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to     = process.env.UPIT_EMAIL_TO   ?? "bakir.mehic@mehiccdev.com";
  const from   = process.env.UPIT_EMAIL_FROM ?? "onboarding@resend.dev";

  if (!apiKey) {
    console.error("[kontakt] RESEND_API_KEY nije podešen. Poruka:", { name, email, subject, message });
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  const esc = (s: string) => s.replace(/</g, "&lt;");

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Nova poruka sa sajta: ${subject || "bez teme"} (${name})`,
      html: `
        <h2 style="font-family:system-ui,sans-serif">Nova poruka sa mehiccdev.com</h2>
        <table style="font-family:system-ui,sans-serif;font-size:14px">
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Ime</td><td><strong>${esc(name)}</strong></td></tr>
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Email</td><td><strong>${esc(email)}</strong></td></tr>
          <tr><td style="color:#71717A;padding:6px 14px 6px 0">Tip projekta</td><td><strong>${esc(subject) || "nije naveden"}</strong></td></tr>
        </table>
        <p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${esc(message)}</p>`,
    });
  } catch (err) {
    console.error("[kontakt] Slanje nije uspjelo:", err, { name, email });
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
