import { describe, expect, it } from "vitest";

import { computeETag, handleIfNoneMatch } from "./etag";

describe("etag helpers", () => {
  it("returns a quoted sha256 prefix", () => {
    expect(computeETag("hello")).toMatch(/^"[a-f0-9]{16}"$/);
  });

  it("returns null when If-None-Match does not match", () => {
    const etag = computeETag("body");
    const request = new Request("https://example.com", {
      headers: { "if-none-match": '"other"' },
    });
    expect(handleIfNoneMatch(request, etag)).toBeNull();
  });

  it("returns 304 with ETag and any extra headers", () => {
    const etag = computeETag("body");
    const request = new Request("https://example.com", {
      headers: { "if-none-match": etag },
    });
    const response = handleIfNoneMatch(request, etag, {
      "X-Robots-Tag": "noindex",
    });

    expect(response).not.toBeNull();
    expect(response?.status).toBe(304);
    expect(response?.headers.get("ETag")).toBe(etag);
    expect(response?.headers.get("X-Robots-Tag")).toBe("noindex");
  });
});
