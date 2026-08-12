import {
  MARKETING_ORIGIN,
  marketingUrl,
  SITE_NAME,
} from "@/lib/marketing-site";

/**
 * blode.md is a genuinely separate origin from blode.co, not one of the project
 * zones proxied under it, so it keeps its own `#organization` and `#website`.
 *
 * The one node it must not mint is the person. Reusing blode.co's `@id` across
 * domains is how schema.org entity linking consolidates one human across
 * properties: a second `#person` on this domain publishes a second Matthew
 * Blode instead.
 */
const PERSON_ID = "https://blode.co/#person";
const ORGANIZATION_ID = `${MARKETING_ORIGIN}/#organization`;
const WEBSITE_ID = `${MARKETING_ORIGIN}/#website`;
const SOFTWARE_ID = `${MARKETING_ORIGIN}/#software`;

const person = {
  "@id": PERSON_ID,
  "@type": "Person",
  name: "Matthew Blode",
  url: "https://blode.co/",
};

/**
 * One script, one `@graph`. Disconnected `ld+json` blocks describe unrelated
 * things and cannot be merged into a single entity, so every node the marketing
 * site publishes lives here.
 *
 * Emitted from the root layout, which is why there is no `WebPage` node: a
 * fixed `#webpage` id would claim every inner page is the home page.
 */
export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": ORGANIZATION_ID,
      "@type": "Organization",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "m@blode.co",
      },
      email: "m@blode.co",
      founder: person,
      logo: {
        "@type": "ImageObject",
        url: marketingUrl("/web-app-manifest-512x512.png"),
      },
      name: SITE_NAME,
      sameAs: ["https://github.com/mblode/blodemd", "https://blode.co"],
      url: `${MARKETING_ORIGIN}/`,
    },
    {
      "@id": WEBSITE_ID,
      "@type": "WebSite",
      inLanguage: "en-US",
      name: SITE_NAME,
      publisher: { "@id": ORGANIZATION_ID },
      url: `${MARKETING_ORIGIN}/`,
    },
    {
      /**
       * `SoftwareApplication` / `WebApplication` for the hosted product.
       * We omit `offers` until real reviews or an aggregateRating exist;
       * an Offer without ratings fails Semrush / rich-result validation for
       * Software Application across every page that emits this graph.
       */
      "@id": SOFTWARE_ID,
      "@type": ["SoftwareApplication", "WebApplication"],
      applicationCategory: "DeveloperApplication",
      author: { "@id": PERSON_ID },
      description:
        "Write MDX in your repo. Merge to publish a docs site with search, custom domains, and Markdown exports for agents.",
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
      name: SITE_NAME,
      operatingSystem: "Web",
      publisher: { "@id": ORGANIZATION_ID },
      url: `${MARKETING_ORIGIN}/`,
    },
  ],
};
