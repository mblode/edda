import { describe, expect, it } from "vitest";

import { marketingUrl } from "@/lib/marketing-site";

import { GET } from "./route";

describe("marketing robots.txt", () => {
  it("returns a single valid robots body with Content-Signal", async () => {
    const response = GET();
    const body = await response.text();

    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8"
    );
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /app");
    expect(body).toContain("Disallow: /oauth");
    expect(body).toContain(
      "Content-Signal: search=yes, ai-input=yes, ai-train=yes"
    );
    expect(body).toContain(`Sitemap: ${marketingUrl("/sitemap.xml")}`);
    expect(body).toContain(`Sitemap: ${marketingUrl("/docs/sitemap.xml")}`);
    expect(body).not.toContain("User-agent: GPTBot");
    expect(body.match(/^User-agent: \*$/gm)).toHaveLength(1);
  });
});
