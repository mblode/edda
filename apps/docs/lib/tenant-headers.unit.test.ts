import { describe, expect, it } from "vitest";

import {
  decodeTenantAnalyticsHeader,
  encodeTenantAnalyticsHeader,
} from "./tenant-headers";

describe("encodeTenantAnalyticsHeader", () => {
  it("encodes only the PostHog slice", () => {
    const encoded = encodeTenantAnalyticsHeader({
      posthog: {
        host: "https://eu.i.posthog.com",
        projectKey: "phc_abcdefghijklmnopqrstuvwxyz",
      },
    });
    expect(encoded).toBeTruthy();
    expect(decodeTenantAnalyticsHeader(encoded)).toEqual({
      posthog: {
        host: "https://eu.i.posthog.com",
        projectKey: "phc_abcdefghijklmnopqrstuvwxyz",
      },
    });
  });

  it("strips legacy ga4 keys from the wire payload", () => {
    const encoded = encodeTenantAnalyticsHeader({
      // Legacy rows may still carry ga4 in JSONB.
      ga4: { measurementId: "G-ABC123DEFG" },
      posthog: { projectKey: "phc_abcdefghijklmnopqrstuvwxyz" },
    } as never);
    expect(decodeURIComponent(encoded ?? "")).toBe(
      JSON.stringify({
        posthog: { projectKey: "phc_abcdefghijklmnopqrstuvwxyz" },
      })
    );
  });

  it("returns null when PostHog is absent", () => {
    expect(
      encodeTenantAnalyticsHeader({
        ga4: { measurementId: "G-ABC123DEFG" },
      } as never)
    ).toBeNull();
  });
});

describe("decodeTenantAnalyticsHeader", () => {
  it("returns null for invalid payloads", () => {
    expect(decodeTenantAnalyticsHeader("not-json")).toBeNull();
    expect(decodeTenantAnalyticsHeader("%7B%7D")).toBeNull();
  });
});
