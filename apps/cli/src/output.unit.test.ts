import { afterEach, describe, expect, it, vi } from "vitest";

import { createReporter, isInteractive } from "./output.js";

const { logMock, spinnerMock } = vi.hoisted(() => ({
  logMock: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
  },
  spinnerMock: {
    message: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  },
}));

vi.mock("@clack/prompts", () => ({
  log: logMock,
  spinner: () => spinnerMock,
}));

const originalTTY = process.stdout.isTTY;
const originalCI = process.env.CI;

const setTTY = (value: boolean): void => {
  Object.defineProperty(process.stdout, "isTTY", {
    configurable: true,
    value,
  });
};

afterEach(() => {
  setTTY(originalTTY);
  if (originalCI === undefined) {
    delete process.env.CI;
  } else {
    process.env.CI = originalCI;
  }
  vi.clearAllMocks();
});

describe("isInteractive", () => {
  it("is false when json output is forced", () => {
    setTTY(true);
    delete process.env.CI;
    expect(isInteractive(true)).toBe(false);
  });

  it("is false in CI even on a TTY", () => {
    setTTY(true);
    process.env.CI = "true";
    expect(isInteractive()).toBe(false);
  });

  it("is true on a TTY outside CI", () => {
    setTTY(true);
    delete process.env.CI;
    expect(isInteractive()).toBe(true);
  });
});

describe("createReporter (non-interactive)", () => {
  it("routes progress to stderr and json to stdout", () => {
    setTTY(false);
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    const stdout = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    const reporter = createReporter({ json: true });
    reporter.step("working");
    reporter.success("done");
    reporter.json({ ok: true });

    expect(reporter.interactive).toBe(false);
    expect(stderr).toHaveBeenCalledWith("working\n");
    expect(stderr).toHaveBeenCalledWith("done\n");
    expect(stdout).toHaveBeenCalledWith('{"ok":true}\n');
    expect(spinnerMock.start).not.toHaveBeenCalled();

    stderr.mockRestore();
    stdout.mockRestore();
  });
});

describe("createReporter (interactive)", () => {
  it("routes through the clack spinner and log, suppressing json", () => {
    setTTY(true);
    delete process.env.CI;
    const stdout = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    const reporter = createReporter({ json: false });
    reporter.step("working");
    reporter.success("done");
    reporter.info("note");
    reporter.json({ ok: true });

    expect(reporter.interactive).toBe(true);
    expect(spinnerMock.start).toHaveBeenCalledWith("working");
    expect(spinnerMock.stop).toHaveBeenCalledWith("done");
    expect(logMock.info).toHaveBeenCalledWith("note");
    expect(stdout).not.toHaveBeenCalledWith('{"ok":true}\n');

    stdout.mockRestore();
  });
});
