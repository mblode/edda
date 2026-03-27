import { NextResponse } from "next/server";

import { resolveRequestTenant } from "@/lib/request-tenant";
import { buildTenantRobotsTxt } from "@/lib/tenant-static";

export const GET = async () => {
  const resolved = await resolveRequestTenant("/robots.txt");
  const content = resolved
    ? buildTenantRobotsTxt(resolved.tenant, {
        protocol: resolved.protocol,
        requestedHost: resolved.resolution.host,
        strategy: resolved.resolution.strategy,
      })
    : `User-agent: *
Allow: /`;

  return new NextResponse(content, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain",
    },
  });
};
