import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type * as DbModule from "./lib/db";
import type * as ProjectAuthModule from "./lib/project-auth";

const authorizeProjectRequest = vi.fn();
const listByProject = vi.fn();
const getById = vi.fn();
const createKey = vi.fn();
const deleteById = vi.fn();

vi.mock("./lib/project-auth", async () => {
  const actual = await vi.importActual<ProjectAuthModule>("./lib/project-auth");

  return {
    ...actual,
    authorizeProjectRequest,
  };
});

vi.mock("./lib/db", async () => {
  const actual = await vi.importActual<DbModule>("./lib/db");

  return {
    ...actual,
    apiKeyDao: {
      ...actual.apiKeyDao,
      create: createKey,
      delete: deleteById,
      getById,
      listByProject,
    },
  };
});

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/blode_docs_drizzle_test";
process.env.NODE_ENV = "test";

let request: (input: string, init?: RequestInit) => Promise<Response>;

const projectId = "7c3afcb6-c6e3-4a0a-948a-d8274210c829";

const currentKey = {
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  id: "c88f7daa-1d96-4f08-87de-e21ec3f0e2d5",
  keyPrefix: "bmd_abc123",
  lastUsedAt: null,
  name: "Deploy key",
  projectId,
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

beforeAll(async () => {
  const { Hono } = await import("hono");
  const { apiKeys } = await import("./routes/api-keys.js");
  const app = new Hono();
  app.route("/projects", apiKeys);
  request = app.request.bind(app);
});

beforeEach(() => {
  authorizeProjectRequest.mockReset();
  listByProject.mockReset();
  getById.mockReset();
  createKey.mockReset();
  deleteById.mockReset();

  authorizeProjectRequest.mockResolvedValue(true);
  listByProject.mockResolvedValue([currentKey]);
  getById.mockResolvedValue(currentKey);
  createKey.mockImplementation((input) =>
    Promise.resolve({
      ...currentKey,
      keyPrefix: input.keyPrefix,
      name: input.name,
    })
  );
  deleteById.mockResolvedValue(currentKey);
});

describe("api keys API", () => {
  it("creates a key and returns the plaintext exactly once", async () => {
    const response = await request(`/projects/${projectId}/keys`, {
      body: JSON.stringify({ name: "CI" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as { apiKey: unknown; key: string };
    expect(body.key.startsWith("bmd_")).toBe(true);
    expect(body.apiKey).toMatchObject({ name: "CI", projectId });
    // The stored record must never carry the plaintext or its hash.
    expect(JSON.stringify(body.apiKey)).not.toContain(body.key);
  });

  it("lists mapped keys without exposing the plaintext", async () => {
    const response = await request(`/projects/${projectId}/keys`);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>[];
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: currentKey.id, projectId });
    expect(JSON.stringify(body)).not.toContain("keyHash");
  });

  it("deletes a key that belongs to the project", async () => {
    const response = await request(
      `/projects/${projectId}/keys/${currentKey.id}`,
      { method: "DELETE" }
    );

    expect(response.status).toBe(204);
    expect(deleteById).toHaveBeenCalledWith(currentKey.id);
  });

  it("returns 404 when deleting a key from another project", async () => {
    getById.mockResolvedValueOnce({
      ...currentKey,
      projectId: "11111111-1111-1111-1111-111111111111",
    });

    const response = await request(
      `/projects/${projectId}/keys/${currentKey.id}`,
      { method: "DELETE" }
    );

    expect(response.status).toBe(404);
    expect(deleteById).not.toHaveBeenCalled();
  });

  it("returns 401 for every route when authorization fails", async () => {
    authorizeProjectRequest.mockResolvedValue(false);

    const create = await request(`/projects/${projectId}/keys`, {
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const list = await request(`/projects/${projectId}/keys`);
    const remove = await request(
      `/projects/${projectId}/keys/${currentKey.id}`,
      { method: "DELETE" }
    );

    expect(create.status).toBe(401);
    expect(list.status).toBe(401);
    expect(remove.status).toBe(401);
    expect(createKey).not.toHaveBeenCalled();
    expect(deleteById).not.toHaveBeenCalled();
  });
});
