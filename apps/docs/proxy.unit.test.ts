import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const resolveTenant = vi.fn();
const lookupTenantDocSlug = vi.fn();

vi.mock("./lib/tenancy", () => ({
  getRequestHost: (headers: Headers) => headers.get("host"),
  isReservedPath: () => false,
  isRootRuntimeHost: () => false,
  isTenantUtilityPath: () => false,
  resolveTenant: (...args: unknown[]) => resolveTenant(...args),
}));

vi.mock("./lib/tenant-slug-index", () => ({
  lookupTenantDocSlug: (...args: unknown[]) => lookupTenantDocSlug(...args),
}));

vi.mock("./lib/marketing-markdown", () => ({
  getMarketingMarkdown: () => null,
}));

const tenant = {
  activeDeploymentId: "dep_1",
  activeDeploymentManifestUrl: "https://blob.example.com/manifest.json",
  analytics: undefined,
  customDomains: [],
  id: "tenant-id",
  name: "Acme",
  pathPrefix: "/docs",
  primaryDomain: "acme.blode.md",
  slug: "acme",
  status: "active" as const,
  subdomain: "acme",
};

describe("proxy slug 404", () => {
  afterEach(() => {
    vi.resetModules();
    resolveTenant.mockReset();
    lookupTenantDocSlug.mockReset();
  });

  it("returns HTTP 404 directly for confirmed unknown doc slugs", async () => {
    resolveTenant.mockResolvedValue({
      basePath: "/docs",
      host: "acme.blode.md",
      rewrittenPath: "/sites/acme/missing-page",
      strategy: "subdomain",
      tenant,
    });
    lookupTenantDocSlug.mockResolvedValue("miss");

    const { proxy } = await import("./proxy");
    const response = await proxy(
      new NextRequest("https://acme.blode.md/docs/missing-page", {
        headers: { host: "acme.blode.md" },
      })
    );

    expect(lookupTenantDocSlug).toHaveBeenCalledWith(tenant, "missing-page");
    expect(response.status).toBe(404);
    expect(response.headers.get("CDN-Cache-Control")).toBe("private, no-store");
    await expect(response.text()).resolves.toContain("Page not found");
  });
});
