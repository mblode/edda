import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WebMcpTools } from "./web-mcp";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

type DocumentWithModelContext = Document & { modelContext?: unknown };

let root: Root;
let container: HTMLDivElement;
const render = async (element: React.ReactNode) => {
  await act(() => root.render(element));
};
const waitForRegistrations = (
  registerTool: { mock: { calls: unknown[] } },
  count: number
) =>
  vi.waitFor(() => {
    expect(registerTool.mock.calls).toHaveLength(count);
  });

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  push.mockClear();
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  delete (document as DocumentWithModelContext).modelContext;
  vi.unstubAllGlobals();
});

describe("WebMcpTools", () => {
  it("does nothing in a browser without WebMCP", async () => {
    await render(<WebMcpTools basePath="" siteName="Acme" />);
    expect(container.innerHTML).toBe("");
  });

  it("registers the docs tools with document.modelContext and unregisters on unmount", async () => {
    const registerTool = vi.fn(() => Promise.resolve());
    (document as DocumentWithModelContext).modelContext = { registerTool };

    await render(
      <WebMcpTools
        basePath="/docs"
        siteDescription="Payments API."
        siteName="Acme"
      />
    );
    await waitForRegistrations(registerTool, 5);

    const names = registerTool.mock.calls.map(
      (call) => (call as unknown as [{ name: string }])[0].name
    );
    expect(names).toEqual([
      "search_docs",
      "read_page",
      "get_site_overview",
      "read_skill",
      "navigate_page",
    ]);
    const [, options] = registerTool.mock.calls[0] as unknown as [
      unknown,
      { signal: AbortSignal },
    ];
    expect(options.signal.aborted).toBe(false);

    await act(() => root.unmount());
    expect(options.signal.aborted).toBe(true);
    root = createRoot(container);
  });

  it("routes navigate_page through the Next.js router", async () => {
    const registerTool = vi.fn(() => Promise.resolve());
    (document as DocumentWithModelContext).modelContext = { registerTool };

    await render(<WebMcpTools basePath="/docs" siteName="Acme" />);
    await waitForRegistrations(registerTool, 5);

    const navigateCall = registerTool.mock.calls.find(
      (call) =>
        (call as unknown as [{ name: string }])[0].name === "navigate_page"
    ) as unknown as
      | [{ execute: (args: Record<string, unknown>) => Promise<unknown> }]
      | undefined;
    expect(navigateCall).toBeDefined();

    await navigateCall?.[0].execute({ path: "guides/deploy" });
    expect(push).toHaveBeenCalledWith("/docs/guides/deploy");
  });
});
