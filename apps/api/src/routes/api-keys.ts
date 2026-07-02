import type { ApiKeyCreated } from "@repo/contracts";
import { ApiKeyCreateSchema } from "@repo/contracts";
import { Hono } from "hono";
import { z } from "zod";

import {
  generateApiKey,
  getApiKeyDisplayPrefix,
  hashApiKey,
} from "../lib/api-keys";
import { apiKeyDao } from "../lib/db";
import { authorizeProjectRequest } from "../lib/project-auth";
import { noContent, notFound, unauthorized } from "../lib/responses";
import { validateJson, validateParams } from "../lib/validators";
import { mapApiKey } from "../mappers/records";

const projectIdParamsSchema = z.object({ projectId: z.string().uuid() });
const keyParamsSchema = projectIdParamsSchema.extend({
  keyId: z.string().uuid(),
});

export const apiKeys = new Hono();

apiKeys.post(
  "/:projectId/keys",
  validateParams(projectIdParamsSchema),
  validateJson(ApiKeyCreateSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    if (!(await authorizeProjectRequest(c, projectId))) {
      return unauthorized(c, "Invalid credentials.");
    }
    const body = c.req.valid("json");
    const key = generateApiKey();
    const record = await apiKeyDao.create({
      keyHash: hashApiKey(key),
      keyPrefix: getApiKeyDisplayPrefix(key),
      name: body.name ?? "Deploy key",
      projectId,
    });
    return c.json(
      { apiKey: mapApiKey(record), key } satisfies ApiKeyCreated,
      201
    );
  }
);

apiKeys.get(
  "/:projectId/keys",
  validateParams(projectIdParamsSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    if (!(await authorizeProjectRequest(c, projectId))) {
      return unauthorized(c, "Invalid credentials.");
    }
    const records = await apiKeyDao.listByProject(projectId);
    return c.json(records.map(mapApiKey), 200);
  }
);

apiKeys.delete(
  "/:projectId/keys/:keyId",
  validateParams(keyParamsSchema),
  async (c) => {
    const { keyId, projectId } = c.req.valid("param");
    if (!(await authorizeProjectRequest(c, projectId))) {
      return unauthorized(c, "Invalid credentials.");
    }
    const record = await apiKeyDao.getById(keyId);
    if (!record || record.projectId !== projectId) {
      return notFound(c);
    }
    await apiKeyDao.delete(keyId);
    return noContent();
  }
);
