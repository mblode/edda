import { describe, expect, it } from "vitest";

import {
  isLocalPosthogHost,
  posthogDefaultApiHost,
  posthogKey,
  posthogUiHost,
  resolvePosthogHost,
} from "./posthog-key";

describe("platform PostHog key (web)", () => {
  it("pins the public token to the blode.co project", () => {
    expect(posthogKey).toBe("phc_yYatHXysbRxjTyfmyCKSUyMSQpgepJPuxegz2HtpfX35");
    expect(posthogUiHost).toBe("https://us.posthog.com");
    expect(posthogDefaultApiHost).toBe("https://s.blode.md");
  });

  it("defaults api_host to the Edda reverse proxy and allows a proxy override", () => {
    expect(resolvePosthogHost("")).toBe("https://s.blode.md");
    expect(resolvePosthogHost("   ")).toBe("https://s.blode.md");
    expect(resolvePosthogHost("  https://r.blode.co  ")).toBe(
      "https://r.blode.co"
    );
  });

  it("treats local hosts as non-production analytics", () => {
    expect(isLocalPosthogHost("localhost")).toBe(true);
    expect(isLocalPosthogHost("127.0.0.1:3000")).toBe(true);
    expect(isLocalPosthogHost("blodemd.localhost")).toBe(true);
    expect(isLocalPosthogHost("blode.md")).toBe(false);
    expect(isLocalPosthogHost("edda-web-abc.vercel.app")).toBe(false);
  });
});
