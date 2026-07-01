import {
  PREBUILT_INDEX_PATH,
  PREBUILT_OPENAPI_INDEX_PATH,
  PREBUILT_SEARCH_INDEX_PATH,
  PREBUILT_TOC_INDEX_PATH,
  PREBUILT_UTILITY_INDEX_PATH,
} from "./constants.js";
import type { ContentSource } from "./content-source.js";
import type {
  ContentEntry,
  ContentIndex,
  PrebuiltOpenApiEntry,
  SearchIndexItem,
  TocItem,
  UtilityIndex,
  UtilityPage,
  UtilitySegment,
} from "./types.js";

interface SerializedContentIndex {
  version: 1;
  entries: ContentEntry[];
  collections: Record<string, ContentEntry[]>;
}

interface SerializedOpenApiIndex {
  entries: PrebuiltOpenApiEntry[];
  version: 1;
}

interface SerializedSearchIndex {
  items: SearchIndexItem[];
  version: 1;
}

interface SerializedTocIndex {
  itemsBySlug: Record<string, TocItem[]>;
  version: 1;
}

interface SerializedUtilityIndex {
  description?: string;
  name: string;
  pages: UtilityPage[];
  segments?: UtilitySegment[];
  slug?: string;
  version: 1;
}

export const serializeContentIndex = (index: ContentIndex): string =>
  JSON.stringify({
    collections: Object.fromEntries(index.byCollection),
    entries: index.entries,
    version: 1,
  } satisfies SerializedContentIndex);

export const serializeOpenApiIndex = (
  entries: PrebuiltOpenApiEntry[]
): string =>
  JSON.stringify({
    entries,
    version: 1,
  } satisfies SerializedOpenApiIndex);

export const loadPrebuiltContentIndex = async (
  source: ContentSource
): Promise<ContentIndex | null> => {
  try {
    const raw = await source.readFile(PREBUILT_INDEX_PATH);
    const data = JSON.parse(raw) as SerializedContentIndex;
    if (data.version !== 1 || !Array.isArray(data.entries)) {
      return null;
    }

    const bySlug = new Map<string, ContentEntry>();
    const byCollection = new Map<string, ContentEntry[]>();

    for (const entry of data.entries) {
      bySlug.set(entry.slug, entry);
    }

    for (const [collectionId, entries] of Object.entries(
      data.collections ?? {}
    )) {
      byCollection.set(collectionId, entries);
    }

    return {
      byCollection,
      bySlug,
      entries: data.entries,
      errors: [],
    };
  } catch {
    return null;
  }
};

export const loadPrebuiltOpenApiIndex = async (
  source: ContentSource
): Promise<PrebuiltOpenApiEntry[] | null> => {
  try {
    const raw = await source.readFile(PREBUILT_OPENAPI_INDEX_PATH);
    const data = JSON.parse(raw) as SerializedOpenApiIndex;
    if (data.version !== 1 || !Array.isArray(data.entries)) {
      return null;
    }

    return data.entries;
  } catch {
    return null;
  }
};

export const serializeSearchIndex = (items: SearchIndexItem[]): string =>
  JSON.stringify({
    items,
    version: 1,
  } satisfies SerializedSearchIndex);

export const loadPrebuiltSearchIndex = async (
  source: ContentSource
): Promise<SearchIndexItem[] | null> => {
  try {
    const raw = await source.readFile(PREBUILT_SEARCH_INDEX_PATH);
    const data = JSON.parse(raw) as SerializedSearchIndex;
    if (data.version !== 1 || !Array.isArray(data.items)) {
      return null;
    }

    return data.items;
  } catch {
    return null;
  }
};

export const serializeTocIndex = (
  itemsBySlug: Map<string, TocItem[]>
): string =>
  JSON.stringify({
    itemsBySlug: Object.fromEntries(itemsBySlug),
    version: 1,
  } satisfies SerializedTocIndex);

export const loadPrebuiltTocIndex = async (
  source: ContentSource
): Promise<Map<string, TocItem[]> | null> => {
  try {
    const raw = await source.readFile(PREBUILT_TOC_INDEX_PATH);
    const data = JSON.parse(raw) as SerializedTocIndex;
    if (data.version !== 1 || typeof data.itemsBySlug !== "object") {
      return null;
    }

    return new Map(Object.entries(data.itemsBySlug ?? {}));
  } catch {
    return null;
  }
};

export const serializeUtilityIndex = (index: UtilityIndex): string =>
  JSON.stringify({
    ...index,
    version: 1,
  } satisfies SerializedUtilityIndex);

export const loadPrebuiltUtilityIndex = async (
  source: ContentSource
): Promise<UtilityIndex | null> => {
  try {
    const raw = await source.readFile(PREBUILT_UTILITY_INDEX_PATH);
    const data = JSON.parse(raw) as SerializedUtilityIndex;
    if (
      data.version !== 1 ||
      typeof data.name !== "string" ||
      !Array.isArray(data.pages)
    ) {
      return null;
    }

    return {
      description: data.description,
      name: data.name,
      pages: data.pages,
      segments: Array.isArray(data.segments) ? data.segments : undefined,
      slug: data.slug,
    };
  } catch {
    return null;
  }
};
