import { InvalidArgumentError } from "commander";
import { describe, expect, it } from "vitest";

import {
  parsePosthogHost,
  parsePosthogProjectKey,
  parseProvider,
} from "./validators.js";

describe("parsePosthogProjectKey", () => {
  it("accepts a valid phc_ key", () => {
    const key = "phc_abcdefghijklmnopqrstuvwxyz";
    expect(parsePosthogProjectKey(key)).toBe(key);
  });

  it("rejects a phx_ personal key with a hint", () => {
    expect(() =>
      parsePosthogProjectKey("phx_abcdefghijklmnopqrstuvwxyz")
    ).toThrow(/Personal API keys/);
  });

  it("rejects a too-short key", () => {
    expect(() => parsePosthogProjectKey("phc_abc")).toThrow(
      InvalidArgumentError
    );
  });
});

describe("parsePosthogHost", () => {
  it("accepts an https URL", () => {
    expect(parsePosthogHost("https://eu.i.posthog.com")).toBe(
      "https://eu.i.posthog.com"
    );
  });

  it("rejects an http URL", () => {
    expect(() => parsePosthogHost("http://eu.i.posthog.com")).toThrow(/https/);
  });

  it("rejects a non-URL", () => {
    expect(() => parsePosthogHost("not-a-url")).toThrow(InvalidArgumentError);
  });
});

describe("parseProvider", () => {
  it("accepts posthog", () => {
    expect(parseProvider("POSTHOG")).toBe("posthog");
  });

  it("rejects unknown providers", () => {
    expect(() => parseProvider("ga4")).toThrow(InvalidArgumentError);
  });
});
