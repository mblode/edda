import { intro } from "@clack/prompts";
import chalk from "chalk";
import type { Command } from "commander";

import { reportCommandError } from "../command-utils.js";
import { resolveDocsRoot } from "../dev/resolve-root.js";
import { CliError, EXIT_CODES } from "../errors.js";
import { createReporter } from "../output.js";
import { loadValidatedSiteConfig } from "../site-config.js";

const CONFIG_FILE = "docs.json";

export const registerValidateCommand = (program: Command): void => {
  program
    .command("validate")
    .description("Validate docs.json")
    .argument("[dir]", "docs directory")
    .option("--json", "output machine-readable JSON (implies non-interactive)")
    .action(async (dir: string | undefined, options: { json?: boolean }) => {
      const reporter = createReporter({ json: options.json });
      if (reporter.interactive) {
        intro(chalk.bold("blodemd validate"));
      }

      try {
        const root = await resolveDocsRoot(dir);
        const { warnings } = await loadValidatedSiteConfig(root);
        for (const warning of warnings) {
          reporter.warn(warning);
        }
        reporter.success(`${chalk.cyan(CONFIG_FILE)} is valid.`);
        reporter.info("Done");
        reporter.json({ valid: true, warnings });
      } catch (error: unknown) {
        // A CliError with the VALIDATION exit code means docs.json itself is
        // invalid; emit the structured failure payload before reporting.
        if (
          options.json &&
          error instanceof CliError &&
          error.exitCode === EXIT_CODES.VALIDATION
        ) {
          reporter.json({ errors: error.message.split("\n"), valid: false });
        }
        reportCommandError("Validation failed", error, { json: options.json });
      }
    });
};
