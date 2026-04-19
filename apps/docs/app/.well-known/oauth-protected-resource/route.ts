import { NextResponse } from "next/server";

import { platformConfig } from "@/lib/platform-config";

export const dynamic = "force-static";
export const preferredRegion = "home";
export const revalidate = 3600;

export const GET = () => {
  const origin = `https://${platformConfig.rootDomain}`;
  const apiOrigin = `https://api.${platformConfig.rootDomain}`;

  const metadata = {
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
    resource: apiOrigin,
    resource_documentation: `${origin}/docs/api/overview`,
    resource_name: "Blode.md API",
    scopes_supported: ["openid", "profile", "email"],
  };

  return NextResponse.json(metadata, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
