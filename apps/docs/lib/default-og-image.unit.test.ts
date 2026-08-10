import { describe, expect, it } from "vitest";

import { defaultOgImageUrl } from "./default-og-image";

describe("defaultOgImageUrl", () => {
  it("keeps a bare origin working", () => {
    expect(defaultOgImageUrl("https://docs.example.com")).toBe(
      "https://docs.example.com/opengraph-image.png"
    );
    expect(defaultOgImageUrl("https://docs.example.com", "")).toBe(
      "https://docs.example.com/opengraph-image.png"
    );
  });

  it("includes the zone path from seo.siteUrl", () => {
    expect(defaultOgImageUrl("https://blode.co", "/allmd/docs")).toBe(
      "https://blode.co/allmd/docs/opengraph-image.png"
    );
  });

  it("tolerates a trailing slash on the base path", () => {
    expect(defaultOgImageUrl("https://blode.co", "/allmd/docs/")).toBe(
      "https://blode.co/allmd/docs/opengraph-image.png"
    );
  });
});
