import {
  PLATFORM_POSTHOG_PROJECT_TOKEN,
  PLATFORM_POSTHOG_UI_HOST,
  resolvePlatformPosthogApiHost,
} from "@repo/common";
import { posthog } from "posthog-js";

import { shouldTrackDocsPostHog } from "./lib/platform-analytics";

// Every deployed docs site reports to the shared project. Tenant BYO analytics
// remain isolated in the named "tenant" instance.
// Token is hardcoded to the blode.co project so a stray
// NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN cannot send to a different project.
if (shouldTrackDocsPostHog()) {
  posthog.init(PLATFORM_POSTHOG_PROJECT_TOKEN, {
    api_host: resolvePlatformPosthogApiHost(
      process.env.NEXT_PUBLIC_POSTHOG_HOST
    ),
    capture_exceptions: true,
    capture_pageview: "history_change",
    loaded: (client) => client.register({ product: "edda", surface: "docs" }),
    debug: process.env.NODE_ENV === "development",
    defaults: "2026-05-30",
    // Required when api_host is a reverse proxy (e.g. s.blode.md).
    ui_host: PLATFORM_POSTHOG_UI_HOST,
  });
}
