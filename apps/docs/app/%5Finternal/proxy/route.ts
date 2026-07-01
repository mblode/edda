import { NextResponse } from "next/server";

import { loadOpenApiProxyConfig } from "@/lib/openapi-proxy";
import { getRequestHost, resolveTenant } from "@/lib/tenancy";
import { getTenantBySlug } from "@/lib/tenants";

interface ProxyPayload {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  tenantSlug?: string;
}

const getTenantPathFromReferer = (request: Request) => {
  const referer = request.headers.get("referer");
  if (!referer) {
    return "/";
  }

  try {
    return new URL(referer).pathname || "/";
  } catch {
    return "/";
  }
};

const jsonError = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

// Resolve the tenant from the trusted Host/Referer pair. A slug hint supplied in
// the request body is only honoured when it matches the host-resolved tenant, so
// a page served for tenant A cannot proxy through tenant B's allowlist.
const loadResolvedTenant = async (
  request: Request,
  slugHint: string | null
) => {
  const host = getRequestHost(request.headers);
  if (!host) {
    return null;
  }

  const resolution = await resolveTenant(
    host,
    getTenantPathFromReferer(request)
  );
  if (!resolution) {
    return null;
  }

  if (slugHint && slugHint !== resolution.tenant.slug) {
    return null;
  }

  return getTenantBySlug(resolution.tenant.slug);
};

export const POST = async (request: Request) => {
  let payload: ProxyPayload;
  try {
    payload = (await request.json()) as ProxyPayload;
  } catch {
    return jsonError("Invalid payload", 400);
  }

  if (!(payload?.url && payload?.method)) {
    return jsonError("Invalid payload", 400);
  }

  const slugHint =
    typeof payload.tenantSlug === "string" ? payload.tenantSlug.trim() : "";
  const tenant = await loadResolvedTenant(request, slugHint || null);
  if (!tenant) {
    return jsonError("Unknown tenant", 400);
  }

  const proxyConfig = await loadOpenApiProxyConfig(tenant);
  if (!proxyConfig) {
    return jsonError("Invalid site config", 400);
  }

  if (!proxyConfig.enabled) {
    return jsonError("Proxy disabled", 403);
  }

  let url: URL;
  try {
    url = new URL(payload.url);
  } catch {
    return jsonError("Invalid URL", 400);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return jsonError("Invalid protocol", 400);
  }

  const { allowedHosts } = proxyConfig;
  if (!allowedHosts.length) {
    return jsonError(
      "No proxy allowlist is configured for this docs.json.",
      403
    );
  }
  if (!allowedHosts.includes(url.hostname.toLowerCase())) {
    return jsonError("Host not allowed", 403);
  }

  const method = payload.method.toUpperCase();
  const response = await fetch(url, {
    body: method === "GET" ? undefined : payload.body,
    headers: payload.headers,
    method,
    redirect: "manual",
  });

  // Never follow upstream redirects: a 3xx could bounce the request to an
  // internal host the allowlist never sanctioned (SSRF).
  if (response.status >= 300 && response.status < 400) {
    return jsonError("Upstream redirect not allowed", 502);
  }

  const text = await response.text();
  return new NextResponse(text, {
    headers: {
      "content-type": response.headers.get("content-type") ?? "text/plain",
    },
    status: response.status,
  });
};
