import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

import { CONFIG_DIR, CREDENTIALS_FILE } from "./constants.js";
import { CliError, EXIT_CODES } from "./errors.js";
import type {
  ApiKeyCredentials,
  AuthFileData,
  StoredAuthSession,
} from "./types.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseStoredAuthSession = (value: unknown): StoredAuthSession | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.accessToken !== "string") {
    return null;
  }

  if (value.refreshToken !== null && typeof value.refreshToken !== "string") {
    return null;
  }

  if (value.expiresAt !== null && typeof value.expiresAt !== "string") {
    return null;
  }

  const { user } = value;
  if (
    user !== null &&
    (!isRecord(user) ||
      typeof user.id !== "string" ||
      (user.email !== null && typeof user.email !== "string"))
  ) {
    return null;
  }

  if (typeof value.createdAt !== "string") {
    return null;
  }

  const parsedUser =
    user === null || !isRecord(user)
      ? null
      : {
          email: (user.email as string | null) ?? null,
          id: user.id as string,
        };

  return {
    accessToken: value.accessToken,
    createdAt: value.createdAt,
    expiresAt: (value.expiresAt as string | null) ?? null,
    refreshToken: (value.refreshToken as string | null) ?? null,
    user: parsedUser,
  };
};

const parseApiKeyCredentials = (value: unknown): ApiKeyCredentials | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.apiKey !== "string") {
    return null;
  }

  return { apiKey: value.apiKey, type: "api-key" };
};

const parseAuthFile = (payload: string): AuthFileData => {
  const parsed = JSON.parse(payload) as unknown;

  if (!isRecord(parsed) || parsed.version !== 1) {
    throw new CliError(
      `Invalid credentials format in ${CREDENTIALS_FILE}`,
      EXIT_CODES.ERROR
    );
  }

  const session = parseStoredAuthSession(parsed.session);
  const apiKey = parseApiKeyCredentials(parsed.apiKey);

  return {
    apiKey: apiKey ?? undefined,
    session: session ?? undefined,
    version: 1,
  };
};

export const readStoredAuthSession =
  async (): Promise<StoredAuthSession | null> => {
    try {
      const raw = await readFile(CREDENTIALS_FILE, "utf8");
      const parsed = parseAuthFile(raw);
      return parsed.session ?? null;
    } catch (error) {
      if (isRecord(error) && error.code === "ENOENT") {
        return null;
      }

      if (error instanceof CliError) {
        throw error;
      }

      return null;
    }
  };

export const readStoredApiKey = async (): Promise<ApiKeyCredentials | null> => {
  try {
    const raw = await readFile(CREDENTIALS_FILE, "utf8");
    const parsed = parseAuthFile(raw);
    return parsed.apiKey ?? null;
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") {
      return null;
    }

    if (error instanceof CliError) {
      throw error;
    }

    return null;
  }
};

export const writeStoredAuthSession = async (
  session: StoredAuthSession
): Promise<void> => {
  const existing = await readStoredApiKey().catch(() => null);
  const payload: AuthFileData = {
    apiKey: existing ?? undefined,
    session,
    version: 1,
  };

  await mkdir(CONFIG_DIR, { mode: 0o700, recursive: true });
  await writeFile(CREDENTIALS_FILE, `${JSON.stringify(payload, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
};

export const writeStoredApiKey = async (
  apiKey: ApiKeyCredentials
): Promise<void> => {
  const existing = await readStoredAuthSession().catch(() => null);
  const payload: AuthFileData = {
    apiKey,
    session: existing ?? undefined,
    version: 1,
  };

  await mkdir(CONFIG_DIR, { mode: 0o700, recursive: true });
  await writeFile(CREDENTIALS_FILE, `${JSON.stringify(payload, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
};

export const clearStoredCredentials = async (): Promise<void> => {
  await rm(CREDENTIALS_FILE, { force: true });
};
