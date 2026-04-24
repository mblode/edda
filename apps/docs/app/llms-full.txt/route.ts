import { NextResponse } from "next/server";

import { getMarketingMarkdown } from "@/lib/marketing-markdown";
import { MARKETING_CANONICAL_PATHS } from "@/lib/marketing-site";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

const body = MARKETING_CANONICAL_PATHS.map((path) => getMarketingMarkdown(path))
  .filter((markdown): markdown is string => markdown !== null)
  .join("\n\n---\n\n");

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
