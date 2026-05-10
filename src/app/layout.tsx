import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://allonsapp.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Next uses this to resolve social image routes to absolute URLs.
  // (Avoids build-time warning when images are relative.)
  applicationName: "Allons",
  referrer: "origin-when-cross-origin",
  creator: "Allons",
  publisher: "Allons",
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  title: {
    default: "Allons — Eventos sin fricción",
    template: "%s — Allons",
  },
  description:
    "Allons es la plataforma para gestionar, vender y controlar entradas de eventos en Honduras. Únete a la lista de espera.",
  keywords: [
    "Allons",
    "eventos Honduras",
    "ticketing Honduras",
    "venta de entradas",
    "boletos",
    "QR",
    "lista de espera",
    "Tegucigalpa",
    "San Pedro Sula",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "es-HN": "/",
      es: "/",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "es_HN",
    url: SITE_URL,
    siteName: "Allons",
    title: "Allons — Eventos sin fricción",
    description:
      "Únete a la lista de espera. Próximamente en Honduras y Latinoamérica.",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Allons — Eventos sin fricción",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Allons — Eventos sin fricción",
    description: "Únete a la lista de espera.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Allons",
        url: SITE_URL,
        sameAs: [
          "https://www.instagram.com/allons.hn/",
          "https://www.tiktok.com/@allons.app",
        ],
      },
      {
        "@type": "WebSite",
        name: "Allons",
        url: SITE_URL,
        inLanguage: "es-HN",
      },
      {
        "@type": "SoftwareApplication",
        name: "Allons",
        applicationCategory: "BusinessApplication",
        operatingSystem: "iOS, Android, Web",
        url: SITE_URL,
        inLanguage: "es-HN",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <html lang="es" className="dark">
      <head>
        <script
          type="application/ld+json"
          // JSON-LD needs a raw string payload.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
