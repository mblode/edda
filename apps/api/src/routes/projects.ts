import {
  ProjectCreateSchema,
  ProjectUpdateSchema,
  SlugSchema,
} from "@repo/contracts";
import { Hono } from "hono";
import { z } from "zod";

import { domainDao, projectDao } from "../lib/db";
import { isUniqueViolationError } from "../lib/db-errors";
import {
  removeProjectTenantEdgeConfig,
  syncProjectTenantEdgeConfig,
} from "../lib/edge-config";
import { logError, logWarn } from "../lib/logger";
import {
  authorizeProjectRequest,
  getAuthenticatedUser,
} from "../lib/project-auth";
import { createProject } from "../lib/project-service";
import { deleteProjectFiles } from "../lib/publish";
import {
  badGateway,
  badRequest,
  noContent,
  notFound,
  unauthorized,
} from "../lib/responses";
import { revalidateProject } from "../lib/revalidate";
import { validateJson, validateParams } from "../lib/validators";
import { mapProject } from "../mappers/records";
import { getDomainRoutingHosts, removeHostedDomains } from "./domains";

const projectIdParamsSchema = z.object({ projectId: z.string().uuid() });
const projectSlugParamsSchema = z.object({
  slug: SlugSchema,
});

export const projects = new Hono();

// List projects for the authenticated user
projects.get("/", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return unauthorized(c, "Authentication required.");
  }

  const records = await projectDao.listByUser(user.id);
  return c.json(records.map(mapProject), 200);
});

// Create a new project
projects.post("/", validateJson(ProjectCreateSchema), async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return unauthorized(c, "Authentication required.");
  }

  const body = c.req.valid("json");

  const existing = await projectDao.getBySlugUnique(body.slug);
  if (existing) {
    return badRequest(c, `Project slug "${body.slug}" is already taken.`);
  }

  let project: Awaited<ReturnType<typeof createProject>>;
  try {
    project = await createProject({
      description: body.description,
      name: body.name,
      slug: body.slug,
      userId: user.id,
    });
  } catch (error) {
    if (isUniqueViolationError(error)) {
      return badRequest(c, `Project slug "${body.slug}" is already taken.`);
    }
    throw error;
  }

  try {
    await syncProjectTenantEdgeConfig(project.id);
  } catch (error: unknown) {
    logWarn("Failed to sync tenant Edge Config after project create", error);
  }

  return c.json(mapProject(project), 201);
});

// Get a project by slug (for the authenticated owner)
projects.get(
  "/by-slug/:slug",
  validateParams(projectSlugParamsSchema),
  async (c) => {
    const user = await getAuthenticatedUser(c);
    if (!user) {
      return unauthorized(c, "Authentication required.");
    }
    const { slug } = c.req.valid("param");
    const record = await projectDao.getBySlugUnique(slug);
    if (!record || record.userId !== user.id) {
      return notFound(c);
    }
    return c.json(mapProject(record), 200);
  }
);

// Get a project by ID
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

// Delete a project and everything it owns
projects.delete(
  "/:projectId",
  validateParams(projectIdParamsSchema),
  async (c) => {
    const { projectId } = c.req.valid("param");
    if (!(await authorizeProjectRequest(c, projectId))) {
      return unauthorized(c, "Invalid credentials.");
    }
    const project = await projectDao.getById(projectId);
    if (!project) {
      return notFound(c);
    }

    const projectDomains = await domainDao.listByProject(projectId);

    // Stop routing first: it is the only step we can still back out of, since
    // nothing has been destroyed yet.
    try {
      await removeProjectTenantEdgeConfig({
        hosts: getDomainRoutingHosts(projectDomains),
        slug: project.slug,
      });
    } catch (error: unknown) {
      logError(
        "Failed to remove tenant Edge Config before project delete",
        error
      );
      return badGateway(
        c,
        "Unable to update routing. Project was not deleted."
      );
    }

    // Cascades to domains, deployments, deploy keys and git connections.
    await projectDao.delete(projectId);

    // Everything below is best-effort cleanup of external state: the project is
    // already gone and unreachable, so failures only leave orphans behind.
    try {
      await removeHostedDomains(projectDomains);
    } catch (error: unknown) {
      logWarn("Failed to remove Vercel domains after project delete", error);
    }

    try {
      await deleteProjectFiles(project.slug);
    } catch (error: unknown) {
      logWarn("Failed to delete deployment files after project delete", error);
    }

    // Drop cached docs HTML so the tenant stops being served before its ISR TTL.
    try {
      await revalidateProject(project.slug, project.id);
    } catch (error: unknown) {
      logWarn("Failed to revalidate docs app after project delete", error);
    }

    return noContent();
  }
);

// Update a project
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

    try {
      await syncProjectTenantEdgeConfig(projectId);
    } catch (error: unknown) {
      logWarn("Failed to sync tenant Edge Config after project update", error);
    }

    return c.json(mapProject(record), 200);
  }
);
