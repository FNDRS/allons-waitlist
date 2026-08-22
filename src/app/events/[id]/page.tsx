import type { Metadata } from "next";
import { EventDownloadFallback } from "@/components/events/EventDownloadFallback";

const SITE_URL = "https://allonsapp.com";
const DEFAULT_PLAY_STORE_LINK =
  "https://play.google.com/store/apps/details?id=com.fndrs.allons";

type Props = {
  params: Promise<{ id: string }>;
};

function buildEventDeepLink(eventId: string) {
  return `allons://events/${encodeURIComponent(eventId)}`;
}

function getAppStoreLink() {
  const link = process.env.APP_STORE_LINK?.trim();
  return link || null;
}

function getPlayStoreLink() {
  return process.env.PLAY_STORE_LINK?.trim() || DEFAULT_PLAY_STORE_LINK;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const path = `/events/${encodeURIComponent(id)}`;

  return {
    title: "Abrir evento",
    description: "Abre este evento compartido en Allons o descarga la app.",
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: "Evento compartido en Allons",
      description: "Abre este evento en Allons o descarga la app.",
      url: `${SITE_URL}${path}`,
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
      title: "Evento compartido en Allons",
      description: "Abre este evento en Allons o descarga la app.",
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

export default async function EventFallbackPage({ params }: Props) {
  const { id } = await params;

  return (
    <EventDownloadFallback
      appDeepLink={buildEventDeepLink(id)}
      appStoreLink={getAppStoreLink()}
      playStoreLink={getPlayStoreLink()}
    />
  );
}
