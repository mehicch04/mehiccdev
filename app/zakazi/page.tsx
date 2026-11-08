import type { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Booking } from "@/components/sections/Booking";
import { Footer } from "@/components/sections/Footer";

const PAGE_URL = "https://mehiccdev.com/zakazi";
const DESC = "Zakažite besplatan poziv sa mehiccdev timom. Za 30 minuta dobijete okvirnu cijenu i rok za vaš sajt ili web aplikaciju.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mehiccdev.com"),
  title: { absolute: "Zakažite poziv | mehiccdev" },
  description: DESC,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: "Zakažite poziv | mehiccdev", description: DESC, url: PAGE_URL, siteName: "mehiccdev", locale: "bs_BA", type: "website" },
  twitter: { card: "summary_large_image", title: "Zakažite poziv | mehiccdev", description: DESC },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16">
        <Booking />
      </main>
      <Footer />
    </>
  );
}
