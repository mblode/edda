import { intro } from "@clack/prompts";
import chalk from "chalk";
import type { Command } from "commander";

import { resolveAuthToken } from "../auth-session.js";
import { reportCommandError } from "../command-utils.js";
import { BLODE_API_URL_ENV, DEFAULT_API_URL } from "../constants.js";
import { CliError, EXIT_CODES } from "../errors.js";
import { requestJson } from "../http.js";
import { createReporter } from "../output.js";

interface ProjectSummary {
  id: string;
  slug: string;
  name?: string | null;
}

export const registerProjectsCommand = (program: Command): void => {
  program
    .command("projects")
    .description("List your projects")
    .option("--api-url <url>", "API URL (env: BLODEMD_API_URL)")
    .option("--json", "output machine-readable JSON (implies non-interactive)")
    .action(async (options: { apiUrl?: string; json?: boolean }) => {
      const reporter = createReporter({ json: options.json });
      if (reporter.interactive) {
        intro(chalk.bold("blodemd projects"));
      }

      try {
        // This endpoint is login-only; project-scoped API keys cannot list
        // projects, so require a stored session.
        const resolved = await resolveAuthToken();
        if (!resolved?.token) {
          throw new CliError(
            'Run "blodemd login" to list your projects. API keys cannot list projects.',
            EXIT_CODES.AUTH_REQUIRED,
            'Run "blodemd login" to authenticate.'
          );
        }

        const apiUrl =
          options.apiUrl ?? process.env[BLODE_API_URL_ENV] ?? DEFAULT_API_URL;

        const projects = await requestJson<ProjectSummary[]>(
          new URL("/projects", apiUrl).toString(),
          { headers: { Authorization: `Bearer ${resolved.token}` } },
          "Failed to list projects"
        );

        reporter.json(projects);

        if (projects.length === 0) {
          reporter.info("No projects yet.");
          return;
        }

        for (const project of projects) {
          const label = project.name
            ? `${chalk.cyan(project.slug)} — ${project.name}`
            : chalk.cyan(project.slug);
          reporter.info(label);
        }
      } catch (error: unknown) {
        reportCommandError("Projects failed", error, { json: options.json });
      }
    });
};
