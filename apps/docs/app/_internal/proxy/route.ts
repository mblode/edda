import { loadSiteConfig } from "@repo/previewing";
import { NextResponse } from "next/server";

import { getTenantContentSource } from "@/lib/content-source";
import { buildOpenApiRegistry } from "@/lib/openapi";
import { getRequestHost, resolveTenant } from "@/lib/tenancy";
import { getTenantBySlug } from "@/lib/tenants";

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

export const POST = async (request: Request) => {
  const payload = (await request.json()) as {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
  };

  if (!(payload?.url && payload?.method)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const host = getRequestHost(request.headers);
  const resolution = host
    ? await resolveTenant(host, getTenantPathFromReferer(request))
    : null;
  if (!resolution) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 400 });
  }

  const tenant = await getTenantBySlug(resolution.tenant.slug);
  if (!tenant) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 400 });
  }

  const configResult = await loadSiteConfig(getTenantContentSource(tenant));
  if (!configResult.ok) {
    return NextResponse.json({ error: "Invalid site config" }, { status: 400 });
  }

  const { config } = configResult;
  if (!config.openapiProxy?.enabled) {
    return NextResponse.json({ error: "Proxy disabled" }, { status: 403 });
  }

  const url = new URL(payload.url);
  if (!["http:", "https:"].includes(url.protocol)) {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }

  let allowedHosts = config.openapiProxy.allowedHosts ?? [];
  if (!allowedHosts.length) {
    const docsCollection = config.collections.find(
      (collection) => collection.type === "docs"
    );
    const registry = await buildOpenApiRegistry(
      docsCollection,
      getTenantContentSource(tenant)
    );
    const derivedHosts = registry.entries.flatMap((entry) =>
      (entry.spec.servers ?? []).flatMap((server) => {
        try {
          return [new URL(server.url).hostname];
        } catch {
          return [];
        }
      })
    );
    allowedHosts = [...new Set(derivedHosts)];
  }

  if (!allowedHosts.length) {
    return NextResponse.json(
      { error: "No proxy allowlist is configured for this docs.json." },
      { status: 403 }
    );
  }
  if (allowedHosts.length && !allowedHosts.includes(url.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const method = payload.method.toUpperCase();
  const response = await fetch(payload.url, {
    body: method === "GET" ? undefined : payload.body,
    headers: payload.headers,
    method,
  });

  const text = await response.text();
  return new NextResponse(text, {
    headers: {
      "content-type": response.headers.get("content-type") ?? "text/plain",
    },
    status: response.status,
  });
};
