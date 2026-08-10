import { describe, expect, it } from "vitest";

import { tenantNotFoundResponse } from "./tenant-not-found-response";

describe("tenantNotFoundResponse", () => {
  it("returns a real HTTP 404 with no-store CDN headers", async () => {
    const response = tenantNotFoundResponse();
    expect(response.status).toBe(404);
    expect(response.headers.get("CDN-Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Vercel-CDN-Cache-Control")).toBe(
      "private, no-store"
    );
    expect(response.headers.get("Content-Type")).toContain("text/html");
    await expect(response.text()).resolves.toContain("Page not found");
  });
});
