import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { isBot } from "@/lib/spam";
import { isE164 } from "@/lib/phone";
import { dbReady, listBookings, newId, saveBooking, type Booking } from "@/lib/db";
import { clientMail, mailer, ownerMail, SITE } from "@/lib/mails";
import { sarajevoToUtc } from "@/lib/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SLOTS = ["11:00", "12:00", "13:00", "14:00"];

type Body = {
  name?: string; email?: string; note?: string; website?: string; phone?: string; t?: number;
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
  const lang  = body.lang === "en" ? "en" : "bs";

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (name.length < 2 || !emailOk || !isE164(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !SLOTS.includes(time)) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }
  if (sarajevoToUtc(date, time).getTime() < Date.now()) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }
  if (!dbReady()) {
    console.error("[zakazi] Baza nije podešena (KV_REST_API_URL / KV_REST_API_TOKEN).");
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  try {
    const all = await listBookings();
    if (all.some((b) => b.date === date && b.time === time && (b.status === "pending" || b.status === "approved"))) {
      return NextResponse.json({ error: "taken" }, { status: 409 });
    }
  } catch (err) {
    console.error("[zakazi] Čitanje baze nije uspjelo:", err);
    return NextResponse.json({ error: "db_error" }, { status: 503 });
  }

  const now = Date.now();
  const b: Booking = { id: newId(), name, email, phone, note, date, time, label, lang, status: "pending", createdAt: now, updatedAt: now };

  try {
    await saveBooking(b);
  } catch (err) {
    console.error("[zakazi] Upis u bazu nije uspio:", err, b);
    return NextResponse.json({ error: "db_error" }, { status: 503 });
  }

  const m = mailer();
  if (!m) {
    console.error("[zakazi] RESEND_API_KEY nije podešen, emailovi nisu poslani.", b.id);
    return NextResponse.json({ ok: true });
  }

  const c = clientMail("received", b);
  await Promise.allSettled([
    m.send({
      to: m.to,
      replyTo: email,
      subject: `Novi zahtjev: ${label}, ${name}`,
      html: ownerMail({
        tag: "Novi zahtjev", title: label, sub: "Čeka tvoje odobrenje", name, email, phone, note, noteLabel: "O projektu",
        meta: lang === "en" ? "Klijent piše na engleskom" : undefined, admin: `${SITE}/admin?b=${b.id}`,
      }),
    }),
    m.send({ to: email, subject: c.subject, html: c.html }),
  ]).then((r) => r.forEach((x) => x.status === "rejected" && console.error("[zakazi] Email nije poslan:", x.reason)));

  return NextResponse.json({ ok: true });
}
