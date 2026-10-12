export const PHONE_DISPLAY = "+387 62 784 029";
export const PHONE_DIAL    = "+38762784029";
export const WHATSAPP      = "38762784029";

export const WA_PREFILL = {
  bs: "Pozdrav, vidio sam vaš sajt i zanima me ",
  en: "Hi, I saw your website and I'm interested in ",
};

export function waLink(lang: string) {
  if (!WHATSAPP) return null;
  const text = lang === "en" ? WA_PREFILL.en : WA_PREFILL.bs;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
