const readTrimmedEnv = (name: string) => {
  const value = process.env[name];
  if (typeof value !== "string") {
    return;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }
  return trimmed;
};

// Must reference process.env.NEXT_PUBLIC_API_URL as a literal so Next.js
// inlines it into the client bundle. Dynamic access via readTrimmedEnv is
// not replaced at build time and would always be undefined on the client.
export const docsApiBase =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";

// Must match the assetPrefix default in apps/docs/next.config.js. That file
// decides where asset URLs point; this one keeps those paths reserved so the
// tenant proxy passes them through. When the two disagreed, every
// `/_docs/_next/*` request resolved as a tenant page and 404ed, which rendered
// every docs site unstyled. Literal `process.env` access for the same reason as
// above: the proxy runs in the edge bundle, where only inlined reads survive.
export const platformAssetPrefix =
  process.env.PLATFORM_ASSET_PREFIX?.trim() ||
  (process.env.VERCEL === "1" ? "/_docs" : "");

export const platformRootDomain =
  readTrimmedEnv("PLATFORM_ROOT_DOMAIN") ?? "blode.md";

// The platform's own docs are the one tenant the marketing app proxies under a
// path prefix. No customer tenant gets that treatment.
export const platformDocsTenantSlug =
  readTrimmedEnv("PLATFORM_DOCS_TENANT_SLUG") ?? "docs";
