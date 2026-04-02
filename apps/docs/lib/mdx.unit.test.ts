import fs from "node:fs/promises";
import path from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderMdx } from "./mdx";

const fixturePath = path.resolve(
  process.cwd(),
  "apps/docs/content/docs/content/code-blocks.mdx"
);

const readFixture = async () => await fs.readFile(fixturePath, "utf8");

describe("renderMdx", () => {
  it("renders the code-blocks fixture through the runtime fallback compiler", async () => {
    const fixture = await readFixture();
    const rendered = await renderMdx(fixture);
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toContain("CodeGroup");
    expect(html).toContain("title=&quot;npm&quot;");
    expect(html).toContain("title=&quot;pnpm&quot;");
    expect(html).toContain("title=&quot;yarn&quot;");
    expect(html).toContain("src/config.ts");
    expect(html).toContain("data-rehype-pretty-code-figure");
  });
});
