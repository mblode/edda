import { beforeAll, describe, expect, it } from "vitest";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/blode_docs_drizzle_test";
process.env.DATABASE_URL = databaseUrl;
process.env.NODE_ENV = "test";

let request: (input: string, init?: RequestInit) => Promise<Response>;

beforeAll(async () => {
  const apiModule = await import("./index.js");
  request = apiModule.app.request.bind(apiModule.app);
});

describe("health", () => {
  it("responds ok", async () => {
    const response = await request("/health");
    expect(response.status).toBe(200);
  });
});
