export type Status = "pending" | "approved" | "declined" | "cancelled";

export type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  note: string;
  topic?: string;
  site?: string;
  date: string;
  time: string;
  label: string;
  lang: "bs" | "en";
  status: Status;
  meet?: string;
  createdAt: number;
  updatedAt: number;
};

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "mehiccdev:bookings";
const remote = !!(URL_ && TOKEN);

const g = globalThis as unknown as { __mdvBookings?: Map<string, string> };
const mem = () => (g.__mdvBookings ??= new Map());

export const dbReady = () => remote || process.env.NODE_ENV !== "production";

async function redis<T>(cmd: (string | number)[]): Promise<T> {
  const r = await fetch(URL_!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  const j = (await r.json()) as { result?: T; error?: string };
  if (!r.ok || j.error) throw new Error(j.error ?? `redis_${r.status}`);
  return j.result as T;
}

const parse = (v: string) => JSON.parse(v) as Booking;

export async function saveBooking(b: Booking) {
  const v = JSON.stringify(b);
  if (remote) await redis(["HSET", KEY, b.id, v]);
  else mem().set(b.id, v);
}

export async function getBooking(id: string) {
  const v = remote ? await redis<string | null>(["HGET", KEY, id]) : mem().get(id) ?? null;
  return v ? parse(v) : null;
}

export async function listBookings() {
  const vals = remote ? (await redis<string[] | null>(["HVALS", KEY])) ?? [] : Array.from(mem().values());
  return vals.map(parse).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
