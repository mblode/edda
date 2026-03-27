import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildTenantSitemapXml,
  getTenantRequestContextFromHeaders,
} from "@/lib/tenant-static";
import { getTenantBySlug } from "@/lib/tenants";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) => {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return new NextResponse("Not found", { status: 404 });
  }

  const headerStore = await headers();
  const xml = await buildTenantSitemapXml(
    tenant,
    getTenantRequestContextFromHeaders(tenant, headerStore)
  );

  return new NextResponse(xml, {
    headers: {
      "CDN-Cache-Control": "s-maxage=3600",
      "content-type": "application/xml",
    },
  });
};
