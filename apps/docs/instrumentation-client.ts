import posthog from "posthog-js";

import { shouldInitPlatformPostHog } from "./lib/platform-analytics";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();

// Customer tenant hosts must never initialize the Blode platform SDK.
if (projectToken && host && shouldInitPlatformPostHog()) {
  posthog.init(projectToken, {
    api_host: host,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    defaults: "2026-01-30",
  });
}
