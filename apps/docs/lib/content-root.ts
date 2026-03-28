import fs from "node:fs";
import path from "node:path";

const DOCS_CONFIG_FILE = "docs.json";

const getTenantDocsPathCandidates = (slug: string): [string, string] => [
  path.join(process.cwd(), "content", slug),
  path.join(process.cwd(), "apps/docs/content", slug),
];

export const getTenantDocsPath = (slug: string): string => {
  const candidates = getTenantDocsPathCandidates(slug);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, DOCS_CONFIG_FILE))) {
      return candidate;
    }
  }

  return candidates[0];
};
