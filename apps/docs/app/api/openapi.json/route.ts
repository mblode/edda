import { NextResponse } from "next/server";

import { marketingUrl } from "@/lib/marketing-site";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

const spec = {
  info: {
    title: "Blode.md Public API",
    version: "1.0.0",
  },
  openapi: "3.1.0",
  paths: {
    "/api/health": {
      get: {
        operationId: "getHealth",
        responses: {
          "200": {
            description: "Service health status.",
          },
        },
        summary: "Health check",
      },
    },
  },
  servers: [{ url: marketingUrl("/") }],
};

export const GET = () =>
  NextResponse.json(spec, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
