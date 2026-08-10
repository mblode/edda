import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { computeETag, handleIfNoneMatch } from "@/lib/etag";
import { toDocHref } from "@/lib/routes";
import {
  getCanonicalDocBasePath,
  getCanonicalOrigin,
  getLlmPageText,
  getTenantRequestContextFromHeaders,
} from "@/lib/tenant-static";
import { getTenantBySlug } from "@/lib/tenants";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ tenant: string; slug?: string[] }> }
) => {
  const { slug = [], tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return new NextResponse("Not found", { status: 404 });
  }

  const slugKey = slug.join("/") || "index";
  const requestContext = getTenantRequestContextFromHeaders(
    tenant,
    await headers()
  );
  const content = await getLlmPageText(tenant, slugKey, requestContext);
  if (!content) {
    return new NextResponse("Not found", { status: 404 });
  }

  const origin = await getCanonicalOrigin(tenant, requestContext);
  const basePath = await getCanonicalDocBasePath(tenant, requestContext);
  const llmsTxtUrl = `${origin}${basePath}/llms.txt`;
  // Markdown alternates stay fetchable for AI agents, but must not be indexed
  // as standalone URLs (empty titles / short meta). Point crawlers at the HTML
  // page via Link rel=canonical and keep them out of the index with noindex.
  const canonicalUrl = `${origin}${toDocHref(slugKey, basePath)}`;
  const blockquote =
    `> ## Documentation Index\n` +
    `> Fetch the complete documentation index at: ${llmsTxtUrl}\n` +
    `> Use this file to discover all available pages before exploring further.\n\n`;

  const body = blockquote + content;
  const etag = computeETag(body);
  const robotsHeaders = { "X-Robots-Tag": "noindex" } as const;
  const notModified = handleIfNoneMatch(request, etag, robotsHeaders);
  if (notModified) {
    return notModified;
  }

  return new NextResponse(body, {
    headers: {
      "CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/markdown; charset=utf-8",
      ETag: etag,
      Link: `<${canonicalUrl}>; rel="canonical"`,
      Vary: "accept",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
      ...robotsHeaders,
    },
  });
};
