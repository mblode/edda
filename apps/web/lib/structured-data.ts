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
      founder: person,
      logo: marketingUrl("/web-app-manifest-512x512.png"),
      name: SITE_NAME,
      sameAs: ["https://github.com/mblode/blodemd"],
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
       * `SoftwareApplication` rather than `SoftwareSourceCode` because the
       * hosted platform is the product the site sells, and /pricing publishes a
       * real price for it. A `SoftwareApplication` with no `offers` would be a
       * type the page does not back up.
       */
      "@id": SOFTWARE_ID,
      "@type": "SoftwareApplication",
      applicationCategory: "DeveloperApplication",
      author: { "@id": PERSON_ID },
      description:
        "A terminal-native documentation platform. Write MDX in your repo, push from the CLI, and deploy on every merge.",
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
      name: SITE_NAME,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        url: marketingUrl("/pricing"),
      },
      operatingSystem: "Any",
      publisher: { "@id": ORGANIZATION_ID },
      url: `${MARKETING_ORIGIN}/`,
    },
  ],
};
