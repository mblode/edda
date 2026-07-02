import { describe, expect, it } from "vitest";

import { CliError, EXIT_CODES, toCliError } from "./errors.js";

describe("toCliError", () => {
  it("maps a 401 response error to AUTH_REQUIRED with a hint", () => {
    const error = new Error("Failed to create deployment: 401 Unauthorized");
    const cliError = toCliError(error);

    expect(cliError).toBeInstanceOf(CliError);
    expect(cliError.exitCode).toBe(EXIT_CODES.AUTH_REQUIRED);
    expect(cliError.hint).toBe('Check your API key or run "blodemd login".');
    expect(cliError.message).toBe(error.message);
  });

  it("does not treat unrelated numbers as a 401", () => {
    const cliError = toCliError(new Error("Uploaded 4014 files"));

    expect(cliError.exitCode).toBe(EXIT_CODES.ERROR);
    expect(cliError.hint).toBeNull();
  });

  it("passes CliError instances through unchanged", () => {
    const original = new CliError("boom", EXIT_CODES.VALIDATION, "fix it");
    expect(toCliError(original)).toBe(original);
  });
});
