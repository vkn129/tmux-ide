import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tmux.thijsverreck.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...docs,
  ];
}
