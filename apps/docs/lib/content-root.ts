import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DOCS_CONFIG_FILE = "docs.json";

const EXTERNAL_DOCS_ROOTS: Record<string, string> = {
  allmd: path.join(os.homedir(), "Code/mblode/allmd/apps/docs"),
  "dnd-grid": path.join(os.homedir(), "Code/mblode/dnd-grid/apps/docs"),
  donebear: path.join(os.homedir(), "Code/donebear/donebear/apps/docs"),
  shareful: path.join(os.homedir(), "Code/shareful-ai/shareful-ai/apps/docs"),
  stratasync: path.join(os.homedir(), "Code/donebear/stratasync/apps/docs"),
};

const getTenantDocsPathCandidates = (slug: string): string[] =>
  [
    EXTERNAL_DOCS_ROOTS[slug],
    path.join(process.cwd(), "content", slug),
    path.join(process.cwd(), "apps/docs/content", slug),
  ].filter(Boolean) as string[];

// On Vercel `process.cwd()` is already `/var/task/apps/docs`, so
// `path.join(cwd, "apps/docs/content", slug)` doubles up the segment and
// produces the infamous `/var/task/apps/docs/apps/docs/content/...` string
// rendered in the "no docs deployment" empty-state. Strip the prefix when
// it's already present so the displayed path is sane.
const getDefaultLocalPath = (slug: string): string => {
  const cwd = process.cwd();
  const relative = cwd.endsWith(`${path.sep}apps${path.sep}docs`)
    ? path.join("content", slug)
    : path.join("apps", "docs", "content", slug);
  return path.join(cwd, relative);
};

export const getTenantDocsPath = (slug: string): string => {
  const candidates = getTenantDocsPathCandidates(slug);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, DOCS_CONFIG_FILE))) {
      return candidate;
    }
  }

  return getDefaultLocalPath(slug);
};
