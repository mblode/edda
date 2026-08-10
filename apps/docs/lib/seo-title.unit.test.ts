import { describe, expect, it } from "vitest";

import { buildDocsSeoTitle } from "./seo-title";

describe("buildDocsSeoTitle", () => {
  it("returns baseTitle when pageTitle is missing", () => {
    expect(
      buildDocsSeoTitle({
        baseTitle: "Blode.md",
        pageDescription: "Some description",
      })
    ).toBe("Blode.md");
  });

  it("uses pageTitle alone when it is not short, clamped to 60 chars", () => {
    const pageTitle =
      "A descriptive page title that is already long enough for SERP";
    const title = buildDocsSeoTitle({
      baseTitle: "Blode.md",
      pageDescription: "Extra context that should not be composed.",
      pageTitle,
    });

    expect(title.endsWith(" · Blode.md")).toBe(true);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.startsWith("A descriptive page title")).toBe(true);
  });

  it("composes short pageTitle with description under 60 chars", () => {
    const title = buildDocsSeoTitle({
      baseTitle: "Blode.md",
      pageDescription:
        "Start a local development server for real-time docs preview with hot reload.",
      pageTitle: "blodemd dev",
    });

    expect(title.startsWith("blodemd dev: ")).toBe(true);
    expect(title.endsWith(" · Blode.md")).toBe(true);
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it("truncates at a word boundary and appends ellipsis", () => {
    const title = buildDocsSeoTitle({
      baseTitle: "Blode.md",
      pageDescription:
        "Display multiple related code blocks with tabbed navigation across languages and tools for installers.",
      pageTitle: "Code group",
    });

    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith("... · Blode.md")).toBe(true);
    expect(title.startsWith("Code group: Display")).toBe(true);
  });

  it("hard-slices when a single token exceeds the budget", () => {
    const title = buildDocsSeoTitle({
      baseTitle: "Blode.md",
      pageDescription: "x".repeat(80),
      pageTitle: "Tabs",
    });

    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith("... · Blode.md")).toBe(true);
  });

  it("respects a custom titleTemplate with %s", () => {
    const title = buildDocsSeoTitle({
      baseTitle: "Blode.md",
      pageDescription: "Authenticate with GitHub in your browser.",
      pageTitle: "login",
      titleTemplate: "%s | Docs",
    });

    expect(title.startsWith("login: ")).toBe(true);
    expect(title.endsWith(" | Docs")).toBe(true);
    expect(title.length).toBeLessThanOrEqual(60);
  });
});
