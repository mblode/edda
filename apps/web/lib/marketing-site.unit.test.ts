import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  HOME_TITLE,
  isRedirectedMarketingPath,
  MARKETING_HOME,
  marketingUrl,
  PLATFORM_ORIGIN,
  platformUrl,
  REDIRECTED_MARKETING_PATHS,
} from "./marketing-site";

const DESIGNER_ONE_LINER =
  "Knowledge docs for agents. Git-native MDX. Publish on merge.";

const here = dirname(fileURLToPath(import.meta.url));

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
  it("HOME_TITLE value is the exact three-sentence string", () => {
    expect(HOME_TITLE).toBe(DESIGNER_ONE_LINER);
  });

  it("README hero and HOME_TITLE source quote the exact string", () => {
    const site = readFileSync(join(here, "marketing-site.ts"), "utf8");
    const readme = readFileSync(join(here, "../../../README.md"), "utf8");
    expect(readme).toContain(`**${DESIGNER_ONE_LINER}**`);
    expect(site).toContain(`HOME_TITLE = "${DESIGNER_ONE_LINER}"`);
    expect(site).not.toMatch(/Knowledge docs for agents, published on merge/);
    expect(readme).not.toMatch(/Knowledge docs for agents, published on merge/);
  });
});
