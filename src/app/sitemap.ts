import type { MetadataRoute } from "next";

const siteUrl = "https://allonsapp.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const legalPaths = [
    "/privacidad",
    "/terminos",
    "/soporte",
    "/eliminar-cuenta",
  ];

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...legalPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
