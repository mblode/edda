import { NextResponse } from "next/server";

import { MARKETING_CANONICAL_PATHS, marketingUrl } from "@/lib/marketing-site";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

const body = [
  "# Blode.md",
  "",
  "> Docs your users love. And their AI understands.",
  "",
  "## Pages",
  ...MARKETING_CANONICAL_PATHS.map((path) => {
    const label = path === "/" ? "Home" : path.slice(1);
    return `- [${label}](${marketingUrl(path)})`;
  }),
  "- [Full content](https://blode.md/llms-full.txt)",
  "- [Documentation](https://blode.md/docs)",
  "- [GitHub](https://github.com/mblode/blodemd)",
  "",
].join("\n");

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
