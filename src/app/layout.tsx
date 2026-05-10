import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://allons.app"),
  applicationName: "Allons",
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
    url: "https://allons.app",
    siteName: "Allons",
    title: "Allons — Eventos sin fricción",
    description:
      "Únete a la lista de espera. Próximamente en Honduras y Latinoamérica.",
    images: [
      {
        url: "/opengraph-image",
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
    images: ["/opengraph-image"],
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
    "@type": "Organization",
    name: "Allons",
    url: "https://allons.app",
    sameAs: [
      "https://www.instagram.com/allons.hn/",
      "https://www.tiktok.com/@allons.app",
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
