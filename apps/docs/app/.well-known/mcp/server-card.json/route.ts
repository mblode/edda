import { NextResponse } from "next/server";

import { siteConfig } from "@/lib/config";
import { platformConfig } from "@/lib/platform-config";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

export const GET = () => {
  const origin = `https://${platformConfig.rootDomain}`;

  const card = {
    capabilities: {
      resources: { listChanged: false, subscribe: false },
      tools: { listChanged: false },
    },
    documentation: `${origin}/docs`,
    instructions:
      "Use this server to discover Blode.md documentation, publish docs projects, and scaffold new MDX sites. Agents should authenticate via the OAuth discovery endpoints under /.well-known.",
    protocolVersion: "2025-06-18",
    serverInfo: {
      name: "blodemd",
      title: "Blode.md",
      version: siteConfig.version,
    },
    transport: {
      args: ["-y", "blodemd", "mcp"],
      command: "npx",
      type: "stdio",
    },
  };

  return NextResponse.json(card, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
