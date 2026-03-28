import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { styleText } from "node:util";

import {
  confirm,
  intro,
  isCancel,
  log,
  outro,
  password,
  spinner,
} from "@clack/prompts";
import { Command } from "commander";
import open from "open";

import type { DeploymentResponse } from "./types.js";

const CONFIG_FILE = "docs.json";
const CREDENTIALS_DIR = path.join(os.homedir(), ".blodemd");
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, "credentials.json");
const DEFAULT_API_URL = "https://api.blode.md";
const DEFAULT_AUTH_URL = "https://blode.md";
const CALLBACK_PORT = 9876;

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

// --- Credentials ---

interface SessionCredentials {
  type: "session";
  accessToken: string;
  refreshToken: string;
}

interface ApiKeyCredentials {
  type: "api-key";
  apiKey: string;
}

type Credentials = SessionCredentials | ApiKeyCredentials;

const readCredentials = async (): Promise<Credentials | undefined> => {
  try {
    const raw = await fs.readFile(CREDENTIALS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.accessToken && typeof parsed.accessToken === "string") {
      return {
        accessToken: parsed.accessToken as string,
        refreshToken: (parsed.refreshToken as string) ?? "",
        type: "session",
      };
    }
    if (parsed.apiKey && typeof parsed.apiKey === "string") {
      return { apiKey: parsed.apiKey as string, type: "api-key" };
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const writeCredentials = async (credentials: Credentials): Promise<void> => {
  await fs.mkdir(CREDENTIALS_DIR, { mode: 0o700, recursive: true });
  await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), {
    mode: 0o600,
  });
};

const deleteCredentials = async (): Promise<void> => {
  try {
    await fs.unlink(CREDENTIALS_FILE);
  } catch {
    // Already gone
  }
};

const getAuthToken = async (
  optApiKey?: string
): Promise<string | undefined> => {
  const envApiKey = optApiKey ?? process.env.BLODE_DOCS_API_KEY;
  if (envApiKey) {
    return envApiKey;
  }

  const credentials = await readCredentials();
  if (!credentials) {
    return undefined;
  }

  return credentials.type === "api-key"
    ? credentials.apiKey
    : credentials.accessToken;
};

// --- PKCE helpers ---

const base64url = (buffer: Buffer): string => buffer.toString("base64url");

const generatePkce = () => {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { challenge, verifier };
};

// --- File helpers ---

const ensureFile = async (filePath: string, content: string): Promise<void> => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, content);
  }
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const readConfig = async (
  root: string
): Promise<{ name?: string; raw: string }> => {
  const raw = await fs.readFile(path.join(root, CONFIG_FILE), "utf8");
  const parsed = JSON.parse(raw) as { name?: string };
  return { name: parsed.name, raw };
};

const resolveDocsRoot = async (dir?: string): Promise<string> => {
  if (dir) {
    return path.resolve(process.cwd(), dir);
  }

  const candidates = [
    process.cwd(),
    path.join(process.cwd(), "docs"),
    path.join(process.cwd(), "apps/docs"),
  ];

  for (const candidate of candidates) {
    if (await fileExists(path.join(candidate, CONFIG_FILE))) {
      return candidate;
    }
  }

  return process.cwd();
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

// --- Push helpers ---

interface PushConfig {
  project: string;
  apiUrl: string;
  authToken: string;
  branch: string;
  commitMessage?: string;
}

const resolvePushConfig = async (
  config: { name?: string },
  options: {
    apiKey?: string;
    apiUrl?: string;
    branch?: string;
    message?: string;
    project?: string;
  }
): Promise<PushConfig> => {
  const project =
    options.project ?? process.env.BLODE_DOCS_PROJECT ?? config.name;
  const apiUrl =
    options.apiUrl ?? process.env.BLODE_DOCS_API_URL ?? DEFAULT_API_URL;
  const authToken = await getAuthToken(options.apiKey);
  const branch =
    options.branch ??
    process.env.BLODE_DOCS_BRANCH ??
    process.env.GITHUB_REF_NAME ??
    readGitValue(["rev-parse", "--abbrev-ref", "HEAD"]) ??
    "main";
  const commitMessage =
    options.message ??
    process.env.BLODE_DOCS_COMMIT_MESSAGE ??
    readGitValue(["log", "-1", "--pretty=%s"]);

  if (!project) {
    throw new Error(
      'Missing project slug. Set "name" in docs.json, pass --project, or set BLODE_DOCS_PROJECT.'
    );
  }
  if (!authToken) {
    throw new Error(
      'Missing credentials. Run "blodemd login", pass --api-key, or set BLODE_DOCS_API_KEY.'
    );
  }

  return { apiUrl, authToken, branch, commitMessage, project };
};

const autoCreateProject = async (
  project: string,
  apiUrl: string,
  headers: Record<string, string>
): Promise<boolean> => {
  const credentials = await readCredentials();
  if (!credentials || credentials.type !== "session") {
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

  const createResult = await requestJson<{
    project: { id: string; slug: string };
    token: string;
  }>(
    new URL("/projects", apiUrl).toString(),
    {
      body: JSON.stringify({ name: project, slug: project }),
      headers,
      method: "POST",
    },
    "Failed to create project"
  );

  log.success(
    `Project ${styleText("cyan", createResult.project.slug)} created`
  );
  log.info(`API key for CI: ${styleText("dim", createResult.token)}`);
  return true;
};

const uploadFiles = async (
  files: string[],
  root: string,
  apiPath: (suffix: string) => string,
  deploymentId: string,
  headers: Record<string, string>,
  s: ReturnType<typeof spinner>
) => {
  s.start(`Uploading ${files.length} files`);
  for (const [index, filePath] of files.entries()) {
    const relativePath = normalizeRelativePath(root, filePath);
    const content = await fs.readFile(filePath);

    await requestJson(
      apiPath(`/${deploymentId}/files`),
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
};

// --- Browser login ---

const startCallbackServer = (
  port: number
): Promise<{ accessToken: string; refreshToken: string }> =>
  // oxlint-disable-next-line eslint-plugin-promise/avoid-new -- wrapping callback-based HTTP server
  new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);

      if (url.pathname === "/callback") {
        const accessToken = url.searchParams.get("access_token");
        const refreshToken = url.searchParams.get("refresh_token");

        if (accessToken) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<html><body><h2>Logged in! You can close this tab.</h2></body></html>"
          );
          server.close();
          resolve({
            accessToken,
            refreshToken: refreshToken ?? "",
          });
        } else {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(
            "<html><body><h2>Login failed. Please try again.</h2></body></html>"
          );
          server.close();
          reject(new Error("No access token received."));
        }
        return;
      }

      res.writeHead(404);
      res.end();
    });

    server.listen(port, "127.0.0.1");
    server.on("error", reject);

    const timeout = setTimeout(
      () => {
        server.close();
        reject(new Error("Login timed out. Please try again."));
      },
      5 * 60 * 1000
    );

    server.on("close", () => clearTimeout(timeout));
  });

// --- CLI ---

const program = new Command();

program.name("blodemd").description("Blode Docs CLI").version("0.0.3");

// login

program
  .command("login")
  .description("Authenticate with Blode Docs")
  .option("--token", "Paste an API key instead of using browser login")
  .action(async (options: { token?: boolean }) => {
    intro(styleText("bold", "blodemd login"));

    try {
      if (options.token) {
        const apiKey = await password({
          message: "Enter your API key",
          validate: (value) => {
            if (!value) {
              return "API key is required.";
            }
          },
        });

        if (isCancel(apiKey)) {
          outro("Cancelled");
          return;
        }

        await writeCredentials({ apiKey, type: "api-key" });

        const prefix = apiKey.split(".")[0] ?? apiKey.slice(0, 12);
        log.success(`Authenticated as ${styleText("cyan", prefix)}`);
        outro("Done");
        return;
      }

      // Browser-based login
      const authUrl = process.env.BLODE_DOCS_AUTH_URL ?? DEFAULT_AUTH_URL;
      const { challenge } = generatePkce();

      const loginUrl = new URL("/auth/cli", authUrl);
      loginUrl.searchParams.set("code_challenge", challenge);
      loginUrl.searchParams.set(
        "redirect_uri",
        `http://localhost:${CALLBACK_PORT}/callback`
      );

      log.info("Opening browser for authentication...");
      log.info(
        `If the browser doesn't open, visit: ${styleText("cyan", loginUrl.toString())}`
      );

      const tokenPromise = startCallbackServer(CALLBACK_PORT);
      await open(loginUrl.toString());

      const { accessToken, refreshToken } = await tokenPromise;
      await writeCredentials({ accessToken, refreshToken, type: "session" });

      const apiUrl = process.env.BLODE_DOCS_API_URL ?? DEFAULT_API_URL;
      try {
        const user = await requestJson<{ email: string }>(
          `${apiUrl}/auth/me`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
          "Failed to fetch user info"
        );
        log.success(`Logged in as ${styleText("cyan", user.email)}`);
      } catch {
        log.success("Logged in successfully.");
      }

      log.info(`Credentials saved to ${styleText("dim", CREDENTIALS_FILE)}`);
      outro("Done");
    } catch (error: unknown) {
      log.error(
        `Login failed: ${error instanceof Error ? error.message : String(error)}`
      );
      outro("Failed");
      process.exitCode = 1;
    }
  });

// logout

program
  .command("logout")
  .description("Remove stored credentials")
  .action(async () => {
    intro(styleText("bold", "blodemd logout"));

    await deleteCredentials();
    log.success("Credentials removed.");
    outro("Done");
  });

// whoami

program
  .command("whoami")
  .description("Show current authentication")
  .action(async () => {
    const credentials = await readCredentials();

    if (!credentials) {
      log.warn('Not logged in. Run "blodemd login" to authenticate.');
      return;
    }

    if (credentials.type === "api-key") {
      const prefix =
        credentials.apiKey.split(".")[0] ?? credentials.apiKey.slice(0, 12);
      log.info(`Logged in with API key ${styleText("cyan", prefix)}`);
      return;
    }

    const apiUrl = process.env.BLODE_DOCS_API_URL ?? DEFAULT_API_URL;
    try {
      const user = await requestJson<{ email: string }>(
        `${apiUrl}/auth/me`,
        { headers: { Authorization: `Bearer ${credentials.accessToken}` } },
        "Failed to fetch user info"
      );
      log.info(`Logged in as ${styleText("cyan", user.email)}`);
    } catch {
      log.warn(
        'Session may have expired. Run "blodemd login" to re-authenticate.'
      );
    }
  });

// init

program
  .command("init")
  .description("Scaffold a docs folder")
  .argument("[dir]", "target directory", "docs")
  .action(async (dir: string) => {
    intro(styleText("bold", "blodemd init"));

    try {
      const root = path.resolve(process.cwd(), dir);
      await fs.mkdir(root, { recursive: true });

      const docsJson = {
        $schema: "https://mintlify.com/docs.json",
        colors: { primary: "#0D9373" },
        name: "my-project",
        navigation: {
          groups: [{ group: "Getting Started", pages: ["index"] }],
        },
        theme: "mint",
      };

      await ensureFile(
        path.join(root, CONFIG_FILE),
        `${JSON.stringify(docsJson, null, 2)}\n`
      );
      await ensureFile(
        path.join(root, "index.mdx"),
        "---\ntitle: Welcome\n---\n\nStart writing your docs here.\n"
      );

      log.success(`Docs scaffolded in ${styleText("cyan", root)}`);
      log.info(
        `Set ${styleText("cyan", "name")} in docs.json to your project slug.`
      );
      outro("Done");
    } catch (error: unknown) {
      log.error(
        `Init failed: ${error instanceof Error ? error.message : String(error)}`
      );
      outro("Failed");
      process.exitCode = 1;
    }
  });

// validate

program
  .command("validate")
  .description("Validate docs.json")
  .argument("[dir]", "docs directory")
  .action(async (dir?: string) => {
    intro(styleText("bold", "blodemd validate"));

    try {
      const root = await resolveDocsRoot(dir);
      await readConfig(root);
      log.success(`${styleText("cyan", CONFIG_FILE)} is valid.`);
      outro("Done");
    } catch (error: unknown) {
      log.error(
        `Validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
      outro("Failed");
      process.exitCode = 1;
    }
  });

// push

program
  .command("push")
  .description("Deploy docs")
  .argument("[dir]", "docs directory")
  .option("--project <slug>", "project slug (env: BLODE_DOCS_PROJECT)")
  .option("--api-url <url>", "API URL (env: BLODE_DOCS_API_URL)")
  .option("--api-key <token>", "API key (env: BLODE_DOCS_API_KEY)")
  .option("--branch <name>", "git branch (env: BLODE_DOCS_BRANCH)")
  .option("--message <msg>", "deploy message (env: BLODE_DOCS_COMMIT_MESSAGE)")
  .action(
    async (
      dir: string | undefined,
      options: {
        apiKey?: string;
        apiUrl?: string;
        branch?: string;
        message?: string;
        project?: string;
      }
    ) => {
      intro(styleText("bold", "blodemd push"));
      const s = spinner();

      try {
        const root = await resolveDocsRoot(dir);

        s.start("Validating configuration");
        const config = await readConfig(root);
        s.stop("Configuration valid");

        const { project, apiUrl, authToken, branch, commitMessage } =
          await resolvePushConfig(config, options);

        s.start("Collecting files");
        const files = await collectFiles(root);
        if (files.length === 0) {
          throw new Error("No files found to deploy.");
        }
        s.stop(`Found ${styleText("cyan", String(files.length))} files`);

        const headers = {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        };

        const apiPath = (suffix: string): string =>
          new URL(
            `/projects/slug/${project}/deployments${suffix}`,
            apiUrl
          ).toString();

        const createDeploymentBody = JSON.stringify({ branch, commitMessage });

        // Try creating the deployment — if 404, offer to create the project
        s.start("Creating deployment");
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

          s.stop("Project not found");

          const created = await autoCreateProject(project, apiUrl, headers);
          if (!created) {
            outro("Cancelled");
            return;
          }

          s.start("Creating deployment");
          deployment = await requestJson<DeploymentResponse>(
            apiPath(""),
            { body: createDeploymentBody, headers, method: "POST" },
            "Failed to create deployment"
          );
        }
        s.stop(`Deployment ${styleText("cyan", deployment.id)} created`);

        await uploadFiles(files, root, apiPath, deployment.id, headers, s);

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

        log.success(`Published ${styleText("cyan", finalized.id)}`);
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
        outro("Failed");
        process.exitCode = 1;
      }
    }
  );

// dev

program
  .command("dev")
  .description("Start the docs dev server")
  .action(() => {
    intro(styleText("bold", "blodemd dev"));
    log.info(
      `Run ${styleText("cyan", "npm run dev --filter=docs")} from the repo root.`
    );
    log.info(
      `Then open ${styleText("cyan", "http://localhost:3001")} to view the docs site.`
    );
    outro("Done");
  });

program.parse();
