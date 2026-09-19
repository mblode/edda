import type { SiteConfig } from "@repo/models";
import { buildContentIndex, createFsSource } from "@repo/previewing";

// Agents pick a page from its `[title](url.md): description` line in llms.txt,
// so a page without a description lists as a bare title and gets skipped or
// guessed at. Hidden pages never reach the index, so they are not reported.
const MAX_LISTED_SLUGS = 5;

export const collectPageDescriptionWarnings = async (
  root: string,
  config: SiteConfig
): Promise<string[]> => {
  const index = await buildContentIndex(createFsSource(root), config);
  const missing = index.entries
    .filter(
      (entry) =>
        entry.kind === "entry" && !entry.hidden && !entry.description?.trim()
    )
    .map((entry) => entry.slug)
    .toSorted();

  if (missing.length === 0) {
    return [];
  }

  const listed = missing.slice(0, MAX_LISTED_SLUGS).join(", ");
  const rest =
    missing.length > MAX_LISTED_SLUGS
      ? ` and ${missing.length - MAX_LISTED_SLUGS} more`
      : "";
  const noun = missing.length === 1 ? "page has" : "pages have";
  return [
    `${missing.length} ${noun} no frontmatter description (${listed}${rest}). Agents choose pages from the description line in llms.txt, so add one sentence to each.`,
  ];
};
