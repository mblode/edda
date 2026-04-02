import { describe, expect, it } from "vitest";

import {
  deriveDisplayNameFromProjectSlug,
  getProjectSlugError,
  resolveProjectTarget,
} from "./project-config.js";

describe("resolveProjectTarget", () => {
  it("prefers the explicit CLI project", () => {
    expect(
      resolveProjectTarget({
        cliProject: "flag-project",
        config: {
          name: "Display Name",
          slug: "config-project",
        },
        envProject: "env-project",
      })
    ).toEqual({
      project: "flag-project",
      usedLegacyNameFallback: false,
    });
  });

  it("falls back to the environment project before docs.json", () => {
    expect(
      resolveProjectTarget({
        config: {
          name: "Display Name",
          slug: "config-project",
        },
        envProject: "env-project",
      })
    ).toEqual({
      project: "env-project",
      usedLegacyNameFallback: false,
    });
  });

  it("uses docs.json slug before docs.json name", () => {
    expect(
      resolveProjectTarget({
        config: {
          name: "Display Name",
          slug: "config-project",
        },
      })
    ).toEqual({
      project: "config-project",
      usedLegacyNameFallback: false,
    });
  });

  it("marks docs.json name fallback as legacy", () => {
    expect(
      resolveProjectTarget({
        config: {
          name: "legacy-project",
        },
      })
    ).toEqual({
      project: "legacy-project",
      usedLegacyNameFallback: true,
    });
  });
});

describe("deriveDisplayNameFromProjectSlug", () => {
  it("title-cases hyphenated slugs", () => {
    expect(deriveDisplayNameFromProjectSlug("acme-docs")).toBe("Acme Docs");
    expect(deriveDisplayNameFromProjectSlug("docs")).toBe("Docs");
  });
});

describe("getProjectSlugError", () => {
  it("returns undefined for valid slugs", () => {
    expect(getProjectSlugError("acme-docs")).toBeUndefined();
  });

  it("returns a validation message for invalid slugs", () => {
    expect(getProjectSlugError("Blode.md")).toMatch(/lowercase letters/);
  });
});
