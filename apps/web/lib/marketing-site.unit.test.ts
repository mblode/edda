import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  isRedirectedMarketingPath,
  MARKETING_HOME,
  marketingUrl,
  pageMetadata,
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
    expect(isRedirectedMarketingPath("")).toBe(true);
    expect(isRedirectedMarketingPath("/about")).toBe(false);
    expect(isRedirectedMarketingPath("/pricing")).toBe(false);
    expect(isRedirectedMarketingPath("/blog")).toBe(false);
    expect(isRedirectedMarketingPath("/docs")).toBe(false);
    expect(isRedirectedMarketingPath("/app")).toBe(false);
    expect(isRedirectedMarketingPath("/oauth")).toBe(false);
    expect(isRedirectedMarketingPath("/api")).toBe(false);

    const home = pageMetadata({
      description: "d",
      path: "/",
      title: HOME_TITLE,
    });
    expect(home.robots).toBeUndefined();

    const about = pageMetadata({
      description: "d",
      path: "/about",
      title: "About",
    });
    expect(about.alternates?.canonical).toBe("https://blode.md/about");
    expect(about.robots).toBeUndefined();
  });

  it("canonicalizes `/` to the brand page and other paths to blode.md", () => {
    expect(marketingUrl("/")).toBe("https://blode.co/edda");
    expect(marketingUrl("")).toBe("https://blode.co/edda");
    expect(marketingUrl("/about")).toBe("https://blode.md/about");
    expect(marketingUrl("/pricing")).toBe("https://blode.md/pricing");
    expect(platformUrl("/privacy")).toBe("https://blode.md/privacy");
  });

  it("301s apex / on blode.md and www.blode.md only", () => {
    const config = readFileSync(join(here, "../next.config.js"), "utf8");
    const redirects = config.match(/redirects\(\)\s*\{[\s\S]*?\n {2}\},/)?.[0];
    expect(redirects).toBeDefined();
    expect(redirects).toMatch(/statusCode:\s*301/);
    expect(redirects).toContain('"blode.md"');
    expect(redirects).toContain('"www.blode.md"');
    expect(redirects).toContain("destination: marketingHome");
    expect(redirects).toContain('source: "/"');
    expect(redirects).not.toContain("/about");
    expect(redirects).not.toContain("/docs");
    expect(redirects).not.toContain("/app");
    expect(redirects).not.toContain("/oauth");
    expect(redirects).not.toContain("/api");
    expect(redirects).not.toContain("/pricing");
    expect(redirects).not.toContain("/blog");
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

  it("HOME_DESCRIPTION leads with the lock", () => {
    expect(HOME_DESCRIPTION.startsWith(DESIGNER_ONE_LINER)).toBe(true);
    expect(HOME_DESCRIPTION).not.toMatch(
      /Knowledge docs for agents, published on merge/
    );
  });
});
