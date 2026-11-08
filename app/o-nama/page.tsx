import type { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { AboutPage } from "@/components/pages/AboutPage";

const PAGE_URL = "https://mehiccdev.com/o-nama";
const TITLE = "O nama | mehiccdev";
const DESC = "mehiccdev je web studio iz Mostara. Radite direktno sa ljudima koji prave vaš sajt ili web aplikaciju.";

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
      <AboutPage />
      <Footer />
    </>
  );
}
