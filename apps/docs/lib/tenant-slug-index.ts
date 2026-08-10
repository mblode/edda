import { normalizePath } from "@repo/common";
import type { Tenant } from "@repo/models";
import type { ContentSource } from "@repo/previewing";
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
const DOC_FILE_EXTENSION_REGEX = /\.(mdx|md)$/;
const INDEX_SUFFIX = "/index";

interface SlugIndex {
  /** When false, misses cannot be treated as definitive 404s (e.g. OpenAPI). */
  definitive: boolean;
  slugs: Set<string>;
}

const slugIndexCache = createTimedPromiseCache<string, SlugIndex | null>({
  maxEntries: 512,
  ttlMs: SLUG_INDEX_TTL_MS,
});

const getSource = (tenant: Tenant): ContentSource => {
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

const slugFromFile = (relativePath: string) => {
  const clean = normalizePath(relativePath);
  const withoutExt = clean.replace(DOC_FILE_EXTENSION_REGEX, "");
  if (withoutExt.endsWith(INDEX_SUFFIX)) {
    const trimmed = withoutExt.slice(0, -INDEX_SUFFIX.length);
    return trimmed.length ? trimmed : "index";
  }
  return withoutExt.length ? withoutExt : "index";
};

const resolveEntrySlug = (relativeSlug: string, slugPrefix: string) => {
  if (!slugPrefix) {
    return relativeSlug;
  }
  if (relativeSlug === "index") {
    return slugPrefix;
  }
  return normalizePath(`${slugPrefix}/${relativeSlug}`);
};

const readDocsJsonMeta = async (source: ContentSource) => {
  try {
    const raw = await source.readFile("docs.json");
    const data = JSON.parse(raw) as {
      api?: { openapi?: unknown };
      collections?: { root?: string; slugPrefix?: string }[];
    };
    const collections = Array.isArray(data.collections)
      ? data.collections.map((collection) => ({
          root: normalizePath(collection.root ?? ""),
          slugPrefix: normalizePath(collection.slugPrefix ?? ""),
        }))
      : [{ root: "", slugPrefix: "" }];
    return {
      collections:
        collections.length > 0 ? collections : [{ root: "", slugPrefix: "" }],
      hasOpenApi: Boolean(data.api?.openapi),
    };
  } catch {
    return {
      collections: [{ root: "", slugPrefix: "" }],
      hasOpenApi: false,
    };
  }
};

const loadOpenApiSlugs = async (source: ContentSource) => {
  try {
    const openApiRaw = await source.readFile(PREBUILT_OPENAPI_INDEX_PATH);
    const openApi = JSON.parse(openApiRaw) as {
      entries?: unknown;
      version?: number;
    };
    if (openApi.version === 1 && isSlugEntryArray(openApi.entries)) {
      return {
        loaded: true as const,
        slugs: openApi.entries.map((entry) => entry.slug),
      };
    }
  } catch {
    // OpenAPI index is optional.
  }
  return { loaded: false as const, slugs: [] as string[] };
};

const loadSlugIndexFromContentFiles = async (
  source: ContentSource
): Promise<SlugIndex | null> => {
  try {
    const { collections, hasOpenApi } = await readDocsJsonMeta(source);
    const openApi = await loadOpenApiSlugs(source);
    const slugs = new Set<string>();

    for (const collection of collections) {
      const files = await source.listFiles(collection.root);
      for (const file of files) {
        if (!DOC_FILE_EXTENSION_REGEX.test(file)) {
          continue;
        }
        slugs.add(resolveEntrySlug(slugFromFile(file), collection.slugPrefix));
      }
    }

    for (const slug of openApi.slugs) {
      slugs.add(slug);
    }

    if (slugs.size === 0) {
      return null;
    }

    // File listing cannot see virtual OpenAPI operation pages. Only treat
    // misses as definitive when OpenAPI is absent or we loaded its index.
    const definitive = !hasOpenApi || openApi.loaded;
    return { definitive, slugs };
  } catch {
    return null;
  }
};

const loadSlugIndex = async (tenant: Tenant): Promise<SlugIndex | null> => {
  const source = getSource(tenant);

  try {
    const raw = await source.readFile(PREBUILT_INDEX_PATH);
    const data = JSON.parse(raw) as {
      entries?: unknown;
      version?: number;
    };
    if (data.version !== 1 || !isSlugEntryArray(data.entries)) {
      return await loadSlugIndexFromContentFiles(source);
    }

    const slugs = new Set(data.entries.map((entry) => entry.slug));
    const openApi = await loadOpenApiSlugs(source);
    for (const slug of openApi.slugs) {
      slugs.add(slug);
    }

    return { definitive: true, slugs };
  } catch {
    // Older deployments predate `_content-index.json`. Derive slugs from the
    // content files in the manifest so proxy can still emit real 404s.
    return await loadSlugIndexFromContentFiles(source);
  }
};

export type DocSlugLookup = "hit" | "miss" | "unknown";

/**
 * Fast membership check against the deployment's slug indexes.
 * Used by proxy so unknown docs can avoid the success CDN TTL (and so a
 * confirmed miss can return a real HTTP 404 before Cache Components streams
 * a soft-200 shell).
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
  if (index.slugs.has(path)) {
    return "hit";
  }
  return index.definitive ? "miss" : "unknown";
};

export const clearTenantSlugIndexCache = () => {
  slugIndexCache.clear();
};
