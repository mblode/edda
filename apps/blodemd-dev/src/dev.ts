import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { homedir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import open from "open";

const DEV_READY_ENDPOINT = "/blodemd-dev/version";
const DEV_READY_TIMEOUT_MS = 45_000;
const DEV_PORT_SCAN_LIMIT = 10;
const DEV_SHUTDOWN_TIMEOUT_MS = 5000;
const DEFAULT_DEV_PORT = 3030;
const MAX_PORT = 65_535;
const LOCALHOST = "127.0.0.1";
const RUNTIME_EXCLUDE_DIRS = new Set([".next", ".turbo", "node_modules"]);
const STANDALONE_RUNTIME_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const STANDALONE_RUNTIME_PREFIX = "standalone-runtime-";
const TURBOPACK_ARGS = ["dev", "--turbopack"] as const;

const getConfigDir = (): string => {
  if (process.platform === "win32") {
    const base =
      process.env.APPDATA ?? path.join(homedir(), "AppData", "Roaming");
    return path.join(base, "blodemd-dev");
  }

  const base = process.env.XDG_CONFIG_HOME ?? path.join(homedir(), ".config");
  return path.join(base, "blodemd-dev");
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const resolveCommonAncestor = (pathsToCompare: string[]): string => {
  const [firstPath, ...restPaths] = pathsToCompare;
  if (!firstPath) {
    return path.sep;
  }

  const first = path.resolve(firstPath);
  const { root } = path.parse(first);
  const firstSegments = first
    .slice(root.length)
    .split(path.sep)
    .filter(Boolean);
  const sharedSegments: string[] = [];

  for (const [index, segment] of firstSegments.entries()) {
    const isShared = restPaths.every((candidatePath) => {
      const candidate = path.resolve(candidatePath);
      if (path.parse(candidate).root !== root) {
        return false;
      }

      const candidateSegments = candidate
        .slice(root.length)
        .split(path.sep)
        .filter(Boolean);
      return candidateSegments[index] === segment;
    });

    if (!isShared) {
      break;
    }

    sharedSegments.push(segment);
  }

  return path.join(root, ...sharedSegments);
};

const cleanupStandaloneRuntimeRoots = async (
  configDir: string,
  maxAgeMs: number = STANDALONE_RUNTIME_MAX_AGE_MS
): Promise<void> => {
  const cutoff = Date.now() - maxAgeMs;
  const entries = await fs.readdir(configDir, { withFileTypes: true });

  await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isDirectory() &&
          entry.name.startsWith(STANDALONE_RUNTIME_PREFIX)
      )
      .map(async (entry) => {
        const entryPath = path.join(configDir, entry.name);
        const stats = await fs.stat(entryPath);

        if (stats.mtimeMs >= cutoff) {
          return;
        }

        await fs.rm(entryPath, { force: true, recursive: true });
      })
  );
};

const createStandaloneRuntimeRoot = async (
  configDir: string = getConfigDir()
): Promise<string> => {
  await fs.mkdir(configDir, { recursive: true });
  await cleanupStandaloneRuntimeRoots(configDir);
  return await fs.mkdtemp(path.join(configDir, STANDALONE_RUNTIME_PREFIX));
};

const copyStandaloneTree = async (
  sourceDir: string,
  targetDir: string
): Promise<void> => {
  await fs.cp(sourceDir, targetDir, {
    filter: (source) => {
      const relative = path.relative(sourceDir, source);
      if (!relative) {
        return true;
      }

      const topSegment = relative.split(path.sep)[0] ?? "";
      return !RUNTIME_EXCLUDE_DIRS.has(topSegment);
    },
    recursive: true,
  });
};

/**
 * Locate the `node_modules` directory that actually contains the dev
 * package's transitive dependencies. Package managers (and the `npx`
 * cache) hoist shared deps above the package directory, so
 * `<packageRoot>/node_modules` may not exist or may not contain `next`.
 * Resolve `next/package.json` and use the directory that owns it.
 */
const resolveRuntimeNodeModules = async (
  packageRoot: string
): Promise<string> => {
  const localNodeModules = path.join(packageRoot, "node_modules");
  if (await fileExists(path.join(localNodeModules, "next", "package.json"))) {
    return localNodeModules;
  }

  const nextPkgPath = createRequire(
    path.join(packageRoot, "package.json")
  ).resolve("next/package.json");
  return path.dirname(path.dirname(nextPkgPath));
};

const materializeStandaloneRuntime = async (
  packageRoot: string
): Promise<{
  devServerDir: string;
  runtimeRoot: string;
}> => {
  const runtimeRoot = await createStandaloneRuntimeRoot();

  try {
    for (const dir of ["dev-server", "docs", "packages"]) {
      await copyStandaloneTree(
        path.join(packageRoot, dir),
        path.join(runtimeRoot, dir)
      );
    }

    const runtimeNodeModules = await resolveRuntimeNodeModules(packageRoot);
    await fs.symlink(
      runtimeNodeModules,
      path.join(runtimeRoot, "node_modules"),
      process.platform === "win32" ? "junction" : "dir"
    );
    // Both dev-server/ and docs/ import from `@repo/*`, and the
    // `@repo/*` packages import each other. Module resolution walks up
    // from each consuming file, so every consumption root needs a
    // `node_modules/@repo` symlink pointing at the shared packages/
    // copy. `packages/node_modules/@repo` also satisfies lookups from
    // inside `packages/@repo/<pkg>/dist/*.js` imports.
    const linkTarget = path.join(runtimeRoot, "packages", "@repo");
    for (const consumer of ["dev-server", "docs", "packages"]) {
      await fs.mkdir(path.join(runtimeRoot, consumer, "node_modules"), {
        recursive: true,
      });
      await fs.symlink(
        linkTarget,
        path.join(runtimeRoot, consumer, "node_modules", "@repo"),
        process.platform === "win32" ? "junction" : "dir"
      );
    }

    await fs.writeFile(
      path.join(runtimeRoot, "dev-server", "package.json"),
      `${JSON.stringify(
        {
          dependencies: {
            next: "16.2.1",
            react: "^19.2.0",
            "react-dom": "^19.2.0",
          },
          devDependencies: {
            "@types/node": "^24.12.2",
            "@types/react": "19.2.14",
            "@types/react-dom": "19.2.3",
            typescript: "6.0.2",
          },
          name: "blodemd-dev-server",
          private: true,
          type: "module",
        },
        null,
        2
      )}\n`
    );

    return {
      devServerDir: path.join(runtimeRoot, "dev-server"),
      runtimeRoot,
    };
  } catch (error) {
    await fs.rm(runtimeRoot, { force: true, recursive: true });
    throw error;
  }
};

/**
 * Resolve the `next` CLI binary from the dev package's own dependencies.
 */
const resolveNextBin = (packageRoot: string): string => {
  const require = createRequire(path.join(packageRoot, "package.json"));
  const nextPkgPath = require.resolve("next/package.json");
  return path.join(path.dirname(nextPkgPath), "dist", "bin", "next");
};

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

const resolveDevPort = async (
  requestedPort: number,
  probePort: PortAvailabilityProbe = probePortAvailability
): Promise<number> => {
  for (let offset = 0; offset < DEV_PORT_SCAN_LIMIT; offset += 1) {
    const candidate = requestedPort + offset;
    if (candidate > MAX_PORT) {
      break;
    }

    if (await probePort(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `No available port found within ${DEV_PORT_SCAN_LIMIT} attempts starting at ${requestedPort}.`
  );
};

const shutdownChildProcess = async (
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

const waitForServer = async ({
  child,
  port,
}: {
  child: ReturnType<typeof spawn>;
  port: number;
}): Promise<void> => {
  const url = `http://localhost:${port}${DEV_READY_ENDPOINT}`;
  const startedAt = Date.now();

  while (Date.now() - startedAt < DEV_READY_TIMEOUT_MS) {
    if (child.exitCode !== null) {
      throw new Error("The local dev server exited before it became ready.");
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

  throw new Error("Timed out waiting for the local dev server to start.");
};

/**
 * Derive the dev npm package root from the running script path.
 * The bin entry point is at `<pkg-root>/dist/dev.mjs`.
 */
const resolveDevPackageRoot = (devFilePath: string): string =>
  path.dirname(path.dirname(devFilePath));

const resolveDocsRoot = (dir?: string): string =>
  dir ? path.resolve(process.cwd(), dir) : process.cwd();

interface DevArgs {
  dir?: string;
  openBrowser: boolean;
  port: number;
}

const parseDevArgs = (argv: string[]): DevArgs => {
  let port = DEFAULT_DEV_PORT;
  let dir: string | undefined;
  let openBrowser = true;

  let index = 0;
  while (index < argv.length) {
    const token = argv[index];
    index += 1;

    if (token === "--no-open") {
      openBrowser = false;
      continue;
    }

    if (token === "--port" || token === "-p") {
      const value = argv[index];
      index += 1;
      if (value) {
        port = Number.parseInt(value, 10);
      }
      continue;
    }

    if (token === "--dir" || token === "-d") {
      const value = argv[index];
      index += 1;
      if (value) {
        dir = value;
      }
    }
  }

  if (!Number.isSafeInteger(port) || port <= 0 || port > MAX_PORT) {
    port = DEFAULT_DEV_PORT;
  }

  return { dir, openBrowser, port };
};

const main = async (): Promise<void> => {
  const {
    dir,
    openBrowser,
    port: requestedPort,
  } = parseDevArgs(process.argv.slice(2));

  const devFilePath = fileURLToPath(import.meta.url);
  const packageRoot = resolveDevPackageRoot(devFilePath);
  const root = resolveDocsRoot(dir);
  const resolvedPort = await resolveDevPort(requestedPort);

  const runtime = await materializeStandaloneRuntime(packageRoot);
  const nextBin = resolveNextBin(packageRoot);
  const localUrl = `http://localhost:${resolvedPort}`;

  const child = spawn(process.execPath, [nextBin, ...TURBOPACK_ARGS], {
    cwd: runtime.devServerDir,
    env: {
      ...process.env,
      BLODEMD_PACKAGES_DIR: path.join(runtime.runtimeRoot, "packages"),
      BLODEMD_TURBOPACK_ROOT: resolveCommonAncestor([
        packageRoot,
        runtime.runtimeRoot,
      ]),
      DOCS_ROOT: root,
      PORT: String(resolvedPort),
    },
    stdio: "inherit",
  });

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    await shutdownChildProcess(child);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  try {
    if (openBrowser) {
      await waitForServer({ child, port: resolvedPort });
      await open(localUrl);
    }

    const [code, signal] = (await once(child, "exit")) as [
      number | null,
      NodeJS.Signals | null,
    ];

    if (
      !(shuttingDown || signal === "SIGINT" || signal === "SIGTERM") &&
      typeof code === "number" &&
      code !== 0
    ) {
      process.exitCode = code;
    }
  } finally {
    await fs.rm(runtime.runtimeRoot, { force: true, recursive: true });
    process.removeListener("SIGINT", shutdown);
    process.removeListener("SIGTERM", shutdown);
  }
};

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
