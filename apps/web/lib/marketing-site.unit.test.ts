import { describe, expect, it } from "vitest";

import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  isRedirectedMarketingPath,
  MARKETING_HOME,
  marketingUrl,
  PLATFORM_ORIGIN,
  platformUrl,
  PRODUCT_ONE_LINER,
  REDIRECTED_MARKETING_PATHS,
} from "./marketing-site";

describe("marketing vs product hosts", () => {
  it("keeps the brand page on blode.co/edda, not blode.co/edda-docs", () => {
    expect(MARKETING_HOME).toBe("https://blode.co/edda");
    expect(PLATFORM_ORIGIN).toBe("https://blode.md");
  });

  it("redirects only the apex marketing landing", () => {
    expect(REDIRECTED_MARKETING_PATHS).toEqual(["/"]);
    expect(isRedirectedMarketingPath("/")).toBe(true);
    expect(isRedirectedMarketingPath("/about")).toBe(false);
    expect(isRedirectedMarketingPath("/pricing")).toBe(false);
    expect(isRedirectedMarketingPath("/blog")).toBe(false);
    expect(isRedirectedMarketingPath("/docs")).toBe(false);
    expect(isRedirectedMarketingPath("/app")).toBe(false);
  });

  it("canonicalizes `/` to the brand page and other paths to blode.md", () => {
    expect(marketingUrl("/")).toBe("https://blode.co/edda");
    expect(marketingUrl("/about")).toBe("https://blode.md/about");
    expect(marketingUrl("/pricing")).toBe("https://blode.md/pricing");
    expect(platformUrl("/privacy")).toBe("https://blode.md/privacy");
  });
});

describe("Designer-locked product one-liner", () => {
  it("uses the exact knowledge-first sentence trio", () => {
    expect(PRODUCT_ONE_LINER).toBe(
      "Knowledge docs for agents. Git-native MDX. Publish on merge."
    );
    expect(HOME_TITLE).toBe(PRODUCT_ONE_LINER);
    expect(HOME_DESCRIPTION.startsWith(PRODUCT_ONE_LINER)).toBe(true);
    expect(PRODUCT_ONE_LINER).not.toMatch(/published on merge/);
    expect(PRODUCT_ONE_LINER).not.toMatch(/—/);
    expect(PRODUCT_ONE_LINER).not.toMatch(/edda-docs/);
  });
});
