import { intro, log } from "@clack/prompts";
import chalk from "chalk";
import type { Command } from "commander";

import { reportCommandError } from "../command-utils.js";
import { resolveDocsRoot } from "../dev/resolve-root.js";
import { loadValidatedSiteConfig } from "../site-config.js";

const CONFIG_FILE = "docs.json";

export const registerValidateCommand = (program: Command): void => {
  program
    .command("validate")
    .description("Validate docs.json")
    .argument("[dir]", "docs directory")
    .action(async (dir?: string) => {
      intro(chalk.bold("blodemd validate"));

      try {
        const root = await resolveDocsRoot(dir);
        const { warnings } = await loadValidatedSiteConfig(root);
        for (const warning of warnings) {
          log.warn(warning);
        }
        log.success(`${chalk.cyan(CONFIG_FILE)} is valid.`);
        log.info("Done");
      } catch (error: unknown) {
        reportCommandError("Validation failed", error);
      }
    });
};
