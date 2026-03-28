import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildTenantLlmsFullTxt,
  buildTenantLlmsTxt,
  getLlmPageText,
} from "./tenant-static";

const tenant = {
  customDomains: ["docs.example.com"],
  docsPath: path.resolve(process.cwd(), "apps/docs/content/atlas"),
  id: "tenant-id",
  name: "Atlas",
  primaryDomain: "docs.example.com",
  slug: "atlas",
  status: "active" as const,
  subdomain: "atlas",
};

describe("tenant static LLM helpers", () => {
  it("includes visible OpenAPI pages in llms outputs", async () => {
    const content = await buildTenantLlmsTxt(tenant);

    expect(content).toContain(
      "[List projects](https://docs.example.com/api/get-projects)"
    );
  });

  it("renders OpenAPI pages as markdown text", async () => {
    const content = await getLlmPageText(tenant, "api/get-projects");

    expect(content).toContain("# List projects");
    expect(content).toContain("Method: GET");
    expect(content).toContain("Path: /projects");
  });

  it("includes OpenAPI bodies in llms-full output", async () => {
    const content = await buildTenantLlmsFullTxt(tenant);

    expect(content).toContain(
      "# List projects (https://docs.example.com/api/get-projects)"
    );
    expect(content).toContain("Method: GET");
    expect(content).toContain("Path: /projects");
  });
});
