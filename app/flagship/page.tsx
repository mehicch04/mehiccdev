import type { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { FlagshipPage } from "@/components/pages/FlagshipPage";

const PAGE_URL = "https://mehiccdev.com/flagship";
const TITLE = "Platforma za nekretnine | mehiccdev";
const DESC = "Flagship produkt mehiccdev tima: platforma za oglašavanje nekretnina sa AI opisima, XML uvozom i kalkulatorom kredita.";

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
      <FlagshipPage />
      <Footer />
    </>
  );
}
