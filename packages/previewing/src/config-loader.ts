import path from "node:path";

import { normalizePath } from "@repo/common";
import type { DocsConfig, SiteConfig } from "@repo/models";
import { validateDocsConfig, validateSiteConfig } from "@repo/validation";

import { LEGACY_PROJECT_NAME_FALLBACK_WARNING } from "./constants.js";
import type { ContentSource } from "./content-source.js";
import type { SiteConfigResult } from "./types.js";

const DOCS_CONFIG_FILE = "docs.json";

const defaultLinkLabel = (input: {
  href: string;
  label?: string;
  type?: "discord" | "github";
}) => {
  if (input.label) {
    return input.label;
  }
  if (input.type === "github") {
    return "GitHub";
  }
  if (input.type === "discord") {
    return "Discord";
  }
  try {
    return new URL(input.href).hostname;
  } catch {
    return input.href;
  }
};

// oxlint-disable-next-line eslint/complexity
const mapDocsConfig = (docs: DocsConfig): SiteConfig => {
  const navigation = {
    global:
      docs.navbar?.links?.length || docs.navigation.global?.anchors?.length
        ? {
            anchors: docs.navigation.global?.anchors?.map((anchor) => ({
              href: anchor.href,
              label: anchor.anchor,
            })),
            links: docs.navbar?.links?.map((link) => ({
              href: link.href,
              label: defaultLinkLabel(link),
            })),
          }
        : undefined,
    groups: docs.navigation.groups?.map((group) => ({
      expanded: group.expanded,
      group: group.group,
      hidden: group.hidden,
      pages: group.root
        ? [
            group.root,
            ...(group.pages ?? []).filter((page) => page !== group.root),
          ]
        : group.pages,
    })),
    languages: docs.navigation.languages?.map((language) => ({
      label: language.language,
      locale: language.language,
      url: language.href,
    })),
    pages: docs.navigation.pages,
    tabs: docs.navigation.tabs?.map((tab) => ({
      groups: tab.groups?.map((group) => ({
        expanded: group.expanded,
        group: group.group,
        hidden: group.hidden,
        pages: group.root
          ? [
              group.root,
              ...(group.pages ?? []).filter((page) => page !== group.root),
            ]
          : group.pages,
      })),
      href: tab.href,
      icon: tab.icon,
      label: tab.tab,
      pages: tab.pages,
    })),
    versions: docs.navigation.versions?.map((version) => ({
      label: version.version,
      url: version.href,
    })),
  } satisfies SiteConfig["navigation"];

  return {
    collections: [
      {
        id: "docs",
        navigation,
        openapi: docs.api?.openapi,
        root: "",
        type: "docs",
      },
    ],
    contextual: docs.contextual,
    description: docs.description,
    favicon:
      typeof docs.favicon === "string" ? docs.favicon : docs.favicon?.light,
    features: {
      rightToc: true,
      search: true,
      themeToggle: docs.appearance?.strict !== true,
      toc: true,
    },
    logo: docs.logo
      ? {
          dark: typeof docs.logo === "string" ? docs.logo : docs.logo.dark,
          href: typeof docs.logo === "string" ? undefined : docs.logo.href,
          light: typeof docs.logo === "string" ? docs.logo : docs.logo.light,
        }
      : undefined,
    name: docs.name,
    navigation,
    openapiProxy: {
      enabled:
        docs.api?.playground?.proxy !== false &&
        Boolean(docs.api?.openapi || docs.api?.asyncapi),
    },
    seo: docs.seo,
    slug: docs.slug,
  };
};

const getProjectWarnings = (config: { slug?: string }): string[] =>
  config.slug ? [] : [LEGACY_PROJECT_NAME_FALLBACK_WARNING];

const readJsonConfig = async (source: ContentSource, relativePath: string) =>
  JSON.parse(await source.readFile(relativePath)) as unknown;

const normalizeRefPath = (baseDirectory: string, reference: string) => {
  if (
    reference.startsWith("/") ||
    reference.startsWith("\\") ||
    reference.startsWith("http://") ||
    reference.startsWith("https://")
  ) {
    throw new Error(
      `Invalid $ref "${reference}". Only relative JSON files are supported.`
    );
  }

  const normalized = normalizePath(path.posix.join(baseDirectory, reference));
  if (
    !normalized ||
    normalized === "." ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    throw new Error(`Invalid $ref "${reference}".`);
  }
  return normalized;
};

const resolveJsonRefs = async (
  source: ContentSource,
  value: unknown,
  baseDirectory: string,
  seen: Set<string>
): Promise<unknown> => {
  if (Array.isArray(value)) {
    return await Promise.all(
      value.map((item) => resolveJsonRefs(source, item, baseDirectory, seen))
    );
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  const reference = record.$ref;
  if (typeof reference === "string") {
    const resolvedPath = normalizeRefPath(baseDirectory, reference);
    if (seen.has(resolvedPath)) {
      throw new Error(`Circular $ref detected for "${resolvedPath}".`);
    }

    const nextSeen = new Set(seen);
    // oxlint-disable-next-line eslint-plugin-unicorn/no-immediate-mutation
    nextSeen.add(resolvedPath);
    const referenced = await readJsonConfig(source, resolvedPath);
    const referencedValue = await resolveJsonRefs(
      source,
      referenced,
      path.posix.dirname(resolvedPath) === "."
        ? ""
        : normalizePath(path.posix.dirname(resolvedPath)),
      nextSeen
    );

    const siblingEntries = Object.entries(record).filter(
      ([key]) => key !== "$ref"
    );
    if (
      !siblingEntries.length ||
      !referencedValue ||
      typeof referencedValue !== "object" ||
      Array.isArray(referencedValue)
    ) {
      return referencedValue;
    }

    const siblingValue = await resolveJsonRefs(
      source,
      Object.fromEntries(siblingEntries),
      baseDirectory,
      seen
    );
    return {
      ...(referencedValue as Record<string, unknown>),
      ...(siblingValue as Record<string, unknown>),
    };
  }

  const resolvedEntries = await Promise.all(
    Object.entries(record).map(async ([key, entryValue]) => [
      key,
      await resolveJsonRefs(source, entryValue, baseDirectory, seen),
    ])
  );
  return Object.fromEntries(resolvedEntries);
};

const readResolvedJsonConfig = async (
  source: ContentSource,
  relativePath: string
) =>
  await resolveJsonRefs(
    source,
    await readJsonConfig(source, relativePath),
    path.posix.dirname(relativePath) === "."
      ? ""
      : normalizePath(path.posix.dirname(relativePath)),
    new Set([relativePath])
  );

const loadDocsConfig = async (
  source: ContentSource
): Promise<SiteConfigResult | null> => {
  if (!(await source.exists(DOCS_CONFIG_FILE))) {
    return null;
  }

  try {
    const parsed = await readResolvedJsonConfig(source, DOCS_CONFIG_FILE);

    // Try SiteConfig format first (has collections, theme, colors, etc.)
    const siteResult = validateSiteConfig(parsed);
    if (siteResult.success) {
      return {
        config: siteResult.data,
        ok: true,
        warnings: getProjectWarnings(siteResult.data),
      };
    }

    // Fall back to DocsConfig format (Mintlify-compatible) and map to SiteConfig
    const docsResult = validateDocsConfig(parsed);
    if (docsResult.success) {
      return {
        config: mapDocsConfig(docsResult.data),
        ok: true,
        warnings: getProjectWarnings(docsResult.data),
      };
    }

    return { errors: docsResult.errors, ok: false };
  } catch (error) {
    return {
      errors: [
        error instanceof Error
          ? error.message
          : `Failed to load ${DOCS_CONFIG_FILE}`,
      ],
      ok: false,
    };
  }
};

export const loadSiteConfig = async (
  source: ContentSource
): Promise<SiteConfigResult> => {
  const docsConfig = await loadDocsConfig(source);
  if (docsConfig) {
    return docsConfig;
  }

  return {
    errors: [`${DOCS_CONFIG_FILE} not found.`],
    ok: false,
  };
};

export const getDocsCollection = (config: SiteConfig) =>
  config.collections.find((collection) => collection.type === "docs");

export const getDocsNavigation = (config: SiteConfig) =>
  getDocsCollection(config)?.navigation ?? config.navigation;

export const getDocsCollectionWithNavigation = (
  config: SiteConfig
): SiteConfig["collections"][number] | undefined => {
  const docsCollection = getDocsCollection(config);
  const docsNavigation = getDocsNavigation(config);

  return docsCollection &&
    docsNavigation &&
    docsCollection.navigation !== docsNavigation
    ? { ...docsCollection, navigation: docsNavigation }
    : docsCollection;
};
