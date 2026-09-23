import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createContext, runInContext } from "node:vm";

import { describe, expect, it } from "vitest";

import { LANDING_EVENTS } from "./analytics";
import {
  DEMO_HTML,
  DEMO_INDEX_QUOTE,
  DEMO_MARKDOWN,
  DEMO_SOURCE,
} from "./mdx-demo";

interface RenderResult {
  error: string | null;
  html: string;
  markdown: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const landingSource = readFileSync(join(here, "../public/landing.js"), "utf8");

// landing.js is a classic script. Run it without a DOM so only the pure
// renderer loads, then read the top-level binding it declares.
const context = createContext({});
runInContext(landingSource, context);
const renderMdx = runInContext("eddaRenderMdx", context) as (
  source: string
) => RenderResult;
const render = (source: string): RenderResult => renderMdx(source);

// Built at runtime so the lint rule against script URLs does not fire on a
// test that checks we drop them.
const SCRIPT_PROTOCOL = ["java", "script:"].join("");

describe("landing MDX demo", () => {
  it("server-renders exactly what landing.js renders", () => {
    const result = render(DEMO_SOURCE);
    expect(result.error).toBeNull();
    expect(result.html).toBe(DEMO_HTML);
    expect(result.markdown).toBe(DEMO_MARKDOWN);
  });

  it("opens the Markdown pane with the same index blockquote", () => {
    expect(runInContext("EDDA_INDEX_QUOTE", context)).toBe(DEMO_INDEX_QUOTE);
    expect(DEMO_MARKDOWN.startsWith(`${DEMO_INDEX_QUOTE}\n\n# `)).toBe(true);
    expect(render("").markdown).toBe(DEMO_INDEX_QUOTE);
  });

  it("escapes raw HTML and drops unsafe link protocols", () => {
    const result = render(
      `<script>alert(1)</script>\n\n[x](${SCRIPT_PROTOCOL}alert(1)) <img src=x onerror=alert(1)>`
    );
    expect(result.html).not.toContain("<script");
    expect(result.html).not.toContain("<img");
    expect(result.html).not.toContain(SCRIPT_PROTOCOL);
  });

  it("drops backslash links that browsers read as protocol-relative", () => {
    expect(render("[x](/\\evil.example)").html).toBe("<p>x</p>");
  });

  it("keeps emphasis and code markup out of link hrefs", () => {
    expect(render("[a](https://x.example/_b_)").html).toBe(
      '<p><a href="https://x.example/&#95;b&#95;" rel="nofollow noopener">a</a></p>'
    );
    expect(render("[a](https://x.example/`b`)").html).not.toContain("<a");
  });

  it("turns callouts into the alert blocks agents read", () => {
    const result = render(
      '<Callout type="warning" title="Heads up">\nCheck the domain.\n</Callout>'
    );
    expect(result.markdown).toBe(
      `${DEMO_INDEX_QUOTE}\n\n> [!WARNING]\n> **Heads up**\n>\n> Check the domain.`
    );
    expect(result.html).toContain('data-type="warning"');
  });

  it("reports unknown and unclosed components", () => {
    expect(render("<Tabs>\nx\n</Tabs>").error).toContain("<Tabs>");
    expect(render("<Note>\nopen").error).toBe("Close <Note> with </Note>.");
  });

  it("fires every landing event name from landing.js", () => {
    for (const event of Object.values(LANDING_EVENTS)) {
      expect(landingSource).toContain(`"${event}"`);
    }
  });
});
