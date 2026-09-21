import { LOCAL_ROOT_HOSTS, normalizeHost } from "@repo/common";
import { posthog } from "posthog-js";

const PLATFORM_ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN?.trim() || "blode.md";
const PLATFORM_DOCS_TENANT_SLUG =
  process.env.NEXT_PUBLIC_PLATFORM_DOCS_TENANT_SLUG?.trim() || "docs";

const LOCAL_PLATFORM_HOSTS = new Set<string>(LOCAL_ROOT_HOSTS);

const isLocalAnalyticsHost = (hostname: string): boolean => {
  const host = normalizeHost(hostname);
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host === "::1" ||
    host === "0.0.0.0" ||
    host.endsWith(".localhost")
  );
};

/**
 * Product hosts eligible for signed-in platform identity. Tenant readers stay
 * anonymous in the shared project; their own analytics use a separate instance.
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

export const shouldInitPlatformPostHogForHost = (hostname: string): boolean => {
  if (isLocalAnalyticsHost(hostname)) {
    return false;
  }
  return isPlatformAnalyticsHost(hostname);
};

export const shouldInitPlatformPostHog = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return shouldInitPlatformPostHogForHost(window.location.hostname);
};

/** All deployed docs surfaces, including tenant/custom domains and path proxies. */
export const shouldTrackDocsPostHogForHost = (hostname: string): boolean =>
  Boolean(normalizeHost(hostname)) && !isLocalAnalyticsHost(hostname);

export const shouldTrackDocsPostHog = (): boolean =>
  typeof window !== "undefined" &&
  shouldTrackDocsPostHogForHost(window.location.hostname);

export const capturePlatformEvent = (
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void => {
  if (!(posthog.__loaded && shouldTrackDocsPostHog())) {
    return;
  }
  posthog.capture(event, properties);
};
