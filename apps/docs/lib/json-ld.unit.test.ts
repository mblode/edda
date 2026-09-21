import { describe, expect, it } from "vitest";

import { buildDocsJsonLd } from "./json-ld";

const base = {
  basePath: "/edda/docs",
  breadcrumbs: [
    { label: "Getting started", path: "index" },
    { label: "Quickstart", path: "quickstart" },
  ],
  canonicalUrl: "https://blode.co/edda/docs/quickstart",
  description: "Install the CLI and deploy.",
  markdownUrl: "https://blode.co/edda/docs/quickstart.md",
  origin: "https://blode.co",
  publishedAt: "2026-09-21T11:03:14.791Z",
  siteDescription: "Knowledge docs for agents.",
  siteName: "Edda",
  title: "Quickstart",
};

describe("buildDocsJsonLd", () => {
  it("links the page to a WebSite node and carries the publish time", () => {
    const graph = buildDocsJsonLd(base)["@graph"];

    expect(graph[0]).toEqual({
      "@id": "https://blode.co/edda/docs#website",
      "@type": "WebSite",
      description: "Knowledge docs for agents.",
      inLanguage: "en",
      name: "Edda",
      url: "https://blode.co/edda/docs",
    });
    expect(graph[1]).toMatchObject({
      "@id": "https://blode.co/edda/docs/quickstart#webpage",
      "@type": ["WebPage", "TechArticle"],
      dateModified: "2026-09-21T11:03:14.791Z",
      description: "Install the CLI and deploy.",
      encoding: {
        "@type": "MediaObject",
        contentUrl: "https://blode.co/edda/docs/quickstart.md",
        encodingFormat: "text/markdown",
      },
      headline: "Quickstart",
      inLanguage: "en",
      isPartOf: { "@id": "https://blode.co/edda/docs#website" },
      name: "Quickstart",
      url: "https://blode.co/edda/docs/quickstart",
    });
    expect(graph[2]).toEqual({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          item: "https://blode.co/edda/docs",
          name: "Getting started",
          position: 1,
        },
        {
          "@type": "ListItem",
          item: "https://blode.co/edda/docs/quickstart",
          name: "Quickstart",
          position: 2,
        },
      ],
    });
  });

  it("omits what it does not know instead of inventing it", () => {
    const graph = buildDocsJsonLd({
      ...base,
      basePath: "",
      breadcrumbs: [],
      canonicalUrl: "https://acme.blode.md/",
      description: undefined,
      markdownUrl: undefined,
      origin: "https://acme.blode.md",
      publishedAt: null,
      siteDescription: undefined,
      title: undefined,
    })["@graph"];

    expect(graph).toHaveLength(2);
    expect(graph[0]).toEqual({
      "@id": "https://acme.blode.md/#website",
      "@type": "WebSite",
      inLanguage: "en",
      name: "Edda",
      url: "https://acme.blode.md/",
    });
    expect(graph[1]).not.toHaveProperty("dateModified");
    expect(graph[1]).not.toHaveProperty("description");
    expect(graph[1]).not.toHaveProperty("encoding");
    expect(graph[1]).not.toHaveProperty("headline");
  });
});
