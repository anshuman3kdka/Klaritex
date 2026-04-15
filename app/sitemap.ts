import type { MetadataRoute } from "next";
import { getAllPostMeta } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const rawBaseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://klaritex.anshuman3kdka.in").replace(/\/$/, "");
  const baseUrl = rawBaseUrl.startsWith("http") ? rawBaseUrl : `https://${rawBaseUrl}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: new URL("/", baseUrl).toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/blog", baseUrl).toString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const posts = getAllPostMeta();
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: new URL(`/blog/${post.slug}`, baseUrl).toString(),
    lastModified: new Date(`${post.date}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
