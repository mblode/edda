import type { UserRecord } from "@repo/db";
import type { Context } from "hono";

import { hashApiKey, isApiKeyToken } from "./api-keys";
import { adminApiToken } from "./config";
import { apiKeyDao, projectDao } from "./db";
import {
  constantTimeEquals,
  getBearerToken,
  getHeaderToken,
} from "./header-auth";
import { authenticateUser } from "./user-auth";

const API_KEY_TOUCH_INTERVAL_MS = 60_000;

const getHeadersRecord = (c: Context): Record<string, string> =>
  Object.fromEntries(c.req.raw.headers.entries());

const hasAdminAccess = (headers: Record<string, unknown>) => {
  if (!adminApiToken) {
    return false;
  }
  const token = getHeaderToken(headers, "x-admin-token");
  return token ? constantTimeEquals(token, adminApiToken) : false;
};

// A deploy key may arrive as `Authorization: Bearer bmd_...` (current CLI) or,
// for backward compatibility with blodemd <= 0.0.15, as `x-admin-token: bmd_...`.
const getApiKeyToken = (headers: Record<string, unknown>): string | null => {
  const bearer = getBearerToken(headers);
  if (bearer && isApiKeyToken(bearer)) {
    return bearer;
  }
  const adminHeader = getHeaderToken(headers, "x-admin-token");
  if (adminHeader && isApiKeyToken(adminHeader)) {
    return adminHeader;
  }
  return null;
};

const hasApiKeyAccess = async (
  headers: Record<string, unknown>,
  projectId: string
): Promise<boolean> => {
  const token = getApiKeyToken(headers);
  if (!token) {
    return false;
  }

  const record = await apiKeyDao.getByHash(hashApiKey(token));
  if (!record || record.projectId !== projectId) {
    return false;
  }

  // Throttle lastUsedAt writes — a single deploy makes several authed calls.
  const lastUsedMs = record.lastUsedAt ? record.lastUsedAt.getTime() : 0;
  if (Date.now() - lastUsedMs > API_KEY_TOUCH_INTERVAL_MS) {
    await apiKeyDao.touchLastUsed(record.id);
  }

  return true;
};

export const authorizeAdminRequest = (c: Context): boolean =>
  hasAdminAccess(getHeadersRecord(c));

export const authorizeProjectRequest = async (
  c: Context,
  projectId: string,
  options: {
    allowAdmin?: boolean;
    allowApiKey?: boolean;
    allowUser?: boolean;
  } = {}
) => {
  const allowAdmin = options.allowAdmin ?? true;
  const allowApiKey = options.allowApiKey ?? false;
  const allowUser = options.allowUser ?? true;
  const headers = getHeadersRecord(c);

  if (allowAdmin && hasAdminAccess(headers)) {
    return true;
  }

  if (allowApiKey && (await hasApiKeyAccess(headers, projectId))) {
    return true;
  }

  if (allowUser) {
    const user = await authenticateUser(headers);
    if (user) {
      const project = await projectDao.getById(projectId);
      return project?.userId === user.id;
    }
  }

  return false;
};

export const getAuthenticatedUser = (
  c: Context
): Promise<UserRecord | null> => {
  const headers = getHeadersRecord(c);
  return authenticateUser(headers);
};
