import { NextResponse } from "next/server";

import { marketingUrl } from "@/lib/marketing-site";

// Proxied dashboard and auth surfaces. They carry no search value and each
// crawl of them burns budget that should go to docs.
const DISALLOWED_PATHS = ["/app", "/oauth"];

const disallowBlock = DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join(
  "\n"
);

// Content-Signal declares AI usage preferences for agents that read robots.txt
// (search index, live AI input / RAG, model training). Not yet an RFC; ignored
// by crawlers that do not implement it. Preferable to opaque Disallow blocks
// for a product that wants to be cited in AI answers.
const body = `User-agent: *
Allow: /
${disallowBlock}
Content-Signal: search=yes, ai-input=yes, ai-train=yes

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
