import { describe, expect, it } from "vitest";

import { buildDocsSeoTitle } from "./seo-title";

describe("buildDocsSeoTitle", () => {
  it("returns baseTitle when pageTitle is missing", () => {
    expect(
      buildDocsSeoTitle({
        baseTitle: "Edda",
        pageDescription: "Some description",
      })
    ).toBe("Edda");
  });

  it("uses the page title alone and never appends the description", () => {
    expect(
      buildDocsSeoTitle({
        baseTitle: "Edda",
        pageDescription:
          "Start a local development server for real-time docs preview with hot reload.",
        pageTitle: "edda dev",
      })
    ).toBe("edda dev · Edda");
  });

  it("clamps a long page title to 60 chars at a word boundary", () => {
    const title = buildDocsSeoTitle({
      baseTitle: "Edda",
      pageTitle:
        "A descriptive page title that is already long enough for SERP clipping",
    });

    expect(title.endsWith("... · Edda")).toBe(true);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.startsWith("A descriptive page title")).toBe(true);
  });

  it("hard-slices when a single token exceeds the budget", () => {
    const title = buildDocsSeoTitle({
      baseTitle: "Edda",
      pageTitle: "x".repeat(80),
    });

    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith("... · Edda")).toBe(true);
  });

  it("respects a custom titleTemplate with %s", () => {
    expect(
      buildDocsSeoTitle({
        baseTitle: "Edda",
        pageDescription: "Authenticate with GitHub in your browser.",
        pageTitle: "login",
        titleTemplate: "%s | Docs",
      })
    ).toBe("login | Docs");
  });
});
