import { NextResponse } from "next/server";

import { platformConfig } from "@/lib/platform-config";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

export const GET = () => {
  const origin = `https://${platformConfig.rootDomain}`;
  const apiOrigin = `https://api.${platformConfig.rootDomain}`;

  const linkset = {
    linkset: [
      {
        anchor: apiOrigin,
        "service-desc": [
          {
            href: `${origin}/docs/api/overview`,
            type: "text/html",
          },
        ],
        "service-doc": [
          {
            href: `${origin}/docs/api/overview`,
            type: "text/html",
          },
        ],
        "service-meta": [
          {
            href: `${origin}/.well-known/oauth-protected-resource`,
            type: "application/json",
          },
        ],
        status: [
          {
            href: `${apiOrigin}/health`,
            type: "application/json",
          },
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(linkset, null, 2), {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/linkset+json",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
