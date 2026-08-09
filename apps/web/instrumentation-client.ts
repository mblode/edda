import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
const uiHost =
  process.env.NEXT_PUBLIC_POSTHOG_UI_HOST?.trim() || "https://us.posthog.com";

// Soft no-op when env is missing so local `next dev` still boots.
if (projectToken && apiHost) {
  posthog.init(projectToken, {
    api_host: apiHost,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    defaults: "2026-05-30",
    // Required when api_host is a reverse proxy (e.g. s.blode.md).
    ui_host: uiHost,
  });
}
