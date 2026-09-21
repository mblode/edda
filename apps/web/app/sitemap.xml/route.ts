import { NextResponse } from "next/server";

import {
  PLATFORM_PAGES,
  PLATFORM_PATHS,
  platformUrl,
} from "@/lib/marketing-site";

export const GET = () => {
  const entries = PLATFORM_PATHS.map((path) => ({
    lastmod: PLATFORM_PAGES[path],
    path,
  }));

  // No `changefreq` or `priority`: Google ignores both.
  // Marketing pages 301 off this host; only remaining blode.md pages are listed.
  const urls = entries
    .map(
      ({ lastmod, path }) => `  <url>
    <loc>${platformUrl(path)}</loc>
    <lastmod>${lastmod}</lastmod>
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
