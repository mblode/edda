import { ProjectUpdateSchema } from "@repo/contracts";
import { Hono } from "hono";
import { z } from "zod";

import { projectDao } from "../lib/db.js";
import { authorizeProjectRequest } from "../lib/project-auth.js";
import { notFound, unauthorized } from "../lib/responses.js";
import { validateJson, validateParams } from "../lib/validators.js";
import { mapProject } from "../mappers/records.js";

const projectIdParamsSchema = z.object({ projectId: z.string().uuid() });

export const projects = new Hono();

projects.get(
  "/:projectId",
  validateParams(projectIdParamsSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    if (!(await authorizeProjectRequest(c, projectId))) {
      return unauthorized(c, "Invalid credentials.");
    }
    const record = await projectDao.getById(projectId);
    if (!record) {
      return notFound(c);
    }
    return c.json(mapProject(record), 200);
  }
);

projects.patch(
  "/:projectId",
  validateParams(projectIdParamsSchema),
  validateJson(ProjectUpdateSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    if (!(await authorizeProjectRequest(c, projectId))) {
      return unauthorized(c, "Invalid credentials.");
    }
    const body = c.req.valid("json");
    const existing = await projectDao.getById(projectId);
    if (!existing) {
      return notFound(c);
    }
    const record = await projectDao.update(projectId, body);
    return c.json(mapProject(record), 200);
  }
);
