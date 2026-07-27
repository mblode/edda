import type * as Previewing from "@repo/previewing";
import { afterEach, describe, expect, it, vi } from "vitest";

const loadSiteConfigForRender = vi.fn();

vi.mock("@repo/previewing", async () => {
  const actual = await vi.importActual<typeof Previewing>("@repo/previewing");
  return { ...actual, loadSiteConfigForRender };
});

const baseTenant = {
  customDomains: [],
  id: "tenant-id",
  name: "Acme",
  primaryDomain: "acme.blode.md",
  slug: "acme",
  status: "active" as const,
  subdomain: "acme",
};

// The request a proxied site produces: the origin sees its own subdomain and
// has no way to know a customer domain sits in front of it.
const proxiedContext = {
  basePath: "",
  protocol: "https",
  requestedHost: "acme.blode.md",
  strategy: "subdomain" as const,
};

const withSiteUrl = (siteUrl?: string) => {
  loadSiteConfigForRender.mockResolvedValue({
    config: { collections: [], name: "Acme", seo: siteUrl ? { siteUrl } : {} },
    ok: true,
  });
};

describe("declared site URL", () => {
  afterEach(() => {
    vi.resetModules();
    loadSiteConfigForRender.mockReset();
  });

  it("publishes at the declared URL even though the request arrived elsewhere", async () => {
    withSiteUrl("https://acme.com/docs");
    const { getCanonicalDocBasePath, getCanonicalOrigin } =
      await import("./tenant-static");

    expect(await getCanonicalOrigin(baseTenant, proxiedContext)).toBe(
      "https://acme.com"
    );
    expect(await getCanonicalDocBasePath(baseTenant, proxiedContext)).toBe(
      "/docs"
    );
  });

  it("ignores a trailing slash when splitting origin from base path", async () => {
    withSiteUrl("https://acme.com/docs/");
    const { getCanonicalDocBasePath } = await import("./tenant-static");

    expect(await getCanonicalDocBasePath(baseTenant, proxiedContext)).toBe(
      "/docs"
    );
  });

  it("treats a bare origin as having no base path", async () => {
    withSiteUrl("https://acme.com");
    const { getCanonicalDocBasePath, getCanonicalOrigin } =
      await import("./tenant-static");

    expect(await getCanonicalOrigin(baseTenant, proxiedContext)).toBe(
      "https://acme.com"
    );
    expect(await getCanonicalDocBasePath(baseTenant, proxiedContext)).toBe("");
  });

  it("falls back to inferring from the request when nothing is declared", async () => {
    withSiteUrl();
    const { getCanonicalDocBasePath, getCanonicalOrigin } =
      await import("./tenant-static");

    expect(await getCanonicalOrigin(baseTenant, proxiedContext)).toBe(
      "https://acme.blode.md"
    );
    expect(await getCanonicalDocBasePath(baseTenant, proxiedContext)).toBe("");
  });
});
