import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  isMarketingHomePath,
  MARKETING_HOME,
  MARKETING_HOME_PATHS,
  marketingUrl,
  pageMetadata,
  PLATFORM_ORIGIN,
  platformUrl,
} from "./marketing-site";

const DESIGNER_ONE_LINER =
  "Knowledge docs for agents. Git-native MDX. Publish on merge.";

const here = dirname(fileURLToPath(import.meta.url));

describe("marketing vs product hosts", () => {
  it("keeps the brand page on blode.co/edda, not blode.co/edda-docs", () => {
    expect(MARKETING_HOME).toBe("https://blode.co/edda");
    expect(PLATFORM_ORIGIN).toBe("https://blode.md");
  });

  it("canonicalizes and noindexes only the apex landing", () => {
    expect(MARKETING_HOME_PATHS).toEqual(["/"]);
    expect(isMarketingHomePath("/")).toBe(true);
    expect(isMarketingHomePath("/about")).toBe(false);
    expect(isMarketingHomePath("/pricing")).toBe(false);
    expect(isMarketingHomePath("/blog")).toBe(false);
    expect(isMarketingHomePath("/docs")).toBe(false);
    expect(isMarketingHomePath("/app")).toBe(false);

    const home = pageMetadata({
      description: "d",
      path: "/",
      title: HOME_TITLE,
    });
    expect(home.alternates?.canonical).toBe("https://blode.co/edda");
    expect(home.robots).toEqual({ follow: true, index: false });

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
    expect(marketingUrl("/about")).toBe("https://blode.md/about");
    expect(marketingUrl("/pricing")).toBe("https://blode.md/pricing");
    expect(platformUrl("/privacy")).toBe("https://blode.md/privacy");
  });

  it("does not 301 apex /; next.config has no host-conditional redirects", () => {
    const config = readFileSync(join(here, "../next.config.js"), "utf8");
    expect(config).not.toContain("redirects()");
    expect(config).not.toMatch(/statusCode:\s*301/);
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
