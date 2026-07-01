import type { Command } from "commander";

import { devCommand } from "../dev/command.js";

export const registerDevCommand = (program: Command): void => {
  program
    .command("dev")
    .description("Start the local docs dev server")
    .option("-p, --port <port>", "Port number", "3030")
    .option("-d, --dir <dir>", "Docs directory")
    .option("--no-open", "Don't open browser")
    .action(
      async (options: { dir?: string; open?: boolean; port: string }) =>
        await devCommand({
          dir: options.dir,
          openBrowser: options.open ?? true,
          port: options.port,
        })
    );
};
