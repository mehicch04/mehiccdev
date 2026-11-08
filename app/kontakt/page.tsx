import type { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ContactPage } from "@/components/pages/ContactPage";

const PAGE_URL = "https://mehiccdev.com/kontakt";
const TITLE = "Kontakt | mehiccdev";
const DESC = "Pišite nam preko forme, WhatsAppa ili emaila. Odgovaramo isti dan. Studio iz Mostara.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mehiccdev.com"),
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESC, url: PAGE_URL, siteName: "mehiccdev", locale: "bs_BA", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <Navbar />
      <ContactPage />
      <Footer />
    </>
  );
}
