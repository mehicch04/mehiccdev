import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider }    from "@/components/ui/ThemeProvider";
import { LanguageProvider } from "@/components/ui/LanguageProvider";
import "@fontsource-variable/inter";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ScrollTopButton } from "@/components/ui/ScrollTopButton";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mehiccdev.com"),

  title: { absolute: "mehiccdev" },
  description:
    "Gradimo web aplikacije za rezervacije i najam, sajtove koje sami uređujete i marketing koji dovodi upite. Iz Mostara za cijeli region.",
  keywords: [
    "mehiccdev",
    "izrada web aplikacija Mostar",
    "izrada sajtova Mostar",
    "sistem za rezervacije",
    "rent a car sistem",
    "sistem za najam vozila",
    "web aplikacija za firmu",
    "digitalni marketing BiH",
    "Next.js razvoj",
    "web development Bosnia",
  ],
  authors: [{ name: "mehiccdev" }],
  creator: "mehiccdev",
  alternates: { canonical: "https://mehiccdev.com" },
  openGraph: {
    title: "mehiccdev · Web aplikacije, sajtovi i marketing",
    description:
      "Sistem za rezervacije i najam, sajt koji sami uređujete i marketing koji dovodi upite. Studio iz Mostara.",
    url: "https://mehiccdev.com",
    siteName: "mehiccdev",
    locale: "bs_BA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "mehiccdev · Web aplikacije, sajtovi i marketing",
    description: "Sistem za rezervacije i najam, sajt koji sami uređujete i marketing koji dovodi upite.",
  },
  robots: { index: true, follow: true },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "mehiccdev",
  url: "https://mehiccdev.com",
  email: "bakir.mehic@mehiccdev.com",
  description:
    "Web studio iz Mostara. Gradimo web aplikacije za rezervacije i najam, sajtove i digitalni marketing.",
  address: { "@type": "PostalAddress", addressLocality: "Mostar", addressCountry: "BA" },
  areaServed: ["Bosnia and Herzegovina", "Croatia", "Serbia", "Montenegro"],
  knowsLanguage: ["bs", "en"],
  sameAs: ["https://www.instagram.com/mehiccdev"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" suppressHydrationWarning>
      <head>
        <script type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
          <LanguageProvider>
            {children}
            <WhatsAppButton />
            <ScrollTopButton />
          </LanguageProvider>
        </ThemeProvider>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
