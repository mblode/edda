/**
 * Default Open Graph image URL for a docs site.
 *
 * Must stay path-aware: `seo.siteUrl` may include a zone path
 * (`https://blode.co/allmd/docs`). Multi-zone product cards live at the zone
 * root (`/allmd/opengraph-image`), not under the nested `/docs` segment, so a
 * siteUrl ending in `/docs` strips that suffix and advertises the extensionless
 * Next-generated route.
 *
 * Bare-origin siteUrls (`https://docs.example.com`) keep the static docs-app
 * file: `${origin}/opengraph-image.png`.
 */
export const defaultOgImageUrl = (origin: string, basePath = "") => {
  const normalizedBase = basePath.replace(/\/+$/, "");

  if (!normalizedBase) {
    return `${origin}/opengraph-image.png`;
  }

  if (normalizedBase === "/docs" || normalizedBase.endsWith("/docs")) {
    const zoneBase = normalizedBase.replace(/\/docs$/, "");
    return `${origin}${zoneBase}/opengraph-image`;
  }

  return `${origin}${normalizedBase}/opengraph-image.png`;
};
