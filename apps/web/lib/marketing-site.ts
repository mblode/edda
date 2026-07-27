import type { Metadata } from "next";

export const MARKETING_ORIGIN = "https://blode.md";

export const CANONICAL_PATHS = [
  "/",
  "/about",
  "/blog",
  "/changelog",
  "/pricing",
  "/privacy",
  "/security",
  "/terms",
] as const;

export type CanonicalPath = (typeof CANONICAL_PATHS)[number];

export const marketingUrl = (path: string) => `${MARKETING_ORIGIN}${path}`;

/**
 * Page metadata with a canonical URL and `og:url`.
 *
 * Next replaces `openGraph` wholesale rather than merging it, so a page that
 * sets only `url` would drop the site name and type declared in the root
 * layout. Building the whole block here keeps every page complete.
 */
export const pageMetadata = ({
  description,
  path,
  title,
  type = "website",
}: {
  description: string;
  path: string;
  title: string;
  type?: "article" | "website";
}): Metadata => ({
  alternates: { canonical: path },
  description,
  openGraph: {
    description,
    siteName: "Blode.md",
    title,
    type,
    url: marketingUrl(path),
  },
  title,
});
