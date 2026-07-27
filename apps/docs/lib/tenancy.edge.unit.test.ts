import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { resolveTenantFromEdgeConfig as ResolveTenantFromEdgeConfig } from "./tenancy";

const edgeConfigMocks = vi.hoisted(() => ({
  getTenantEdgeHostRecord: vi.fn(),
  getTenantEdgeSlugRecord: vi.fn(),
}));

vi.mock("./edge-config", () => ({
  getTenantEdgeHostRecord: edgeConfigMocks.getTenantEdgeHostRecord,
  getTenantEdgeSlugRecord: edgeConfigMocks.getTenantEdgeSlugRecord,
}));

let resolveTenantFromEdgeConfig: typeof ResolveTenantFromEdgeConfig;

const tenant = {
  customDomains: ["docs.example.com"],
  id: "tenant-id",
  name: "Example",
  pathPrefix: "/docs",
  primaryDomain: "docs.example.com",
  slug: "example",
  status: "active" as const,
  subdomain: "example",
};

describe("resolveTenantFromEdgeConfig", () => {
  beforeAll(async () => {
    ({ resolveTenantFromEdgeConfig } = await import("./tenancy"));
  });

  beforeEach(() => {
    edgeConfigMocks.getTenantEdgeHostRecord.mockReset();
    edgeConfigMocks.getTenantEdgeSlugRecord.mockReset();
  });

  it("resolves a custom domain host record without the docs API", async () => {
    edgeConfigMocks.getTenantEdgeHostRecord.mockResolvedValue({
      host: "docs.example.com",
      pathPrefix: "/docs",
      strategy: "custom-domain",
      tenant,
      version: 1,
    });

    const resolution = await resolveTenantFromEdgeConfig(
      "docs.example.com",
      "/docs/getting-started"
    );

    expect(resolution).toMatchObject({
      basePath: "/docs",
      host: "docs.example.com",
      rewrittenPath: "/sites/example/getting-started",
      strategy: "custom-domain",
    });
  });

  it("resolves root utility routes for path-prefixed custom domains", async () => {
    edgeConfigMocks.getTenantEdgeHostRecord.mockResolvedValue({
      host: "docs.example.com",
      pathPrefix: "/docs",
      strategy: "custom-domain",
      tenant,
      version: 1,
    });

    const resolution = await resolveTenantFromEdgeConfig(
      "docs.example.com",
      "/robots.txt"
    );

    expect(resolution).toMatchObject({
      basePath: "/docs",
      host: "docs.example.com",
      rewrittenPath: "/sites/example/robots.txt",
      strategy: "custom-domain",
    });
  });

  it("resolves llms segment routes for path-prefixed custom domains", async () => {
    edgeConfigMocks.getTenantEdgeHostRecord.mockResolvedValue({
      host: "docs.example.com",
      pathPrefix: "/docs",
      strategy: "custom-domain",
      tenant,
      version: 1,
    });

    const resolution = await resolveTenantFromEdgeConfig(
      "docs.example.com",
      "/llms/api.txt"
    );

    expect(resolution).toMatchObject({
      basePath: "/docs",
      host: "docs.example.com",
      rewrittenPath: "/sites/example/llms/api.txt",
      strategy: "custom-domain",
    });
  });

  it("resolves a subdomain via the tenant slug record", async () => {
    edgeConfigMocks.getTenantEdgeHostRecord.mockResolvedValue(null);
    edgeConfigMocks.getTenantEdgeSlugRecord.mockResolvedValue({
      slug: "example",
      tenant: {
        ...tenant,
        customDomains: [],
        pathPrefix: undefined,
        primaryDomain: "example.blode.md",
      },
      version: 1,
    });

    const resolution = await resolveTenantFromEdgeConfig(
      "example.blode.md",
      "/docs/cli"
    );

    // Proxied customers forward theirdomain.com/docs/* here, so `/docs` must
    // be stripped for every subdomain tenant. Scoping this to one tenant 404s
    // every proxied site.
    expect(resolution).toMatchObject({
      basePath: "/docs",
      host: "example.blode.md",
      rewrittenPath: "/sites/example/cli",
      strategy: "subdomain",
    });
  });

  it("strips the /docs prefix for the platform docs tenant too", async () => {
    edgeConfigMocks.getTenantEdgeHostRecord.mockResolvedValue(null);
    edgeConfigMocks.getTenantEdgeSlugRecord.mockResolvedValue({
      slug: "docs",
      tenant: {
        ...tenant,
        customDomains: [],
        pathPrefix: undefined,
        primaryDomain: "docs.blode.md",
        slug: "docs",
      },
      version: 1,
    });

    const resolution = await resolveTenantFromEdgeConfig(
      "docs.blode.md",
      "/docs/cli"
    );

    expect(resolution).toMatchObject({
      basePath: "/docs",
      host: "docs.blode.md",
      rewrittenPath: "/sites/docs/cli",
      strategy: "subdomain",
    });
  });

  it("resolves a localhost subdomain via the tenant slug record", async () => {
    edgeConfigMocks.getTenantEdgeHostRecord.mockResolvedValue(null);
    edgeConfigMocks.getTenantEdgeSlugRecord.mockResolvedValue({
      slug: "example",
      tenant: {
        ...tenant,
        customDomains: [],
        pathPrefix: undefined,
        primaryDomain: "example.blode.md",
      },
      version: 1,
    });

    const resolution = await resolveTenantFromEdgeConfig(
      "example.localhost",
      "/docs/cli"
    );

    expect(resolution).toMatchObject({
      basePath: "/docs",
      host: "example.localhost",
      rewrittenPath: "/sites/example/cli",
      strategy: "subdomain",
    });
  });

  it("resolves a root-domain path tenant via the tenant slug record", async () => {
    edgeConfigMocks.getTenantEdgeHostRecord.mockResolvedValue(null);
    edgeConfigMocks.getTenantEdgeSlugRecord.mockResolvedValue({
      slug: "example",
      tenant: {
        ...tenant,
        customDomains: [],
        pathPrefix: undefined,
        primaryDomain: "example.blode.md",
      },
      version: 1,
    });

    const resolution = await resolveTenantFromEdgeConfig(
      "blode.md",
      "/example/guides/intro"
    );

    expect(resolution).toMatchObject({
      basePath: "/example",
      host: "blode.md",
      rewrittenPath: "/sites/example/guides/intro",
      strategy: "path",
    });
  });
});
