import { describe, expect, it } from "vitest";

import {
  articleNode,
  faqPageNode,
  ORGANIZATION_ID,
  pageJsonLd,
  PERSON_ID,
  siteGraph,
  WEBSITE_ID,
  webPageNode,
} from "./structured-data";

describe("structured data graph", () => {
  it("emits one graph with stable ids and no SoftwareApplication", () => {
    const data = pageJsonLd(
      webPageNode({
        description: "Hosted docs from git.",
        name: "Blode.md",
        path: "/",
      })
    );

    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@graph"]).toHaveLength(siteGraph.length + 1);
    expect(JSON.stringify(data)).not.toContain("SoftwareApplication");
    expect(data["@graph"].some((node) => node["@id"] === PERSON_ID)).toBe(true);
    expect(data["@graph"].some((node) => node["@id"] === ORGANIZATION_ID)).toBe(
      true
    );
    expect(data["@graph"].some((node) => node["@id"] === WEBSITE_ID)).toBe(
      true
    );
  });

  it("points FAQ and Article nodes back at the shared website and org", () => {
    const faq = faqPageNode("/", [
      { answer: "Git-native MDX.", question: "Who is it for?" },
    ]);
    const article = articleNode({
      dateModified: "2026-08-13",
      datePublished: "2026-04-20",
      description: "Intro",
      headline: "Hello, Blode.md",
      path: "/blog/intro-to-blode-md",
    });

    expect(faq.isPartOf).toEqual({ "@id": WEBSITE_ID });
    expect(article.publisher).toEqual({ "@id": ORGANIZATION_ID });
    expect(article.author).toEqual({ "@id": PERSON_ID });
    expect(article.image).toContain("web-app-manifest-512x512.png");
  });
});
