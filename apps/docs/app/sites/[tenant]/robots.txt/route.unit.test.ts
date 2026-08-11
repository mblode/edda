import { describe, expect, it, vi } from "vitest";

const buildTenantRobotsTxt = vi.fn();
const getTenantBySlug = vi.fn();
const getTenantRequestContextFromUrl = vi.fn();
const getStaticTenantRequestContext = vi.fn();

vi.mock("@/lib/tenant-static", () => ({
  buildTenantRobotsTxt: (...args: unknown[]) =>
    Reflect.apply(buildTenantRobotsTxt, undefined, args),
  getStaticTenantRequestContext: (...args: unknown[]) =>
    Reflect.apply(getStaticTenantRequestContext, undefined, args),
}));

vi.mock("@/lib/tenant-utility-context", () => ({
  getTenantRequestContextFromUrl: (...args: unknown[]) =>
    Reflect.apply(getTenantRequestContextFromUrl, undefined, args),
}));

vi.mock("@/lib/tenants", () => ({
  getTenantBySlug: (...args: unknown[]) =>
    Reflect.apply(getTenantBySlug, undefined, args),
}));

const tenant = {
  id: "tenant-id",
  name: "Docs",
  slug: "docs",
  status: "active" as const,
  subdomain: "docs",
};

describe("tenant robots.txt route", () => {
  it("returns the tenant robots body exactly once", async () => {
    buildTenantRobotsTxt.mockResolvedValue(`User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: https://blode.md/docs/sitemap.xml
`);
    getTenantBySlug.mockResolvedValue(tenant);
    getTenantRequestContextFromUrl.mockReturnValue(null);
    getStaticTenantRequestContext.mockReturnValue({});

    const { GET } = await import("./route");
    const response = await GET(
      new Request("https://blode.md/sites/docs/robots.txt"),
      { params: Promise.resolve({ tenant: "docs" }) }
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("Content-Signal:");
    expect(body.match(/^User-agent: \*$/gm)).toHaveLength(1);
    expect(buildTenantRobotsTxt).toHaveBeenCalledTimes(1);
  });
});
