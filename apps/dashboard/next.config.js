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
const isVercelRuntime = process.env.VERCEL === "1";

// Dashboard is proxied under `blode.md/app`, so its chunks share the `/_next/*`
// namespace with the marketing build. Without a prefix the only thing telling
// them apart at the edge is the Referer header, and any client that omits it --
// a crawler, a privacy extension -- gets a 404 for every stylesheet and script.
// Keep in sync with DASHBOARD_ASSET_PREFIX in apps/web/next.config.js and
// apps/docs/next.config.js.
const assetPrefix =
  cleanEnv(process.env.PLATFORM_ASSET_PREFIX) ||
  (isVercelRuntime ? "/_app" : "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix,
  cacheComponents: true,
  experimental: {
    // A bail-out from prerendering throws. Without this every cached GET logs a
    // stack trace during the build that means nothing.
    hideLogsAfterAbort: true,
    // Hold a navigation or Server Action pending through a connectivity drop
    // and retry on reconnect, instead of throwing.
    useOffline: true,
    optimizePackageImports: [
      "blode-icons-react",
      "radix-ui",
      "@base-ui/react",
      "cmdk",
      "@repo/contracts",
      "@repo/db",
    ],
  },
  images: {
    remotePatterns: [
      {
        hostname: "**.public.blob.vercel-storage.com",
        protocol: "https",
      },
    ],
  },
  partialPrefetching: true,
  redirects() {
    return [
      {
        destination: "/oauth/consent",
        permanent: false,
        source: "/oauth/sign-up",
      },
      {
        destination: "/oauth/consent",
        permanent: false,
        source: "/oauth/sign-up/:path*",
      },
    ];
  },
  // Serve the prefixed chunks when the dashboard is reached on its own domain
  // rather than through the marketing rewrite, which strips the prefix itself.
  rewrites() {
    return {
      afterFiles: [],
      beforeFiles: assetPrefix
        ? [
            {
              destination: "/_next/:path*",
              source: `${assetPrefix}/_next/:path*`,
            },
          ]
        : [],
      fallback: [],
    };
  },
  transpilePackages: ["@repo/contracts", "@repo/db"],
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
