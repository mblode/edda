import { toDocHref } from "@/lib/routes";

/**
 * Structured data for a docs page.
 *
 * One `@graph` per page, with the nodes Google documents reading from a
 * documentation site: a `WebSite` for the site name, a `WebPage` (typed also
 * as `TechArticle`) for the page itself, and a `BreadcrumbList` for the
 * breadcrumb rich result. Every node carries an `@id` so the page can point
 * at the site with `isPartOf` instead of repeating it.
 *
 * `dateModified` is the deployment's publish time. A publish rewrites every
 * file, so that is the honest last-modified date for every page it serves; the
 * sitemap's `lastmod` uses the same value. When the content source has no
 * publish time the field is omitted rather than stamped with the request time.
 */

export interface DocsJsonLdInput {
  basePath: string;
  breadcrumbs: { label: string; path: string }[];
  canonicalUrl: string;
  description?: string;
  language?: string;
  markdownUrl?: string;
  origin: string;
  publishedAt?: string | null;
  siteDescription?: string;
  siteName: string;
  title?: string;
}

type JsonLdNode = Record<string, unknown>;

// A site under a path prefix is `https://host/docs`; one at a domain root is
// `https://host/`, the same URL its canonical tag and sitemap use.
const docsRootUrl = (origin: string, basePath: string) =>
  basePath ? `${origin}${toDocHref("index", basePath)}` : `${origin}/`;

export const buildDocsJsonLd = ({
  basePath,
  breadcrumbs,
  canonicalUrl,
  description,
  language = "en",
  markdownUrl,
  origin,
  publishedAt,
  siteDescription,
  siteName,
  title,
}: DocsJsonLdInput) => {
  const siteUrl = docsRootUrl(origin, basePath);
  const siteId = `${siteUrl}#website`;

  const website: JsonLdNode = {
    "@id": siteId,
    "@type": "WebSite",
    inLanguage: language,
    name: siteName,
    url: siteUrl,
  };
  if (siteDescription) {
    website.description = siteDescription;
  }

  const webpage: JsonLdNode = {
    "@id": `${canonicalUrl}#webpage`,
    "@type": ["WebPage", "TechArticle"],
    inLanguage: language,
    isPartOf: { "@id": siteId },
    url: canonicalUrl,
  };
  if (title) {
    webpage.headline = title;
    webpage.name = title;
  }
  if (description) {
    webpage.description = description;
  }
  if (publishedAt) {
    webpage.dateModified = publishedAt;
  }
  if (markdownUrl) {
    webpage.encoding = {
      "@type": "MediaObject",
      contentUrl: markdownUrl,
      encodingFormat: "text/markdown",
    };
  }

  const graph: JsonLdNode[] = [website, webpage];

  if (breadcrumbs.length > 0) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        item: `${origin}${toDocHref(crumb.path, basePath)}`,
        name: crumb.label,
        position: index + 1,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};
