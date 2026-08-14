import { NextResponse } from "next/server";

import { marketingUrl } from "@/lib/marketing-site";

// Proxied dashboard and auth surfaces. They carry no search value and each
// crawl of them burns budget that should go to docs.
const DISALLOWED_PATHS = ["/app", "/oauth"];

const disallowBlock = DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join(
  "\n"
);

// Content-Signal is not a robots.txt field Semrush (or the original RFC)
// accepts. Agents that implement it read the HTTP header on this response
// and on HTML pages. The comment keeps the preference visible in the file.
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=yes";

const body = `User-agent: *
Allow: /
${disallowBlock}

# Content-Signal: ${CONTENT_SIGNAL}

Sitemap: ${marketingUrl("/sitemap.xml")}
Sitemap: ${marketingUrl("/docs/sitemap.xml")}
`;

export const GET = () =>
  new NextResponse(body, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Signal": CONTENT_SIGNAL,
      "Content-Type": "text/plain; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
