import type { TenantResolution } from "@repo/contracts";
import type { Tenant } from "@repo/models";
import { buildContentIndex, loadSiteConfig } from "@repo/previewing";

import {
  getTenantContentSource,
  resolveSiteConfigAssets,
} from "@/lib/content-source";
import { buildNavigation, flattenNav } from "@/lib/navigation";
import { buildOpenApiRegistry } from "@/lib/openapi";
import { toDocHref } from "@/lib/routes";
import { getRequestProtocol } from "@/lib/tenancy";

interface TenantRequestContext {
  basePath?: string;
  protocol?: string;
  requestedHost?: string;
  strategy?: TenantResolution["strategy"] | null;
}

const getCanonicalHost = (
  tenant: Tenant,
  requestedHost?: string,
  strategy?: TenantResolution["strategy"] | null
) =>
  strategy === "custom-domain" && requestedHost
    ? requestedHost
    : tenant.primaryDomain;

const getCanonicalBasePath = (
  tenant: Tenant,
  basePath?: string,
  strategy?: TenantResolution["strategy"] | null
) => (strategy === "path" ? "" : basePath || tenant.pathPrefix || "");

export const getTenantRequestContextFromHeaders = (
  tenant: Tenant,
  headerStore: Pick<Headers, "get">
): TenantRequestContext => ({
  basePath: headerStore.get("x-tenant-base-path") ?? tenant.pathPrefix ?? "",
  protocol: getRequestProtocol(headerStore),
  requestedHost: headerStore.get("x-tenant-domain") ?? undefined,
  strategy: (headerStore.get("x-tenant-strategy") ?? null) as
    | TenantResolution["strategy"]
    | null,
});

export const getCanonicalOrigin = (
  tenant: Tenant,
  context: TenantRequestContext = {}
) =>
  `${context.protocol ?? "https"}://${getCanonicalHost(
    tenant,
    context.requestedHost,
    context.strategy
  )}`;

const getCanonicalDocBasePath = (
  tenant: Tenant,
  context: TenantRequestContext = {}
) => getCanonicalBasePath(tenant, context.basePath, context.strategy);

const loadTenantUrlData = async (tenant: Tenant) => {
  const contentSource = getTenantContentSource(tenant);
  const configResult = await loadSiteConfig(contentSource);
  if (!configResult.ok) {
    throw new Error("Invalid config");
  }

  const config = await resolveSiteConfigAssets(
    configResult.config,
    contentSource
  );
  const contentIndex = await buildContentIndex(contentSource, config);
  if (contentIndex.errors.length) {
    throw new Error("Invalid content");
  }

  const docsCollection = config.collections.find(
    (collection) => collection.type === "docs"
  );
  const docsNavigation = docsCollection?.navigation ?? config.navigation;
  const docsCollectionWithNavigation =
    docsCollection &&
    docsNavigation &&
    docsCollection.navigation !== docsNavigation
      ? { ...docsCollection, navigation: docsNavigation }
      : docsCollection;
  const registry = await buildOpenApiRegistry(
    docsCollectionWithNavigation,
    contentSource
  );
  const nav = docsNavigation
    ? buildNavigation(
        docsNavigation,
        registry,
        docsCollection?.slugPrefix ?? ""
      )
    : [];
  const navPages = flattenNav(nav).map((page) => page.path);
  const contentPages = contentIndex.entries.map((entry) => entry.slug);

  return {
    config,
    pages: [...new Set([...navPages, ...contentPages])],
  };
};

export const buildTenantSitemapXml = async (
  tenant: Tenant,
  context: TenantRequestContext = {}
) => {
  const { pages } = await loadTenantUrlData(tenant);
  const origin = getCanonicalOrigin(tenant, context);
  const basePath = getCanonicalDocBasePath(tenant, context);
  const urls = pages.map((page) => `${origin}${toDocHref(page, basePath)}`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;
};

export const buildTenantRobotsTxt = (
  tenant: Tenant,
  context: TenantRequestContext = {}
) => {
  const origin = getCanonicalOrigin(tenant, context);
  return `User-agent: *
Allow: /
Sitemap: ${origin}/sitemap.xml`;
};

export const buildTenantLlmsTxt = async (
  tenant: Tenant,
  context: TenantRequestContext = {}
) => {
  const { config, pages } = await loadTenantUrlData(tenant);
  const origin = getCanonicalOrigin(tenant, context);
  const basePath = getCanonicalDocBasePath(tenant, context);
  const urls = pages
    .slice(0, 50)
    .map((page) => `${origin}${toDocHref(page, basePath)}`);

  return [
    `# ${config.name}`,
    config.description ? `> ${config.description}` : null,
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
    "## Key URLs",
    ...urls.map((url) => `- ${url}`),
  ]
    .filter(Boolean)
    .join("\n");
};

export const getTenantMetadata = async (tenant: Tenant) => {
  const contentSource = getTenantContentSource(tenant);
  const configResult = await loadSiteConfig(contentSource);
  if (!configResult.ok) {
    return null;
  }

  const config = await resolveSiteConfigAssets(
    configResult.config,
    contentSource
  );

  return config;
};
