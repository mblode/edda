import { posthog } from "posthog-js";

import {
  isLocalPosthogHost,
  posthogKey,
  posthogUiHost,
  resolvePosthogHost,
} from "./lib/posthog-key";

const isLocalHost = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return isLocalPosthogHost(window.location.hostname);
};

// Soft no-op on localhost so local `next dev` does not hit the shared
// blode.co production project. Token is hardcoded (not env) so a stray
// NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN cannot send to a different project.
if (!isLocalHost()) {
  posthog.init(posthogKey, {
    api_host: resolvePosthogHost(),
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    defaults: "2026-05-30",
    // Required when api_host is a reverse proxy (e.g. s.blode.md).
    ui_host: posthogUiHost,
  });
}
