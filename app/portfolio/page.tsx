import type { Metadata } from "next";
import { PortfolioPage } from "@/components/portfolio/PortfolioPage";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";

const PAGE_URL = "https://mehiccdev.com/portfolio";
const DESC = "Projekti mehiccdev tima: web aplikacije, sajtovi i UI/UX dizajn za klijente iz rent a car, medicine, fitnessa i gaminga.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mehiccdev.com"),
  title: { absolute: "Portfolio: web aplikacije i sajtovi | mehiccdev" },
  description: DESC,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: "Portfolio: web aplikacije i sajtovi | mehiccdev", description: DESC, url: PAGE_URL, siteName: "mehiccdev", locale: "bs_BA", type: "website" },
  twitter: { card: "summary_large_image", title: "Portfolio: web aplikacije i sajtovi | mehiccdev", description: DESC },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <Navbar />
      <PortfolioPage />
      <Footer />
    </>
  );
}
