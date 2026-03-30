import { describe, expect, it } from "vitest";

import {
  applyTenantUtilityContextSearchParams,
  getTenantRequestContextFromUrl,
} from "./tenant-utility-context";

describe("tenant utility context", () => {
  it("round-trips tenant utility rewrite context through search params", () => {
    const url = new URL("https://blode.md/sites/example/sitemap.xml");

    applyTenantUtilityContextSearchParams(url, {
      basePath: "/example",
      protocol: "https",
      requestedHost: "blode.md",
      strategy: "path",
    });

    expect(getTenantRequestContextFromUrl(url)).toEqual({
      basePath: "/example",
      protocol: "https",
      requestedHost: "blode.md",
      strategy: "path",
    });
  });

  it("returns null when no rewrite context is present", () => {
    expect(
      getTenantRequestContextFromUrl(
        new URL("https://blode.md/sites/example/sitemap.xml")
      )
    ).toBeNull();
  });
});
