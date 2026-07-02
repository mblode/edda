import type { Context } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { hashApiKey } from "./lib/api-keys";

const getByHash = vi.fn();
const touchLastUsed = vi.fn();
const getProjectById = vi.fn();
const authenticateUser = vi.fn();

// No admin token configured, so the admin branch never short-circuits.
vi.mock("./lib/config", () => ({ adminApiToken: undefined }));

vi.mock("./lib/db", () => ({
  apiKeyDao: {
    getByHash: (...args: unknown[]) => getByHash(...args),
    touchLastUsed: (...args: unknown[]) => touchLastUsed(...args),
  },
  projectDao: {
    getById: (...args: unknown[]) => getProjectById(...args),
  },
}));

vi.mock("./lib/user-auth", () => ({
  authenticateUser: (...args: unknown[]) => authenticateUser(...args),
}));

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/blode_docs_drizzle_test";
process.env.NODE_ENV = "test";

const KEY = "bmd_testkeyabcdef";
const PROJECT_ID = "11111111-1111-1111-1111-111111111111";

const ctx = (headers: Record<string, string>): Context =>
  ({ req: { raw: { headers: new Headers(headers) } } }) as unknown as Context;

const importAuthorize = async () => {
  const mod = await import("./lib/project-auth");
  return mod.authorizeProjectRequest;
};

describe("authorizeProjectRequest api-key branch", () => {
  beforeEach(() => {
    getByHash.mockReset();
    touchLastUsed.mockReset();
    getProjectById.mockReset();
    authenticateUser.mockReset();
    authenticateUser.mockResolvedValue(null);
    getProjectById.mockResolvedValue(null);
  });

  it("authorizes a valid deploy key for its own project", async () => {
    getByHash.mockResolvedValue({
      id: "k1",
      lastUsedAt: null,
      projectId: PROJECT_ID,
    });
    const authorize = await importAuthorize();

    const ok = await authorize(
      ctx({ authorization: `Bearer ${KEY}` }),
      PROJECT_ID,
      { allowApiKey: true }
    );

    expect(ok).toBe(true);
    expect(getByHash).toHaveBeenCalledWith(hashApiKey(KEY));
    expect(touchLastUsed).toHaveBeenCalledWith("k1");
  });

  it("rejects a key scoped to a different project", async () => {
    getByHash.mockResolvedValue({
      id: "k1",
      lastUsedAt: null,
      projectId: "22222222-2222-2222-2222-222222222222",
    });
    const authorize = await importAuthorize();

    const ok = await authorize(
      ctx({ authorization: `Bearer ${KEY}` }),
      PROJECT_ID,
      { allowApiKey: true }
    );

    expect(ok).toBe(false);
  });

  it("accepts a bmd_ key sent via x-admin-token (legacy CLI compat)", async () => {
    getByHash.mockResolvedValue({
      id: "k1",
      lastUsedAt: null,
      projectId: PROJECT_ID,
    });
    const authorize = await importAuthorize();

    const ok = await authorize(ctx({ "x-admin-token": KEY }), PROJECT_ID, {
      allowApiKey: true,
    });

    expect(ok).toBe(true);
  });

  it("ignores deploy keys when allowApiKey is not enabled", async () => {
    getByHash.mockResolvedValue({
      id: "k1",
      lastUsedAt: null,
      projectId: PROJECT_ID,
    });
    const authorize = await importAuthorize();

    const ok = await authorize(
      ctx({ authorization: `Bearer ${KEY}` }),
      PROJECT_ID
    );

    expect(ok).toBe(false);
    expect(getByHash).not.toHaveBeenCalled();
  });

  it("skips the lastUsedAt write when the key was used recently", async () => {
    getByHash.mockResolvedValue({
      id: "k1",
      lastUsedAt: new Date(),
      projectId: PROJECT_ID,
    });
    const authorize = await importAuthorize();

    await authorize(ctx({ authorization: `Bearer ${KEY}` }), PROJECT_ID, {
      allowApiKey: true,
    });

    expect(touchLastUsed).not.toHaveBeenCalled();
  });
});
