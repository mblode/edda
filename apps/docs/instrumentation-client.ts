import posthog from "posthog-js";

import { shouldInitPlatformPostHog } from "./lib/platform-analytics";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
const uiHost =
  process.env.NEXT_PUBLIC_POSTHOG_UI_HOST?.trim() || "https://us.posthog.com";

// Customer tenant hosts must never initialize the Blode platform SDK.
if (projectToken && apiHost && shouldInitPlatformPostHog()) {
  posthog.init(projectToken, {
    api_host: apiHost,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    defaults: "2026-05-30",
    // Required when api_host is a reverse proxy (e.g. s.blode.md).
    ui_host: uiHost,
  });
}
