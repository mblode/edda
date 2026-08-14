import { DocArticleSkeleton } from "@/components/docs/doc-article-skeleton";

// Segment hole for Instant Navigations. The shared `[[...slug]]` App Shell
// must not include a resolved article, or every sidebar click can keep the
// previous page (e.g. /docs) while the URL updates.
export default function DocPageLoading() {
  return <DocArticleSkeleton />;
}
