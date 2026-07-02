#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPO_PACKAGES } from "./repo-packages.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const devRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(devRoot, "../..");

const command = process.env.npm_command;
const isGlobalInstall = process.env.npm_config_global === "true";
const shouldPackage = command === "pack" || command === "publish";

const hasRepoSources =
  existsSync(path.join(repoRoot, "apps", "dev-server")) &&
  existsSync(path.join(repoRoot, "packages", "previewing"));

if (!hasRepoSources) {
  console.log("Skipping standalone package preparation outside the monorepo.");
  process.exit(0);
}

if (!shouldPackage && !isGlobalInstall) {
  process.exit(0);
}

console.log("Preparing blodemd-dev standalone package...");

// Build @repo/* workspace packages first so the copied dist/ output is
// available for the vendored Next.js dev server.
console.log("Building @repo packages...");
for (const pkg of REPO_PACKAGES) {
  execSync("npm run build", {
    cwd: path.join(repoRoot, `packages/${pkg}`),
    stdio: "inherit",
  });
}

execSync("npm run build", {
  cwd: devRoot,
  stdio: "inherit",
});

execSync("node scripts/prepare-dist.mjs", {
  cwd: devRoot,
  stdio: "inherit",
});
