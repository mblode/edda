import { NextResponse } from "next/server";

import { platformConfig } from "@/lib/platform-config";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

const ROOT_PATHS = [
  "/",
  "/about",
  "/blog",
  "/changelog",
  "/privacy",
  "/terms",
  "/security",
  "/docs",
  "/docs/quickstart",
  "/docs/how-it-works",
  "/docs/api/overview",
  "/docs/cli/overview",
  "/docs/cli/new",
  "/docs/cli/login",
  "/docs/cli/logout",
  "/docs/cli/whoami",
  "/docs/cli/dev",
  "/docs/cli/push",
  "/docs/cli/validate",
  "/docs/components/accordion",
  "/docs/components/callout",
  "/docs/components/card",
  "/docs/components/code-group",
  "/docs/components/columns",
  "/docs/components/expandable",
  "/docs/components/frame",
  "/docs/components/installer",
  "/docs/components/steps",
  "/docs/components/tabs",
  "/docs/components/tree",
  "/docs/components/type-table",
  "/docs/configuration/docs-json",
  "/docs/configuration/navigation",
  "/docs/configuration/theming",
  "/docs/content/code-blocks",
  "/docs/content/frontmatter",
  "/docs/content/mdx-basics",
  "/docs/deployment/push",
  "/docs/features/collections",
  "/docs/features/custom-domains",
  "/docs/features/dev-server",
  "/docs/features/openapi",
  "/docs/features/search",
  "/docs/features/seo",
  "/docs/guides/proxy-cloudflare",
  "/docs/guides/proxy-nginx",
  "/docs/guides/proxy-vercel",
];

export const GET = () => {
  const origin = `https://${platformConfig.rootDomain}`;
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = ROOT_PATHS.map(
    (path) =>
      `  <url><loc>${origin}${path === "/" ? "" : path}</loc><lastmod>${lastmod}</lastmod></url>`
  ).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/xml; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
