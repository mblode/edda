import { describe, expect, it } from "vitest";

import {
  isPlatformAnalyticsHost,
  shouldInitPlatformPostHogForHost,
} from "./platform-analytics";

describe("isPlatformAnalyticsHost", () => {
  it("allows platform root and local hosts", () => {
    expect(isPlatformAnalyticsHost("blode.md")).toBe(true);
    expect(isPlatformAnalyticsHost("www.blode.md")).toBe(true);
    expect(isPlatformAnalyticsHost("localhost")).toBe(true);
    expect(isPlatformAnalyticsHost("docs.localhost")).toBe(true);
    expect(isPlatformAnalyticsHost("127.0.0.1:3001")).toBe(true);
  });

  it("allows the platform docs tenant host", () => {
    expect(isPlatformAnalyticsHost("docs.blode.md")).toBe(true);
  });

  it("allows Vercel preview hosts", () => {
    expect(isPlatformAnalyticsHost("blodemd-docs-abc.vercel.app")).toBe(true);
  });

  it("rejects customer tenant hosts", () => {
    expect(isPlatformAnalyticsHost("acme.blode.md")).toBe(false);
    expect(isPlatformAnalyticsHost("docs.example.com")).toBe(false);
    expect(isPlatformAnalyticsHost("example.localhost")).toBe(false);
  });
});

describe("shouldInitPlatformPostHogForHost", () => {
  it("does not send the shared blode.co project from local next dev", () => {
    expect(shouldInitPlatformPostHogForHost("localhost")).toBe(false);
    expect(shouldInitPlatformPostHogForHost("127.0.0.1:3001")).toBe(false);
    expect(shouldInitPlatformPostHogForHost("docs.localhost")).toBe(false);
  });

  it("inits on Edda product hosts and preview deployments", () => {
    expect(shouldInitPlatformPostHogForHost("blode.md")).toBe(true);
    expect(shouldInitPlatformPostHogForHost("docs.blode.md")).toBe(true);
    expect(
      shouldInitPlatformPostHogForHost("blodemd-docs-abc.vercel.app")
    ).toBe(true);
  });

  it("still never inits on customer tenant hosts", () => {
    expect(shouldInitPlatformPostHogForHost("acme.blode.md")).toBe(false);
    expect(shouldInitPlatformPostHogForHost("docs.example.com")).toBe(false);
    expect(shouldInitPlatformPostHogForHost("example.localhost")).toBe(false);
  });
});
