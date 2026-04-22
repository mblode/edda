import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CliError, EXIT_CODES } from "./errors.js";

const SUPPORTED_NODE_MAJOR = 24;

const SUPPORTED_NODE_RANGE = "24.x";

const parseVersion = (input: string): [number, number, number] | null => {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(input.trim());
  if (!match) {
    return null;
  }

  const [, majorText = "", minorText = "", patchText = ""] = match;
  if (!majorText || !minorText || !patchText) {
    return null;
  }

  const major = Number.parseInt(majorText, 10);
  const minor = Number.parseInt(minorText, 10);
  const patch = Number.parseInt(patchText, 10);

  if ([major, minor, patch].some((value) => Number.isNaN(value))) {
    return null;
  }

  return [major, minor, patch];
};

export const isSupportedNodeVersion = (version: string): boolean => {
  const parsed = parseVersion(version);
  if (!parsed) {
    return false;
  }

  const [major] = parsed;

  return major === SUPPORTED_NODE_MAJOR;
};

export const assertSupportedNodeVersion = (
  version = process.versions.node
): void => {
  if (isSupportedNodeVersion(version)) {
    return;
  }

  throw new CliError(
    `blodemd requires Node.js ${SUPPORTED_NODE_RANGE}. Current version: ${version}.`,
    EXIT_CODES.VALIDATION,
    "Install a supported Node.js version and try again."
  );
};

export const readCliVersion = (moduleUrl: string): string => {
  const moduleDir = path.dirname(fileURLToPath(moduleUrl));
  const packageJsonPath = path.resolve(moduleDir, "..", "package.json");
  const raw = readFileSync(packageJsonPath, "utf8");
  const parsed = JSON.parse(raw) as { version?: string };

  return parsed.version ?? "0.0.0";
};
