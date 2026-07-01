import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// The dashboard and docs repo pickers are intentional duplicates (the two apps
// share no @repo/ui package). Keep them byte-identical so a fix to one is not
// silently lost from the other.
const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("repo-picker drift guard", () => {
  it("keeps the dashboard and docs copies byte-identical", () => {
    const dashboard = read("apps/dashboard/components/git/repo-picker.tsx");
    const docs = read("apps/docs/components/git/repo-picker.tsx");
    expect(docs).toBe(dashboard);
  });
});
