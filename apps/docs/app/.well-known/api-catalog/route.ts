import { NextResponse } from "next/server";

import { marketingUrl } from "@/lib/marketing-site";

const catalog = {
  linkset: [
    {
      anchor: marketingUrl("/api"),
      "service-desc": [
        {
          href: marketingUrl("/api/openapi.json"),
          type: "application/json",
        },
      ],
      "service-doc": [
        {
          href: marketingUrl("/docs/api/overview"),
          type: "text/html",
        },
      ],
      status: [
        {
          href: marketingUrl("/api/health"),
          type: "application/json",
        },
      ],
    },
  ],
};

export const GET = () =>
  new NextResponse(JSON.stringify(catalog, null, 2), {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
