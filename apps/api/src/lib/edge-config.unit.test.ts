import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:54322/blode_docs_drizzle_test";
process.env.PLATFORM_ROOT_DOMAIN ??= "blode.md";

const expectItemOperation = (
  items: { key: string; operation: "delete" | "upsert" }[],
  key: string,
  operation: "delete" | "upsert"
) => {
  expect(items.find((item) => item.key === key)).toMatchObject({
    key,
    operation,
  });
};

describe("buildTenantEdgeConfigItems", () => {
  it("uses stable Edge Config-compatible key formats", async () => {
    const { getTenantEdgeHostKey, getTenantEdgeSlugKey } =
      await import("@repo/contracts");

    expect(getTenantEdgeHostKey("docs.example.com")).toBe(
      "th_docs_example_com"
    );
    expect(getTenantEdgeSlugKey("example")).toBe("ts_example");
  });

  it("emits records and deletes stale hosts using Edge Config-safe keys only", async () => {
    const { buildTenantEdgeConfigItems } = await import("./edge-config");
    const { getTenantEdgeHostKey, getTenantEdgeSlugKey } =
      await import("@repo/contracts");

    const tenant = {
      activeDeploymentId: "11111111-1111-4111-8111-111111111111",
      activeDeploymentManifestUrl: "https://example.com/manifest.json",
      customDomains: ["docs.example.com"],
      description: "Example docs",
      id: "22222222-2222-4222-8222-222222222222",
      name: "Example",
      pathPrefix: "/docs",
      primaryDomain: "docs.example.com",
      slug: "example",
      status: "active" as const,
      subdomain: "example",
    };

    const items = buildTenantEdgeConfigItems({
      domains: [
        {
          hostname: "docs.example.com",
          pathPrefix: "/docs",
          status: "valid_configuration",
        },
        {
          hostname: "pending.example.com",
          pathPrefix: null,
          status: "pending_verification",
        },
      ],
      removedHosts: ["old.example.com"],
      tenant,
    });

    expectItemOperation(items, getTenantEdgeSlugKey("example"), "upsert");
    expectItemOperation(
      items,
      getTenantEdgeHostKey("example.blode.md"),
      "upsert"
    );
    expectItemOperation(
      items,
      getTenantEdgeHostKey("docs.example.com"),
      "upsert"
    );
    expectItemOperation(
      items,
      getTenantEdgeHostKey("pending.example.com"),
      "delete"
    );
    expectItemOperation(
      items,
      getTenantEdgeHostKey("old.example.com"),
      "delete"
    );

    for (const item of items) {
      expect(item.key).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
});
