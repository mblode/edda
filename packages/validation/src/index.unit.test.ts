import { describe, expect, it } from "vitest";

import { validateDocsConfig, validateDocsConfigForRender } from "./index.js";

const baseConfig = {
  name: "Acme",
  navigation: { pages: ["index"] },
};

describe("config validation", () => {
  describe("authoring", () => {
    it("rejects unknown keys so typos are caught before deploy", () => {
      const result = validateDocsConfig({ ...baseConfig, nvaigation: {} });

      expect(result.success).toBe(false);
      expect(result.success ? [] : result.errors.join(" ")).toContain(
        "nvaigation"
      );
    });

    it("rejects unknown keys nested inside a known object", () => {
      const result = validateDocsConfig({
        ...baseConfig,
        seo: { indexign: "all" },
      });

      expect(result.success).toBe(false);
      expect(result.success ? [] : result.errors.join(" ")).toContain(
        "indexign"
      );
    });
  });

  describe("rendering", () => {
    // A published site went down because its config carried two keys the
    // deployed platform did not know about. Content that was valid when it
    // shipped must keep rendering.
    it("ignores unknown keys instead of failing the whole site", () => {
      const result = validateDocsConfigForRender({
        ...baseConfig,
        colors: { primary: "#000" },
        theme: "mint",
      });

      expect(result.success).toBe(true);
      expect(result.ignoredKeys).toEqual(
        expect.arrayContaining(["theme", "colors"])
      );
    });

    it("ignores unknown keys nested inside a known object", () => {
      const result = validateDocsConfigForRender({
        ...baseConfig,
        seo: { indexing: "all", futureField: true },
      });

      expect(result.success).toBe(true);
      expect(result.ignoredKeys).toContain("seo.futureField");
      // The keys we do understand survive untouched.
      expect(result.success && result.data.seo?.indexing).toBe("all");
    });

    it("still fails on a value of the wrong type", () => {
      const result = validateDocsConfigForRender({
        ...baseConfig,
        navigation: { pages: "not-an-array" },
      });

      expect(result.success).toBe(false);
    });

    it("still fails when a required field is missing", () => {
      const result = validateDocsConfigForRender({ unknown: true });

      expect(result.success).toBe(false);
    });

    it("reports nothing ignored for a clean config", () => {
      const result = validateDocsConfigForRender(baseConfig);

      expect(result.success).toBe(true);
      expect(result.ignoredKeys).toEqual([]);
    });
  });
});
