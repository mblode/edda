import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type * as DbModule from "./lib/db";
import type * as ProjectAuthModule from "./lib/project-auth";
import type * as PublishModule from "./lib/publish";

let authorizeResult = true;
const currentProject = {
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  deploymentName: "example",
  description: null,
  id: "7c3afcb6-c6e3-4a0a-948a-d8274210c829",
  name: "Example",
  slug: "example",
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  userId: "27f6a57a-77fd-4600-8c24-e94d0cb3f9d8",
};
let currentDeployment = {
  branch: "main",
  changes: null,
  commitMessage: null,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  environment: "production" as const,
  fileCount: null,
  id: "649a2cb8-52ea-492d-8d76-d6787f1e49b6",
  manifestUrl: null as string | null,
  previewUrl: null,
  projectId: "7c3afcb6-c6e3-4a0a-948a-d8274210c829",
  promotedAt: null,
  status: "building" as const,
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

const getByProjectId = vi.fn(() => Promise.resolve(currentDeployment));
const getBySlugUnique = vi.fn(() => Promise.resolve(currentProject));
const update = vi.fn((_id: string, input: Record<string, unknown>) =>
  Promise.resolve({
    ...currentDeployment,
    ...input,
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  })
);

let finalizeImplementation: () => Promise<{
  fileCount: number;
  manifestUrl: string;
}> = () =>
  Promise.resolve({
    fileCount: 1,
    manifestUrl: "https://example.com/manifest.json",
  });

vi.mock("./lib/project-auth", async () => {
  const actual = await vi.importActual<ProjectAuthModule>("./lib/project-auth");

  return {
    ...actual,
    authorizeProjectRequest: vi.fn(() => Promise.resolve(authorizeResult)),
  };
});

vi.mock("./lib/db", async () => {
  const actual = await vi.importActual<DbModule>("./lib/db");

  return {
    ...actual,
    deploymentDao: {
      create: vi.fn(),
      getByProjectId,
      listByProject: vi.fn(),
      update,
    },
    projectDao: {
      ...actual.projectDao,
      getBySlugUnique,
    },
  };
});

vi.mock("./lib/publish", async () => {
  const actual = await vi.importActual<PublishModule>("./lib/publish");

  return {
    ...actual,
    finalizeDeploymentManifest: vi.fn(() => finalizeImplementation()),
    uploadDeploymentFile: vi.fn(),
    uploadDeploymentFiles: vi.fn(),
  };
});

vi.mock("./lib/edge-config", () => ({
  syncProjectTenantEdgeConfig: vi.fn(() => Promise.resolve()),
}));

vi.mock("./lib/prewarm", () => ({
  prewarmProject: vi.fn(() => Promise.resolve()),
}));

const revalidateProjectMock = vi.fn(() => Promise.resolve());
vi.mock("./lib/revalidate", () => ({
  revalidateProject: revalidateProjectMock,
}));

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/blode_docs_drizzle_test";
process.env.NODE_ENV = "test";

let request: (input: string, init?: RequestInit) => Promise<Response>;

beforeAll(async () => {
  const apiModule = await import("./index.js");
  request = apiModule.app.request.bind(apiModule.app);
});

beforeEach(() => {
  authorizeResult = true;
  currentDeployment = {
    ...currentDeployment,
    manifestUrl: null,
    promotedAt: null,
    status: "building",
  };
  finalizeImplementation = () =>
    Promise.resolve({
      fileCount: 1,
      manifestUrl: "https://example.com/manifest.json",
    });
  getByProjectId.mockClear();
  getBySlugUnique.mockClear();
  update.mockClear();
  revalidateProjectMock.mockClear();
  revalidateProjectMock.mockImplementation(() => Promise.resolve());
});

describe("deployments API", () => {
  it("rejects promotion before finalize succeeds", async () => {
    const response = await request(
      "/projects/7c3afcb6-c6e3-4a0a-948a-d8274210c829/deployments/649a2cb8-52ea-492d-8d76-d6787f1e49b6",
      { method: "PATCH" }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Only finalized successful deployments can be promoted.",
    });
  });

  it("maps finalize server failures to 502", async () => {
    finalizeImplementation = () => Promise.reject(new Error("blob exploded"));

    const response = await request(
      "/projects/slug/example/deployments/649a2cb8-52ea-492d-8d76-d6787f1e49b6/finalize",
      {
        body: JSON.stringify({}),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Unable to finalize deployment.",
    });
  });

  it("still returns 200 but logs an error when docs revalidation fails", async () => {
    // Regression guard for the blodemd-test incident (Apr 2026): a stale
    // DOCS_REVALIDATE_URL caused revalidateProject to throw, which was
    // swallowed as logWarn — deploys looked green while docs served empty
    // state for up to 1h. The failure must now log at error level so it
    // surfaces in alerting, but the finalize HTTP response still succeeds
    // so the CLI push UX isn't broken.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    revalidateProjectMock.mockImplementation(() =>
      Promise.reject(new Error("Revalidation failed: 404"))
    );

    const response = await request(
      "/projects/slug/example/deployments/649a2cb8-52ea-492d-8d76-d6787f1e49b6/finalize",
      {
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
        method: "POST",
      }
    );

    expect(response.status).toBe(200);
    expect(revalidateProjectMock).toHaveBeenCalledWith("example");
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Docs revalidation failed"),
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  it("keeps publish validation failures as 400", async () => {
    const publishModule = await import("./lib/publish");
    finalizeImplementation = () =>
      Promise.reject(
        new publishModule.PublishValidationError(
          "Deployment is missing docs.json."
        )
      );

    const response = await request(
      "/projects/slug/example/deployments/649a2cb8-52ea-492d-8d76-d6787f1e49b6/finalize",
      {
        body: JSON.stringify({}),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Deployment is missing docs.json.",
    });
  });
});
