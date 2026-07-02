import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import { intro, log } from "@clack/prompts";
import chalk from "chalk";
import open from "open";

import { CliError, EXIT_CODES, toCliError } from "../errors.js";
import { parsePort } from "../validation.js";
import { resolveDocsRoot, validateDocsRoot } from "./resolve-root.js";
import { createDevWatcher } from "./watcher.js";

const DEV_READY_ENDPOINT = "/blodemd-dev/version";
const DEV_READY_TIMEOUT_MS = 45_000;
const DEV_PORT_SCAN_LIMIT = 10;
const DEV_SHUTDOWN_TIMEOUT_MS = 5000;
const LOCALHOST = "127.0.0.1";
const DEV_PACKAGE_NAME = "blodemd-dev";

type PortAvailabilityProbe = (port: number) => Promise<boolean>;

const probePortAvailability: PortAvailabilityProbe = async (port) => {
  const server = createServer();

  const listening = (async () => {
    await once(server, "listening");
    return { kind: "listening" as const };
  })();
  const errored = (async () => {
    const [error] = await once(server, "error");
    return {
      error: error as NodeJS.ErrnoException,
      kind: "error" as const,
    };
  })();

  server.listen({ exclusive: true, host: LOCALHOST, port });

  const outcome = await Promise.race([listening, errored]);

  if (outcome.kind === "error") {
    if (
      outcome.error.code === "EADDRINUSE" ||
      outcome.error.code === "EACCES"
    ) {
      return false;
    }

    throw outcome.error;
  }

  server.close();
  await once(server, "close");
  return true;
};

export const resolveDevPort = async (
  requestedPort: number,
  probePort: PortAvailabilityProbe = probePortAvailability
): Promise<number> => {
  for (let offset = 0; offset < DEV_PORT_SCAN_LIMIT; offset += 1) {
    const candidate = requestedPort + offset;
    if (candidate > 65_535) {
      break;
    }

    if (await probePort(candidate)) {
      return candidate;
    }
  }

  throw new CliError(
    `No available port found within ${DEV_PORT_SCAN_LIMIT} attempts starting at ${requestedPort}.`,
    EXIT_CODES.ERROR,
    "Close the process using the port or pass a different --port value."
  );
};

export const shutdownChildProcess = async (
  child: ReturnType<typeof spawn>,
  timeoutMs: number = DEV_SHUTDOWN_TIMEOUT_MS
): Promise<void> => {
  if (child.exitCode !== null) {
    return;
  }

  const timer = setTimeout(() => {
    if (child.exitCode === null) {
      child.kill("SIGKILL");
    }
  }, timeoutMs);

  const exitPromise = once(child, "exit");

  try {
    child.kill("SIGTERM");
  } catch (error) {
    clearTimeout(timer);

    const killError = error as NodeJS.ErrnoException;
    if (killError.code === "ESRCH") {
      return;
    }

    throw error;
  }

  await exitPromise.finally(() => {
    clearTimeout(timer);
  });
};

// --- Dev-server resolution ---

interface MonorepoServer {
  mode: "monorepo";
  repoRoot: string;
}

/**
 * When the CLI is installed from npm the heavy Next.js dev-server payload no
 * longer ships inside `blodemd`. Instead the CLI delegates to the companion
 * `blodemd-dev` package via `npx`, pinned to the CLI's own version so the two
 * always run in lockstep.
 */
interface DelegatedServer {
  mode: "delegated";
  devPackageVersion: string;
}

type DevServerResolution = MonorepoServer | DelegatedServer;

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Derive the CLI npm package root from the running script path.
 * The CLI entry point is at `<pkg-root>/dist/cli.mjs`.
 */
const resolveCliPackageRoot = (cliFilePath: string): string =>
  path.dirname(path.dirname(cliFilePath));

/**
 * Read the CLI's own version so the delegated `blodemd-dev` invocation is
 * pinned to the exact matching release (they version together via changesets).
 */
const readCliPackageVersion = async (cliFilePath: string): Promise<string> => {
  const packageJsonPath = path.join(
    resolveCliPackageRoot(cliFilePath),
    "package.json"
  );
  const raw = await fs.readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(raw) as { version?: string };
  return parsed.version ?? "0.0.0";
};

/**
 * Walk up from the running CLI looking for the blodemd monorepo checkout.
 * Returns the repo root when found (development mode), otherwise `null`
 * (installed mode, which delegates to `blodemd-dev`).
 */
const findMonorepoRoot = async (start: string): Promise<string | null> => {
  let current = start;

  while (true) {
    const packageJsonPath = path.join(current, "package.json");
    if (await fileExists(packageJsonPath)) {
      const raw = await fs.readFile(packageJsonPath, "utf8");
      const parsed = JSON.parse(raw) as { workspaces?: string[] };
      const workspaces = parsed.workspaces ?? [];

      const hasWorkspaces =
        workspaces.includes("apps/*") && workspaces.includes("packages/*");
      const hasDevServer = await fileExists(
        path.join(current, "apps", "dev-server", "next.config.js")
      );

      if (hasWorkspaces && hasDevServer) {
        return current;
      }
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return null;
};

const resolveDevServer = async (
  cliFilePath: string
): Promise<DevServerResolution> => {
  const repoRoot = await findMonorepoRoot(path.dirname(cliFilePath));
  if (repoRoot) {
    return { mode: "monorepo", repoRoot };
  }

  const devPackageVersion = await readCliPackageVersion(cliFilePath);
  return { devPackageVersion, mode: "delegated" };
};

interface DevServerLaunch {
  args: string[];
  command: string;
  cwd: string;
  env: NodeJS.ProcessEnv;
}

export const buildDevServerLaunch = (
  server: DevServerResolution,
  { root, port }: { root: string; port: number }
): DevServerLaunch => {
  if (server.mode === "delegated") {
    const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

    // The CLI owns readiness polling, the file watcher and opening the
    // browser, so `blodemd-dev` runs with `--no-open` and only boots the
    // Next.js server.
    return {
      args: [
        "-y",
        `${DEV_PACKAGE_NAME}@${server.devPackageVersion}`,
        "dev",
        "--port",
        String(port),
        "--dir",
        root,
        "--no-open",
      ],
      command: npxCommand,
      cwd: process.cwd(),
      env: {
        ...process.env,
        DOCS_ROOT: root,
        PORT: String(port),
      },
    };
  }

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  return {
    args: ["run", "dev", "--workspace=dev-server"],
    command: npmCommand,
    cwd: server.repoRoot,
    env: {
      ...process.env,
      DOCS_ROOT: root,
      PORT: String(port),
    },
  };
};

const spawnDevServer = (
  server: DevServerResolution,
  options: { root: string; port: number }
): ReturnType<typeof spawn> => {
  const launch = buildDevServerLaunch(server, options);

  return spawn(launch.command, launch.args, {
    cwd: launch.cwd,
    env: launch.env,
    stdio: "inherit",
  });
};

interface DevCommandDependencies {
  createWatcher: typeof createDevWatcher;
  getCliFilePath: () => string;
  getIntro: typeof intro;
  getOpen: typeof open;
  getLog: typeof log;
  parsePortValue: typeof parsePort;
  resolveDevPortValue: typeof resolveDevPort;
  resolveDocsRootValue: typeof resolveDocsRoot;
  resolveServer: typeof resolveDevServer;
  shutdownChild: typeof shutdownChildProcess;
  spawnServer: typeof spawnDevServer;
  validateDocsRootValue: typeof validateDocsRoot;
  waitForServerReady: typeof waitForServer;
}

// --- Server readiness ---

const waitForServer = async ({
  child,
  port,
}: {
  child: ReturnType<typeof spawn>;
  port: number;
}) => {
  const url = `http://localhost:${port}${DEV_READY_ENDPOINT}`;
  const startedAt = Date.now();

  while (Date.now() - startedAt < DEV_READY_TIMEOUT_MS) {
    if (child.exitCode !== null) {
      throw new CliError(
        "The local dev server exited before it became ready.",
        EXIT_CODES.ERROR
      );
    }

    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          accept: "application/json",
        },
      });

      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await delay(500);
  }

  throw new CliError(
    "Timed out waiting for the local dev server to start.",
    EXIT_CODES.ERROR
  );
};

const defaultDevCommandDependencies: DevCommandDependencies = {
  createWatcher: createDevWatcher,
  getCliFilePath: () => fileURLToPath(import.meta.url),
  getIntro: intro,
  getLog: log,
  getOpen: open,
  parsePortValue: parsePort,
  resolveDevPortValue: resolveDevPort,
  resolveDocsRootValue: resolveDocsRoot,
  resolveServer: resolveDevServer,
  shutdownChild: shutdownChildProcess,
  spawnServer: spawnDevServer,
  validateDocsRootValue: validateDocsRoot,
  waitForServerReady: waitForServer,
};

// --- Main command ---

export const devCommand = async (
  {
    dir,
    openBrowser,
    port: portValue,
  }: {
    dir?: string;
    openBrowser: boolean;
    port: string;
  },
  dependencies: DevCommandDependencies = defaultDevCommandDependencies
) => {
  const cliLog = dependencies.getLog;

  dependencies.getIntro(chalk.bold("blodemd dev"));

  try {
    const port = dependencies.parsePortValue(portValue);
    const resolvedPort = await dependencies.resolveDevPortValue(port);
    const root = await dependencies.resolveDocsRootValue(dir);
    await dependencies.validateDocsRootValue(root);

    const cliFilePath = dependencies.getCliFilePath();
    const server = await dependencies.resolveServer(cliFilePath);
    const localUrl = `http://localhost:${resolvedPort}`;

    cliLog.info(`Docs root: ${chalk.cyan(root)}`);

    const child = dependencies.spawnServer(server, {
      port: resolvedPort,
      root,
    });

    let watcher: Awaited<ReturnType<typeof createDevWatcher>> | null = null;
    let shuttingDown = false;

    const closeAll = async () => {
      if (shuttingDown) {
        return;
      }
      shuttingDown = true;

      if (watcher) {
        await watcher.close();
        watcher = null;
      }

      await dependencies.shutdownChild(child);
    };

    process.once("SIGINT", closeAll);
    process.once("SIGTERM", closeAll);

    try {
      await dependencies.waitForServerReady({ child, port: resolvedPort });

      watcher = await dependencies.createWatcher({ port: resolvedPort, root });
      cliLog.success(`Dev server running at ${chalk.cyan(localUrl)}`);

      if (openBrowser) {
        await dependencies.getOpen(localUrl);
      }

      const [code, signal] = (await once(child, "exit")) as [
        number | null,
        NodeJS.Signals | null,
      ];

      if (shuttingDown || signal === "SIGINT" || signal === "SIGTERM") {
        return;
      }

      if (code !== 0) {
        throw new CliError(
          `The local dev server exited with code ${code ?? "unknown"}.`,
          EXIT_CODES.ERROR
        );
      }
    } finally {
      await closeAll();
      process.removeListener("SIGINT", closeAll);
      process.removeListener("SIGTERM", closeAll);
    }
  } catch (error) {
    const cliError = toCliError(error);

    cliLog.error(cliError.message);
    if (cliError.hint) {
      cliLog.info(cliError.hint);
    }

    process.exitCode = cliError.exitCode;
  }
};
