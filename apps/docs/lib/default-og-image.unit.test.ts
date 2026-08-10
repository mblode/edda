import { describe, expect, it } from "vitest";

import { defaultOgImageUrl } from "./default-og-image";

describe("defaultOgImageUrl", () => {
  it("keeps a bare origin on the static png route", () => {
    expect(defaultOgImageUrl("https://docs.example.com")).toBe(
      "https://docs.example.com/opengraph-image.png"
    );
    expect(defaultOgImageUrl("https://docs.example.com", "")).toBe(
      "https://docs.example.com/opengraph-image.png"
    );
  });

  it("strips a trailing /docs zone path to the product card", () => {
    expect(defaultOgImageUrl("https://blode.co", "/allmd/docs")).toBe(
      "https://blode.co/allmd/opengraph-image"
    );
  });

  it("tolerates a trailing slash on the /docs base path", () => {
    expect(defaultOgImageUrl("https://blode.co", "/allmd/docs/")).toBe(
      "https://blode.co/allmd/opengraph-image"
    );
  });

  it("maps a root /docs siteUrl to the origin extensionless card", () => {
    expect(defaultOgImageUrl("https://example.com", "/docs")).toBe(
      "https://example.com/opengraph-image"
    );
    expect(defaultOgImageUrl("https://example.com", "/docs/")).toBe(
      "https://example.com/opengraph-image"
    );
  });
});
