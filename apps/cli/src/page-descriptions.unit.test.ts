import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { collectPageDescriptionWarnings } from "./page-descriptions.js";
import { loadValidatedSiteConfig } from "./site-config.js";

const tempDirs: string[] = [];

const writeDocs = async (pages: Record<string, string>): Promise<string> => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "blodemd-desc-"));
  tempDirs.push(root);
  await fs.writeFile(
    path.join(root, "docs.json"),
    JSON.stringify({
      name: "Acme",
      navigation: {
        groups: [{ group: "Docs", pages: ["index", "quickstart"] }],
      },
      slug: "acme",
    }),
    "utf8"
  );
  for (const [file, content] of Object.entries(pages)) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await fs.writeFile(path.join(root, file), content, "utf8");
  }
  return root;
};

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((dir) => fs.rm(dir, { force: true, recursive: true }))
  );
});

describe("collectPageDescriptionWarnings", () => {
  it("names visible pages that have no description", async () => {
    const root = await writeDocs({
      "guides/auth.mdx": "---\ntitle: Auth\n---\n\nTokens.\n",
      "index.mdx": "---\ntitle: Home\ndescription: Start here.\n---\n\nHi.\n",
      "internal.mdx": "---\ntitle: Internal\nhidden: true\n---\n\nSecret.\n",
      "quickstart.mdx": "---\ntitle: Quickstart\ndescription:   \n---\n\nGo.\n",
    });
    const { config } = await loadValidatedSiteConfig(root);

    const warnings = await collectPageDescriptionWarnings(root, config);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("2 pages have no frontmatter description");
    expect(warnings[0]).toContain("guides/auth, quickstart");
    expect(warnings[0]).not.toContain("internal");
    expect(warnings[0]).not.toContain("index");
  });

  it("stays silent when every visible page has a description", async () => {
    const root = await writeDocs({
      "index.mdx": "---\ntitle: Home\ndescription: Start here.\n---\n\nHi.\n",
    });
    const { config } = await loadValidatedSiteConfig(root);

    await expect(collectPageDescriptionWarnings(root, config)).resolves.toEqual(
      []
    );
  });
});
