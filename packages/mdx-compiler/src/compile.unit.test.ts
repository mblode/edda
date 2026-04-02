import fs from "node:fs/promises";
import path from "node:path";

import { run } from "@mdx-js/mdx";
import { createElement } from "react";
import type { ComponentType, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";
import { describe, expect, it } from "vitest";

import { compileContent } from "./compile.js";

const fixturePath = path.resolve(
  process.cwd(),
  "apps/docs/content/docs/content/code-blocks.mdx"
);

const readFixture = async () => await fs.readFile(fixturePath, "utf8");

const CodeGroup = ({ children }: { children?: ReactNode }) =>
  createElement("div", { "data-code-group": "" }, children);

describe("compileContent", () => {
  it("compiles the code-blocks fixture into executable output", async () => {
    const fixture = await readFixture();
    const compiled = await compileContent(fixture);

    const mdxModule = await run(compiled.compiledSource, {
      ...jsxRuntime,
      baseUrl: import.meta.url,
    });
    const Content = mdxModule.default as ComponentType<{
      components?: {
        CodeGroup: typeof CodeGroup;
      };
    }>;

    const html = renderToStaticMarkup(
      createElement(Content, {
        components: {
          CodeGroup,
        },
      })
    );

    expect(html).toContain("CodeGroup");
    expect(html).toContain("title=&quot;npm&quot;");
    expect(html).toContain("title=&quot;pnpm&quot;");
    expect(html).toContain("title=&quot;yarn&quot;");
    expect(html).toContain("src/config.ts");
  });
});
