import { confirm, intro, isCancel } from "@clack/prompts";
import chalk from "chalk";
import type { Command } from "commander";

import { resolveAuthToken } from "../auth-session.js";
import {
  collectFiles,
  readGitValue,
  reportCommandError,
} from "../command-utils.js";
import {
  BLODE_API_KEY_ENV,
  BLODE_API_URL_ENV,
  BLODE_BRANCH_ENV,
  BLODE_COMMIT_MESSAGE_ENV,
  BLODE_PROJECT_ENV,
  DEFAULT_API_URL,
} from "../constants.js";
import { resolveDocsRoot } from "../dev/resolve-root.js";
import { requestJson } from "../http.js";
import { createReporter } from "../output.js";
import type { Reporter } from "../output.js";
import {
  getProjectSlugError,
  LEGACY_PROJECT_NAME_FALLBACK_WARNING,
  resolveProjectTarget,
} from "../project-config.js";
import { loadValidatedSiteConfig } from "../site-config.js";
import type { DeploymentResponse } from "../types.js";
import { createUploadBatches } from "../upload.js";

interface PushConfig {
  project: string;
  projectDisplayName: string;
  apiUrl: string;
  authHeaders: Record<string, string>;
  canAutoCreate: boolean;
  branch: string;
  commitMessage?: string;
  usedLegacyNameFallback: boolean;
}

// Resolve auth in the documented order: --api-key flag, BLODEMD_API_KEY env,
// then stored `blodemd login` credentials. A project-scoped deploy key and a
// stored session both authenticate via a bearer token; only sessions may
// auto-create projects.
const resolveAuthHeaders = async (
  apiKeyOption?: string
): Promise<{ headers: Record<string, string>; canAutoCreate: boolean }> => {
  const apiKey = (apiKeyOption ?? process.env[BLODE_API_KEY_ENV])?.trim();
  if (apiKey) {
    return {
      canAutoCreate: false,
      headers: { Authorization: `Bearer ${apiKey}` },
    };
  }

  const resolved = await resolveAuthToken();
  if (!resolved?.token) {
    throw new Error(
      'Not logged in. Run "blodemd login" to authenticate, pass --api-key, or set BLODEMD_API_KEY (see https://blode.md/docs/deployment/ci).'
    );
  }

  return {
    canAutoCreate: true,
    headers: { Authorization: `Bearer ${resolved.token}` },
  };
};

const resolvePushConfig = async (
  config: { name?: string; slug?: string },
  options: {
    apiKey?: string;
    apiUrl?: string;
    branch?: string;
    message?: string;
    project?: string;
  }
): Promise<PushConfig> => {
  const { project, usedLegacyNameFallback } = resolveProjectTarget({
    cliProject: options.project,
    config,
    envProject: process.env[BLODE_PROJECT_ENV],
  });
  const apiUrl =
    options.apiUrl ?? process.env[BLODE_API_URL_ENV] ?? DEFAULT_API_URL;

  const branch =
    options.branch ??
    process.env[BLODE_BRANCH_ENV] ??
    process.env.GITHUB_REF_NAME ??
    readGitValue(["rev-parse", "--abbrev-ref", "HEAD"]) ??
    "main";
  const commitMessage =
    options.message ??
    process.env[BLODE_COMMIT_MESSAGE_ENV] ??
    readGitValue(["log", "-1", "--pretty=%s"]);

  if (!project) {
    throw new Error(
      'Missing project slug. Set "slug" in docs.json, pass --project, or set BLODEMD_PROJECT.'
    );
  }

  const projectSlugError = getProjectSlugError(project);
  if (projectSlugError) {
    if (usedLegacyNameFallback) {
      throw new Error(
        `docs.json.name is not a valid deployment slug. Add "slug" to docs.json, pass --project, or set BLODEMD_PROJECT. ${projectSlugError}`
      );
    }

    throw new Error(`Invalid project slug "${project}". ${projectSlugError}`);
  }

  const { headers: authHeaders, canAutoCreate } = await resolveAuthHeaders(
    options.apiKey
  );

  return {
    apiUrl,
    authHeaders,
    branch,
    canAutoCreate,
    commitMessage,
    project,
    projectDisplayName: config.name?.trim() || project,
    usedLegacyNameFallback,
  };
};

const autoCreateProject = async (
  project: string,
  projectDisplayName: string,
  apiUrl: string,
  headers: Record<string, string>,
  canAutoCreate: boolean,
  reporter: Reporter
): Promise<boolean> => {
  if (!canAutoCreate) {
    throw new Error(
      `Project "${project}" not found. Create it at blode.md or login with "blodemd login" to auto-create.`
    );
  }

  const shouldCreate = await confirm({
    message: `Project "${project}" doesn't exist. Create it?`,
  });

  if (isCancel(shouldCreate) || !shouldCreate) {
    return false;
  }

  const createResult = await requestJson<{ id: string; slug: string }>(
    new URL("/projects", apiUrl).toString(),
    {
      body: JSON.stringify({ name: projectDisplayName, slug: project }),
      headers,
      method: "POST",
    },
    "Failed to create project"
  );

  reporter.success(`Project ${chalk.cyan(createResult.slug)} created`);

  // Mint a project-scoped deploy key so the new project is CI-ready. The
  // plaintext key is only returned once, so surface it immediately.
  const keyResult = await requestJson<{ key: string }>(
    new URL(`/projects/${createResult.id}/keys`, apiUrl).toString(),
    {
      body: JSON.stringify({ name: "CI deploy key" }),
      headers,
      method: "POST",
    },
    "Failed to create deploy key"
  );

  reporter.info(
    `Deploy key created (save this — shown once, use as ${BLODE_API_KEY_ENV} in CI): ${chalk.cyan(keyResult.key)}`
  );
  return true;
};

// 4 MB limit keeps each batch well under Vercel's 4.5 MB serverless body cap
const MAX_BATCH_BYTES = 4 * 1024 * 1024;

const uploadFiles = async (
  files: string[],
  root: string,
  apiPath: (suffix: string) => string,
  deploymentId: string,
  headers: Record<string, string>,
  reporter: Reporter
) => {
  reporter.step(`Uploading ${files.length} files`);

  let uploaded = 0;
  for await (const batch of createUploadBatches({
    files,
    maxBatchBytes: MAX_BATCH_BYTES,
    root,
  })) {
    await requestJson(
      apiPath(`/${deploymentId}/files/batch`),
      {
        body: JSON.stringify({ files: batch }),
        headers,
        method: "POST",
      },
      "Failed to upload files"
    );
    uploaded += batch.length;
    reporter.step(`Uploading files (${uploaded}/${files.length})`);
  }

  reporter.success(`Uploaded ${chalk.cyan(String(files.length))} files`);
};

export const registerPushCommand = (program: Command): void => {
  program
    .command("push")
    .description("Deploy docs")
    .argument("[dir]", "docs directory")
    .option("--project <slug>", "project slug (env: BLODEMD_PROJECT)")
    .option("--api-key <token>", "API key (env: BLODEMD_API_KEY)")
    .option("--api-url <url>", "API URL (env: BLODEMD_API_URL)")
    .option("--branch <name>", "git branch (env: BLODEMD_BRANCH)")
    .option("--message <msg>", "deploy message (env: BLODEMD_COMMIT_MESSAGE)")
    .option("--json", "output machine-readable JSON (implies non-interactive)")
    .action(
      async (
        dir: string | undefined,
        options: {
          apiKey?: string;
          apiUrl?: string;
          branch?: string;
          json?: boolean;
          message?: string;
          project?: string;
        }
      ) => {
        const reporter = createReporter({ json: options.json });
        if (reporter.interactive) {
          intro(chalk.bold("blodemd push"));
        }

        try {
          const root = await resolveDocsRoot(dir);

          reporter.step("Validating configuration");
          const { config, warnings } = await loadValidatedSiteConfig(root);
          reporter.success("Configuration valid");
          for (const warning of warnings) {
            reporter.warn(warning);
          }

          const {
            project,
            projectDisplayName,
            apiUrl,
            authHeaders,
            canAutoCreate,
            branch,
            commitMessage,
            usedLegacyNameFallback,
          } = await resolvePushConfig(config, options);

          if (usedLegacyNameFallback) {
            reporter.warn(LEGACY_PROJECT_NAME_FALLBACK_WARNING);
          }

          reporter.step("Collecting files");
          const files = await collectFiles(root);
          if (files.length === 0) {
            throw new Error("No files found to deploy.");
          }
          reporter.success(`Found ${chalk.cyan(String(files.length))} files`);

          const headers = {
            ...authHeaders,
            "Content-Type": "application/json",
          };

          const apiPath = (suffix: string): string =>
            new URL(
              `/projects/slug/${project}/deployments${suffix}`,
              apiUrl
            ).toString();

          const createDeploymentBody = JSON.stringify({
            branch,
            commitMessage,
          });

          // Try creating the deployment — if 404, offer to create the project
          reporter.step("Creating deployment");
          let deployment: DeploymentResponse;
          try {
            deployment = await requestJson<DeploymentResponse>(
              apiPath(""),
              { body: createDeploymentBody, headers, method: "POST" },
              "Failed to create deployment"
            );
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "";
            if (!errorMessage.includes("404")) {
              throw error;
            }

            reporter.stop("Project not found");

            const created = await autoCreateProject(
              project,
              projectDisplayName,
              apiUrl,
              headers,
              canAutoCreate,
              reporter
            );
            if (!created) {
              reporter.info("Cancelled");
              return;
            }

            reporter.step("Creating deployment");
            deployment = await requestJson<DeploymentResponse>(
              apiPath(""),
              { body: createDeploymentBody, headers, method: "POST" },
              "Failed to create deployment"
            );
          }
          reporter.success(`Deployment ${chalk.cyan(deployment.id)} created`);

          await uploadFiles(
            files,
            root,
            apiPath,
            deployment.id,
            headers,
            reporter
          );

          reporter.step("Finalizing deployment");
          const finalized = await requestJson<DeploymentResponse>(
            apiPath(`/${deployment.id}/finalize`),
            {
              body: JSON.stringify({ promote: true }),
              headers,
              method: "POST",
            },
            "Failed to finalize deployment"
          );
          reporter.success("Deployment finalized");

          reporter.success(`Published ${chalk.cyan(finalized.id)}`);
          if (finalized.manifestUrl) {
            reporter.info(`Manifest: ${finalized.manifestUrl}`);
          }
          if (typeof finalized.fileCount === "number") {
            reporter.info(`Files: ${finalized.fileCount}`);
          }

          reporter.info("Done");

          reporter.json({
            deploymentId: finalized.id,
            fileCount: finalized.fileCount ?? files.length,
            manifestUrl: finalized.manifestUrl ?? null,
          });
        } catch (error: unknown) {
          reporter.stop("Failed");
          reportCommandError("Push failed", error, { json: options.json });
        }
      }
    );
};
