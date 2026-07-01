import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { BlobContentSource } from "./blob-source.js";
import type { ContentSource } from "./content-source.js";
import { createFsSource } from "./fs-source.js";
import { buildContentIndex } from "./index.js";

// A single tree exercised through both content sources so their listFiles
// contract (paths relative to the listed directory) stays identical.
const CONTENT: Record<string, string> = {
  "AGENTS.md": "# Agents\n",
  "README.md": "# Readme\n",
  "docs/guide.mdx": "---\ntitle: Guide\n---\n# Guide\n",
  "docs/index.mdx": "---\ntitle: Home\n---\n# Home\n",
  "docs/nested/deep.mdx": "---\ntitle: Deep\n---\n# Deep\n",
};

const MANIFEST_URL = "https://blob.example.com/manifest.json";

const tempRoots: string[] = [];

const createFsSourceFromContent = async (): Promise<ContentSource> => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "conformance-"));
  tempRoots.push(root);
  for (const [relativePath, content] of Object.entries(CONTENT)) {
    const absolutePath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content);
  }
  return createFsSource(root);
};

const createBlobSourceFromContent = (): ContentSource => {
  vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url === MANIFEST_URL) {
      return Promise.resolve(
        Response.json(
          {
            files: Object.keys(CONTENT).map((key) => ({
              path: key,
              url: `blob:${key}`,
            })),
          },
          { status: 200 }
        )
      );
    }
    const key = url.replace("blob:", "");
    const content = CONTENT[key];
    if (content === undefined) {
      return Promise.resolve(new Response("not found", { status: 404 }));
    }
    return Promise.resolve(new Response(content, { status: 200 }));
  });
  return new BlobContentSource(MANIFEST_URL);
};

const withSources = async (
  run: (source: ContentSource) => Promise<unknown>
) => {
  const fsResult = await run(await createFsSourceFromContent());
  const blobResult = await run(createBlobSourceFromContent());
  return { blobResult, fsResult };
};

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => fs.rm(root, { force: true, recursive: true }))
  );
});

describe("ContentSource listFiles conformance", () => {
  it("lists a nested directory with paths relative to it", async () => {
    const { blobResult, fsResult } = await withSources((source) =>
      source.listFiles("docs")
    );

    expect(fsResult).toEqual(["guide.mdx", "index.mdx", "nested/deep.mdx"]);
    expect(blobResult).toEqual(fsResult);
  });

  it("lists the content root, skipping root helper files", async () => {
    const { blobResult, fsResult } = await withSources((source) =>
      source.listFiles("")
    );

    expect(fsResult).toEqual([
      "docs/guide.mdx",
      "docs/index.mdx",
      "docs/nested/deep.mdx",
    ]);
    expect(blobResult).toEqual(fsResult);
  });

  it("builds an identical content index for a non-empty collection root", async () => {
    const config = {
      collections: [{ id: "docs", root: "docs", slugPrefix: "", type: "docs" }],
    } as unknown as Parameters<typeof buildContentIndex>[1];

    const summarize = async (source: ContentSource) => {
      const index = await buildContentIndex(source, config);
      return index.entries
        .filter((entry) => entry.kind === "entry")
        .map((entry) => ({ slug: entry.slug, sourcePath: entry.sourcePath }))
        .toSorted((a, b) => a.sourcePath.localeCompare(b.sourcePath));
    };

    const { blobResult, fsResult } = await withSources(summarize);

    expect(fsResult).toEqual([
      { slug: "guide", sourcePath: "docs/guide.mdx" },
      { slug: "index", sourcePath: "docs/index.mdx" },
      { slug: "nested/deep", sourcePath: "docs/nested/deep.mdx" },
    ]);
    expect(blobResult).toEqual(fsResult);
  });
});
