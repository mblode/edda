import { homedir } from "node:os";
import { join } from "node:path";

export const CLI_NAME = "blodemd";

export const BLODE_TOKEN_ENV = "BLODE_DOCS_API_KEY";
export const BLODE_API_URL_ENV = "BLODE_DOCS_API_URL";
export const BLODE_PROJECT_ENV = "BLODE_DOCS_PROJECT";
export const BLODE_BRANCH_ENV = "BLODE_DOCS_BRANCH";
export const BLODE_COMMIT_MESSAGE_ENV = "BLODE_DOCS_COMMIT_MESSAGE";

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

export const CONFIG_DIR = join(configBaseDir, CLI_NAME);
export const CREDENTIALS_FILE = join(CONFIG_DIR, "credentials.json");
