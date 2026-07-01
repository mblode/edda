import type { SiteConfig } from "@repo/models";

import {
  buildPageMetadataMap,
  shouldIncludeSearchEntry,
} from "./content-index.js";
import type { ContentIndex, SearchIndexItem, UtilityIndex } from "./types.js";

export const buildSearchIndex = (
  index: ContentIndex,
  config: SiteConfig,
  utilityIndex?: UtilityIndex
): SearchIndexItem[] => {
  const pageMetadataMap = buildPageMetadataMap(index);
  const items = new Map<string, SearchIndexItem>();

  for (const page of utilityIndex?.pages ?? []) {
    items.set(page.slug, {
      path: page.slug,
      title: page.title,
    });
  }

  for (const entry of index.entries) {
    if (!shouldIncludeSearchEntry(entry, pageMetadataMap, config)) {
      continue;
    }

    const pageMeta = pageMetadataMap.get(entry.slug);
    items.set(entry.slug, {
      href: pageMeta?.url,
      path: entry.slug,
      title: pageMeta?.sidebarTitle ?? entry.title,
    });
  }

  return [...items.values()];
};
