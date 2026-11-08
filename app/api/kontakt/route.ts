import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rateLimit";
import { isBot } from "@/lib/spam";
import { isE164 } from "@/lib/phone";
import { ownerMail } from "@/lib/mails";

export const runtime = "nodejs";

type Body = {
  name?: string; email?: string; subject?: string; message?: string; website?: string; phone?: string; t?: number;
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

  if (isBot({ website: body.website, t: body.t, name: body.name, text: body.message })) {
    return NextResponse.json({ ok: true });
  }

  if (!rateLimit(`kontakt:${ip}`, 3).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name    = (body.name ?? "").trim();
  const email   = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();
  const phone   = (body.phone ?? "").trim();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (name.length < 2 || !emailOk || !isE164(phone) || message.length < 5) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to     = process.env.UPIT_EMAIL_TO   ?? "bakir.mehic@mehiccdev.com";
  const from   = process.env.UPIT_EMAIL_FROM ?? "onboarding@resend.dev";

  if (!apiKey) {
    console.error("[kontakt] RESEND_API_KEY nije podešen. Poruka:", { name, email, subject, message });
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }


  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Novi upit: ${subject || "bez teme"}, ${name}`,
      html: ownerMail({ tag: "Novi upit", title: subject || "Upit sa sajta", name, email, phone, note: message, noteLabel: "Poruka" }),
    });
  } catch (err) {
    console.error("[kontakt] Slanje nije uspjelo:", err, { name, email });
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
