import { intro } from "@clack/prompts";
import chalk from "chalk";
import type { Command } from "commander";

import { resolveApiKeyCredential, resolveAuthToken } from "../auth-session.js";
import { reportCommandError } from "../command-utils.js";
import {
  DEFAULT_API_URL,
  readApiUrlEnv,
  resolveApiKeyEnvName,
} from "../constants.js";
import { CliError, ERROR_CODES, EXIT_CODES } from "../errors.js";
import { requestJson } from "../http.js";
import { createReporter } from "../output.js";

interface ProjectSummary {
  id: string;
  slug: string;
  name?: string | null;
}

const listProjects = async (
  apiUrl: string,
  token: string
): Promise<ProjectSummary[]> => {
  try {
    return await requestJson<ProjectSummary[]>(
      new URL("/projects", apiUrl).toString(),
      { headers: { Authorization: `Bearer ${token}` } },
      "Failed to list projects"
    );
  } catch (error: unknown) {
    // Branch on the typed status, not on the text of the message. The generic
    // 401 hint suggests BLODEMD_API_KEY, which cannot work for this endpoint.
    if (error instanceof CliError && error.status === 401) {
      throw new CliError(
        "Your stored session was rejected.",
        EXIT_CODES.AUTH_REQUIRED,
        'Run "edda login" to re-authenticate.',
        { code: ERROR_CODES.AUTH_REQUIRED, status: error.status }
      );
    }
    throw error;
  }
};

export const registerProjectsCommand = (program: Command): void => {
  program
    .command("projects")
    .description("List your projects")
    .option(
      "--api-key <token>",
      "API key (env: EDDA_API_KEY or BLODEMD_API_KEY)"
    )
    .option("--api-url <url>", "API URL (env: EDDA_API_URL or BLODEMD_API_URL)")
    .option("--json", "output machine-readable JSON (implies non-interactive)")
    .action(
      async (options: { apiKey?: string; apiUrl?: string; json?: boolean }) => {
        const reporter = createReporter({ json: options.json });
        if (reporter.interactive) {
          intro(chalk.bold("edda projects"));
        }

        try {
          // Same credential precedence as `push` (--api-key, BLODEMD_API_KEY,
          // then the stored session). This endpoint is login-only, so when an
          // API key wins we say so instead of quietly listing the session's
          // projects as if the key were in use.
          if (resolveApiKeyCredential(options.apiKey)) {
            const origin = options.apiKey
              ? "--api-key"
              : (resolveApiKeyEnvName() ?? "EDDA_API_KEY");
            throw new CliError(
              `An API key from ${origin} takes precedence here, and project-scoped API keys cannot list projects.`,
              EXIT_CODES.AUTH_REQUIRED,
              `Unset ${origin} (or drop --api-key) and run "edda login" to list projects.`,
              { code: ERROR_CODES.PERMISSION_DENIED }
            );
          }

          const resolved = await resolveAuthToken();
          if (!resolved?.token) {
            throw new CliError(
              'Run "edda login" to list your projects. API keys cannot list projects.',
              EXIT_CODES.AUTH_REQUIRED,
              'Run "edda login" to authenticate.'
            );
          }

          const apiUrl = options.apiUrl ?? readApiUrlEnv() ?? DEFAULT_API_URL;

          const projects = await listProjects(apiUrl, resolved.token);

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
      }
    );
};
