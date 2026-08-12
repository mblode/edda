import type { Metadata } from "next";

export const MARKETING_ORIGIN = "https://blode.md";

export const SITE_NAME = "Blode.md";

/** `Product: what it does`, under 60 characters so the SERP does not clip it. */
export const HOME_TITLE = "Blode.md: MDX docs from git, live on merge";

/** Default meta description for the home page and root layout. */
export const HOME_DESCRIPTION =
  "Write MDX in your repo. Merge to publish a docs site with search, custom domains, and Markdown exports for agents. Hosted is $0.";

/** Inner pages set a bare title and the root layout appends the product. */
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

export const CANONICAL_PATHS = [
  "/",
  "/about",
  "/blog",
  "/changelog",
  "/free-online-llms-txt-resources",
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
 * `title` is the bare page name ("Pricing"), not the finished string: the root
 * layout's template appends the product. Next applies that template to `<title>`
 * only, so `og:title` is resolved here by hand. The home page is the exception
 * and carries the full site title absolutely.
 *
 * Next also replaces `openGraph` wholesale rather than merging it, so a page
 * that set only `url` would drop the site name and type declared in the root
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
}): Metadata => {
  const isHome = path === "/";
  return {
    alternates: { canonical: path },
    description,
    openGraph: {
      description,
      siteName: SITE_NAME,
      title: isHome ? title : `${title} | ${SITE_NAME}`,
      type,
      url: marketingUrl(path),
    },
    title: isHome ? { absolute: title } : title,
  };
};
