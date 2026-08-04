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

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  assetPrefix: cleanEnv(process.env.PLATFORM_ASSET_PREFIX),
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
  transpilePackages: ["@repo/contracts", "@repo/db"],
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
