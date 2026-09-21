import { homedir } from "node:os";
import { join } from "node:path";

export const DEV_PACKAGE_NAME = "edda-docs-dev";
const CONFIG_DIR_NAME = "blodemd";

const BLODE_API_URL_ENV = "BLODEMD_API_URL";
const BLODE_API_KEY_ENV = "BLODEMD_API_KEY";
const BLODE_PROJECT_ENV = "BLODEMD_PROJECT";
const BLODE_BRANCH_ENV = "BLODEMD_BRANCH";
const BLODE_COMMIT_MESSAGE_ENV = "BLODEMD_COMMIT_MESSAGE";
const EDDA_API_URL_ENV = "EDDA_API_URL";
const EDDA_API_KEY_ENV = "EDDA_API_KEY";
const EDDA_PROJECT_ENV = "EDDA_PROJECT";
const EDDA_BRANCH_ENV = "EDDA_BRANCH";
const EDDA_COMMIT_MESSAGE_ENV = "EDDA_COMMIT_MESSAGE";

const readFirstEnv = (...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
};

export const readApiUrlEnv = (): string | undefined =>
  readFirstEnv(EDDA_API_URL_ENV, BLODE_API_URL_ENV);

export const readApiKeyEnv = (): string | undefined =>
  readFirstEnv(EDDA_API_KEY_ENV, BLODE_API_KEY_ENV);

export const readProjectEnv = (): string | undefined =>
  readFirstEnv(EDDA_PROJECT_ENV, BLODE_PROJECT_ENV);

export const readBranchEnv = (): string | undefined =>
  readFirstEnv(EDDA_BRANCH_ENV, BLODE_BRANCH_ENV);

export const readCommitMessageEnv = (): string | undefined =>
  readFirstEnv(EDDA_COMMIT_MESSAGE_ENV, BLODE_COMMIT_MESSAGE_ENV);

export const resolveApiKeyEnvName = (): string | undefined => {
  if (process.env[EDDA_API_KEY_ENV]?.trim()) {
    return EDDA_API_KEY_ENV;
  }
  if (process.env[BLODE_API_KEY_ENV]?.trim()) {
    return BLODE_API_KEY_ENV;
  }
  return undefined;
};

export const resolveProjectEnvName = (): string | undefined => {
  if (process.env[EDDA_PROJECT_ENV]?.trim()) {
    return EDDA_PROJECT_ENV;
  }
  if (process.env[BLODE_PROJECT_ENV]?.trim()) {
    return BLODE_PROJECT_ENV;
  }
  return undefined;
};

export const DEFAULT_API_URL = "https://api.blode.md";
export const DEFAULT_SUPABASE_URL = "https://bwnxwgkgyklzzmpbzuoz.supabase.co";

export const OAUTH_CLIENT_ID = "6b5f9860-fe96-4a83-b1ad-266260523c91";

export const DEFAULT_OAUTH_CALLBACK_PORT = 8787;
export const DEFAULT_OAUTH_CALLBACK_PATH = "/auth/callback";
export const DEFAULT_OAUTH_TIMEOUT_SECONDS = 180;

const getDefaultConfigBaseDir = (): string => {
  if (process.platform === "win32") {
    return process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");
  }

  return process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
};

const configBaseDir = getDefaultConfigBaseDir();

export const CONFIG_DIR = join(configBaseDir, CONFIG_DIR_NAME);
export const CREDENTIALS_FILE = join(CONFIG_DIR, "credentials.json");
