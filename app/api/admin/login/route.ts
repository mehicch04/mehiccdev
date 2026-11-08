import { NextResponse } from "next/server";
import { adminToken, checkPassword, COOKIE, isAdmin } from "@/lib/adminAuth";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return NextResponse.json({ ok: isAdmin(req) }, { status: isAdmin(req) ? 200 : 401 });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`admin-login:${ip}`, 8).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  if (!adminToken()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  let password = "";
  try {
    password = String(((await req.json()) as { password?: string }).password ?? "");
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, adminToken()!, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
