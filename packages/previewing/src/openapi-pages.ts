import { ensureArray, normalizePath } from "@repo/common";
import type {
  CollectionConfig,
  DocsOpenApiSource,
  SiteConfig,
} from "@repo/models";
import {
  extractOpenApiOperations,
  openApiIdentifier,
  openApiSlug,
  parseOpenApiSpec,
} from "@repo/prebuild";
import type { OpenApiOperation } from "@repo/prebuild";

import { getDocsNavigation } from "./config-loader.js";
import type { ContentSource } from "./content-source.js";
import type { UtilityPage } from "./types.js";

interface UtilityOpenApiPage extends UtilityPage {
  identifier: string;
  sourceKey: string;
}

const getOpenApiSourceKey = (source: DocsOpenApiSource): string =>
  `${source.source}::${source.directory ?? ""}::${(source.include ?? []).join(
    "|"
  )}`;

const toOpenApiSourceObject = (
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
    sources.push(toOpenApiSourceObject(item));
  }

  const groups = collection?.navigation?.groups ?? [];
  for (const group of groups) {
    if (!group.openapi) {
      continue;
    }
    sources.push(toOpenApiSourceObject(group.openapi));
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

const getSchemaTypeLabel = (schema: unknown): string => {
  if (!schema || typeof schema !== "object") {
    return "any";
  }
  const record = schema as Record<string, unknown>;
  if (typeof record.$ref === "string") {
    const last = record.$ref.split("/").pop();
    return last ?? "object";
  }
  if (typeof record.type === "string") {
    if (record.type === "array" && record.items) {
      return `${getSchemaTypeLabel(record.items)}[]`;
    }
    return record.type;
  }
  if (Array.isArray(record.oneOf) || Array.isArray(record.anyOf)) {
    const variants = (record.oneOf ?? record.anyOf) as unknown[];
    return variants.map(getSchemaTypeLabel).join(" | ");
  }
  return "object";
};

const formatParameterLine = (parameter: Record<string, unknown>): string => {
  const name = String(parameter.name ?? "");
  const location = parameter.in ? ` (${parameter.in})` : "";
  const required = parameter.required ? "required" : "optional";
  const type = getSchemaTypeLabel(parameter.schema);
  const description =
    typeof parameter.description === "string" && parameter.description
      ? ` - ${parameter.description.split("\n")[0]}`
      : "";
  return `- \`${name}\`${location}: ${type}, ${required}${description}`;
};

const formatRequestBody = (body: Record<string, unknown>): string => {
  const required = body.required ? "required" : "optional";
  const content = (body.content as Record<string, unknown> | undefined) ?? {};
  const mediaTypes = Object.keys(content);
  if (mediaTypes.length === 0) {
    return `${required} body`;
  }
  return mediaTypes
    .map((mediaType) => {
      const mediaEntry = content[mediaType] as
        | Record<string, unknown>
        | undefined;
      const schemaLabel = getSchemaTypeLabel(mediaEntry?.schema);
      return `- ${mediaType} (${required}): ${schemaLabel}`;
    })
    .join("\n");
};

const formatResponses = (responses: Record<string, unknown>): string =>
  Object.entries(responses)
    .map(([status, value]) => {
      const response = (value as Record<string, unknown>) ?? {};
      const description =
        typeof response.description === "string" && response.description
          ? response.description.split("\n")[0]
          : "";
      const content =
        (response.content as Record<string, unknown> | undefined) ?? {};
      const mediaTypes = Object.keys(content);
      const mediaSuffix = mediaTypes.length
        ? ` [${mediaTypes.join(", ")}]`
        : "";
      return `- ${status}${mediaSuffix}${description ? ` - ${description}` : ""}`;
    })
    .join("\n");

export const formatOpenApiPageContent = (
  operation: OpenApiOperation
): string => {
  const parts = [`Method: ${operation.method}`, `Path: ${operation.path}`];

  if (operation.description) {
    parts.push(operation.description);
  }
  if (operation.tags.length) {
    parts.push(`Tags: ${operation.tags.join(", ")}`);
  }
  if (operation.parameters.length) {
    parts.push(
      `## Parameters\n\n${operation.parameters
        .map(formatParameterLine)
        .join("\n")}`
    );
  }
  if (operation.requestBody) {
    parts.push(
      `## Request body\n\n${formatRequestBody(operation.requestBody)}`
    );
  }
  if (operation.responses) {
    parts.push(`## Responses\n\n${formatResponses(operation.responses)}`);
  }

  return parts.join("\n\n");
};

const getGroupedOpenApiSourceKey = (
  source: string | DocsOpenApiSource
): string => getOpenApiSourceKey(toOpenApiSourceObject(source));

const collectUtilityOpenApiPages = (
  pagesByIdentifier: Map<string, UtilityOpenApiPage>,
  pagesBySource: Map<string, UtilityOpenApiPage[]>,
  operations: OpenApiOperation[],
  directory: string,
  openApiSource: DocsOpenApiSource,
  slugPrefix: string
) => {
  const sourceKey = getOpenApiSourceKey(openApiSource);
  const includeIdentifiers = openApiSource.include?.length
    ? new Set(openApiSource.include)
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
    const page = {
      content: formatOpenApiPageContent(operation),
      description: operation.description,
      identifier,
      slug,
      sourceKey,
      title: operation.summary ?? identifier,
    } satisfies UtilityOpenApiPage;

    pagesByIdentifier.set(identifier, page);
    if (!pagesBySource.has(sourceKey)) {
      pagesBySource.set(sourceKey, []);
    }
    pagesBySource.get(sourceKey)?.push(page);
  }
};

const addUtilityPagesFromSourceKey = (
  pages: Map<string, UtilityPage>,
  pagesBySource: Map<string, UtilityOpenApiPage[]>,
  sourceKey: string
) => {
  for (const page of pagesBySource.get(sourceKey) ?? []) {
    pages.set(page.slug, page);
  }
};

const addReferencedUtilityPages = (
  pages: Map<string, UtilityPage>,
  pagesByIdentifier: Map<string, UtilityOpenApiPage>,
  pageReferences: string[] | undefined,
  hiddenPages: Set<string>,
  groupHidden = false
) => {
  for (const pageReference of pageReferences ?? []) {
    if (groupHidden || hiddenPages.has(pageReference)) {
      continue;
    }

    const page = pagesByIdentifier.get(pageReference);
    if (page) {
      pages.set(page.slug, page);
    }
  }
};

export const buildUtilityOpenApiPages = async (
  config: SiteConfig,
  collection: CollectionConfig | undefined,
  source: ContentSource
) => {
  if (!collection || collection.type !== "docs") {
    return [] satisfies UtilityPage[];
  }

  const docsNavigation = getDocsNavigation(config);
  const hiddenPages = new Set(docsNavigation?.hidden);
  const slugPrefix = normalizePath(collection.slugPrefix ?? "");
  const byIdentifier = new Map<string, UtilityOpenApiPage>();
  const bySource = new Map<string, UtilityOpenApiPage[]>();
  const pages = new Map<string, UtilityPage>();
  const sources = collectOpenApiSources(collection);

  const resolved = await Promise.all(
    sources.map(async (item) => {
      const rawSpec = await source.readFile(item.source);
      const spec = parseOpenApiSpec(rawSpec, item.source);
      const directory = item.directory ?? "api";
      const { operations } = extractOpenApiOperations(spec, directory);
      return { directory, operations, source: item };
    })
  );

  for (const { directory, operations, source: openApiSource } of resolved) {
    collectUtilityOpenApiPages(
      byIdentifier,
      bySource,
      operations,
      directory,
      openApiSource,
      slugPrefix
    );
  }

  for (const openApiSource of ensureArray(collection.openapi)) {
    if (!openApiSource) {
      continue;
    }
    addUtilityPagesFromSourceKey(
      pages,
      bySource,
      getGroupedOpenApiSourceKey(openApiSource)
    );
  }

  for (const group of docsNavigation?.groups ?? []) {
    const groupHidden = group.hidden === true;
    addReferencedUtilityPages(
      pages,
      byIdentifier,
      group.pages,
      hiddenPages,
      groupHidden
    );

    if (groupHidden || !group.openapi) {
      continue;
    }
    addUtilityPagesFromSourceKey(
      pages,
      bySource,
      getGroupedOpenApiSourceKey(group.openapi)
    );
  }

  addReferencedUtilityPages(
    pages,
    byIdentifier,
    docsNavigation?.pages,
    hiddenPages
  );

  return [...pages.values()];
};
