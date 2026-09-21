// oxlint-disable require-await -- WebMCP execute callbacks must return a Promise

import {
  getMarkdownExportSourcePath,
  isExternalHref,
  stripBasePath,
  toDocHref,
  toMarkdownDocHref,
} from "@/lib/routes";

/**
 * WebMCP tools for a hosted docs site.
 *
 * WebMCP lets a page register typed tools that a browser agent can call
 * directly instead of guessing at the interface. Every Edda site registers
 * the same five tools Mintlify exposes, so an agent that already knows how to
 * read Mintlify docs in the browser can read Edda docs the same way:
 * `search_docs`, `read_page`, `get_site_overview`, `read_skill`, and
 * `navigate_page`. Each one is a thin client over a route the site already
 * publishes (`/search`, `/{page}.md`, `/llms.txt`, `/.well-known/skills`), so
 * what the agent reads through a tool is what it would read over HTTP.
 *
 * The API surface is Chrome's imperative WebMCP API
 * (`document.modelContext.registerTool`). Older preview builds exposed the
 * same interface on `navigator.modelContext`, and the earliest ones only had
 * `provideContext`, so registration tries each in turn.
 */

const SEARCH_RESULT_LIMIT = 10;
const MAX_SEARCH_RESULT_LIMIT = 50;
const MARKDOWN_ACCEPT = "text/markdown, text/plain;q=0.9, */*;q=0.1";

interface JSONSchemaObject {
  additionalProperties?: boolean;
  description?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  type: "object";
}

export interface WebMcpToolAnnotations {
  consequentialHint?: boolean;
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface WebMcpExecuteContext {
  signal?: AbortSignal;
}

export interface WebMcpTool {
  annotations?: WebMcpToolAnnotations;
  description: string;
  execute: (
    args: Record<string, unknown>,
    context?: WebMcpExecuteContext
  ) => Promise<unknown>;
  inputSchema: JSONSchemaObject;
  name: string;
}

export interface ModelContextLike {
  provideContext?: (context: { tools: WebMcpTool[] }) => unknown;
  registerTool?: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal }
  ) => unknown;
}

export interface DocsWebMcpToolOptions {
  /** Docs base path when the site is served under a path prefix, e.g. `/docs`. */
  basePath: string;
  /** Returns the current document location; defaults to `window.location`. */
  currentLocation?: () => { href: string; origin: string; pathname: string };
  fetchImpl?: typeof fetch;
  /** Performs a same-origin navigation to an absolute or root-relative URL. */
  navigate: (href: string) => void;
  siteDescription?: string;
  siteName: string;
}

interface SearchIndexItem {
  href?: string;
  path: string;
  title: string;
}

interface SkillsIndex {
  skills?: { description?: string; files?: string[]; name: string }[];
}

const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const asLimit = (value: unknown): number => {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(asString(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return SEARCH_RESULT_LIMIT;
  }
  return Math.min(Math.floor(parsed), MAX_SEARCH_RESULT_LIMIT);
};

const defaultLocation = () => ({
  href: window.location.href,
  origin: window.location.origin,
  pathname: window.location.pathname,
});

/**
 * Resolves whatever an agent passes as a page reference (a slug, a
 * root-relative path, a same-origin URL, with or without `.md`) to the docs
 * slug that names it. Returns `null` for another origin.
 */
export const resolveDocsSlug = (
  reference: string,
  { basePath, origin }: { basePath: string; origin: string }
): string | null => {
  const trimmed = reference.trim();
  let pathname = trimmed;

  if (isExternalHref(trimmed)) {
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      return null;
    }
    if (url.origin !== origin) {
      return null;
    }
    ({ pathname } = url);
  } else {
    const suffixIndex = trimmed.search(/[?#]/);
    pathname = suffixIndex === -1 ? trimmed : trimmed.slice(0, suffixIndex);
  }

  const withoutExtension = getMarkdownExportSourcePath(pathname) ?? pathname;
  const rootRelative = withoutExtension.startsWith("/")
    ? withoutExtension
    : `/${withoutExtension}`;
  const relative = stripBasePath(rootRelative, basePath)
    .replaceAll(/\/+/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  return relative === "index" ? "" : relative;
};

const buildSearchMatcher = (query: string) => {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
  return (item: SearchIndexItem) => {
    const haystack =
      `${item.title} ${item.path} ${item.href ?? ""}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  };
};

const readText = async (
  fetchImpl: typeof fetch,
  url: string,
  accept: string,
  signal: AbortSignal | undefined,
  notFoundMessage: string
) => {
  const response = await fetchImpl(url, { headers: { accept }, signal });
  if (response.status === 404) {
    throw new Error(notFoundMessage);
  }
  if (!response.ok) {
    throw new Error(`Request for ${url} failed with status ${response.status}`);
  }
  return await response.text();
};

export const buildDocsWebMcpTools = ({
  basePath,
  currentLocation = defaultLocation,
  fetchImpl,
  navigate,
  siteDescription,
  siteName,
}: DocsWebMcpToolOptions): WebMcpTool[] => {
  const doFetch: typeof fetch =
    fetchImpl ?? ((input, init) => globalThis.fetch(input, init));
  const absolute = (href: string) =>
    new URL(href, currentLocation().origin).href;
  const about = siteDescription
    ? `${siteName} documentation: ${siteDescription}`
    : `${siteName} documentation`;

  const tools: WebMcpTool[] = [
    {
      annotations: { readOnlyHint: true },
      description: `Search the ${siteName} documentation by keyword. Returns matching pages and headings with their title, path, and URL. Use read_page to read a result.`,
      execute: async (args, context) => {
        const query = asString(args.query);
        if (!query) {
          throw new Error("query must not be empty.");
        }
        const limit = asLimit(args.limit);
        const response = await doFetch(toDocHref("search", basePath), {
          headers: { accept: "application/json" },
          signal: context?.signal,
        });
        if (!response.ok) {
          throw new Error(
            `Search index request failed with status ${response.status}`
          );
        }
        const payload = (await response.json()) as { items?: unknown };
        const items = Array.isArray(payload.items)
          ? (payload.items as SearchIndexItem[])
          : [];
        const matches = buildSearchMatcher(query);
        const results = items
          .filter((item) => matches(item))
          .slice(0, limit)
          .map((item) => ({
            path: item.path,
            title: item.title,
            url: absolute(item.href ?? toDocHref(item.path, basePath)),
          }));
        return { query, results, total: results.length };
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          limit: {
            description: `Maximum results to return. Defaults to ${SEARCH_RESULT_LIMIT}.`,
            type: "integer",
          },
          query: {
            description: "Words to look for in page titles and headings.",
            type: "string",
          },
        },
        required: ["query"],
        type: "object",
      },
      name: "search_docs",
    },
    {
      annotations: { readOnlyHint: true },
      description: `Read a ${siteName} documentation page as Markdown. Pass the page path or URL from search_docs or get_site_overview; omit it to read the page currently open.`,
      execute: async (args, context) => {
        const location = currentLocation();
        const reference = asString(args.path) || location.pathname;
        const slug = resolveDocsSlug(reference, {
          basePath,
          origin: location.origin,
        });
        if (slug === null) {
          throw new Error(
            `read_page only reads pages on ${location.origin}; got ${reference}.`
          );
        }
        const markdownHref = toMarkdownDocHref(slug || "index", basePath);
        const markdown = await readText(
          doFetch,
          markdownHref,
          MARKDOWN_ACCEPT,
          context?.signal,
          `No documentation page at ${toDocHref(slug || "index", basePath)}. Use search_docs or get_site_overview to find the right path.`
        );
        return markdown;
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          path: {
            description:
              "Page path such as `quickstart` or `/guides/deploy`, or a same-origin URL. Defaults to the current page.",
            type: "string",
          },
        },
        type: "object",
      },
      name: "read_page",
    },
    {
      annotations: { readOnlyHint: true },
      description: `Get an outline of the whole ${siteName} documentation site: every page grouped by navigation section with a one-line description and its Markdown URL. Start here before reading individual pages.`,
      execute: async (_args, context) => {
        const overview = await readText(
          doFetch,
          toDocHref("llms.txt", basePath),
          "text/plain, text/markdown;q=0.9, */*;q=0.1",
          context?.signal,
          "This site has not published a documentation index."
        );
        return overview;
      },
      inputSchema: {
        additionalProperties: false,
        properties: {},
        type: "object",
      },
      name: "get_site_overview",
    },
    {
      annotations: { readOnlyHint: true },
      description: `Read an agent skill published by the ${siteName} documentation. Call without a name to list the available skills; pass a name to read that skill's SKILL.md.`,
      execute: async (args, context) => {
        const name = asString(args.name);
        const indexHref = toDocHref(".well-known/skills/index.json", basePath);
        const indexText = await readText(
          doFetch,
          indexHref,
          "application/json",
          context?.signal,
          "This site does not publish agent skills."
        );
        const index = JSON.parse(indexText) as SkillsIndex;
        const skills = index.skills ?? [];

        if (!name) {
          return {
            skills: skills.map((skill) => ({
              description: skill.description ?? null,
              name: skill.name,
              url: absolute(
                toDocHref(`.well-known/skills/${skill.name}/SKILL.md`, basePath)
              ),
            })),
          };
        }

        const skill = skills.find((candidate) => candidate.name === name);
        if (!skill) {
          const available = skills.map((candidate) => candidate.name);
          throw new Error(
            available.length > 0
              ? `No skill named ${name}. Available skills: ${available.join(", ")}.`
              : `No skill named ${name}. This site does not publish agent skills.`
          );
        }

        return await readText(
          doFetch,
          toDocHref(`.well-known/skills/${skill.name}/SKILL.md`, basePath),
          MARKDOWN_ACCEPT,
          context?.signal,
          `Skill ${name} is listed but its SKILL.md is missing.`
        );
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          name: {
            description:
              "Skill name from the skills list. Omit to list the skills this site publishes.",
            type: "string",
          },
        },
        type: "object",
      },
      name: "read_skill",
    },
    {
      annotations: { readOnlyHint: false },
      description: `Navigate this browser tab to a ${siteName} documentation page. Pass a page path or same-origin URL from search_docs or get_site_overview.`,
      execute: async (args) => {
        const reference = asString(args.path);
        if (!reference) {
          throw new Error("path must not be empty.");
        }
        const location = currentLocation();
        const slug = resolveDocsSlug(reference, {
          basePath,
          origin: location.origin,
        });
        if (slug === null) {
          throw new Error(
            `navigate_page only opens pages on ${location.origin}; got ${reference}.`
          );
        }
        const hashIndex = reference.indexOf("#");
        const hash = hashIndex === -1 ? "" : reference.slice(hashIndex);
        const href = `${toDocHref(slug || "index", basePath)}${hash}`;
        navigate(href);
        return { navigated: true, url: absolute(href) };
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          path: {
            description:
              "Page path such as `quickstart` or `/guides/deploy#setup`, or a same-origin URL.",
            type: "string",
          },
        },
        required: ["path"],
        type: "object",
      },
      name: "navigate_page",
    },
  ];

  return tools.map((tool) => ({
    ...tool,
    description: `${tool.description} Site: ${about}.`,
  }));
};

/**
 * Finds the WebMCP registration surface the browser exposes, if any. Chrome
 * ships it on `document.modelContext`; earlier preview builds used
 * `navigator.modelContext`.
 */
export const getModelContext = (): ModelContextLike | null => {
  if (typeof document === "undefined") {
    return null;
  }
  const fromDocument = (document as Document & { modelContext?: unknown })
    .modelContext;
  if (fromDocument && typeof fromDocument === "object") {
    return fromDocument as ModelContextLike;
  }
  const fromNavigator = (
    globalThis.navigator as Navigator & { modelContext?: unknown }
  )?.modelContext;
  if (fromNavigator && typeof fromNavigator === "object") {
    return fromNavigator as ModelContextLike;
  }
  return null;
};

/**
 * Registers `tools` with the browser's model context. Prefers `registerTool`,
 * which lets the caller unregister through `signal`; falls back to
 * `provideContext` for builds that only implement that. Returns `false` when
 * the browser has no WebMCP support, so the page behaves as it always did.
 */
export const registerWebMcpTools = async (
  tools: WebMcpTool[],
  { signal }: { signal?: AbortSignal } = {}
): Promise<boolean> => {
  const context = getModelContext();
  if (!context) {
    return false;
  }

  if (typeof context.registerTool === "function") {
    await Promise.all(
      tools.map((tool) => context.registerTool?.(tool, { signal }))
    );
    return true;
  }

  if (typeof context.provideContext === "function") {
    await context.provideContext({ tools });
    return true;
  }

  return false;
};
