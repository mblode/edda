import { Command } from "commander";

import { registerAnalyticsCommand } from "./analytics/command.js";
import { registerAuthCommands } from "./commands/auth.js";
import { registerDevCommand } from "./commands/dev.js";
import { registerNewCommand } from "./commands/new.js";
import { registerPushCommand } from "./commands/push.js";
import { registerValidateCommand } from "./commands/validate.js";
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
registerDevCommand(program);
registerAnalyticsCommand(program);

program.parse();
