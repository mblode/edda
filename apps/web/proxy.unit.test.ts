import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { proxy } from "./proxy";

const markdownResponse = () =>
  new Response("# Quickstart\n", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
    status: 200,
  });

describe("web proxy markdown negotiation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("serves the .md twin for a docs page when the agent asks for markdown", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(markdownResponse()));
    vi.stubGlobal("fetch", fetchMock);

    const response = await proxy(
      new NextRequest("https://blode.md/docs/quickstart", {
        headers: { accept: "text/markdown" },
      })
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as unknown as [URL];
    expect(url.pathname).toBe("/docs/quickstart.md");
    expect(response.headers.get("Vary")).toBe("Accept");
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8"
    );
    await expect(response.text()).resolves.toBe("# Quickstart\n");
  });

  it("maps the docs root to index.md", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(markdownResponse()));
    vi.stubGlobal("fetch", fetchMock);

    await proxy(
      new NextRequest("https://blode.md/docs", {
        headers: { accept: "text/markdown, text/html;q=0.9" },
      })
    );

    const [url] = fetchMock.mock.calls[0] as unknown as [URL];
    expect(url.pathname).toBe("/docs/index.md");
  });

  it("leaves file URLs and HTML requests alone", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(markdownResponse()));
    vi.stubGlobal("fetch", fetchMock);

    const cases: [string, string][] = [
      ["/docs/quickstart.md", "text/markdown"],
      ["/docs/llms.txt", "text/markdown"],
      ["/docs/quickstart", "text/html,application/xhtml+xml,*/*;q=0.8"],
      ["/docs/quickstart", "text/html, text/markdown;q=0.5"],
    ];
    for (const [pathname, accept] of cases) {
      const response = await proxy(
        new NextRequest(`https://blode.md${pathname}`, {
          headers: { accept },
        })
      );
      expect(response.headers.get("x-middleware-next")).toBe("1");
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
