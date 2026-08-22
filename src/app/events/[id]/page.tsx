import type { Metadata } from "next";
import { EventDownloadFallback } from "@/components/events/EventDownloadFallback";
import { formatEventWhen, getPublicEvent } from "@/lib/allons-api";

const SITE_URL = "https://allonsapp.com";
const DEFAULT_APP_STORE_LINK =
  "https://apps.apple.com/us/app/allons-eventos-honduras/id6780532182?uo=4";
const DEFAULT_PLAY_STORE_LINK =
  "https://play.google.com/store/apps/details?id=com.fndrs.allons";

/** Copia de respaldo cuando no se pudo resolver el evento. */
const GENERIC_TITLE = "Evento compartido en Allons";
const GENERIC_DESCRIPTION = "Abre este evento en Allons o descarga la app.";

type Props = {
  params: Promise<{ id: string }>;
};

function buildEventDeepLink(eventId: string) {
  return `allons://events/${encodeURIComponent(eventId)}`;
}

function getAppStoreLink() {
  return process.env.APP_STORE_LINK?.trim() || DEFAULT_APP_STORE_LINK;
}

function getPlayStoreLink() {
  return process.env.PLAY_STORE_LINK?.trim() || DEFAULT_PLAY_STORE_LINK;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const path = `/events/${encodeURIComponent(id)}`;
  const event = await getPublicEvent(id);

  const title = event?.title ?? GENERIC_TITLE;
  // Fecha y lugar en la descripción: es lo que decide si alguien abre el enlace.
  const description =
    [formatEventWhen(event?.startsAt ?? null), event?.city]
      .filter(Boolean)
      .join(" · ") || GENERIC_DESCRIPTION;

  // La portada del evento cuando existe. Hoy la mayoría no tiene, así que la
  // imagen del sitio sigue siendo el respaldo y no un hueco en la tarjeta.
  const image = event?.coverImageUrl
    ? { url: event.coverImageUrl, alt: event.title }
    : {
        url: `${SITE_URL}/opengraph-image`,
        alt: "Allons Eventos sin fricción",
      };

  return {
    title: event ? event.title : "Abrir evento",
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      images: [{ ...image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

export default async function EventFallbackPage({ params }: Props) {
  const { id } = await params;
  const event = await getPublicEvent(id);

  return (
    <EventDownloadFallback
      appDeepLink={buildEventDeepLink(id)}
      appStoreLink={getAppStoreLink()}
      playStoreLink={getPlayStoreLink()}
      eventTitle={event?.title ?? null}
      eventMeta={
        [formatEventWhen(event?.startsAt ?? null), event?.city]
          .filter(Boolean)
          .join(" · ") || null
      }
      providerName={event?.providerName ?? null}
    />
  );
}
