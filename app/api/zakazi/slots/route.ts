import { NextResponse } from "next/server";
import { dbReady, listBookings } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!dbReady()) return NextResponse.json({ slots: [] });
  try {
    const today = new Date().toISOString().slice(0, 10);
    const slots = (await listBookings())
      .filter((b) => b.date >= today && (b.status === "pending" || b.status === "approved"))
      .map((b) => ({ d: b.date, t: b.time }));
    return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ slots: [] });
  }
}
