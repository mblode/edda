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
  assetPrefix: cleanEnv(process.env.PLATFORM_ASSET_PREFIX),
  experimental: {
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
