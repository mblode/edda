/**
 * The example in the landing page's "MDX in, HTML and Markdown out" demo.
 *
 * `DEMO_HTML` and `DEMO_MARKDOWN` are what `eddaRenderMdx` in
 * `public/landing.js` returns for `DEMO_SOURCE`. The page server-renders them
 * so the demo is complete without JavaScript, and `mdx-demo.unit.test.ts`
 * fails if the two drift.
 */

/**
 * The index blockquote the real `.md` route prepends to every page
 * (`apps/docs/app/sites/[tenant]/llms.mdx`), for the demo's page. The
 * Markdown pane opens with it, as `EDDA_INDEX_QUOTE` does in `landing.js`.
 */
export const DEMO_INDEX_QUOTE = `> ## Documentation Index
> [HTML page](https://acme.blode.md/quickstart)
> [Documentation index](https://acme.blode.md/llms.txt)
> Use the index to discover all available pages before exploring further.`;
export const DEMO_SOURCE = `# Quickstart

Install the CLI, then publish your first page.

<Note>
Run \`edda login\` once per machine.
</Note>

## Publish

1. Run \`edda new docs\`
2. Run \`edda push docs\`

Read the [CLI guide](/docs/cli/overview).
`;

export const DEMO_HTML =
  '<h3>Quickstart</h3><p>Install the CLI, then publish your first page.</p><div class="callout" data-type="note"><p>Run <code>edda login</code> once per machine.</p></div><h4>Publish</h4><ol><li>Run <code>edda new docs</code></li><li>Run <code>edda push docs</code></li></ol><p>Read the <a href="/docs/cli/overview" rel="nofollow noopener">CLI guide</a>.</p>';

export const DEMO_MARKDOWN = `${DEMO_INDEX_QUOTE}

# Quickstart

Install the CLI, then publish your first page.

> [!NOTE]
> Run \`edda login\` once per machine.

## Publish

1. Run \`edda new docs\`
2. Run \`edda push docs\`

Read the [CLI guide](/docs/cli/overview).`;
