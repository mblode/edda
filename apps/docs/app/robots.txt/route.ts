import { NextResponse } from "next/server";

import { platformConfig } from "@/lib/platform-config";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

export const GET = () => {
  const origin = `https://${platformConfig.rootDomain}`;
  const body = `User-agent: *
Allow: /

# Content Signals — declare AI content usage preferences
# https://contentsignals.org
Content-Signal: search=yes, ai-input=yes, ai-train=no

Sitemap: ${origin}/sitemap.xml

# LLM-friendly content
# ${origin}/llms.txt - Index of documentation pages
# ${origin}/llms-full.txt - Full documentation content
# Append .md to any page URL for raw markdown

# Agent discovery
# ${origin}/.well-known/api-catalog - API catalog (RFC 9727)
# ${origin}/.well-known/agent-skills/index.json - Installable agent skills
# ${origin}/.well-known/mcp/server-card.json - MCP Server Card
`;

  return new NextResponse(body, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
