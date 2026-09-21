/**
 * Public write-only token for the shared blode.co PostHog project (529494).
 * Hardcoded so a mis-set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` cannot send
 * Edda / blode.md platform events to a different project.
 *
 * Same key as mblode/blode-co `apps/web/lib/posthog-key.ts` and
 * `@repo/common` `PLATFORM_POSTHOG_PROJECT_TOKEN`. apps/web stays free of
 * `@repo/*` runtime deps, so this file is the marketing-app copy.
 */
export const posthogKey = "phc_yYatHXysbRxjTyfmyCKSUyMSQpgepJPuxegz2HtpfX35";

/** Toolbar / session links still need the real PostHog app when api_host is a reverse proxy. */
export const posthogUiHost = "https://us.posthog.com";

/**
 * Default ingest host: Edda's reverse proxy (same role as blode.co's
 * `NEXT_PUBLIC_POSTHOG_HOST=https://r.blode.co`).
 */
export const posthogDefaultApiHost = "https://s.blode.md";

export const resolvePosthogHost = (
  envHost: string | undefined = process.env.NEXT_PUBLIC_POSTHOG_HOST
): string => {
  const trimmed = envHost?.trim();
  return trimmed || posthogDefaultApiHost;
};

const PORT_SUFFIX = /:\d+$/;

/** Match blode.co: do not send the shared production project from local `next dev`. */
export const isLocalPosthogHost = (hostname: string): boolean => {
  const host = hostname.trim().replace(PORT_SUFFIX, "").toLowerCase();
  return (
    host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")
  );
};
