import { describe, expect, it } from "vitest";

import { ProjectUpdateSchema } from "./project.js";

describe("ProjectUpdateSchema", () => {
  it("allows clearing an existing description", () => {
    expect(ProjectUpdateSchema.parse({ description: null })).toEqual({
      description: null,
    });
  });

  it("accepts an analytics payload with PostHog", () => {
    expect(
      ProjectUpdateSchema.parse({
        analytics: {
          posthog: { projectKey: "phc_abcdefghijklmnopqrstuvwxyz" },
        },
      })
    ).toEqual({
      analytics: {
        posthog: { projectKey: "phc_abcdefghijklmnopqrstuvwxyz" },
      },
    });
  });

  it("allows clearing analytics with null", () => {
    expect(ProjectUpdateSchema.parse({ analytics: null })).toEqual({
      analytics: null,
    });
  });

  it("rejects invalid PostHog project keys", () => {
    expect(() =>
      ProjectUpdateSchema.parse({
        analytics: { posthog: { projectKey: "not-a-posthog-key" } },
      })
    ).toThrow();
  });
});
