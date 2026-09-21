import { PLATFORM_POSTHOG_PROJECT_TOKEN } from "@repo/common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { init } = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock("posthog-js", () => ({ posthog: { init } }));

beforeEach(() => {
  vi.resetModules();
  init.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe("docs instrumentation", () => {
  it.each(["docs.blode.md", "acme.blode.md", "docs.example.com", "blode.co"])(
    "initializes the shared project once on %s",
    async (hostname) => {
      vi.stubGlobal("window", { location: { hostname } });
      await import("../instrumentation-client");
      expect(init).toHaveBeenCalledTimes(1);
      expect(init).toHaveBeenCalledWith(
        PLATFORM_POSTHOG_PROJECT_TOKEN,
        expect.objectContaining({
          capture_pageview: "history_change",
          ui_host: "https://us.posthog.com",
        })
      );
      const register = vi.fn();
      init.mock.calls[0]?.[1].loaded({ register });
      expect(register).toHaveBeenCalledWith({
        product: "edda",
        surface: "docs",
      });
    }
  );

  it("does not initialize on localhost", async () => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
    await import("../instrumentation-client");
    expect(init).not.toHaveBeenCalled();
  });
});
