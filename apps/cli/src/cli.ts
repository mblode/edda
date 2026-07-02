import { Command } from "commander";

import { registerAnalyticsCommand } from "./analytics/command.js";
import { registerAuthCommands } from "./commands/auth.js";
import { registerDevCommand } from "./commands/dev.js";
import { registerNewCommand } from "./commands/new.js";
import { registerProjectsCommand } from "./commands/projects.js";
import { registerPushCommand } from "./commands/push.js";
import { registerValidateCommand } from "./commands/validate.js";
import { toCliError } from "./errors.js";
import { assertSupportedNodeVersion, readCliVersion } from "./runtime.js";

const program = new Command();
const cliVersion = readCliVersion(import.meta.url);

program.name("blodemd").description("Blode.md CLI").version(cliVersion);
program.hook("preAction", () => {
  assertSupportedNodeVersion();
});

registerAuthCommands(program);
registerNewCommand(program);
registerValidateCommand(program);
registerPushCommand(program);
registerProjectsCommand(program);
registerDevCommand(program);
registerAnalyticsCommand(program);

program.addHelpText(
  "after",
  "\nExample:\n  $ blodemd push ./docs --project my-docs\n"
);

// Top-level boundary: turn any thrown CliError (or wrapped error) into a clean
// stderr message plus exit code instead of a raw stack trace.
try {
  await program.parseAsync();
} catch (error) {
  const cliError = toCliError(error);
  console.error(cliError.message);
  if (cliError.hint) {
    console.error(cliError.hint);
  }
  process.exitCode = cliError.exitCode;
}
