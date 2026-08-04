import { NextResponse } from "next/server";

import { computeETag, handleIfNoneMatch } from "@/lib/etag";
import {
  buildTenantLlmsFullTxt,
  getStaticTenantRequestContext,
} from "@/lib/tenant-static";
import { getTenantRequestContextFromUrl } from "@/lib/tenant-utility-context";
import { getTenantBySlug } from "@/lib/tenants";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ tenant: string }> }
) => {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return new NextResponse("Not found", { status: 404 });
  }

  const content = await buildTenantLlmsFullTxt(
    tenant,
    getTenantRequestContextFromUrl(new URL(request.url)) ??
      getStaticTenantRequestContext(tenant)
  );

  const etag = computeETag(content);
  const notModified = handleIfNoneMatch(request, etag);
  if (notModified) {
    return notModified;
  }

  return new NextResponse(content, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
      ETag: etag,
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};
