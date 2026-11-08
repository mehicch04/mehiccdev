import { createHmac, timingSafeEqual } from "crypto";

export const COOKIE = "mdv_admin";

const sign = (s: string) => createHmac("sha256", s).update("mehiccdev-admin-v1").digest("hex");

export function adminToken() {
  const p = process.env.ADMIN_PASSWORD;
  return p ? sign(p) : null;
}

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkPassword(input: string) {
  const t = adminToken();
  return !!t && same(sign(input), t);
}

export function isAdmin(req: Request) {
  const t = adminToken();
  if (!t) return false;
  const m = (req.headers.get("cookie") ?? "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`));
  return !!m && same(m[1], t);
}
