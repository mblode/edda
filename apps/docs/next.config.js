import path from "node:path";
import { fileURLToPath } from "node:url";

const cleanEnv = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, "..", "..");
const rawDashboardAppUrl = cleanEnv(process.env.DASHBOARD_APP_URL);
const rawPlatformRootDomain = cleanEnv(process.env.PLATFORM_ROOT_DOMAIN);
const platformRootDomain = rawPlatformRootDomain || "blode.md";
const isVercelRuntime = process.env.VERCEL === "1";
// Keep docs able to proxy `/app` and `/oauth` when apex traffic lands here
// directly or an upstream rewrite misroutes dashboard requests to docs.
const dashboardAppUrl =
  rawDashboardAppUrl ||
  (isVercelRuntime
    ? `https://app.${platformRootDomain}`
    : "http://127.0.0.1:3002");

// Docs is proxied under `blode.md/docs`, so its chunks share the `/_next/*`
// namespace with the marketing build and there is no reliable way to tell them
// apart at the edge. Serving them under a prefix makes the split explicit.
// Keep in sync with DOCS_ASSET_PREFIX in apps/web/next.config.js.
const assetPrefix =
  cleanEnv(process.env.PLATFORM_ASSET_PREFIX) ||
  (isVercelRuntime ? "/_docs" : "");

// Safe on every response, tenant docs included: none of these can change how a
// page renders.
//
// Deliberately absent, and not an oversight:
//
// - **No CSP.** This app renders customer-authored MDX. `<Iframe>` and
//   `<Video>` take an arbitrary `src`, images come from whatever CDN the
//   customer uses, and `analytics.posthog.host` in a project's config is a
//   free-form URL. Any `script-src`, `frame-src`, `connect-src` or `img-src`
//   narrow enough to be worth setting would break somebody's published docs.
// - **No `X-Frame-Options` on tenant docs.** A customer embedding their own
//   docs in their own product is a supported-looking thing to do, and these
//   pages are public and read-only, so the clickjacking they would prevent has
//   nothing to act on. The dashboard paths below are the exception.
const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix,
  cacheComponents: true,
  // The marketing sitemap stamps `lastmod`, and a prerender cannot read the
  // clock. next.config runs in Node at build time, outside any prerender.
  env: { BUILD_DATE: new Date().toISOString().slice(0, 10) },
  cacheLife: {
    artifacts: {
      expire: 3600,
      revalidate: 300,
      stale: 1800,
    },
    hours: {
      expire: 14_400,
      revalidate: 900,
      stale: 3600,
    },
  },
  experimental: {
    // A bail-out from prerendering throws, and the route handlers below catch
    // it alongside their real errors. Without this every cached GET logs a
    // stack trace during the build that means nothing.
    hideLogsAfterAbort: true,
    // Hold a navigation pending through a connectivity drop and retry on
    // reconnect, instead of throwing.
    useOffline: true,
    optimizePackageImports: [
      "blode-icons-react",
      "radix-ui",
      "@base-ui/react",
      "cmdk",
      "@repo/previewing",
      "@repo/models",
      "@repo/common",
    ],
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
    ].join(", ");
    // Every matching rule applies in array order and a later value wins per
    // header key, so the catch-all goes first and the narrower rules after it.
    return [
      {
        headers: baseSecurityHeaders,
        source: "/(.*)",
      },
      // Auth and dashboard traffic this app proxies when apex requests land
      // here. Framing those is worth blocking; framing a docs page is not.
      {
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
        source: "/app/:path*",
      },
      {
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
        source: "/oauth/:path*",
      },
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
    "/sites/**": ["./content/**/*"],
  },
  partialPrefetching: true,
  rewrites() {
    const assetRewrite = assetPrefix
      ? [
          {
            destination: "/_next/:path*",
            source: `${assetPrefix}/_next/:path*`,
          },
        ]
      : [];
    return {
      afterFiles: [
        {
          destination: "/sites/:tenant/llms.mdx/:path*",
          source: "/sites/:tenant/:path*.md",
        },
        {
          destination: "/sites/:tenant/llms.mdx/:path*",
          source: "/sites/:tenant/:path*.mdx",
        },
      ],
      beforeFiles: [
        ...assetRewrite,
        // Prefixed dashboard chunks, for the same reason as the Referer rule
        // below but without needing the client to send one. Keep in sync with
        // `assetPrefix` in apps/dashboard/next.config.js.
        {
          destination: `${dashboardAppUrl}/_next/:path*`,
          source: "/_app/_next/:path*",
        },
        { destination: `${dashboardAppUrl}/app`, source: "/app" },
        {
          destination: `${dashboardAppUrl}/app/:path*`,
          source: "/app/:path*",
        },
        {
          destination: `${dashboardAppUrl}/oauth/:path*`,
          source: "/oauth/:path*",
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
  transpilePackages: [
    "@repo/common",
    "@repo/contracts",
    "@repo/models",
    "@repo/prebuild",
    "@repo/previewing",
    "@repo/validation",
  ],
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
