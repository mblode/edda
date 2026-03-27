import type { Context } from "hono";

import { authenticateApiKey } from "./api-key-auth.js";
import { adminApiToken } from "./config.js";
import { apiKeyDao } from "./db.js";

export const getHeadersRecord = (c: Context): Record<string, string> =>
  Object.fromEntries(c.req.raw.headers.entries());

const hasAdminAccess = (headers: Record<string, unknown>) => {
  if (!adminApiToken) {
    return false;
  }
  const token = headers["x-admin-token"];
  return typeof token === "string" && token.trim() === adminApiToken;
};

export const authorizeProjectRequest = async (
  c: Context,
  projectId: string,
  options: {
    allowAdmin?: boolean;
    allowProjectApiKey?: boolean;
  } = {}
) => {
  const allowAdmin = options.allowAdmin ?? true;
  const allowProjectApiKey = options.allowProjectApiKey ?? true;
  const headers = getHeadersRecord(c);

  if (allowAdmin && hasAdminAccess(headers)) {
    return true;
  }

  if (!allowProjectApiKey) {
    return false;
  }

  const apiKey = await authenticateApiKey(headers, apiKeyDao);
  return Boolean(apiKey && apiKey.projectId === projectId);
};
