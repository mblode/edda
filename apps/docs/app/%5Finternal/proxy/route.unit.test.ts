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

vi.mock("@/lib/tenants", () => ({
  getTenantBySlug: vi.fn((slug: string) =>
    Promise.resolve(slug === "example" ? tenant : null)
  ),
}));

vi.mock("@/lib/tenancy", () => ({
  getRequestHost: (headers: Headers) => headers.get("host") ?? "",
  resolveTenant: vi.fn((host: string) =>
    Promise.resolve(host === "example.docs.blode.md" ? { tenant } : null)
  ),
}));

vi.mock("@/lib/openapi-proxy", () => ({
  loadOpenApiProxyConfig: vi.fn(() =>
    Promise.resolve({
      allowedHosts: ["api.example.com"],
      enabled: true,
    })
  ),
}));

const buildRequest = (body: unknown, host = "example.docs.blode.md"): Request =>
  new Request("https://example.docs.blode.md/_internal/proxy", {
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      host,
      referer: `https://${host}/docs/api`,
    },
    method: "POST",
  });

describe("/_internal/proxy route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects malformed JSON with 400", async () => {
    const { POST } = await import("./route");
    const response = await POST(buildRequest("{not json"));
    expect(response.status).toBe(400);
  });

  it("rejects an unparseable target URL with 400", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      buildRequest({ method: "GET", url: "http://" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a target host outside the allowlist with 403", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      buildRequest({ method: "GET", url: "https://evil.example.net/steal" })
    );
    expect(response.status).toBe(403);
  });

  it("rejects a forged slug that does not match the host-resolved tenant", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      buildRequest({
        method: "GET",
        tenantSlug: "other-tenant",
        url: "https://api.example.com/v1/ping",
      })
    );
    expect(response.status).toBe(400);
  });

  it("returns 502 when the upstream responds with a redirect", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(null, {
            headers: { location: "http://169.254.169.254/" },
            status: 302,
          })
        )
      )
    );
    const { POST } = await import("./route");
    const response = await POST(
      buildRequest({ method: "GET", url: "https://api.example.com/v1/ping" })
    );
    expect(response.status).toBe(502);
  });

  it("proxies an allowlisted request through to the upstream", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response('{"ok":true}', {
            headers: { "content-type": "application/json" },
            status: 200,
          })
        )
      )
    );
    const { POST } = await import("./route");
    const response = await POST(
      buildRequest({
        method: "GET",
        tenantSlug: "example",
        url: "https://api.example.com/v1/ping",
      })
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('"ok":true');
  });
});
