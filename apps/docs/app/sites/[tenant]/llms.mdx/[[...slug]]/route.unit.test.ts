import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const tenant = {
  customDomains: ["docs.example.com"],
  docsPath: "",
  id: "tenant-id",
  name: "Example",
  primaryDomain: "docs.example.com",
  slug: "example",
  status: "active" as const,
  subdomain: "example",
};

vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(new Headers({ host: "docs.example.com" })),
}));

vi.mock("@/lib/tenants", () => ({
  getTenantBySlug: vi.fn((slug: string) =>
    Promise.resolve(slug === "example" ? tenant : null)
  ),
}));

vi.mock("@/lib/tenant-static", () => ({
  getCanonicalDocBasePath: () => Promise.resolve(""),
  getCanonicalOrigin: () => Promise.resolve("https://docs.example.com"),
  getLlmPageText: vi.fn((_t: unknown, slug: string) =>
    Promise.resolve(slug === "intro" ? "# Intro\n\nWelcome." : null)
  ),
  getTenantRequestContextFromHeaders: () => ({
    host: "docs.example.com",
    strategy: "custom-domain",
  }),
}));

describe("llms.mdx route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets X-Robots-Tag: noindex on 200 responses", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request("https://docs.example.com/intro.md"),
      { params: Promise.resolve({ slug: ["intro"], tenant: "example" }) }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(response.headers.get("Link")).toContain('rel="canonical"');
  });

  it("sets X-Robots-Tag: noindex on 304 responses", async () => {
    const { GET } = await import("./route");
    const initial = await GET(
      new Request("https://docs.example.com/intro.md"),
      { params: Promise.resolve({ slug: ["intro"], tenant: "example" }) }
    );
    const etag = initial.headers.get("ETag");
    expect(etag).toEqual(expect.any(String));
    if (!etag) {
      throw new Error("expected ETag on initial response");
    }

    const response = await GET(
      new Request("https://docs.example.com/intro.md", {
        headers: { "if-none-match": etag },
      }),
      { params: Promise.resolve({ slug: ["intro"], tenant: "example" }) }
    );

    expect(response.status).toBe(304);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(response.headers.get("ETag")).toBe(etag);
  });
});
