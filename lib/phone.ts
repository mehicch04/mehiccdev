export const COUNTRIES = [
  { c: "BA", d: "387", f: "🇧🇦" },
  { c: "HR", d: "385", f: "🇭🇷" },
  { c: "RS", d: "381", f: "🇷🇸" },
  { c: "ME", d: "382", f: "🇲🇪" },
  { c: "SI", d: "386", f: "🇸🇮" },
  { c: "MK", d: "389", f: "🇲🇰" },
  { c: "AL", d: "355", f: "🇦🇱" },
  { c: "DE", d: "49", f: "🇩🇪" },
  { c: "AT", d: "43", f: "🇦🇹" },
  { c: "CH", d: "41", f: "🇨🇭" },
  { c: "IT", d: "39", f: "🇮🇹" },
  { c: "FR", d: "33", f: "🇫🇷" },
  { c: "NL", d: "31", f: "🇳🇱" },
  { c: "BE", d: "32", f: "🇧🇪" },
  { c: "SE", d: "46", f: "🇸🇪" },
  { c: "NO", d: "47", f: "🇳🇴" },
  { c: "DK", d: "45", f: "🇩🇰" },
  { c: "GB", d: "44", f: "🇬🇧" },
  { c: "IE", d: "353", f: "🇮🇪" },
  { c: "TR", d: "90", f: "🇹🇷" },
  { c: "AE", d: "971", f: "🇦🇪" },
  { c: "US", d: "1", f: "🇺🇸" },
];

export function toE164(code: string, raw: string) {
  const n = raw.replace(/\D/g, "").replace(/^0+/, "");
  const c = code.replace(/\D/g, "");
  if (!c || n.length < 6 || n.length > 12) return null;
  return `+${c}${n}`;
}

export const isE164 = (s: string) => /^\+\d{8,15}$/.test(s);
