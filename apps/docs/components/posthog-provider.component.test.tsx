import { PLATFORM_POSTHOG_PROJECT_TOKEN } from "@repo/common";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PostHogProvider } from "./posthog-provider";

const { capture, init } = vi.hoisted(() => ({
  capture: vi.fn(),
  init: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: { init } }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/guide",
  useSearchParams: () => new URLSearchParams("tab=api"),
}));
vi.mock("@/lib/platform-analytics", () => ({
  shouldTrackDocsPostHog: () => true,
}));

let root: Root;
let container: HTMLDivElement;
const render = async (element: React.ReactNode) => {
  await act(() => root.render(element));
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  vi.clearAllMocks();
  init.mockReturnValue({ capture });
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("tenant analytics alongside the shared project", () => {
  it("does not double-count when the tenant selects the shared project", async () => {
    await render(
      <PostHogProvider projectKey={PLATFORM_POSTHOG_PROJECT_TOKEN} />
    );
    expect(init).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
  });

  it("keeps a different project in its named instance with an absolute URL", async () => {
    await render(
      <PostHogProvider
        projectKey="phc_tenant_test"
        host="https://eu.i.posthog.com"
      />
    );
    expect(init).toHaveBeenCalledWith(
      "phc_tenant_test",
      expect.objectContaining({
        api_host: "https://eu.i.posthog.com",
        capture_pageview: false,
      }),
      "tenant"
    );
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith("$pageview", {
      $current_url: `${window.location.origin}/guide?tab=api`,
    });
  });
});
