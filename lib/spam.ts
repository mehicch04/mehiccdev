export function isBot(b: { website?: string; t?: number; name?: string; text?: string }) {
  if (b.website) return true;
  if (typeof b.t !== "number" || b.t < 2500) return true;
  if (/(https?:\/\/|www\.)/i.test(b.name ?? "")) return true;
  if (((b.text ?? "").match(/(https?:\/\/|www\.)/gi) ?? []).length > 2) return true;
  return false;
}
