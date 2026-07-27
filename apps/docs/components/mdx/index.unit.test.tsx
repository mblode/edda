import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const MockTree = (_props: { children?: ReactNode }) => null;
const MockTreeFile = () => null;
const MockTreeFolder = (_props: { children?: ReactNode }) => null;

describe("mdxComponents", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("rebuilds Tree dotted subcomponents in the server MDX registry", async () => {
    vi.doMock("next/image", () => ({
      default: () => null,
    }));
    vi.doMock("next/link", () => ({
      default: ({ children }: { children?: ReactNode }) => children,
    }));
    vi.doMock("./tree", () => ({
      Tree: MockTree,
      TreeFile: MockTreeFile,
      TreeFolder: MockTreeFolder,
    }));

    const { mdxComponents } = await import("./index");
    const tree = mdxComponents.Tree as {
      File?: unknown;
      Folder?: unknown;
    };

    expect(tree.File).toBeDefined();
    expect(tree.Folder).toBeDefined();
  }, 30_000);

  it("resolves href props against the base path on link-bearing components", async () => {
    vi.doMock("next/image", () => ({ default: () => null }));
    vi.doMock("next/link", () => ({
      default: ({ children }: { children?: ReactNode }) => children,
    }));
    vi.doMock("./card", () => ({
      Card: ({ href }: { href?: string }) => href ?? null,
    }));

    const { createMdxComponents } = await import("./index");
    const Card = createMdxComponents("/docs", "index").Card as (props: {
      href?: string;
    }) => { props: { href?: string } };

    // Authored as `/quickstart`; on a site proxied under /docs it must not
    // escape the prefix and 404.
    expect(Card({ href: "/quickstart" }).props.href).toBe("/docs/quickstart");
    expect(Card({ href: "https://example.com" }).props.href).toBe(
      "https://example.com"
    );
    expect(Card({}).props.href).toBeUndefined();
  }, 30_000);
});
