import type { ProjectAnalytics } from "@repo/contracts";

export const TENANT_HEADERS = {
  ANALYTICS: "x-tenant-analytics",
  BASE_PATH: "x-tenant-base-path",
  CUSTOM_DOMAINS: "x-tenant-custom-domains",
  DEPLOYMENT_ID: "x-tenant-deployment-id",
  DOMAIN: "x-tenant-domain",
  ID: "x-tenant-id",
  MANIFEST_URL: "x-tenant-manifest-url",
  NAME: "x-tenant-name",
  PATH_PREFIX: "x-tenant-path-prefix",
  PRIMARY_DOMAIN: "x-tenant-primary-domain",
  SLUG: "x-tenant-slug",
  STRATEGY: "x-tenant-strategy",
  SUBDOMAIN: "x-tenant-subdomain",
} as const;

const toWireAnalytics = (value: ProjectAnalytics): ProjectAnalytics | null => {
  if (!value.posthog?.projectKey) {
    return null;
  }
  return {
    posthog: {
      projectKey: value.posthog.projectKey,
      ...(value.posthog.host ? { host: value.posthog.host } : {}),
    },
  };
};

export const encodeTenantAnalyticsHeader = (
  analytics: ProjectAnalytics | undefined
): string | null => {
  if (!analytics) {
    return null;
  }
  const wire = toWireAnalytics(analytics);
  if (!wire) {
    return null;
  }
  return encodeURIComponent(JSON.stringify(wire));
};

export const decodeTenantAnalyticsHeader = (
  encoded: string | null | undefined
): ProjectAnalytics | null => {
  if (!encoded) {
    return null;
  }
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as ProjectAnalytics;
    return toWireAnalytics(parsed);
  } catch {
    return null;
  }
};
