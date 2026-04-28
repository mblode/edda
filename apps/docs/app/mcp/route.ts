import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tenant } from "@repo/models";

import { siteConfig } from "@/lib/config";
import { getRequestHost } from "@/lib/tenancy";
import {
  getCanonicalDocBasePath,
  getCanonicalOrigin,
  getLlmPageText,
  loadTenantUtilityIndex,
} from "@/lib/tenant-static";
import type { TenantRequestContext } from "@/lib/tenant-utility-context";
import { getTenantBySlug } from "@/lib/tenants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE_HEADER = "no-store";
const SEARCH_RESULT_LIMIT = 10;
const SNIPPET_LENGTH = 240;

const buildSnippet = (content: string, query: string): string => {
  const haystack = content.toLowerCase();
  const needle = query.toLowerCase();
  const matchIndex = needle ? haystack.indexOf(needle) : -1;
  const start =
    matchIndex >= 0
      ? Math.max(0, matchIndex - Math.floor(SNIPPET_LENGTH / 4))
      : 0;
  const slice = content.slice(start, start + SNIPPET_LENGTH).trim();
  const prefix = start > 0 ? "…" : "";
  const suffix = start + SNIPPET_LENGTH < content.length ? "…" : "";
  return `${prefix}${slice}${suffix}`.replaceAll(/\s+/g, " ");
};

const buildContext = (
  request: Request,
  tenant: Tenant
): TenantRequestContext => {
  const url = new URL(request.url);
  const host = getRequestHost(request.headers) || url.host;
  return {
    basePath: tenant.pathPrefix ?? "",
    protocol: url.protocol.replace(/:$/, "") || "https",
    requestedHost: host,
    strategy: tenant.customDomains.length > 0 ? "custom-domain" : null,
  };
};

const resolveTenantFromRequest = async (
  request: Request
): Promise<Tenant | null> => {
  const host = getRequestHost(request.headers);
  if (!host) {
    return null;
  }

  const subdomainSegments = host.split(".");
  const candidates = new Set<string>();

  if (subdomainSegments.length >= 3) {
    const [subdomain] = subdomainSegments;
    if (subdomain) {
      candidates.add(subdomain);
    }
  }

  const previewPrefix = host.includes("---") ? host.split("---")[0] : null;
  if (previewPrefix) {
    candidates.add(previewPrefix);
  }

  for (const candidate of candidates) {
    const tenant = await getTenantBySlug(candidate);
    if (tenant) {
      return tenant;
    }
  }

  return null;
};

const createMcpServer = (request: Request, tenant: Tenant): Server => {
  const server = new Server(
    {
      name: `blodemd-${tenant.slug}`,
      version: siteConfig.version,
    },
    {
      capabilities: {
        tools: { listChanged: false },
      },
      instructions: `Search and fetch documentation for ${tenant.name}.`,
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: [
      {
        description:
          "Search the documentation by query. Returns up to 10 matching pages with title, URL, and a snippet.",
        inputSchema: {
          properties: {
            query: {
              description: "Substring to search for (case-insensitive).",
              type: "string",
            },
          },
          required: ["query"],
          type: "object",
        },
        name: "search_docs",
      },
      {
        description:
          "Fetch the full markdown content for a documentation page by slug.",
        inputSchema: {
          properties: {
            slug: {
              description: "The page slug, for example 'getting-started'.",
              type: "string",
            },
          },
          required: ["slug"],
          type: "object",
        },
        name: "fetch_doc",
      },
      {
        description:
          "List every documentation page in this site with its slug, title, and description.",
        inputSchema: { properties: {}, type: "object" },
        name: "list_docs",
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;
    const context = buildContext(request, tenant);
    const origin = getCanonicalOrigin(tenant, context);
    const basePath = getCanonicalDocBasePath(tenant, context);
    const docHref = (slug: string) => {
      const trimmed = (basePath ?? "").replace(/\/+$/, "");
      const path = slug ? `${trimmed}/${slug}` : `${trimmed}/`;
      return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
    };

    if (req.params.name === "list_docs") {
      const index = await loadTenantUtilityIndex(tenant);
      const payload = {
        pages: index.pages.map((page) => ({
          description: page.description ?? null,
          slug: page.slug,
          title: page.title,
          url: docHref(page.slug),
        })),
      };
      return {
        content: [{ text: JSON.stringify(payload, null, 2), type: "text" }],
        structuredContent: payload,
      };
    }

    if (req.params.name === "search_docs") {
      const query = String(args.query ?? "").trim();
      if (!query) {
        return {
          content: [{ text: "Query must not be empty.", type: "text" }],
          isError: true,
        };
      }

      const index = await loadTenantUtilityIndex(tenant);
      const needle = query.toLowerCase();
      const results = index.pages
        .filter((page) => {
          const haystack = `${page.title}\n${page.description ?? ""}\n${
            page.content
          }`.toLowerCase();
          return haystack.includes(needle);
        })
        .slice(0, SEARCH_RESULT_LIMIT)
        .map((page) => ({
          description: page.description ?? null,
          slug: page.slug,
          snippet: buildSnippet(page.content, query),
          title: page.title,
          url: docHref(page.slug),
        }));

      const payload = { query, results };
      return {
        content: [{ text: JSON.stringify(payload, null, 2), type: "text" }],
        structuredContent: payload,
      };
    }

    if (req.params.name === "fetch_doc") {
      const slug = String(args.slug ?? "").trim();
      if (!slug) {
        return {
          content: [{ text: "Slug must not be empty.", type: "text" }],
          isError: true,
        };
      }

      const content = await getLlmPageText(tenant, slug);
      if (content === null) {
        return {
          content: [
            {
              text: `No documentation page found for slug "${slug}".`,
              type: "text",
            },
          ],
          isError: true,
        };
      }

      const payload = { content, slug, url: docHref(slug) };
      return {
        content: [{ text: content, type: "text" }],
        structuredContent: payload,
      };
    }

    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${req.params.name}`
    );
  });

  return server;
};

const handle = async (request: Request): Promise<Response> => {
  const tenant = await resolveTenantFromRequest(request);
  if (!tenant) {
    return Response.json(
      {
        error: {
          code: -32_001,
          message: "Tenant could not be resolved for this host.",
        },
        id: null,
        jsonrpc: "2.0",
      },
      {
        headers: { "Cache-Control": NO_STORE_HEADER },
        status: 404,
      }
    );
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    sessionIdGenerator: undefined,
  });
  const server = createMcpServer(request, tenant);
  await server.connect(transport);

  try {
    const response = await transport.handleRequest(request);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", NO_STORE_HEADER);
    return new Response(response.body, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  } finally {
    await server.close().catch((error: unknown) => {
      console.error("[mcp] failed to close server", error);
    });
  }
};

export const GET = (request: Request) => handle(request);
export const POST = (request: Request) => handle(request);
export const DELETE = (request: Request) => handle(request);
