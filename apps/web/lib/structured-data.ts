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
export const PERSON_ID = "https://blode.co/#person";
export const ORGANIZATION_ID = `${MARKETING_ORIGIN}/#organization`;
export const WEBSITE_ID = `${MARKETING_ORIGIN}/#website`;

const LOGO_URL = marketingUrl("/web-app-manifest-512x512.png");

export interface FaqItem {
  answer: string;
  question: string;
}

export type SchemaNode = Record<string, unknown>;

const person: SchemaNode = {
  "@id": PERSON_ID,
  "@type": "Person",
  name: "Matthew Blode",
  url: "https://blode.co/",
};

const organization: SchemaNode = {
  "@id": ORGANIZATION_ID,
  "@type": "Organization",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "m@blode.co",
  },
  email: "m@blode.co",
  founder: { "@id": PERSON_ID },
  image: LOGO_URL,
  logo: {
    "@type": "ImageObject",
    height: 512,
    url: LOGO_URL,
    width: 512,
  },
  name: SITE_NAME,
  sameAs: ["https://github.com/mblode/blodemd", "https://blode.co"],
  url: `${MARKETING_ORIGIN}/`,
};

const website: SchemaNode = {
  "@id": WEBSITE_ID,
  "@type": "WebSite",
  inLanguage: "en-US",
  name: SITE_NAME,
  publisher: { "@id": ORGANIZATION_ID },
  url: `${MARKETING_ORIGIN}/`,
};

/** Shared entities. Page-level nodes append to this graph in one script. */
export const siteGraph: SchemaNode[] = [person, organization, website];

export const pageJsonLd = (...nodes: SchemaNode[]) => ({
  "@context": "https://schema.org",
  "@graph": [...siteGraph, ...nodes],
});

export const webPageNode = ({
  description,
  extra,
  name,
  path,
  type = "WebPage",
}: {
  description: string;
  extra?: SchemaNode;
  name: string;
  path: string;
  type?: string | string[];
}): SchemaNode => ({
  "@id": `${marketingUrl(path)}#webpage`,
  "@type": type,
  description,
  isPartOf: { "@id": WEBSITE_ID },
  name,
  publisher: { "@id": ORGANIZATION_ID },
  url: marketingUrl(path),
  ...extra,
});

export const faqPageNode = (
  path: string,
  faqs: readonly FaqItem[]
): SchemaNode => ({
  "@id": `${marketingUrl(path)}#faq`,
  "@type": "FAQPage",
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: faqs.map((faq, index) => ({
    "@id": `${marketingUrl(path)}#faq-${index + 1}`,
    "@type": "Question",
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
    name: faq.question,
  })),
  url: marketingUrl(path),
});

export const articleNode = ({
  dateModified,
  datePublished,
  description,
  headline,
  path,
}: {
  dateModified: string;
  datePublished: string;
  description: string;
  headline: string;
  path: string;
}): SchemaNode => ({
  "@id": `${marketingUrl(path)}#article`,
  "@type": "Article",
  author: { "@id": PERSON_ID },
  dateModified,
  datePublished,
  description,
  headline,
  image: LOGO_URL,
  mainEntityOfPage: { "@id": `${marketingUrl(path)}#webpage` },
  publisher: { "@id": ORGANIZATION_ID },
  url: marketingUrl(path),
});

export const breadcrumbNode = (
  items: readonly { name: string; path: string }[]
): SchemaNode => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    item: marketingUrl(item.path),
    name: item.name,
    position: index + 1,
  })),
});
