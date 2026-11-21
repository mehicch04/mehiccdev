import { renderOg, OG_SIZE } from "@/lib/og";

export const alt = "Rezervacioni sistem za rent-a-car firme · mehiccdev";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Rješenje za rent-a-car firme",
    h1: "Rezervacioni sistem",
    h2: "za vašu rent\u2011a\u2011car firmu",
    sub: "Sajt, admin panel i kalendar dostupnosti u jednom. Paketi od 1.390 KM.",
    chips: ["Bez duplih termina", "Radi 24/7", "Sistem ostaje vaš"],
    phone: "phone-rent.jpg",
  });
}
