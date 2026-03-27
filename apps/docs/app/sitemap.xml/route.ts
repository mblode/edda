import { NextResponse } from "next/server";

import { resolveRequestTenant } from "@/lib/request-tenant";
import { buildTenantSitemapXml } from "@/lib/tenant-static";

export const GET = async () => {
  const resolved = await resolveRequestTenant("/sitemap.xml");
  if (!resolved) {
    return new NextResponse("Not found", { status: 404 });
  }

  const xml = await buildTenantSitemapXml(resolved.tenant, {
    protocol: resolved.protocol,
    requestedHost: resolved.resolution.host,
    strategy: resolved.resolution.strategy,
  });

  return new NextResponse(xml, {
    headers: {
      "CDN-Cache-Control": "s-maxage=3600",
      "Content-Type": "application/xml",
    },
  });
};
