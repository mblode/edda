import path from "node:path";

import { normalizePath } from "@repo/common";
import type {
  CollectionConfig,
  ContentType,
  FrontmatterByType,
  PageMode,
  SiteConfig,
} from "@repo/models";
import { PageModeSchema } from "@repo/models";
import { validateFrontmatter } from "@repo/validation";

import type { ContentSource } from "./content-source.js";
import { parseFrontmatter } from "./markdown/format.js";
import type { ContentEntry, ContentIndex, PageMetadata } from "./types.js";

const validModes = new Set<string>(PageModeSchema.options);

export const buildPageMetadataMap = (
  index: ContentIndex
): Map<string, PageMetadata> => {
  const map = new Map<string, PageMetadata>();
  for (const entry of index.entries) {
    if (entry.kind !== "entry") {
      continue;
    }
    const fm = entry.frontmatter as Record<string, unknown>;
    const meta: PageMetadata = {
      title: entry.title,
    };
    if (typeof fm.sidebarTitle === "string") {
      meta.sidebarTitle = fm.sidebarTitle;
    }
    if (typeof fm.icon === "string") {
      meta.icon = fm.icon;
    }
    if (typeof fm.iconType === "string") {
      meta.iconType = fm.iconType;
    }
    if (typeof fm.tag === "string") {
      meta.tag = fm.tag;
    }
    if (typeof fm.hidden === "boolean") {
      meta.hidden = fm.hidden;
    }
    if (typeof fm.deprecated === "boolean") {
      meta.deprecated = fm.deprecated;
    }
    if (typeof fm.url === "string") {
      meta.url = fm.url;
    }
    if (typeof fm.mode === "string" && validModes.has(fm.mode)) {
      meta.mode = fm.mode as PageMode;
    }
    if (typeof fm.noindex === "boolean") {
      meta.noindex = fm.noindex;
    }
    if (typeof fm.hideFooterPagination === "boolean") {
      meta.hideFooterPagination = fm.hideFooterPagination;
    }
    if (typeof fm.hideApiMarker === "boolean") {
      meta.hideApiMarker = fm.hideApiMarker;
    }
    if (Array.isArray(fm.keywords)) {
      meta.keywords = fm.keywords as string[];
    }
    map.set(entry.slug, meta);
  }
  return map;
};

const DOC_FILE_EXTENSION_REGEX = /\.(mdx|md)$/;
const INDEX_SUFFIX = "/index";

const titleFromSlug = (slug: string) => {
  const clean = slug.replaceAll("-", " ").split("/").pop() ?? slug;
  if (clean === "index") {
    return "Overview";
  }
  return clean.replaceAll(/\b\w/g, (char) => char.toUpperCase());
};

const slugFromFile = (relativePath: string) => {
  const clean = normalizePath(relativePath);
  const withoutExt = clean.replace(DOC_FILE_EXTENSION_REGEX, "");
  if (withoutExt.endsWith(INDEX_SUFFIX)) {
    const trimmed = withoutExt.slice(0, -INDEX_SUFFIX.length);
    return trimmed.length ? trimmed : "index";
  }
  return withoutExt.length ? withoutExt : "index";
};

const listContentFiles = async (source: ContentSource, directory: string) => {
  const files = await source.listFiles(directory);
  return files.filter((file: string) => DOC_FILE_EXTENSION_REGEX.test(file));
};

const sortDefaults: Record<
  ContentType,
  { field: "date" | "order" | "title" | "price"; direction: "asc" | "desc" }
> = {
  blog: { direction: "desc", field: "date" },
  courses: { direction: "asc", field: "order" },
  docs: { direction: "asc", field: "title" },
  forms: { direction: "asc", field: "title" },
  notes: { direction: "desc", field: "date" },
  products: { direction: "asc", field: "title" },
  sheets: { direction: "asc", field: "title" },
  site: { direction: "asc", field: "title" },
  slides: { direction: "asc", field: "title" },
  todos: { direction: "desc", field: "date" },
};

const normalizeSortValue = (value: unknown) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
    return value.toLowerCase();
  }
  return null;
};

const compareValues = (a: unknown, b: unknown, direction: "asc" | "desc") => {
  const left = normalizeSortValue(a);
  const right = normalizeSortValue(b);
  if (left === null && right === null) {
    return 0;
  }
  if (left === null) {
    return 1;
  }
  if (right === null) {
    return -1;
  }
  const multiplier = direction === "desc" ? -1 : 1;
  if (typeof left === "number" && typeof right === "number") {
    return (left - right) * multiplier;
  }
  if (left < right) {
    return -1 * multiplier;
  }
  if (left > right) {
    return 1 * multiplier;
  }
  return 0;
};

const autoIndexTypes = new Set<ContentType>([
  "blog",
  "courses",
  "products",
  "notes",
  "forms",
  "sheets",
  "slides",
  "todos",
]);

const getCollectionIndex = (
  collection: CollectionConfig,
  slugPrefix: string
) => {
  if (collection.index) {
    return collection.index;
  }
  if (autoIndexTypes.has(collection.type)) {
    const slug = slugPrefix || collection.id;
    return {
      slug,
      title: titleFromSlug(slug),
    };
  }
  return null;
};

const addEntry = (
  entry: ContentEntry,
  index: ContentIndex,
  errors: string[]
) => {
  if (index.bySlug.has(entry.slug)) {
    errors.push(`slug "${entry.slug}" is defined more than once`);
    return;
  }
  index.entries.push(entry);
  index.bySlug.set(entry.slug, entry);
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

const buildEntryFromFile = async ({
  collection,
  errors,
  file,
  root,
  slugPrefix,
  source,
}: {
  collection: CollectionConfig;
  errors: string[];
  file: string;
  root: string;
  slugPrefix: string;
  source: ContentSource;
}): Promise<Extract<ContentEntry, { kind: "entry" }> | null> => {
  const sourcePath = root
    ? normalizePath(path.join(root, file))
    : normalizePath(file);

  let entrySource = "";
  try {
    entrySource = await source.readFile(sourcePath);
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : `Failed to read ${sourcePath}`
    );
    return null;
  }

  const { frontmatter } = parseFrontmatter(entrySource);
  const frontmatterResult = validateFrontmatter(collection.type, frontmatter);
  if (!frontmatterResult.success) {
    for (const issue of frontmatterResult.errors) {
      errors.push(`${sourcePath}: ${issue}`);
    }
  }

  const resolvedFrontmatter = frontmatterResult.success
    ? frontmatterResult.data
    : (frontmatter as FrontmatterByType[ContentType]);
  const relativeSlug = slugFromFile(file);
  const slug = resolveEntrySlug(relativeSlug, slugPrefix);
  const title =
    typeof resolvedFrontmatter?.title === "string"
      ? resolvedFrontmatter.title
      : titleFromSlug(slug);
  const description =
    typeof resolvedFrontmatter?.description === "string"
      ? resolvedFrontmatter.description
      : undefined;

  const hidden =
    typeof resolvedFrontmatter?.hidden === "boolean"
      ? resolvedFrontmatter.hidden
      : undefined;

  return {
    collectionId: collection.id,
    description,
    frontmatter: resolvedFrontmatter,
    hidden: hidden || undefined,
    kind: "entry",
    relativePath: sourcePath,
    slug,
    sourcePath,
    title,
    type: collection.type,
  };
};

export const buildContentIndex = async (
  source: ContentSource,
  config: SiteConfig
): Promise<ContentIndex> => {
  const errors: string[] = [];
  const index: ContentIndex = {
    byCollection: new Map<string, ContentEntry[]>(),
    bySlug: new Map<string, ContentEntry>(),
    entries: [],
    errors,
  };

  for (const collection of config.collections) {
    const root = normalizePath(collection.root ?? "");
    const slugPrefix = normalizePath(collection.slugPrefix ?? "");
    let files: string[] = [];
    try {
      files = await listContentFiles(source, root);
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : `Failed to read ${root || "."}`
      );
      continue;
    }

    const collectionEntries: ContentEntry[] = [];

    const resolvedEntries = await Promise.all(
      files.map(
        async (file) =>
          await buildEntryFromFile({
            collection,
            errors,
            file,
            root,
            slugPrefix,
            source,
          })
      )
    );

    for (const entry of resolvedEntries) {
      if (!entry) {
        continue;
      }

      collectionEntries.push(entry);
      addEntry(entry, index, errors);
    }

    const sortConfig = {
      ...sortDefaults[collection.type],
      ...collection.sort,
    };
    const sortField = sortConfig.field ?? "title";
    const sortDirection = sortConfig.direction ?? "asc";
    collectionEntries.sort((left, right) => {
      const leftValue =
        left.kind === "entry"
          ? (left.frontmatter as Record<string, unknown>)[sortField]
          : undefined;
      const rightValue =
        right.kind === "entry"
          ? (right.frontmatter as Record<string, unknown>)[sortField]
          : undefined;
      return compareValues(leftValue, rightValue, sortDirection);
    });

    index.byCollection.set(collection.id, collectionEntries);

    const collectionIndex = getCollectionIndex(collection, slugPrefix);
    if (collectionIndex) {
      const indexEntry: ContentEntry = {
        collectionId: collection.id,
        description: collectionIndex.description,
        kind: "index",
        slug: collectionIndex.slug,
        title: collectionIndex.title ?? titleFromSlug(collectionIndex.slug),
        type: collection.type,
      };
      addEntry(indexEntry, index, errors);
    }
  }

  return index;
};

export const shouldIncludeSearchEntry = (
  entry: ContentEntry,
  pageMetadataMap: Map<string, PageMetadata>,
  config: SiteConfig
) => {
  const pageMeta = pageMetadataMap.get(entry.slug);

  if (pageMeta?.hidden || pageMeta?.noindex) {
    return false;
  }

  if (
    config.seo?.indexing !== "all" &&
    entry.kind === "entry" &&
    entry.hidden === true
  ) {
    return false;
  }

  return true;
};
