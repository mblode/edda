import { NextResponse } from "next/server";

import { blogPosts } from "@/lib/blog";
import { CANONICAL_PATHS, marketingUrl } from "@/lib/marketing-site";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

export const GET = () => {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [
    ...CANONICAL_PATHS.map((path) => ({
      lastmod: today,
      path,
      priority: path === "/" ? "1.0" : "0.7",
    })),
    ...blogPosts.map((post) => ({
      lastmod: post.date,
      path: `/blog/${post.slug}`,
      priority: "0.6",
    })),
  ];

  const urls = entries
    .map(
      ({ lastmod, path, priority }) => `  <url>
    <loc>${marketingUrl(path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new NextResponse(xml, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/xml; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
