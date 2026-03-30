import { ensureArray, normalizePath } from "@repo/common";
import type { CollectionConfig, DocsOpenApiSource } from "@repo/models";
import {
  extractOpenApiOperations,
  openApiIdentifier,
  openApiSlug,
  parseOpenApiSpec,
} from "@repo/prebuild";
import type { OpenApiOperation, OpenApiSpec } from "@repo/prebuild";
import { loadPrebuiltOpenApiIndex } from "@repo/previewing";
import type { ContentSource, PrebuiltOpenApiEntry } from "@repo/previewing";

export interface OpenApiEntry {
  slug: string;
  identifier: string;
  operation: OpenApiOperation;
  spec: OpenApiSpec;
  source: DocsOpenApiSource;
  sourceKey: string;
}

export interface OpenApiRegistry {
  entries: OpenApiEntry[];
  bySlug: Map<string, OpenApiEntry>;
  byIdentifier: Map<string, OpenApiEntry>;
  bySource: Map<string, OpenApiEntry[]>;
}

const toRegistry = (entries: OpenApiEntry[]): OpenApiRegistry => {
  const bySlug = new Map<string, OpenApiEntry>();
  const byIdentifier = new Map<string, OpenApiEntry>();
  const bySource = new Map<string, OpenApiEntry[]>();

  for (const entry of entries) {
    bySlug.set(entry.slug, entry);
    byIdentifier.set(entry.identifier, entry);
    if (!bySource.has(entry.sourceKey)) {
      bySource.set(entry.sourceKey, []);
    }
    bySource.get(entry.sourceKey)?.push(entry);
  }

  return { byIdentifier, bySlug, bySource, entries };
};

export const fromPrebuiltOpenApiEntries = (
  entries: PrebuiltOpenApiEntry[]
): OpenApiRegistry => toRegistry(entries);

const getOpenApiSourceKey = (source: DocsOpenApiSource): string =>
  `${source.source}::${source.directory ?? ""}::${(source.include ?? []).join(
    "|"
  )}`;

const toSourceObject = (
  value: string | DocsOpenApiSource
): DocsOpenApiSource => {
  if (typeof value === "string") {
    return { source: value };
  }
  return value;
};

const collectOpenApiSources = (collection?: CollectionConfig) => {
  const sources: DocsOpenApiSource[] = [];

  for (const item of ensureArray(collection?.openapi)) {
    if (!item) {
      continue;
    }
    sources.push(toSourceObject(item));
  }

  const groups = collection?.navigation?.groups ?? [];
  for (const group of groups) {
    if (!group.openapi) {
      continue;
    }
    sources.push(toSourceObject(group.openapi));
  }

  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = getOpenApiSourceKey(source);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const buildOpenApiRegistry = async (
  collection: CollectionConfig | undefined,
  contentSource: ContentSource
): Promise<OpenApiRegistry> => {
  if (!collection || collection.type !== "docs") {
    return toRegistry([]);
  }

  const entries: OpenApiEntry[] = [];
  const slugPrefix = normalizePath(collection.slugPrefix ?? "");

  const sources = collectOpenApiSources(collection);
  const resolved = await Promise.all(
    sources.map(async (source) => {
      const rawSpec = await contentSource.readFile(source.source);
      const spec = parseOpenApiSpec(rawSpec, source.source);
      const directory = source.directory ?? "api";
      const { operations } = extractOpenApiOperations(spec, directory);
      return { directory, operations, source, spec };
    })
  );

  for (const { directory, operations, source, spec } of resolved) {
    const sourceKey = getOpenApiSourceKey(source);
    const includeIdentifiers = source.include?.length
      ? new Set(source.include)
      : null;

    for (const operation of operations) {
      const identifier = openApiIdentifier(operation.method, operation.path);
      if (includeIdentifiers && !includeIdentifiers.has(identifier)) {
        continue;
      }

      const baseSlug = normalizePath(
        openApiSlug(operation.method, operation.path, directory)
      );
      const slug = slugPrefix
        ? normalizePath(`${slugPrefix}/${baseSlug}`)
        : baseSlug;
      const entry: OpenApiEntry = {
        identifier,
        operation,
        slug: normalizePath(slug),
        source,
        sourceKey,
        spec,
      };
      entries.push(entry);
    }
  }

  return toRegistry(entries);
};

export const loadOpenApiRegistry = async (
  collection: CollectionConfig | undefined,
  contentSource: ContentSource
): Promise<OpenApiRegistry> => {
  const prebuilt = await loadPrebuiltOpenApiIndex(contentSource);
  if (prebuilt) {
    return fromPrebuiltOpenApiEntries(prebuilt);
  }

  return await buildOpenApiRegistry(collection, contentSource);
};
