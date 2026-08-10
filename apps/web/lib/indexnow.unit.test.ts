import { afterEach, describe, expect, it, vi } from "vitest";

import {
  authorizeIndexNowSubmit,
  getIndexNowUrls,
  isIndexNowOwnedUrl,
  submitIndexNow,
} from "./indexnow";

describe("indexnow helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("authorizeIndexNowSubmit accepts only the exact bearer secret", () => {
    expect(authorizeIndexNowSubmit("Bearer secret", "secret")).toBe(true);
    expect(authorizeIndexNowSubmit("Bearer wrong", "secret")).toBe(false);
    expect(authorizeIndexNowSubmit(null, "secret")).toBe(false);
  });

  it("isIndexNowOwnedUrl accepts only https blode.md URLs", () => {
    expect(isIndexNowOwnedUrl("https://blode.md/about")).toBe(true);
    expect(isIndexNowOwnedUrl("http://blode.md/about")).toBe(false);
    expect(isIndexNowOwnedUrl("https://evil.example/about")).toBe(false);
    expect(isIndexNowOwnedUrl("not-a-url")).toBe(false);
  });

  it("getIndexNowUrls includes marketing canonical paths", () => {
    const urls = getIndexNowUrls();
    expect(urls).toContain("https://blode.md/");
    expect(urls).toContain("https://blode.md/free-online-llms-txt-resources");
  });

  it("submitIndexNow returns 503 when INDEXNOW_KEY is missing", async () => {
    vi.stubEnv("INDEXNOW_KEY", "");
    const result = await submitIndexNow();
    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
  });

  it("submitIndexNow rejects caller URLs that are not on blode.md", async () => {
    vi.stubEnv("INDEXNOW_KEY", "test-key");
    const result = await submitIndexNow(["https://evil.example/x"]);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.submitted).toBe(0);
  });

  it("submitIndexNow posts owned URLs and maps upstream failures", async () => {
    vi.stubEnv("INDEXNOW_KEY", "test-key");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve("rate limited"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitIndexNow(["https://blode.md/about"]);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(429);
    expect(result.submitted).toBe(0);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
