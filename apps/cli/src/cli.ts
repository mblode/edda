import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";

import { intro, log, outro, spinner } from "@clack/prompts";
import { Command } from "commander";

import type { DeploymentResponse } from "./types.js";

const CONTENT_CONFIG_FILE = "docs.json";

const TEXT_CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".mdx": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".yaml": "application/yaml; charset=utf-8",
  ".yml": "application/yaml; charset=utf-8",
};

const ensureFile = async (filePath: string, content: string): Promise<void> => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, content);
  }
};

const isMissingFileError = (error: unknown): boolean =>
  error instanceof Error &&
  "code" in error &&
  (error as NodeJS.ErrnoException).code === "ENOENT";

const validateConfigFile = async (root: string): Promise<string> => {
  try {
    const raw = await fs.readFile(path.join(root, CONTENT_CONFIG_FILE), "utf8");
    JSON.parse(raw);
    return CONTENT_CONFIG_FILE;
  } catch (error) {
    if (isMissingFileError(error)) {
      throw new Error(`${CONTENT_CONFIG_FILE} not found.`, { cause: error });
    }
    throw error;
  }
};

const readGitValue = (gitArgs: string[]): string | undefined => {
  const result = spawnSync("git", gitArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (result.status !== 0) {
    return;
  }

  const value = result.stdout.trim();
  return value || undefined;
};

const normalizeRelativePath = (root: string, filePath: string): string =>
  path.relative(root, filePath).split(path.sep).join("/");

const shouldSkipEntry = (name: string): boolean =>
  name.startsWith(".") || name === "node_modules";

const collectFiles = async (root: string): Promise<string[]> => {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (shouldSkipEntry(entry.name)) {
      continue;
    }

    const absolutePath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files.toSorted((left, right) => left.localeCompare(right));
};

const getContentType = (filePath: string): string =>
  TEXT_CONTENT_TYPES[path.extname(filePath).toLowerCase()] ??
  "application/octet-stream";

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const requestJson = async <T>(
  url: string,
  init: RequestInit,
  message: string
): Promise<T> => {
  const response = await fetch(url, init);
  const data = await readJson(response);
  if (!response.ok) {
    const detail =
      typeof data === "string" ? data : JSON.stringify(data ?? {}, null, 2);
    throw new Error(`${message}: ${response.status} ${detail}`);
  }

  return data as T;
};

const program = new Command();

program.name("blode-docs").description("Blode Docs CLI").version("0.0.3");

program
  .command("init")
  .description("Scaffold a content folder")
  .argument("[dir]", "target directory", "docs")
  .action(async (dir: string) => {
    intro(styleText("bold", "blode-docs init"));

    const root = path.resolve(process.cwd(), dir);
    await fs.mkdir(root, { recursive: true });

    const docsJson = {
      $schema: "https://mintlify.com/docs.json",
      colors: { primary: "#0D9373" },
      name: "My Site",
      navigation: {
        groups: [{ group: "Getting Started", pages: ["index"] }],
      },
      theme: "mint",
    };

    await ensureFile(
      path.join(root, CONTENT_CONFIG_FILE),
      `${JSON.stringify(docsJson, null, 2)}\n`
    );
    await ensureFile(
      path.join(root, "index.mdx"),
      "---\ntitle: Welcome\n---\n\nStart writing your docs here.\n"
    );

    log.success(`Docs scaffolded in ${styleText("cyan", root)}`);
    outro("Done");
  });

program
  .command("validate")
  .description("Validate docs.json")
  .argument("[dir]", "target directory", "docs")
  .action(async (dir: string) => {
    intro(styleText("bold", "blode-docs validate"));

    const root = path.resolve(process.cwd(), dir);

    try {
      const configFile = await validateConfigFile(root);
      log.success(`${styleText("cyan", configFile)} is valid JSON.`);
      outro("Done");
    } catch (error: unknown) {
      log.error(
        `Validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exitCode = 1;
    }
  });

program
  .command("push")
  .description("Publish docs content")
  .argument("[dir]", "target directory", "docs")
  .option("--project <slug>", "project slug (env: BLODE_DOCS_PROJECT)")
  .option("--api-url <url>", "API endpoint URL (env: BLODE_DOCS_API_URL)")
  .option(
    "--api-key <token>",
    "API authentication token (env: BLODE_DOCS_API_KEY)"
  )
  .option("--branch <name>", "git branch name (env: BLODE_DOCS_BRANCH)")
  .option(
    "--commit-message <message>",
    "deployment message (env: BLODE_DOCS_COMMIT_MESSAGE)"
  )
  .action(
    async (
      dir: string,
      options: {
        apiKey?: string;
        apiUrl?: string;
        branch?: string;
        commitMessage?: string;
        project?: string;
      }
    ) => {
      intro(styleText("bold", "blode-docs push"));
      const s = spinner();

      try {
        const root = path.resolve(process.cwd(), dir);

        s.start("Validating configuration");
        await validateConfigFile(root);
        s.stop("Configuration valid");

        const project = options.project ?? process.env.BLODE_DOCS_PROJECT;
        const apiUrl =
          options.apiUrl ??
          process.env.BLODE_DOCS_API_URL ??
          process.env.NEXT_PUBLIC_API_URL ??
          "http://localhost:4000";
        const apiKey = options.apiKey ?? process.env.BLODE_DOCS_API_KEY;
        const branch =
          options.branch ??
          process.env.BLODE_DOCS_BRANCH ??
          process.env.GITHUB_REF_NAME ??
          readGitValue(["rev-parse", "--abbrev-ref", "HEAD"]) ??
          "main";
        const commitMessage =
          options.commitMessage ??
          process.env.BLODE_DOCS_COMMIT_MESSAGE ??
          readGitValue(["log", "-1", "--pretty=%s"]);

        if (!project) {
          throw new Error(
            "Missing project slug. Pass --project or set BLODE_DOCS_PROJECT."
          );
        }
        if (!apiKey) {
          throw new Error(
            "Missing API key. Pass --api-key or set BLODE_DOCS_API_KEY."
          );
        }

        s.start("Collecting files");
        const files = await collectFiles(root);
        if (files.length === 0) {
          throw new Error("No files found to publish.");
        }
        s.stop(`Found ${styleText("cyan", String(files.length))} files`);

        const headers = {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        };

        const apiPath = (suffix: string): string =>
          new URL(
            `/projects/slug/${project}/deployments${suffix}`,
            apiUrl
          ).toString();

        s.start("Creating deployment");
        const deployment = await requestJson<DeploymentResponse>(
          apiPath(""),
          {
            body: JSON.stringify({ branch, commitMessage }),
            headers,
            method: "POST",
          },
          "Failed to create deployment"
        );
        s.stop(`Deployment ${styleText("cyan", deployment.id)} created`);

        s.start(`Uploading ${files.length} files`);
        for (const [index, filePath] of files.entries()) {
          const relativePath = normalizeRelativePath(root, filePath);
          const content = await fs.readFile(filePath);

          await requestJson(
            apiPath(`/${deployment.id}/files`),
            {
              body: JSON.stringify({
                contentBase64: content.toString("base64"),
                contentType: getContentType(filePath),
                path: relativePath,
              }),
              headers,
              method: "POST",
            },
            `Failed to upload ${relativePath}`
          );

          s.message(`Uploading files (${index + 1}/${files.length})`);
        }
        s.stop(`Uploaded ${styleText("cyan", String(files.length))} files`);

        s.start("Finalizing deployment");
        const finalized = await requestJson<DeploymentResponse>(
          apiPath(`/${deployment.id}/finalize`),
          {
            body: JSON.stringify({ promote: true }),
            headers,
            method: "POST",
          },
          "Failed to finalize deployment"
        );
        s.stop("Deployment finalized");

        log.success(`Published deployment ${styleText("cyan", finalized.id)}`);
        if (finalized.manifestUrl) {
          log.info(`Manifest: ${finalized.manifestUrl}`);
        }
        if (typeof finalized.fileCount === "number") {
          log.info(`Files: ${finalized.fileCount}`);
        }

        outro("Done");
      } catch (error: unknown) {
        s.stop("Failed");
        log.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      }
    }
  );

program
  .command("dev")
  .description("Start the docs dev server")
  .action(() => {
    intro(styleText("bold", "blode-docs dev"));
    log.info(
      `Run ${styleText("cyan", "npm run dev --filter=docs")} from the repo root.`
    );
    log.info(
      `Then open ${styleText("cyan", "http://localhost:3001")} to view the docs site.`
    );
    outro("Done");
  });

program.parse();
