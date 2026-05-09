import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Allons — Eventos sin fricción",
  description:
    "Allons es la plataforma para gestionar y vender entradas de eventos en Honduras y Latinoamérica. Únete a la lista de espera.",
  metadataBase: new URL("https://allons.app"),
  openGraph: {
    title: "Allons — Eventos sin fricción",
    description:
      "Únete a la lista de espera. Próximamente en Honduras y Latinoamérica.",
    url: "https://allons.app",
    siteName: "Allons",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Allons — Eventos sin fricción",
    description: "Únete a la lista de espera.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
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
