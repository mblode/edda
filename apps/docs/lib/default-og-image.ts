/**
 * Default Open Graph image URL for a docs site.
 *
 * Must stay path-aware: `seo.siteUrl` may include a zone path
 * (`https://blode.co/allmd/docs`), and dropping it advertises the hub card at
 * `/opengraph-image.png` instead of the docs zone's card.
 *
 * Bare-origin siteUrls (`https://docs.example.com`) keep working — `basePath`
 * is empty and the URL collapses to `${origin}/opengraph-image.png`.
 *
 * The docs app ships a static `app/opengraph-image.png` metadata file, so the
 * route keeps the `.png` extension. Generated `opengraph-image.tsx` routes use
 * the extensionless form; switch this helper if the file convention changes.
 */
export const defaultOgImageUrl = (origin: string, basePath = "") => {
  const normalizedBase = basePath.replace(/\/+$/, "");
  return `${origin}${normalizedBase}/opengraph-image.png`;
};
