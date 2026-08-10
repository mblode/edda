import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import YAML from "yaml";

const DOCS_CONTENT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../content/docs"
);

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

const listMdxFiles = (dir: string): string[] => {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listMdxFiles(fullPath);
    }
    return entry.name.endsWith(".mdx") ? [fullPath] : [];
  });
};

describe("platform docs frontmatter", () => {
  it("parses every MDX description without YAML compact-mapping errors", () => {
    const files = listMdxFiles(DOCS_CONTENT_ROOT);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const match = FRONTMATTER_REGEX.exec(source);
      expect(match, `${file} missing frontmatter`).toBeTruthy();
      const parsed = YAML.parse(match?.[1] ?? "");
      expect(typeof parsed?.title).toBe("string");
      if (parsed?.description !== undefined) {
        expect(typeof parsed.description).toBe("string");
      }
    }
  });
});
