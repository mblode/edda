import { describe, expect, it } from "vitest";

import {
  ProjectAnalyticsPosthogSchema,
  ProjectAnalyticsSchema,
} from "./analytics.js";

describe("ProjectAnalyticsPosthogSchema", () => {
  it("accepts a phc_ project key", () => {
    expect(
      ProjectAnalyticsPosthogSchema.parse({
        projectKey: "phc_abcdefghijklmnopqrstuvwxyz",
      })
    ).toEqual({ projectKey: "phc_abcdefghijklmnopqrstuvwxyz" });
  });

  it("rejects phx_ personal API keys", () => {
    expect(() =>
      ProjectAnalyticsPosthogSchema.parse({
        projectKey: "phx_abcdefghijklmnopqrstuvwxyz",
      })
    ).toThrow();
  });

  it("accepts an optional host", () => {
    expect(
      ProjectAnalyticsPosthogSchema.parse({
        host: "https://eu.i.posthog.com",
        projectKey: "phc_abcdefghijklmnopqrstuvwxyz",
      })
    ).toEqual({
      host: "https://eu.i.posthog.com",
      projectKey: "phc_abcdefghijklmnopqrstuvwxyz",
    });
  });

  it("rejects a non-URL host", () => {
    expect(() =>
      ProjectAnalyticsPosthogSchema.parse({
        host: "not-a-url",
        projectKey: "phc_abcdefghijklmnopqrstuvwxyz",
      })
    ).toThrow();
  });
});

describe("ProjectAnalyticsSchema", () => {
  it("accepts a PostHog config", () => {
    expect(
      ProjectAnalyticsSchema.parse({
        posthog: { projectKey: "phc_abcdefghijklmnopqrstuvwxyz" },
      })
    ).toEqual({
      posthog: { projectKey: "phc_abcdefghijklmnopqrstuvwxyz" },
    });
  });

  it("strips legacy ga4 keys", () => {
    expect(
      ProjectAnalyticsSchema.parse({
        ga4: { measurementId: "G-ABC123DEFG" },
        posthog: { projectKey: "phc_abcdefghijklmnopqrstuvwxyz" },
      })
    ).toEqual({
      posthog: { projectKey: "phc_abcdefghijklmnopqrstuvwxyz" },
    });
  });

  it("allows an empty config (provider cleared)", () => {
    expect(ProjectAnalyticsSchema.parse({})).toEqual({});
  });
});
