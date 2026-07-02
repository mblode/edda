import { EventEmitter } from "node:events";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildDevServerLaunch,
  devCommand,
  resolveDevPort,
  shutdownChildProcess,
} from "./command.js";

// eslint-disable-next-line unicorn/prefer-event-target
class FakeChildProcess extends EventEmitter {
  exitCode: number | null = null;
  readonly signals: (NodeJS.Signals | undefined)[] = [];
  private readonly mode: "graceful" | "stubborn";

  constructor(mode: "graceful" | "stubborn") {
    super();
    this.mode = mode;
  }

  kill = vi.fn((signal?: NodeJS.Signals) => {
    this.signals.push(signal);

    if (signal === "SIGTERM" && this.mode === "graceful") {
      queueMicrotask(() => {
        this.exitCode = 0;
        this.emit("exit", 0, signal);
      });
    }

    if (signal === "SIGKILL") {
      queueMicrotask(() => {
        this.exitCode = 1;
        this.emit("exit", 1, signal);
      });
    }

    return true;
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("resolveDevPort", () => {
  it("keeps the requested port when it is available", async () => {
    const probe = vi.fn((port: number) => Promise.resolve(port === 3030));

    await expect(resolveDevPort(3030, probe)).resolves.toBe(3030);
    expect(probe).toHaveBeenCalledWith(3030);
  });

  it("advances to the next available port when the requested port is busy", async () => {
    const probe = vi.fn((port: number) => Promise.resolve(port === 3032));

    await expect(resolveDevPort(3030, probe)).resolves.toBe(3032);
    expect(probe).toHaveBeenNthCalledWith(1, 3030);
    expect(probe).toHaveBeenNthCalledWith(2, 3031);
    expect(probe).toHaveBeenNthCalledWith(3, 3032);
  });

  it("fails after scanning the fallback window", async () => {
    const probe = vi.fn(() => Promise.resolve(false));

    await expect(resolveDevPort(3030, probe)).rejects.toThrow(
      /No available port found within 10 attempts starting at 3030\./
    );
    expect(probe).toHaveBeenCalledTimes(10);
  });
});

describe("shutdownChildProcess", () => {
  it("sends SIGTERM and resolves when the child exits cleanly", async () => {
    const child = new FakeChildProcess("graceful");

    await expect(
      shutdownChildProcess(child as never, 100)
    ).resolves.toBeUndefined();
    expect(child.kill).toHaveBeenCalledTimes(1);
    expect(child.signals).toEqual(["SIGTERM"]);
  });

  it("escalates to SIGKILL when the child ignores SIGTERM", async () => {
    vi.useFakeTimers();

    const child = new FakeChildProcess("stubborn");
    const shutdown = shutdownChildProcess(child as never, 50);

    expect(child.kill).toHaveBeenCalledTimes(1);
    expect(child.signals).toEqual(["SIGTERM"]);

    await vi.advanceTimersByTimeAsync(50);
    await expect(shutdown).resolves.toBeUndefined();
    expect(child.kill).toHaveBeenCalledTimes(2);
    expect(child.signals).toEqual(["SIGTERM", "SIGKILL"]);
  });
});

describe("buildDevServerLaunch", () => {
  it("delegates to blodemd-dev via npx for installed launches", () => {
    const launch = buildDevServerLaunch(
      {
        devPackageVersion: "1.2.3",
        mode: "delegated",
      },
      { port: 3140, root: "/docs" }
    );

    expect(launch.command).toBe(
      process.platform === "win32" ? "npx.cmd" : "npx"
    );
    expect(launch.args).toEqual([
      "-y",
      "blodemd-dev@1.2.3",
      "dev",
      "--port",
      "3140",
      "--dir",
      "/docs",
      "--no-open",
    ]);
    expect(launch.env.DOCS_ROOT).toBe("/docs");
    expect(launch.env.PORT).toBe("3140");
  });

  it("uses the workspace dev script for monorepo launches", () => {
    const launch = buildDevServerLaunch(
      {
        mode: "monorepo",
        repoRoot: "/repo",
      },
      { port: 3030, root: "/docs" }
    );

    expect(launch.command).toBe(
      process.platform === "win32" ? "npm.cmd" : "npm"
    );
    expect(launch.args).toEqual(["run", "dev", "--workspace=dev-server"]);
    expect(launch.cwd).toBe("/repo");
    expect(launch.env.DOCS_ROOT).toBe("/docs");
    expect(launch.env.PORT).toBe("3030");
  });
});

describe("devCommand", () => {
  it("opens the browser exactly once after the server is ready", async () => {
    const child = new FakeChildProcess("graceful");
    const openCalls: string[] = [];
    const lifecycle: string[] = [];
    const watcher = {
      close: vi.fn(() => {
        lifecycle.push("watcher.close");
        return Promise.resolve();
      }),
    };

    await devCommand(
      { openBrowser: true, port: "3030" },
      {
        createWatcher: vi.fn(() => {
          lifecycle.push("createWatcher");
          return watcher;
        }) as never,
        getCliFilePath: () => "/fake/dist/cli.mjs",
        getIntro: vi.fn(),
        getLog: {
          error: vi.fn(),
          info: vi.fn(),
          success: vi.fn(() => {
            lifecycle.push("log.success");
          }),
        } as never,
        getOpen: vi.fn((url: string) => {
          lifecycle.push("open");
          openCalls.push(url);
          setTimeout(() => {
            child.exitCode = 0;
            child.emit("exit", 0, null);
          }, 0);
          return Promise.resolve();
        }) as never,
        parsePortValue: vi.fn(() => 3030),
        resolveDevPortValue: vi.fn(() => Promise.resolve(3030)),
        resolveDocsRootValue: vi.fn(() => Promise.resolve("/docs")),
        resolveServer: vi.fn(() =>
          Promise.resolve({
            mode: "monorepo",
            repoRoot: "/repo",
          })
        ) as never,
        shutdownChild: vi.fn(() => Promise.resolve()),
        spawnServer: vi.fn(() => child as never),
        validateDocsRootValue: vi.fn(() =>
          Promise.resolve({
            config: {} as never,
            warnings: [],
          })
        ) as never,
        waitForServerReady: vi.fn(() => {
          lifecycle.push("waitForServer");
          return Promise.resolve();
        }),
      }
    );

    expect(openCalls).toEqual(["http://localhost:3030"]);
    expect(lifecycle).toEqual([
      "waitForServer",
      "createWatcher",
      "log.success",
      "open",
      "watcher.close",
    ]);
  });

  it("skips opening the browser when --no-open is used", async () => {
    const child = new FakeChildProcess("graceful");
    const openSpy = vi.fn(() => Promise.resolve());

    setTimeout(() => {
      child.exitCode = 0;
      child.emit("exit", 0, null);
    }, 0);

    await devCommand(
      { openBrowser: false, port: "3030" },
      {
        createWatcher: vi.fn(
          () =>
            ({
              close: vi.fn(() => Promise.resolve()),
            }) as never
        ) as never,
        getCliFilePath: () => "/fake/dist/cli.mjs",
        getIntro: vi.fn(),
        getLog: {
          error: vi.fn(),
          info: vi.fn(),
          success: vi.fn(),
        } as never,
        getOpen: openSpy as never,
        parsePortValue: vi.fn(() => 3030),
        resolveDevPortValue: vi.fn(() => Promise.resolve(3030)),
        resolveDocsRootValue: vi.fn(() => Promise.resolve("/docs")),
        resolveServer: vi.fn(() =>
          Promise.resolve({
            mode: "monorepo",
            repoRoot: "/repo",
          })
        ) as never,
        shutdownChild: vi.fn(() => Promise.resolve()),
        spawnServer: vi.fn(() => child as never),
        validateDocsRootValue: vi.fn(() =>
          Promise.resolve({
            config: {} as never,
            warnings: [],
          })
        ) as never,
        waitForServerReady: vi.fn(() => Promise.resolve()),
      }
    );

    expect(openSpy).not.toHaveBeenCalled();
  });
});
