import type { Metadata } from "next";

/**
 * Brand/marketing page, owned by the blode-co repo.
 * Apex `/` on blode.md 301s here. Not a product host.
 */
export const MARKETING_HOME = "https://blode.co/edda";

/**
 * Product runtime host: docs, dashboard, API, tenant `*.blode.md` sites,
 * and every apex page except the marketing landing.
 */
export const PLATFORM_ORIGIN = "https://blode.md";

export const SITE_NAME = "Edda";

/** Designer lock. Keep character-for-character with the README hero. */
// oxfmt-ignore
export const HOME_TITLE = "Knowledge docs for agents. Git-native MDX. Publish on merge.";

/** Default meta description. Lock first, how second. */
export const HOME_DESCRIPTION = `${HOME_TITLE} Write MDX in git. The merge publishes the site and the Markdown from that commit. Hosted is $0. MIT if I disappear.`;

/** Inner pages set a bare title and the root layout appends the product. */
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

/**
 * Only the apex marketing landing 301s to MARKETING_HOME.
 * Do not whole-host redirect blode.md. Product routes stay.
 */
export const REDIRECTED_MARKETING_PATHS = ["/"] as const;

/**
 * Pages that remain on blode.md.
 * Bump the date when the page's copy changes; it feeds the sitemap `lastmod`.
 */
export const PLATFORM_PAGES = {
  "/about": "2026-08-14",
  "/blog": "2026-09-19",
  "/changelog": "2026-09-19",
  "/compare/mintlify": "2026-09-06",
  "/docs-as-code": "2026-09-06",
  "/free-online-llms-txt-resources": "2026-09-19",
  "/pricing": "2026-08-14",
  "/privacy": "2026-08-14",
  "/security": "2026-08-14",
  "/terms": "2026-08-14",
} as const;

export type PlatformPath = keyof typeof PLATFORM_PAGES;

export const PLATFORM_PATHS = Object.keys(PLATFORM_PAGES) as PlatformPath[];

export const isRedirectedMarketingPath = (path: string): boolean =>
  path === "/" || path === "";

export const platformUrl = (path: string) =>
  `${PLATFORM_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

/** Brand home for `/`; every other path stays on the product host. */
export const marketingUrl = (path: string) =>
  isRedirectedMarketingPath(path) ? MARKETING_HOME : platformUrl(path);

/** Static 1200x630 cards in `app/`; declared here because pages replace `openGraph` wholesale. */
const OG_IMAGE = { height: 630, url: "/opengraph-image.png", width: 1200 };
const TWITTER_IMAGE = "/twitter-image.png";
export const TWITTER_CREATOR = "@mattblode";

/**
 * Page metadata with a canonical URL and `og:url`.
 *
 * The apex landing canonicalizes to MARKETING_HOME (it 301s there).
 * Every other page keeps a blode.md canonical.
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
