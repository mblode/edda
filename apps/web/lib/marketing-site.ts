import type { Metadata } from "next";

/** Public marketing home. Apex marketing pages on blode.md 301 here. */
export const MARKETING_HOME = "https://blode.co/edda";

/** Product host: docs, dashboard, API, legal pages, tenant `*.blode.md` sites. */
export const PLATFORM_ORIGIN = "https://blode.md";

export const SITE_NAME = "Edda";

/** `Product: what it does`, under 60 characters so the SERP does not clip it. */
export const HOME_TITLE = "Edda | Git-native MDX docs, published on merge";

/** Default meta description for the home page and root layout. */
export const HOME_DESCRIPTION =
  "Git-native MDX docs. I built this for people who already write MDX in git. No second editor. Hosted is $0. MIT if I disappear.";

/** Inner pages set a bare title and the root layout appends the product. */
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/**
 * Marketing paths on blode.md / www.blode.md that 301 to MARKETING_HOME.
 * Host-conditional so localhost and preview deployments still render these pages.
 */
export const REDIRECTED_MARKETING_PATHS = [
  "/",
  "/about",
  "/blog",
  "/changelog",
  "/compare/mintlify",
  "/docs-as-code",
  "/free-online-llms-txt-resources",
  "/pricing",
] as const;

/**
 * Pages that remain on blode.md after the marketing move.
 * Bump the date when the page's copy changes; it feeds the sitemap `lastmod`.
 */
export const PLATFORM_PAGES = {
  "/privacy": "2026-09-21",
  "/security": "2026-09-21",
  "/terms": "2026-09-21",
} as const;

export type PlatformPath = keyof typeof PLATFORM_PAGES;

export const PLATFORM_PATHS = Object.keys(PLATFORM_PAGES) as PlatformPath[];

export const isRedirectedMarketingPath = (path: string): boolean => {
  if (
    (REDIRECTED_MARKETING_PATHS as readonly string[]).includes(path) ||
    path === "/blog" ||
    path.startsWith("/blog/")
  ) {
    return true;
  }
  return false;
};

export const platformUrl = (path: string) =>
  `${PLATFORM_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

export const marketingUrl = (path: string) =>
  isRedirectedMarketingPath(path) ? MARKETING_HOME : platformUrl(path);

/** Static 1200x630 cards in `app/`; declared here because pages replace `openGraph` wholesale. */
const OG_IMAGE = { height: 630, url: "/opengraph-image.png", width: 1200 };
const TWITTER_IMAGE = "/twitter-image.png";
export const TWITTER_CREATOR = "@mattblode";

/**
 * Page metadata with a canonical URL and `og:url`.
 *
 * Redirected marketing pages canonicalize to MARKETING_HOME. Legal and other
 * pages that still live on blode.md keep a platform canonical.
 *
 * `title` is the bare page name ("Pricing"), not the finished string: the root
 * layout's template appends the product. Next applies that template to `<title>`
 * only, so `og:title` is resolved here by hand. The home page is the exception
 * and carries the full site title absolutely.
 *
 * Next also replaces `openGraph` and `twitter` wholesale rather than merging
 * them, so a page that set only `url` would drop the site name, type, card
 * type, and the file-based images declared in the root layout. Building the
 * whole block here keeps every page complete.
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
  const canonical = marketingUrl(path);
  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: [OG_IMAGE],
      siteName: SITE_NAME,
      title: isHome ? title : `${title} | ${SITE_NAME}`,
      type,
      url: canonical,
    },
    title: isHome ? { absolute: title } : title,
    twitter: {
      card: "summary_large_image",
      creator: TWITTER_CREATOR,
      images: [TWITTER_IMAGE],
    },
  };
};
