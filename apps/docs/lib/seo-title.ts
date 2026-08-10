const MAX_TITLE_LENGTH = 60;
const SHORT_PAGE_TITLE_LIMIT = 35;

export interface BuildDocsSeoTitleInput {
  baseTitle: string;
  pageDescription?: string | null;
  pageTitle?: string | null;
  titleTemplate?: string | null;
}

const truncateAtWordBoundary = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  const ellipsis = "...";
  const budget = Math.max(maxLength - ellipsis.length, 1);
  const sliced = text.slice(0, budget);
  const lastSpace = sliced.lastIndexOf(" ");
  const trimmed = (
    lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced
  ).trimEnd();

  return `${trimmed}${ellipsis}`;
};

/**
 * Build a docs page SEO title that prefers a short pageTitle + description
 * composition when the H1 alone is thin, while staying under ~60 characters
 * including the site suffix from the title template.
 */
export const buildDocsSeoTitle = ({
  baseTitle,
  pageDescription,
  pageTitle,
  titleTemplate,
}: BuildDocsSeoTitleInput): string => {
  if (!pageTitle) {
    return baseTitle;
  }

  const template = titleTemplate?.includes("%s")
    ? titleTemplate
    : `%s · ${baseTitle}`;
  const suffixLength = template.replace("%s", "").length;
  const maxSegmentLength = Math.max(MAX_TITLE_LENGTH - suffixLength, 1);

  const description = pageDescription?.trim();
  const shouldCompose =
    Boolean(description) && pageTitle.length < SHORT_PAGE_TITLE_LIMIT;

  const rawSegment = shouldCompose ? `${pageTitle}: ${description}` : pageTitle;
  const pageSegment = truncateAtWordBoundary(rawSegment, maxSegmentLength);

  return template.replace("%s", pageSegment);
};
