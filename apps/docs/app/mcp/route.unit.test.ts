import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as TenantStaticModule from "@/lib/tenant-static";

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

vi.mock("@/lib/tenant-static", async () => {
  const actual = await vi.importActual<typeof TenantStaticModule>(
    "@/lib/tenant-static"
  );
  return {
    ...actual,
    getCanonicalDocBasePath: () => "",
    getCanonicalOrigin: () => "https://docs.example.com",
    getLlmPageText: vi.fn((_t: unknown, slug: string) =>
      Promise.resolve(
        slug === "intro" ? "# Intro\n\nWelcome to the docs." : null
      )
    ),
    loadTenantUtilityIndex: vi.fn(() =>
      Promise.resolve({
        description: "Example docs",
        name: "Example",
        pages: [
          {
            content: "Welcome to the docs. Get started with installation.",
            description: "Start here",
            slug: "intro",
            title: "Intro",
          },
          {
            content: "Authenticate with API keys.",
            description: "Auth flows",
            slug: "auth",
            title: "Auth",
          },
        ],
      })
    ),
  };
});

const buildRequest = (body: unknown): Request =>
  new Request("https://example.docs.blode.md/mcp", {
    body: JSON.stringify(body),
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
      host: "example.docs.blode.md",
      "mcp-protocol-version": "2025-06-18",
    },
    method: "POST",
  });

const initialize = async (POST: (req: Request) => Promise<Response>) => {
  const response = await POST(
    buildRequest({
      id: 0,
      jsonrpc: "2.0",
      method: "initialize",
      params: {
        capabilities: {},
        clientInfo: { name: "test", version: "0" },
        protocolVersion: "2025-06-18",
      },
    })
  );
  expect(response.status).toBe(200);
};

const parseJsonRpc = async (response: Response) => {
  const text = await response.text();
  // Streamable HTTP may emit either JSON or SSE; pick the data line for SSE.
  if (response.headers.get("content-type")?.includes("text/event-stream")) {
    const dataLine = text.split("\n").find((line) => line.startsWith("data:"));
    return dataLine ? JSON.parse(dataLine.slice(5).trim()) : null;
  }
  return JSON.parse(text);
};

describe("MCP /mcp route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists the three documentation tools", async () => {
    const { POST } = await import("./route");
    await initialize(POST);

    const response = await POST(
      buildRequest({
        id: 1,
        jsonrpc: "2.0",
        method: "tools/list",
        params: {},
      })
    );

    expect(response.status).toBe(200);
    const json = await parseJsonRpc(response);
    const names = (json.result.tools as { name: string }[]).map(
      (tool) => tool.name
    );
    expect(names).toEqual(
      expect.arrayContaining(["search_docs", "fetch_doc", "list_docs"])
    );
  });

  it("returns 404 when the host does not resolve to a tenant", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("https://unknown.example.com/mcp", {
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "tools/list",
        }),
        headers: {
          "content-type": "application/json",
          host: "unknown.example.com",
        },
        method: "POST",
      })
    );
    expect(response.status).toBe(404);
  });
});
