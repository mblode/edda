import { LOCAL_ROOT_HOSTS, normalizeHost } from "@repo/common";
import posthog from "posthog-js";

const PLATFORM_ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN?.trim() || "blode.md";
const PLATFORM_DOCS_TENANT_SLUG =
  process.env.NEXT_PUBLIC_PLATFORM_DOCS_TENANT_SLUG?.trim() || "docs";

const LOCAL_PLATFORM_HOSTS = new Set<string>(LOCAL_ROOT_HOSTS);

/**
 * Platform PostHog should only run on Blode product/docs hosts — never on
 * customer tenant subdomains or custom domains.
 */
export const isPlatformAnalyticsHost = (hostname: string): boolean => {
  const host = normalizeHost(hostname);
  if (!host) {
    return false;
  }
  if (LOCAL_PLATFORM_HOSTS.has(host)) {
    return true;
  }
  if (host === PLATFORM_ROOT_DOMAIN || host === `www.${PLATFORM_ROOT_DOMAIN}`) {
    return true;
  }
  if (host === `${PLATFORM_DOCS_TENANT_SLUG}.${PLATFORM_ROOT_DOMAIN}`) {
    return true;
  }
  if (host === `${PLATFORM_DOCS_TENANT_SLUG}.localhost`) {
    return true;
  }
  // Docs app preview deployments are product surfaces, not customer tenants.
  if (host.endsWith(".vercel.app")) {
    return true;
  }
  return false;
};

export const shouldInitPlatformPostHog = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return isPlatformAnalyticsHost(window.location.hostname);
};

export const capturePlatformEvent = (
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void => {
  if (!(posthog.__loaded && shouldInitPlatformPostHog())) {
    return;
  }
  posthog.capture(event, properties);
};
