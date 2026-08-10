import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const resolveTenant = vi.fn();
const lookupTenantDocSlug = vi.fn();
const isRootRuntimeHost = vi.fn(() => false);
const getMarketingMarkdown = vi.fn(() => null as string | null);

vi.mock("./lib/tenancy", () => ({
  getRequestHost: (headers: Headers) => headers.get("host"),
  isReservedPath: () => false,
  isRootRuntimeHost: ((...args: unknown[]) =>
    Reflect.apply(
      isRootRuntimeHost,
      undefined,
      args
    )) as typeof isRootRuntimeHost,
  isTenantUtilityPath: () => false,
  resolveTenant: ((...args: unknown[]) =>
    Reflect.apply(resolveTenant, undefined, args)) as typeof resolveTenant,
}));

vi.mock("./lib/tenant-slug-index", () => ({
  lookupTenantDocSlug: ((...args: unknown[]) =>
    Reflect.apply(
      lookupTenantDocSlug,
      undefined,
      args
    )) as typeof lookupTenantDocSlug,
}));

vi.mock("./lib/marketing-markdown", () => ({
  getMarketingMarkdown: ((...args: unknown[]) =>
    Reflect.apply(
      getMarketingMarkdown,
      undefined,
      args
    )) as typeof getMarketingMarkdown,
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

describe("docs proxy", () => {
  afterEach(() => {
    vi.resetModules();
    resolveTenant.mockReset();
    lookupTenantDocSlug.mockReset();
    isRootRuntimeHost.mockReset();
    isRootRuntimeHost.mockReturnValue(false);
    getMarketingMarkdown.mockReset();
    getMarketingMarkdown.mockReturnValue(null);
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

  it("sets X-Robots-Tag: noindex on root-host marketing markdown Accept responses", async () => {
    isRootRuntimeHost.mockReturnValue(true);
    getMarketingMarkdown.mockReturnValue("# Home\n\nWelcome.");

    const { proxy } = await import("./proxy");
    const response = await proxy(
      new NextRequest("https://blode.md/", {
        headers: {
          accept: "text/markdown",
          host: "blode.md",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    await expect(response.text()).resolves.toBe("# Home\n\nWelcome.");
  });

  it("rewrites /docs/robots.txt to the tenant robots route only", async () => {
    isRootRuntimeHost.mockReturnValue(true);
    resolveTenant.mockResolvedValue({
      basePath: "/docs",
      host: "blode.md",
      rewrittenPath: "/sites/docs/robots.txt",
      strategy: "path",
      tenant: {
        ...tenant,
        pathPrefix: undefined,
        slug: "docs",
        subdomain: "docs",
      },
    });

    const { proxy } = await import("./proxy");
    const response = await proxy(
      new NextRequest("https://blode.md/docs/robots.txt", {
        headers: { host: "blode.md" },
      })
    );

    const rewrite = response.headers.get("x-middleware-rewrite");
    expect(rewrite).toBeTruthy();
    expect(new URL(rewrite ?? "").pathname).toBe("/sites/docs/robots.txt");
  });
});
