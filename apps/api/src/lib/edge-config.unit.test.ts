import { afterEach, describe, expect, it, vi } from "vitest";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:54332/blode_docs_drizzle_test";
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

describe("buildTenantEdgeConfigRemovalItems", () => {
  it("deletes the slug, subdomain and custom hosts of a removed project", async () => {
    const { buildTenantEdgeConfigRemovalItems } = await import("./edge-config");
    const {
      getLegacyTenantEdgeSlugKey,
      getTenantEdgeHostKey,
      getTenantEdgeSlugKey,
    } = await import("@repo/contracts");

    const items = buildTenantEdgeConfigRemovalItems({
      hosts: ["example.blode.md", "docs.example.com", "www.example.com"],
      slug: "example",
    });

    expect(items.every((item) => item.operation === "delete")).toBe(true);
    expectItemOperation(items, getTenantEdgeSlugKey("example"), "delete");
    // Legacy `tenant:slug:` keys are not valid Edge Config keys; sending one
    // makes Vercel reject the entire batch.
    expect(
      items.some((item) => item.key === getLegacyTenantEdgeSlugKey("example"))
    ).toBe(false);
    expectItemOperation(
      items,
      getTenantEdgeHostKey("example.blode.md"),
      "delete"
    );
    expectItemOperation(
      items,
      getTenantEdgeHostKey("docs.example.com"),
      "delete"
    );
    expectItemOperation(
      items,
      getTenantEdgeHostKey("www.example.com"),
      "delete"
    );
  });
});

describe("edge config key safety", () => {
  it("keeps every removal key within Edge Config's key rules", async () => {
    const { buildTenantEdgeConfigRemovalItems } = await import("./edge-config");

    const items = buildTenantEdgeConfigRemovalItems({
      hosts: ["example.blode.md", "docs.example.com"],
      slug: "example",
    });

    for (const item of items) {
      expect(item.key).toMatch(/^[A-Za-z0-9_-]{1,256}$/);
    }
  });
});

const GUARD_ENV = { id: "ecfg_test", token: "token_test" };

const loadEdgeConfigModule = async () => {
  process.env.VERCEL_EDGE_CONFIG_ID = GUARD_ENV.id;
  process.env.VERCEL_TOKEN = GUARD_ENV.token;
  vi.resetModules();
  return await import("./edge-config");
};

const stubEdgeConfigFetch = (listing: {
  items?: { key: string; value: unknown }[];
  ok: boolean;
}) => {
  const fetchMock = vi.fn((_url: unknown, init?: { method?: string }) => {
    if (init?.method === "PATCH") {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
      } as unknown as Response);
    }
    return Promise.resolve({
      json: () => Promise.resolve(listing.items ?? []),
      ok: listing.ok,
      text: () => Promise.resolve(""),
    } as unknown as Response);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const patchedItems = (fetchMock: ReturnType<typeof stubEdgeConfigFetch>) =>
  fetchMock.mock.calls
    .filter(([, init]) => (init as { method?: string })?.method === "PATCH")
    .map(
      ([, init]) =>
        JSON.parse((init as { body: string }).body) as {
          items: { key: string }[];
        }
    );

// The write guard exists because this path runs on every deploy and every
// GitHub webhook, not only when tenant data changes. It must be able to cost
// money, never correctness — so the "read failed" case has to still write.
describe("applyEdgeConfigItems write guard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("issues no write when every delete targets a key that is absent", async () => {
    const fetchMock = stubEdgeConfigFetch({ items: [], ok: true });
    const { removeProjectTenantEdgeConfig } = await loadEdgeConfigModule();

    await removeProjectTenantEdgeConfig({
      hosts: ["docs.example.com"],
      slug: "example",
    });

    expect(patchedItems(fetchMock)).toHaveLength(0);
  });

  it("writes only the keys that actually exist", async () => {
    const { getTenantEdgeSlugKey } = await import("@repo/contracts");
    const presentKey = getTenantEdgeSlugKey("example");
    const fetchMock = stubEdgeConfigFetch({
      items: [{ key: presentKey, value: { version: 1 } }],
      ok: true,
    });
    const { removeProjectTenantEdgeConfig } = await loadEdgeConfigModule();

    await removeProjectTenantEdgeConfig({
      hosts: ["docs.example.com"],
      slug: "example",
    });

    const bodies = patchedItems(fetchMock);
    expect(bodies).toHaveLength(1);
    expect(bodies[0].items.map((item) => item.key)).toEqual([presentKey]);
  });

  it("falls back to writing everything when the read fails", async () => {
    const fetchMock = stubEdgeConfigFetch({ ok: false });
    const { buildTenantEdgeConfigRemovalItems, removeProjectTenantEdgeConfig } =
      await loadEdgeConfigModule();

    await removeProjectTenantEdgeConfig({
      hosts: ["docs.example.com"],
      slug: "example",
    });

    const expected = buildTenantEdgeConfigRemovalItems({
      hosts: ["example.blode.md", "docs.example.com"],
      slug: "example",
    });
    const bodies = patchedItems(fetchMock);
    expect(bodies).toHaveLength(1);
    expect(bodies[0].items).toHaveLength(expected.length);
  });
});
