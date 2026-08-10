import { NextResponse } from "next/server";

import { marketingUrl } from "@/lib/marketing-site";

// Proxied dashboard and auth surfaces. They carry no search value and each
// crawl of them burns budget that should go to docs.
const DISALLOWED_PATHS = ["/app", "/oauth"];

const disallowBlock = DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join(
  "\n"
);

const body = `User-agent: *
Allow: /
${disallowBlock}

Sitemap: ${marketingUrl("/sitemap.xml")}
Sitemap: ${marketingUrl("/docs/sitemap.xml")}
`;

export const GET = () =>
  new NextResponse(body, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
