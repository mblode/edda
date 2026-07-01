import { slugify } from "@repo/common";

import { NEWLINE_REGEX } from "./constants.js";
import type { ContentSource } from "./content-source.js";
import type { ContentIndex, TocItem } from "./types.js";

const HEADING_REGEX = /^(#{2,4})\s+(.*)$/;
// Matches ``` and ~~~ fenced blocks, requiring the same fence to close them.
const TOC_FENCE_REGEX = /(`{3,}|~{3,})[\s\S]*?\1/g;

export const extractToc = (source: string): TocItem[] => {
  const withoutCode = source.replaceAll(TOC_FENCE_REGEX, "");
  const lines = withoutCode.split(NEWLINE_REGEX);
  const toc: TocItem[] = [];
  const emitted = new Set<string>();

  for (const line of lines) {
    const match = HEADING_REGEX.exec(line.trim());
    if (!match) {
      continue;
    }

    const [, hashes = "", heading = ""] = match;
    if (!(hashes && heading)) {
      continue;
    }

    const baseId = slugify(heading.trim());
    // Increment until the id is unique among the ids we have already emitted,
    // so a suffixed id never collides with an explicit "foo-1" heading.
    let id = baseId;
    let count = 1;
    while (emitted.has(id)) {
      id = `${baseId}-${count}`;
      count += 1;
    }
    emitted.add(id);

    toc.push({
      id,
      level: hashes.length,
      title: heading.trim(),
    });
  }

  return toc;
};

export const buildTocIndex = async (
  index: ContentIndex,
  source: ContentSource
): Promise<Map<string, TocItem[]>> => {
  const itemsBySlug = new Map<string, TocItem[]>();

  const results = await Promise.all(
    index.entries.map(async (entry) => {
      if (entry.kind !== "entry") {
        return null;
      }
      const rawContent = await source.readFile(entry.relativePath);
      return { slug: entry.slug, toc: extractToc(rawContent) };
    })
  );

  for (const result of results) {
    if (result) {
      itemsBySlug.set(result.slug, result.toc);
    }
  }

  return itemsBySlug;
};
