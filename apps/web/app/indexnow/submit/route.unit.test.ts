import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const submitIndexNow = vi.hoisted(() =>
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      submitted: 1,
      urlList: ["https://blode.md/"],
    })
  )
);

vi.mock("@/lib/indexnow", async () => {
  const actual = await vi.importActual("@/lib/indexnow");
  return {
    ...actual,
    submitIndexNow,
  };
});

describe("POST /indexnow/submit", () => {
  beforeEach(() => {
    vi.resetModules();
    submitIndexNow.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 503 when INDEXNOW_SUBMIT_SECRET is unset", async () => {
    vi.stubEnv("INDEXNOW_SUBMIT_SECRET", "");
    const { POST } = await import("./route");
    const response = await POST(
      new Request("https://blode.md/indexnow/submit", { method: "POST" })
    );
    expect(response.status).toBe(503);
  });

  it("returns 401 for a bad bearer token", async () => {
    vi.stubEnv("INDEXNOW_SUBMIT_SECRET", "topsecret");
    const { POST } = await import("./route");
    const response = await POST(
      new Request("https://blode.md/indexnow/submit", {
        headers: { authorization: "Bearer nope" },
        method: "POST",
      })
    );
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid JSON", async () => {
    vi.stubEnv("INDEXNOW_SUBMIT_SECRET", "topsecret");
    const { POST } = await import("./route");
    const response = await POST(
      new Request("https://blode.md/indexnow/submit", {
        body: "{",
        headers: { authorization: "Bearer topsecret" },
        method: "POST",
      })
    );
    expect(response.status).toBe(400);
  });

  it("submits the default URL set when the body is empty", async () => {
    vi.stubEnv("INDEXNOW_SUBMIT_SECRET", "topsecret");
    const { POST } = await import("./route");
    const response = await POST(
      new Request("https://blode.md/indexnow/submit", {
        headers: { authorization: "Bearer topsecret" },
        method: "POST",
      })
    );
    expect(response.status).toBe(200);
    expect(submitIndexNow).toHaveBeenCalledWith(undefined);
  });
});
