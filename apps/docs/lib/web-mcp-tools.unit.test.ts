import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildDocsWebMcpTools,
  getModelContext,
  registerWebMcpTools,
  resolveDocsSlug,
} from "./web-mcp-tools";
import type { WebMcpTool } from "./web-mcp-tools";

const ORIGIN = "https://docs.example.com";

const jsonResponse = (body: unknown, status = 200) =>
  Response.json(body, { status });

const textResponse = (body: string, status = 200) =>
  new Response(body, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
    status,
  });

const notFound = () => new Response("Not found", { status: 404 });

const createTools = ({
  basePath = "",
  fetchImpl,
  navigate = vi.fn(),
  pathname = "/quickstart",
}: {
  basePath?: string;
  fetchImpl: typeof fetch;
  navigate?: (href: string) => void;
  pathname?: string;
}) => {
  const tools = buildDocsWebMcpTools({
    basePath,
    currentLocation: () => ({
      href: `${ORIGIN}${pathname}`,
      origin: ORIGIN,
      pathname,
    }),
    fetchImpl,
    navigate,
    siteDescription: "Payments API for developers.",
    siteName: "Acme",
  });
  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  const tool = (name: string): WebMcpTool => {
    const found = byName.get(name);
    if (!found) {
      throw new Error(`missing tool ${name}`);
    }
    return found;
  };
  return { navigate, tool, tools };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildDocsWebMcpTools", () => {
  it("exposes the five tools browser agents expect from a docs site", () => {
    const { tools } = createTools({ fetchImpl: vi.fn() });
    expect(tools.map((tool) => tool.name)).toEqual([
      "search_docs",
      "read_page",
      "get_site_overview",
      "read_skill",
      "navigate_page",
    ]);
    for (const tool of tools) {
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.description).toContain("Acme");
      expect(tool.description).toContain("Payments API for developers.");
    }
    const readOnly = tools
      .filter((tool) => tool.annotations?.readOnlyHint)
      .map((tool) => tool.name);
    expect(readOnly).toEqual([
      "search_docs",
      "read_page",
      "get_site_overview",
      "read_skill",
    ]);
  });

  it("search_docs filters the site search index and builds absolute URLs", async () => {
    const fetchImpl = vi.fn((input: RequestInfo | URL) => {
      expect(String(input)).toBe("/docs/search");
      return jsonResponse({
        items: [
          { path: "quickstart", title: "Quickstart" },
          {
            href: "/docs/guides/deploy#ci",
            path: "guides/deploy",
            title: "Deploy from CI",
          },
          { path: "api/webhooks", title: "Webhooks" },
        ],
      });
    }) as unknown as typeof fetch;
    const { tool } = createTools({ basePath: "/docs", fetchImpl });

    const result = await tool("search_docs").execute({ query: "deploy ci" });

    expect(result).toEqual({
      query: "deploy ci",
      results: [
        {
          path: "guides/deploy",
          title: "Deploy from CI",
          url: `${ORIGIN}/docs/guides/deploy#ci`,
        },
      ],
      total: 1,
    });
  });

  it("search_docs caps results at the requested limit", async () => {
    const items = Array.from({ length: 30 }, (_, index) => ({
      path: `page-${index}`,
      title: `Page ${index}`,
    }));
    const fetchImpl = vi.fn(() =>
      jsonResponse({ items })
    ) as unknown as typeof fetch;
    const { tool } = createTools({ fetchImpl });

    const defaulted = (await tool("search_docs").execute({
      query: "page",
    })) as {
      results: unknown[];
    };
    const limited = (await tool("search_docs").execute({
      limit: 3,
      query: "page",
    })) as { results: unknown[] };

    expect(defaulted.results).toHaveLength(10);
    expect(limited.results).toHaveLength(3);
  });

  it("search_docs rejects an empty query without fetching", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const { tool } = createTools({ fetchImpl });

    await expect(tool("search_docs").execute({ query: "  " })).rejects.toThrow(
      /query must not be empty/
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("read_page fetches the Markdown twin for a path, URL, or the current page", async () => {
    const requested: string[] = [];
    const fetchImpl = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      requested.push(String(input));
      expect(new Headers(init?.headers).get("accept")).toContain(
        "text/markdown"
      );
      return textResponse(`# ${String(input)}`);
    }) as unknown as typeof fetch;
    const { tool } = createTools({
      basePath: "/docs",
      fetchImpl,
      pathname: "/docs/guides/deploy",
    });
    const read = tool("read_page");

    await expect(read.execute({ path: "quickstart" })).resolves.toBe(
      "# /docs/quickstart.md"
    );
    await expect(read.execute({ path: "/docs/quickstart.md" })).resolves.toBe(
      "# /docs/quickstart.md"
    );
    await expect(
      read.execute({ path: `${ORIGIN}/docs/api/webhooks#retries` })
    ).resolves.toBe("# /docs/api/webhooks.md");
    await expect(read.execute({})).resolves.toBe("# /docs/guides/deploy.md");
    await expect(read.execute({ path: "/docs" })).resolves.toBe(
      "# /docs/index.md"
    );
    expect(requested).toEqual([
      "/docs/quickstart.md",
      "/docs/quickstart.md",
      "/docs/api/webhooks.md",
      "/docs/guides/deploy.md",
      "/docs/index.md",
    ]);
  });

  it("read_page refuses another origin and reports a missing page", async () => {
    const fetchImpl = vi.fn(() => notFound()) as unknown as typeof fetch;
    const { tool } = createTools({ fetchImpl });
    const read = tool("read_page");

    await expect(
      read.execute({ path: "https://evil.example.net/quickstart" })
    ).rejects.toThrow(/only reads pages on https:\/\/docs\.example\.com/);
    expect(fetchImpl).not.toHaveBeenCalled();

    await expect(read.execute({ path: "missing" })).rejects.toThrow(
      /No documentation page at \/missing/
    );
  });

  it("get_site_overview returns llms.txt", async () => {
    const fetchImpl = vi.fn((input: RequestInfo | URL) => {
      expect(String(input)).toBe("/llms.txt");
      return textResponse("# Acme\n\n## Docs\n- [Quickstart](/quickstart.md)");
    }) as unknown as typeof fetch;
    const { tool } = createTools({ fetchImpl });

    await expect(tool("get_site_overview").execute({})).resolves.toContain(
      "[Quickstart](/quickstart.md)"
    );
  });

  it("read_skill lists skills without a name and reads SKILL.md with one", async () => {
    const fetchImpl = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/docs/.well-known/skills/index.json") {
        return jsonResponse({
          skills: [
            {
              description: "Acme documentation.",
              files: ["SKILL.md"],
              name: "acme",
            },
          ],
        });
      }
      if (url === "/docs/.well-known/skills/acme/SKILL.md") {
        return textResponse("---\nname: acme\n---\n# Acme");
      }
      return notFound();
    }) as unknown as typeof fetch;
    const { tool } = createTools({ basePath: "/docs", fetchImpl });
    const readSkill = tool("read_skill");

    await expect(readSkill.execute({})).resolves.toEqual({
      skills: [
        {
          description: "Acme documentation.",
          name: "acme",
          url: `${ORIGIN}/docs/.well-known/skills/acme/SKILL.md`,
        },
      ],
    });
    await expect(readSkill.execute({ name: "acme" })).resolves.toContain(
      "# Acme"
    );
    await expect(readSkill.execute({ name: "nope" })).rejects.toThrow(
      /No skill named nope\. Available skills: acme\./
    );
  });

  it("navigate_page navigates within the docs and rejects other origins", async () => {
    const navigate = vi.fn();
    const { tool } = createTools({
      basePath: "/docs",
      fetchImpl: vi.fn() as unknown as typeof fetch,
      navigate,
    });
    const go = tool("navigate_page");

    await expect(go.execute({ path: "guides/deploy#ci" })).resolves.toEqual({
      navigated: true,
      url: `${ORIGIN}/docs/guides/deploy#ci`,
    });
    expect(navigate).toHaveBeenCalledWith("/docs/guides/deploy#ci");

    await go.execute({ path: `${ORIGIN}/docs/quickstart.md` });
    expect(navigate).toHaveBeenLastCalledWith("/docs/quickstart");

    await expect(
      go.execute({ path: "https://evil.example.net/" })
    ).rejects.toThrow(/only opens pages on/);
    await expect(go.execute({})).rejects.toThrow(/path must not be empty/);
    expect(navigate).toHaveBeenCalledTimes(2);
  });
});

describe("resolveDocsSlug", () => {
  it("normalises slugs, paths, markdown twins and same-origin URLs", () => {
    const options = { basePath: "/docs", origin: ORIGIN };
    expect(resolveDocsSlug("quickstart", options)).toBe("quickstart");
    expect(resolveDocsSlug("/docs/quickstart", options)).toBe("quickstart");
    expect(resolveDocsSlug("/docs/quickstart.md", options)).toBe("quickstart");
    expect(resolveDocsSlug("/docs/index.md", options)).toBe("");
    expect(resolveDocsSlug("/docs", options)).toBe("");
    expect(resolveDocsSlug("/docs/", options)).toBe("");
    expect(resolveDocsSlug(`${ORIGIN}/docs/api/keys?x=1#y`, options)).toBe(
      "api/keys"
    );
    expect(resolveDocsSlug("https://other.example.org/docs/x", options)).toBe(
      null
    );
  });

  it("works without a base path", () => {
    const options = { basePath: "", origin: ORIGIN };
    expect(resolveDocsSlug("/", options)).toBe("");
    expect(resolveDocsSlug("/quickstart/", options)).toBe("quickstart");
    expect(resolveDocsSlug("index.md", options)).toBe("");
  });
});

describe("registerWebMcpTools", () => {
  const tools: WebMcpTool[] = [
    {
      description: "a",
      execute: () => Promise.resolve("ok"),
      inputSchema: { properties: {}, type: "object" },
      name: "a",
    },
    {
      description: "b",
      execute: () => Promise.resolve("ok"),
      inputSchema: { properties: {}, type: "object" },
      name: "b",
    },
  ];

  it("returns false when the browser has no model context", async () => {
    vi.stubGlobal("document", {});
    vi.stubGlobal("navigator", {});
    expect(getModelContext()).toBeNull();
    await expect(registerWebMcpTools(tools)).resolves.toBe(false);
  });

  it("prefers document.modelContext.registerTool and forwards the signal", async () => {
    const registerTool = vi.fn(() => Promise.resolve());
    const provideContext = vi.fn();
    vi.stubGlobal("document", {
      modelContext: { provideContext, registerTool },
    });
    vi.stubGlobal("navigator", {
      modelContext: { registerTool: vi.fn() },
    });
    const controller = new AbortController();

    await expect(
      registerWebMcpTools(tools, { signal: controller.signal })
    ).resolves.toBe(true);

    expect(registerTool).toHaveBeenCalledTimes(2);
    expect(registerTool).toHaveBeenCalledWith(tools[0], {
      signal: controller.signal,
    });
    expect(provideContext).not.toHaveBeenCalled();
  });

  it("falls back to navigator.modelContext.provideContext on older builds", async () => {
    const provideContext = vi.fn();
    vi.stubGlobal("document", {});
    vi.stubGlobal("navigator", { modelContext: { provideContext } });

    await expect(registerWebMcpTools(tools)).resolves.toBe(true);
    expect(provideContext).toHaveBeenCalledWith({ tools });
  });
});
