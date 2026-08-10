import { normalizePath } from "@repo/common";
import type { Tenant } from "@repo/models";
import { createBlobSource } from "@repo/previewing/blob-source";
import {
  PREBUILT_INDEX_PATH,
  PREBUILT_OPENAPI_INDEX_PATH,
} from "@repo/previewing/constants";
import { createFsSource } from "@repo/previewing/fs-source";

import { getTenantDocsPath } from "./content-root";
import { createTimedPromiseCache } from "./server-cache";
import { getProjectTag } from "./tenants";

const SLUG_INDEX_TTL_MS = 30 * 1000;

type SlugIndex = Set<string>;

const slugIndexCache = createTimedPromiseCache<string, SlugIndex | null>({
  maxEntries: 512,
  ttlMs: SLUG_INDEX_TTL_MS,
});

const getSource = (tenant: Tenant) => {
  if (tenant.activeDeploymentManifestUrl) {
    return createBlobSource(
      tenant.activeDeploymentManifestUrl,
      getProjectTag(tenant.slug)
    );
  }

  return createFsSource(tenant.docsPath ?? getTenantDocsPath(tenant.slug));
};

const isSlugEntryArray = (value: unknown): value is { slug: string }[] =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as { slug?: unknown }).slug === "string"
  );

const loadSlugIndex = async (tenant: Tenant): Promise<SlugIndex | null> => {
  const source = getSource(tenant);

  try {
    const raw = await source.readFile(PREBUILT_INDEX_PATH);
    const data = JSON.parse(raw) as {
      entries?: unknown;
      version?: number;
    };
    if (data.version !== 1 || !isSlugEntryArray(data.entries)) {
      return null;
    }

    const slugs = new Set(data.entries.map((entry) => entry.slug));

    try {
      const openApiRaw = await source.readFile(PREBUILT_OPENAPI_INDEX_PATH);
      const openApi = JSON.parse(openApiRaw) as {
        entries?: unknown;
        version?: number;
      };
      if (openApi.version === 1 && isSlugEntryArray(openApi.entries)) {
        for (const entry of openApi.entries) {
          slugs.add(entry.slug);
        }
      }
    } catch {
      // OpenAPI index is optional.
    }

    return slugs;
  } catch {
    // No prebuilt index (local unpublished / config-error tenants). Caller
    // must fall through so those states can still render.
    return null;
  }
};

export type DocSlugLookup = "hit" | "miss" | "unknown";

/**
 * Fast membership check against the deployment's prebuilt slug indexes.
 * Used by proxy so unknown docs can avoid the success CDN TTL (and so a
 * confirmed miss can skip streaming a soft-200 shell).
 */
export const lookupTenantDocSlug = async (
  tenant: Tenant,
  slugKey: string
): Promise<DocSlugLookup> => {
  const cacheKey = `${tenant.slug}:${tenant.activeDeploymentId ?? tenant.activeDeploymentManifestUrl ?? "local"}`;
  const index = await slugIndexCache.getOrCreate(cacheKey, () =>
    loadSlugIndex(tenant)
  );
  if (!index) {
    return "unknown";
  }

  const path = normalizePath(slugKey) || "index";
  return index.has(path) ? "hit" : "miss";
};

export const clearTenantSlugIndexCache = () => {
  slugIndexCache.clear();
};
