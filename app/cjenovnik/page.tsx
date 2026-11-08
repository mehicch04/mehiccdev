import type { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { PricingPage } from "@/components/pages/PricingPage";

const PAGE_URL = "https://mehiccdev.com/cjenovnik";
const TITLE = "Cjenovnik | mehiccdev";
const DESC = "Cijene web aplikacija, sajtova i marketinga. Aplikaciju plaćate jednom, bez mjesečne pretplate. Uporedite pakete i izračunajte isplativost.";

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
      <PricingPage />
      <Footer />
    </>
  );
}
