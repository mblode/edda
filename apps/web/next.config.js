const rawDocsAppUrl = (process.env.DOCS_APP_URL ?? "").trim();
const rawDashboardAppUrl = (process.env.DASHBOARD_APP_URL ?? "").trim();
const rawPlatformRootDomain = (process.env.PLATFORM_ROOT_DOMAIN ?? "").trim();
const platformRootDomain = rawPlatformRootDomain || "blode.md";
const isVercelRuntime = process.env.VERCEL === "1";
const docsAppUrl =
  rawDocsAppUrl ||
  (isVercelRuntime
    ? `https://docs.${platformRootDomain}`
    : "http://127.0.0.1:3001");
// Dashboard traffic must not fall back to docs. If it does, `/app` gets
// treated as tenant/docs traffic and 404s instead of reaching auth.
const dashboardAppUrl =
  rawDashboardAppUrl ||
  (isVercelRuntime
    ? `https://app.${platformRootDomain}`
    : "http://127.0.0.1:3002");

// The docs build serves its chunks under this prefix so they never collide with
// the marketing build's own `/_next/*`. Keep in sync with `assetPrefix` in
// apps/docs/next.config.js.
const DOCS_ASSET_PREFIX = "/_docs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // The sitemap stamps `lastmod` with today's date, and a prerender cannot read
  // the clock. next.config runs in Node at build time, outside any prerender,
  // so stamping it here is safe.
  env: { BUILD_DATE: new Date().toISOString().slice(0, 10) },
  experimental: {
    // A bail-out from prerendering throws. Without this every cached GET logs a
    // stack trace during the build that means nothing.
    hideLogsAfterAbort: true,
    // Runs the React Compiler inside Turbopack rather than Babel.
    turbopackRustReactCompiler: true,
    // Hold a navigation pending through a connectivity drop and retry on
    // reconnect, instead of throwing.
    useOffline: true,
  },
  headers() {
    const agentDiscoveryLink = [
      '</.well-known/api-catalog>; rel="api-catalog"',
      '</docs/api/overview>; rel="service-doc"; type="text/html"',
      '</api/openapi.json>; rel="service-desc"; type="application/json"',
      '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rel/skills-index"; type="application/json"',
      '</.well-known/mcp/server-card.json>; rel="https://modelcontextprotocol.io/rel/server-card"; type="application/json"',
      '</.well-known/oauth-authorization-server>; rel="https://datatracker.ietf.org/doc/html/rfc8414"; type="application/json"',
      '</.well-known/oauth-protected-resource>; rel="https://datatracker.ietf.org/doc/html/rfc9728"; type="application/json"',
      '</.well-known/openid-configuration>; rel="http://openid.net/specs/connect/1.0/issuer"; type="application/json"',
      '</sitemap.xml>; rel="sitemap"; type="application/xml"',
      '</llms.txt>; rel="https://llmstxt.org/rel/llms-txt"; type="text/plain"',
    ].join(", ");
    return [
      {
        headers: [{ key: "Link", value: agentDiscoveryLink }],
        source: "/",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "**.public.blob.vercel-storage.com",
        protocol: "https",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/markdown/*": ["./app/markdown/content/**/*.md"],
  },
  partialPrefetching: true,
  reactCompiler: true,
  rewrites() {
    return {
      beforeFiles: [
        // Prefixed docs chunks. Unlike the Referer rules below this needs no
        // hint from the client, so crawlers that omit Referer still get the
        // real asset instead of a 404.
        //
        // The prefix is stripped here rather than by the docs app. A Next
        // rewrite cannot target `/_next/*` -- the destination is reserved and
        // silently falls through to the tenant catch-all -- so docs only ever
        // serves these at their unprefixed path.
        {
          destination: `${docsAppUrl}/_next/:path*`,
          source: `${DOCS_ASSET_PREFIX}/_next/:path*`,
        },
        { destination: `${docsAppUrl}/docs`, source: "/docs" },
        { destination: `${docsAppUrl}/docs/:path*`, source: "/docs/:path*" },
        { destination: `${dashboardAppUrl}/app`, source: "/app" },
        {
          destination: `${dashboardAppUrl}/app/:path*`,
          source: "/app/:path*",
        },
        {
          destination: `${dashboardAppUrl}/oauth/:path*`,
          source: "/oauth/:path*",
        },
        { destination: `${docsAppUrl}/api/:path*`, source: "/api/:path*" },
        { destination: `${docsAppUrl}/docs.json`, source: "/docs.json" },
        { destination: `${docsAppUrl}/sites/:path*`, source: "/sites/:path*" },
        {
          destination: `${docsAppUrl}/.well-known/:path*`,
          source: "/.well-known/:path*",
        },
        { destination: `${docsAppUrl}/llms.txt`, source: "/llms.txt" },
        {
          destination: `${docsAppUrl}/llms-full.txt`,
          source: "/llms-full.txt",
        },
        // Cross-project unprefixed /_next/* assets: when the browser requests
        // a chunk with a Referer from a proxied surface, forward it to the
        // matching backing app so the correct build serves it. Docs only needs
        // this in local development, where it runs without an asset prefix.
        {
          destination: `${docsAppUrl}/_next/:path*`,
          has: [
            {
              key: "referer",
              type: "header",
              value: ".*\\/docs(?:\\/.*)?(?:[?#].*)?$",
            },
          ],
          source: "/_next/:path*",
        },
        {
          destination: `${dashboardAppUrl}/_next/:path*`,
          has: [
            {
              key: "referer",
              type: "header",
              value: ".*\\/(app|oauth)(?:\\/.*)?(?:[?#].*)?$",
            },
          ],
          source: "/_next/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
