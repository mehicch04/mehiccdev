export function sarajevoToUtc(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Sarajevo", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(new Date(guess)).map((p) => [p.type, p.value]),
  );
  const local = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess - (local - guess));
}

export const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function googleCalendarUrl(b: { name: string; phone: string; email: string; note: string; date: string; time: string; meet?: string }) {
  const start = sarajevoToUtc(b.date, b.time);
  const end = new Date(start.getTime() + 30 * 60000);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `Poziv: ${b.name}`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: `${b.name}\n${b.phone}\n${b.email}${b.note ? `\n\n${b.note}` : ""}${b.meet ? `\n\n${b.meet}` : ""}`,
    location: b.meet ?? "Google Meet",
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
