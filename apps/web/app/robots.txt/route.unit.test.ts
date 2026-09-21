import { describe, expect, it } from "vitest";

import { DOCS_HOME, platformUrl } from "@/lib/marketing-site";

import { CONTENT_SIGNAL, GET } from "./route";

describe("marketing robots.txt", () => {
  it("returns a valid robots body and Content-Signal header", async () => {
    const response = GET();
    const body = await response.text();

    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8"
    );
    expect(response.headers.get("Content-Signal")).toBe(CONTENT_SIGNAL);
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /app");
    expect(body).toContain("Disallow: /oauth");
    expect(body).toContain(`# Content-Signal: ${CONTENT_SIGNAL}`);
    expect(body).not.toMatch(/^Content-Signal:/m);
    expect(body).toContain(`Sitemap: ${platformUrl("/sitemap.xml")}`);
    // blode.md/docs 301s to blode.co/edda/docs; a sitemap behind a redirect
    // is one Google may refuse to read, so the crawler file names the target.
    expect(body).toContain(`Sitemap: ${DOCS_HOME}/sitemap.xml`);
    expect(body).not.toContain(platformUrl("/docs/sitemap.xml"));
    expect(body).not.toContain("User-agent: GPTBot");
    expect(body.match(/^User-agent: \*$/gm)).toHaveLength(1);
  });
});
