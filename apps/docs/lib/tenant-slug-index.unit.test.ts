import { afterEach, describe, expect, it, vi } from "vitest";

const readFile = vi.fn();

vi.mock("@repo/previewing/blob-source", () => ({
  createBlobSource: () => ({ readFile }),
}));

vi.mock("@repo/previewing/fs-source", () => ({
  createFsSource: () => ({ readFile }),
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

  it("returns unknown when no prebuilt index exists", async () => {
    readFile.mockRejectedValue(new Error("missing"));
    const { clearTenantSlugIndexCache, lookupTenantDocSlug } =
      await import("./tenant-slug-index");
    clearTenantSlugIndexCache();

    expect(await lookupTenantDocSlug(tenant, "guide")).toBe("unknown");
  });
});
