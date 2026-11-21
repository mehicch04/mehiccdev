import type { Metadata } from "next";
import { MaximumCaseStudy } from "@/components/portfolio/MaximumCaseStudy";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";

const PAGE_URL = "https://mehiccdev.com/maximum";

export const metadata: Metadata = {
  metadataBase: new URL("https://mehiccdev.com"),
  title: { absolute: "Maximum Rent a Car: case study | mehiccdev" },
  description:
    "Kako smo rent a car firmi napravili sistem za rezervacije: učitavanje na telefonu sa 21,6s na 3,2s i upiti 24 sata dnevno.",
  keywords: [
    "maximum rent a car",
    "case study rent a car sistem",
    "rezervacioni sistem rent a car",
    "web aplikacija za iznajmljivanje vozila",
    "mehiccdev",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Maximum Rent a Car: case study | mehiccdev",
    description: "Kako smo rent a car firmi napravili sistem za rezervacije: učitavanje na telefonu sa 21,6s na 3,2s i upiti 24 sata dnevno.",
    url: PAGE_URL,
    siteName: "mehiccdev",
    locale: "bs_BA",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maximum Rent a Car: case study | mehiccdev",
    description: "Kako smo rent a car firmi napravili sistem za rezervacije: učitavanje na telefonu sa 21,6s na 3,2s i upiti 24 sata dnevno.",
  },
  robots: { index: true, follow: true },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Maximum Rent a Car",
  headline: "Maximum Rent a Car: case study",
  description: "Kako smo rent a car firmi napravili sistem za rezervacije: učitavanje na telefonu sa 21,6s na 3,2s i upiti 24 sata dnevno.",
  url: PAGE_URL,
  author: { "@type": "Organization", name: "mehiccdev", url: "https://mehiccdev.com" },
  inLanguage: ["bs", "en"],
};

export default function MaximumCaseStudyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Navbar />
      <MaximumCaseStudy />
      <Footer />
    </>
  );
}
