import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("GET /indexnow/key/[key]", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 404 when INDEXNOW_KEY is unset", async () => {
    vi.stubEnv("INDEXNOW_KEY", "");
    const response = await GET(new Request("https://blode.md/x.txt"), {
      params: Promise.resolve({ key: "x" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 404 when the path key does not match", async () => {
    vi.stubEnv("INDEXNOW_KEY", "correct-key");
    const response = await GET(new Request("https://blode.md/wrong.txt"), {
      params: Promise.resolve({ key: "wrong" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns the key as plain text when it matches", async () => {
    vi.stubEnv("INDEXNOW_KEY", "correct-key");
    const response = await GET(
      new Request("https://blode.md/correct-key.txt"),
      {
        params: Promise.resolve({ key: "correct-key" }),
      }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8"
    );
    await expect(response.text()).resolves.toBe("correct-key");
  });
});
