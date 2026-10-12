import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rentACarInquirySchema } from "@/lib/schemas/rentACarInquiry";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (typeof body === "object" && body !== null && "website" in body) {
    const hp = (body as Record<string, unknown>).website;
    if (typeof hp === "string" && hp.length > 0) {
      return NextResponse.json({ ok: true });
    }
  }

  const limited = rateLimit(`rent-a-car:${ip}`);
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = rentACarInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const to     = process.env.UPIT_EMAIL_TO   ?? "bakir.mehic@mehiccdev.com";
  const from   = process.env.UPIT_EMAIL_FROM ?? "onboarding@resend.dev";

  if (!apiKey) {
    console.error("[upit-rent-a-car] RESEND_API_KEY nije podešen. Upit:", d);
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  const rows: [string, string][] = [
    ["Broj vozila",        d.fleetSize],
    ["Broj lokacija",      d.locations || "nije navedeno"],
    ["Prima rezervacije",  d.channels?.join(", ") || "nije navedeno"],
    ["Koristi agregatore", d.aggregators || "nije navedeno"],
    ["Postojeći sajt",     d.currentSite || "nije naveden"],
    ["Kada kreće",         d.timeline],
    ["Ime i prezime",      d.fullName],
    ["Firma",              d.company || "nije navedena"],
    ["Telefon",            d.phone],
    ["Email",              d.email],
    ["Napomena",           d.note || "nema"],
  ];

  const html = `
    <h2 style="font-family:system-ui,sans-serif">Novi upit: rent-a-car sistem</h2>
    <table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 14px 6px 0;color:#71717A">${k}</td>
                 <td style="padding:6px 0"><strong>${String(v).replace(/</g, "&lt;")}</strong></td></tr>`
        )
        .join("")}
    </table>`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      replyTo: d.email,
      subject: `Upit rent-a-car sistem: ${d.company || d.fullName} (${d.fleetSize} vozila)`,
      html,
    });
  } catch (err) {
    console.error("[upit-rent-a-car] Slanje nije uspjelo:", err, "Upit:", d);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
