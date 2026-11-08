import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { dbReady, getBooking, listBookings, saveBooking } from "@/lib/db";
import { clientMail, ics, mailer } from "@/lib/mails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  if (!dbReady()) return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  try {
    return NextResponse.json(
      { bookings: await listBookings(), meet: process.env.MEET_LINK ?? "", mail: !!process.env.RESEND_API_KEY },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[admin] Čitanje baze nije uspjelo:", err);
    return NextResponse.json({ error: "db_error" }, { status: 503 });
  }
}

type Patch = { id?: string; action?: "approve" | "decline" | "cancel"; meet?: string };

export async function PATCH(req: Request) {
  if (!isAdmin(req)) return deny();
  let body: Patch;
  try {
    body = (await req.json()) as Patch;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const b = body.id ? await getBooking(body.id) : null;
  if (!b) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const meet = (body.meet ?? "").trim();
  if (body.action === "approve") {
    if (!/^https:\/\/\S+$/.test(meet)) return NextResponse.json({ error: "meet_link" }, { status: 422 });
    if (b.status !== "pending" && b.status !== "approved") return NextResponse.json({ error: "state" }, { status: 409 });
    b.status = "approved";
    b.meet = meet;
  } else if (body.action === "decline") {
    if (b.status !== "pending") return NextResponse.json({ error: "state" }, { status: 409 });
    b.status = "declined";
  } else if (body.action === "cancel") {
    if (b.status !== "approved") return NextResponse.json({ error: "state" }, { status: 409 });
    b.status = "cancelled";
  } else {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  b.updatedAt = Date.now();
  await saveBooking(b);

  let mailed = false;
  const m = mailer();
  if (m) {
    const kind = b.status === "approved" ? "approved" : b.status === "declined" ? "declined" : "cancelled";
    const c = clientMail(kind, b);
    try {
      await m.send({ to: b.email, subject: c.subject, html: c.html, ics: kind === "approved" ? ics(b) : undefined });
      mailed = true;
    } catch (err) {
      console.error("[admin] Email klijentu nije poslan:", err);
    }
  }

  return NextResponse.json({ ok: true, booking: b, mailed });
}
