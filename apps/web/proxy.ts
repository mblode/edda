import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SLUG_BY_PATH: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/blog": "blog",
  "/changelog": "changelog",
  "/compare/mintlify": "compare-mintlify",
  "/docs-as-code": "docs-as-code",
  "/free-online-llms-txt-resources": "free-online-llms-txt-resources",
  "/pricing": "pricing",
  "/privacy": "privacy",
  "/security": "security",
  "/terms": "terms",
};

const prefersMarkdown = (accept: string | null): boolean => {
  if (!accept) {
    return false;
  }
  const entries = accept.split(",").map((part) => {
    const [raw, ...params] = part.trim().split(";");
    const type = (raw ?? "").trim().toLowerCase();
    const qParam = params
      .map((p) => p.trim())
      .find((p) => p.toLowerCase().startsWith("q="));
    const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    return { q: Number.isFinite(q) ? q : 0, type };
  });
  const md = entries.find((e) => e.type === "text/markdown");
  if (!md || md.q <= 0) {
    return false;
  }
  const html = entries.find((e) => e.type === "text/html" || e.type === "*/*");
  if (!html) {
    return true;
  }
  return md.q >= html.q;
};

const DOCS_PREFIX = "/docs";

// A docs page URL (no file extension) under the proxied /docs prefix. Files
// such as /docs/llms.txt, /docs/quickstart.md and /docs/sitemap.xml already
// have one representation and negotiate nothing.
const isDocsPageUrl = (pathname: string): boolean => {
  if (pathname !== DOCS_PREFIX && !pathname.startsWith(`${DOCS_PREFIX}/`)) {
    return false;
  }
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  return !lastSegment.includes(".");
};

const withVaryAccept = async (url: URL, request: NextRequest) => {
  // Fetched and returned as a constructed Response rather than rewritten:
  // Next replaces `Vary` on a rewrite with its RSC list, so the CDN would
  // serve this Markdown to the next HTML request for the same URL.
  const upstream = await fetch(url, {
    headers: { "user-agent": request.headers.get("user-agent") ?? "" },
  });
  const headers = new Headers(upstream.headers);
  headers.set("Vary", "Accept");
  return new NextResponse(upstream.body, {
    headers,
    status: upstream.status,
  });
};

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  if (!prefersMarkdown(request.headers.get("accept"))) {
    return NextResponse.next();
  }
  if (isDocsPageUrl(pathname)) {
    // The docs app negotiates Markdown itself, but this project's CDN caches
    // the proxied HTML under the page URL without `Accept` in the key (Next
    // strips `Vary: Accept` from rendered HTML). Once the HTML is cached, an
    // agent asking for text/markdown got HTML back. Serve the explicit `.md`
    // twin instead, which is its own URL and therefore its own cache entry.
    const url = request.nextUrl.clone();
    url.pathname = `${pathname === DOCS_PREFIX ? `${DOCS_PREFIX}/index` : pathname}.md`;
    return await withVaryAccept(url, request);
  }
  const slug = SLUG_BY_PATH[pathname];
  if (!slug) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = `/markdown/${slug}`;
  return await withVaryAccept(url, request);
};

export const config = {
  matcher: [
    "/",
    "/docs",
    "/docs/:path*",
    "/about",
    "/blog",
    "/changelog",
    "/compare/mintlify",
    "/docs-as-code",
    "/free-online-llms-txt-resources",
    "/pricing",
    "/privacy",
    "/security",
    "/terms",
  ],
};
