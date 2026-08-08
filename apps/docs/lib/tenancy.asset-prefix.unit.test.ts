import { beforeAll, describe, expect, it, vi } from "vitest";

import type { isReservedPath as IsReservedPath } from "./tenancy";

let isReservedPath: typeof IsReservedPath;

// next.config.js sets assetPrefix to `/_docs` whenever the build runs on
// Vercel, without needing PLATFORM_ASSET_PREFIX. The proxy has to derive the
// same prefix from the same signal: when it did not, `/_docs/_next/*` resolved
// as a tenant page instead of a static asset and every docs site on a tenant
// host rendered unstyled.
describe("isReservedPath with the implicit Vercel asset prefix", () => {
  beforeAll(async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("PLATFORM_ASSET_PREFIX", "");
    ({ isReservedPath } = await import("./tenancy"));
  });

  it("reserves the docs asset prefix", () => {
    expect(isReservedPath("/_docs/_next/static/chunks/main.js")).toBe(true);
    expect(isReservedPath("/_docs/_next/static/media/glide.woff2")).toBe(true);
  });

  it("still routes tenant pages that merely start with an underscore", () => {
    expect(isReservedPath("/_docsy")).toBe(false);
    expect(isReservedPath("/guides/_docs")).toBe(false);
  });
});
