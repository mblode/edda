import { afterEach, describe, expect, it, vi } from "vitest";

const readFile = vi.fn();
const listFiles = vi.fn();

vi.mock("@repo/previewing/blob-source", () => ({
  createBlobSource: () => ({ listFiles, readFile }),
}));

vi.mock("@repo/previewing/fs-source", () => ({
  createFsSource: () => ({ listFiles, readFile }),
}));

const tenant = {
  activeDeploymentId: "dep_1",
  activeDeploymentManifestUrl: "https://blob.example.com/manifest.json",
  customDomains: [],
  id: "tenant-id",
  name: "Acme",
  primaryDomain: "acme.blode.md",
  slug: "acme",
  status: "active" as const,
  subdomain: "acme",
};

describe("lookupTenantDocSlug", () => {
  afterEach(() => {
    vi.resetModules();
    readFile.mockReset();
    listFiles.mockReset();
  });

  it("reports hits and misses from the prebuilt indexes", async () => {
    readFile.mockImplementation((path: string) => {
      if (path === "_content-index.json") {
        return Promise.resolve(
          JSON.stringify({
            entries: [{ slug: "index" }, { slug: "guide" }],
            version: 1,
          })
        );
      }
      if (path === "_openapi-index.json") {
        return Promise.resolve(
          JSON.stringify({
            entries: [{ slug: "api/overview" }],
            version: 1,
          })
        );
      }
      return Promise.reject(new Error(`unexpected ${path}`));
    });

    const { clearTenantSlugIndexCache, lookupTenantDocSlug } =
      await import("./tenant-slug-index");
    clearTenantSlugIndexCache();

    expect(await lookupTenantDocSlug(tenant, "")).toBe("hit");
    expect(await lookupTenantDocSlug(tenant, "guide")).toBe("hit");
    expect(await lookupTenantDocSlug(tenant, "api/overview")).toBe("hit");
    expect(await lookupTenantDocSlug(tenant, "missing-page")).toBe("miss");
  });

  it("falls back to content files when the prebuilt index is missing", async () => {
    readFile.mockImplementation((path: string) => {
      if (path === "_content-index.json" || path === "_openapi-index.json") {
        return Promise.reject(new Error("missing"));
      }
      if (path === "docs.json") {
        return Promise.resolve(JSON.stringify({ name: "Acme" }));
      }
      return Promise.reject(new Error(`unexpected ${path}`));
    });
    listFiles.mockResolvedValue([
      "index.mdx",
      "guide.mdx",
      "cli/index.mdx",
      "cli/usage.mdx",
      "meta.json",
    ]);

    const { clearTenantSlugIndexCache, lookupTenantDocSlug } =
      await import("./tenant-slug-index");
    clearTenantSlugIndexCache();

    expect(await lookupTenantDocSlug(tenant, "")).toBe("hit");
    expect(await lookupTenantDocSlug(tenant, "guide")).toBe("hit");
    expect(await lookupTenantDocSlug(tenant, "cli")).toBe("hit");
    expect(await lookupTenantDocSlug(tenant, "cli/usage")).toBe("hit");
    expect(await lookupTenantDocSlug(tenant, "missing-page")).toBe("miss");
  });

  it("keeps misses unknown when OpenAPI is configured without an index", async () => {
    readFile.mockImplementation((path: string) => {
      if (path === "_content-index.json" || path === "_openapi-index.json") {
        return Promise.reject(new Error("missing"));
      }
      if (path === "docs.json") {
        return Promise.resolve(
          JSON.stringify({
            api: { openapi: "openapi.yaml" },
            name: "Acme",
          })
        );
      }
      return Promise.reject(new Error(`unexpected ${path}`));
    });
    listFiles.mockResolvedValue(["index.mdx", "guide.mdx"]);

    const { clearTenantSlugIndexCache, lookupTenantDocSlug } =
      await import("./tenant-slug-index");
    clearTenantSlugIndexCache();

    expect(await lookupTenantDocSlug(tenant, "guide")).toBe("hit");
    expect(await lookupTenantDocSlug(tenant, "missing-page")).toBe("unknown");
  });

  it("returns unknown when no content files or prebuilt index exist", async () => {
    readFile.mockRejectedValue(new Error("missing"));
    listFiles.mockRejectedValue(new Error("missing"));
    const { clearTenantSlugIndexCache, lookupTenantDocSlug } =
      await import("./tenant-slug-index");
    clearTenantSlugIndexCache();

    expect(await lookupTenantDocSlug(tenant, "guide")).toBe("unknown");
  });
});
