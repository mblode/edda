/**
 * Public write-only token for the shared blode.co PostHog project (529494).
 * Hardcoded so a mis-set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` cannot send
 * Edda / blode.md platform events to a different project (including a
 * customer tenant project).
 *
 * Same key as mblode/blode-co `apps/web/lib/posthog-key.ts`. Never a tenant key.
 */
export const PLATFORM_POSTHOG_PROJECT_TOKEN =
  "phc_yYatHXysbRxjTyfmyCKSUyMSQpgepJPuxegz2HtpfX35";

/** Toolbar / session links still need the real PostHog app when api_host is a reverse proxy. */
export const PLATFORM_POSTHOG_UI_HOST = "https://us.posthog.com";

/**
 * Default ingest host: Edda's reverse proxy (same role as blode.co's
 * `NEXT_PUBLIC_POSTHOG_HOST=https://r.blode.co`). Override with
 * `NEXT_PUBLIC_POSTHOG_HOST` if the proxy origin changes — never to swap projects.
 */
export const PLATFORM_POSTHOG_DEFAULT_API_HOST = "https://s.blode.md";

export const resolvePlatformPosthogApiHost = (envHost?: string): string => {
  const trimmed = envHost?.trim();
  return trimmed || PLATFORM_POSTHOG_DEFAULT_API_HOST;
};
