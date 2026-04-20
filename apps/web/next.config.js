const rawDocsAppUrl = (process.env.DOCS_APP_URL ?? "").trim();
const docsAppUrl = rawDocsAppUrl || "http://127.0.0.1:3001";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  reactCompiler: true,
  rewrites() {
    return {
      beforeFiles: [
        { destination: `${docsAppUrl}/docs`, source: "/docs" },
        { destination: `${docsAppUrl}/docs/:path*`, source: "/docs/:path*" },
        { destination: `${docsAppUrl}/app`, source: "/app" },
        { destination: `${docsAppUrl}/app/:path*`, source: "/app/:path*" },
        { destination: `${docsAppUrl}/oauth/:path*`, source: "/oauth/:path*" },
        { destination: `${docsAppUrl}/api/:path*`, source: "/api/:path*" },
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
        // Cross-project /_next/* assets: when the browser requests a Next.js
        // chunk with a Referer from /docs, /app, or /oauth (all proxied to
        // apps/docs), forward the asset request to apps/docs so the right
        // build serves it. Direct requests to apps/web's own /_next/* (from
        // the marketing pages) have no /docs Referer and fall through to
        // Next.js's built-in static handler.
        {
          destination: `${docsAppUrl}/_next/:path*`,
          has: [
            {
              key: "referer",
              type: "header",
              value: `.*\\/(docs|app|oauth)(?:\\/.*)?$`,
            },
          ],
          source: "/_next/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
