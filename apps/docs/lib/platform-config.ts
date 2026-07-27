import {
  platformAssetPrefix,
  platformDocsTenantSlug,
  platformRootDomain,
} from "./env";

export const platformConfig = {
  assetPrefix: platformAssetPrefix,
  // Where the marketing app proxies the platform's own docs tenant.
  docsBasePath: "/docs",
  docsTenantSlug: platformDocsTenantSlug,
  rootDomain: platformRootDomain,
};
