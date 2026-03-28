import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { getTenantDocsPath } from "./content-root";

const originalCwd = process.cwd();
const tempDirs: string[] = [];

const createTempDir = async (prefix: string) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(directory);
  return directory;
};

const writeDocsConfig = async (filePath: string) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify({ name: "Atlas" }), "utf8");
};

afterEach(async () => {
  process.chdir(originalCwd);
  await Promise.all(
    tempDirs.splice(0).map(async (directory) => {
      await fs.rm(directory, { force: true, recursive: true });
    })
  );
});

describe("getTenantDocsPath", () => {
  it("uses the package-local content directory when running from apps/docs", async () => {
    const root = await createTempDir("docs-app-root-");
    await writeDocsConfig(path.join(root, "content/atlas/docs.json"));
    process.chdir(root);

    expect(getTenantDocsPath("atlas")).toBe(
      path.join(process.cwd(), "content/atlas")
    );
  });

  it("uses the monorepo app content directory when running from the repo root", async () => {
    const root = await createTempDir("docs-monorepo-root-");
    await writeDocsConfig(path.join(root, "apps/docs/content/atlas/docs.json"));
    process.chdir(root);

    expect(getTenantDocsPath("atlas")).toBe(
      path.join(process.cwd(), "apps/docs/content/atlas")
    );
  });
});
