import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider }    from "@/components/ui/ThemeProvider";
import { LanguageProvider } from "@/components/ui/LanguageProvider";
import "@fontsource-variable/inter";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ScrollTopButton } from "@/components/ui/ScrollTopButton";
import { INTRO_SCRIPT } from "@/components/ui/IntroLoader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mehiccdev.com"),

  title: { absolute: "Izrada web aplikacija i sajtova u Mostaru | mehiccdev" },
  applicationName: "mehiccdev",
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
    title: "Izrada web aplikacija i sajtova u Mostaru | mehiccdev",
    description:
      "Sistem za rezervacije i najam, sajt koji sami uređujete i marketing koji dovodi upite. Studio iz Mostara.",
    url: "https://mehiccdev.com",
    siteName: "mehiccdev",
    locale: "bs_BA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Izrada web aplikacija i sajtova u Mostaru | mehiccdev",
    description: "Sistem za rezervacije i najam, sajt koji sami uređujete i marketing koji dovodi upite.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const SITE = "https://mehiccdev.com";
const OG = [`${SITE}/og/mehiccdev.jpg`, `${SITE}/og/mehiccdev-kvadrat.jpg`];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "mehiccdev",
      alternateName: ["mehiccdev.com", "mehiccdev Mostar"],
      url: SITE,
      inLanguage: "bs-BA",
      publisher: { "@id": `${SITE}/#org` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE}/#org`,
      name: "mehiccdev",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/brand/icon-512.png`, width: 512, height: 512 },
      image: OG,
      email: "bakir.mehic@mehiccdev.com",
      telephone: "+387 62 784 029",
      description: "Web studio iz Mostara. Gradimo web aplikacije za rezervacije i najam, sajtove i digitalni marketing.",
      address: { "@type": "PostalAddress", addressLocality: "Mostar", addressCountry: "BA" },
      areaServed: ["Bosnia and Herzegovina", "Croatia", "Serbia", "Montenegro"],
      knowsLanguage: ["bs", "en"],
      sameAs: ["https://www.instagram.com/mehiccdev"],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE}/#webpage`,
      url: SITE,
      name: "Izrada web aplikacija i sajtova u Mostaru | mehiccdev",
      isPartOf: { "@id": `${SITE}/#website` },
      about: { "@id": `${SITE}/#org` },
      inLanguage: "bs-BA",
      primaryImageOfPage: { "@type": "ImageObject", url: OG[0], width: 1200, height: 630 },
      image: OG,
    },
    {
      "@type": "ItemList",
      "@id": `${SITE}/#nav`,
      itemListElement: [
        ["Rent a car sistem", "/rjesenja/rent-a-car"],
        ["Portfolio", "/portfolio"],
        ["Cjenovnik", "/cjenovnik"],
        ["O nama", "/o-nama"],
        ["Kontakt", "/kontakt"],
        ["Zakažite poziv", "/zakazi"],
      ].map(([n, u], i) => ({ "@type": "SiteNavigationElement", position: i + 1, name: n, url: `${SITE}${u}` })),
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
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
