import { describe, expect, it } from "vitest";

import {
  articleMatchesUrlPath,
  currentDocPathFromPathname,
} from "./current-doc-path";

describe("currentDocPathFromPathname", () => {
  it("strips the tenant base path and normalizes the slug", () => {
    expect(currentDocPathFromPathname("/docs/raycast", "/docs")).toBe(
      "raycast"
    );
  });

  it("treats the collection root as index", () => {
    expect(currentDocPathFromPathname("/docs", "/docs")).toBe("index");
    expect(currentDocPathFromPathname("/", "")).toBe("index");
  });
});

describe("articleMatchesUrlPath", () => {
  it("accepts the article only when it matches the URL slug", () => {
    expect(articleMatchesUrlPath("cli", "cli")).toBe(true);
    expect(articleMatchesUrlPath("index", "cli")).toBe(false);
  });
});
