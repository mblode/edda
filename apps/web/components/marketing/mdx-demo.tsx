import { DEMO_HTML, DEMO_MARKDOWN, DEMO_SOURCE } from "@/lib/mdx-demo";

const paneLabel = "font-mono text-muted-foreground text-xs";

/**
 * The signature moment: edit MDX on the left, see the published HTML and the
 * agent Markdown on the right. Server-rendered with the example's real output;
 * `public/landing.js` makes the editor live.
 *
 * The preview renders MDX `#` to `###` as h3 to h5, so the demo carries its own
 * visually hidden h2. Without it the outline jumps from the hero h1 to h3.
 */
export const MdxDemo = () => (
  <div className="container" data-mdx-demo>
    <h2 className="sr-only">Live example: MDX in, HTML and Markdown out</h2>
    <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-border bg-background text-left lg:grid-cols-2">
      <div className="flex min-w-0 flex-col border-border border-b bg-surface lg:border-r lg:border-b-0">
        <div className="flex min-h-12 items-center justify-between gap-4 border-border border-b px-4">
          <label className={paneLabel} htmlFor="mdx-demo-input">
            MDX in: docs/quickstart.mdx
          </label>
          <button
            className="inline-flex h-8 items-center rounded-md px-2 text-muted-foreground text-xs outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            data-mdx-reset
            hidden
            type="button"
          >
            Reset example
          </button>
        </div>
        <textarea
          aria-describedby="mdx-demo-status"
          autoCapitalize="off"
          autoComplete="off"
          className="min-h-80 w-full flex-1 resize-y bg-transparent p-4 font-mono [font-variant-ligatures:none] text-[13px] leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:text-sm"
          data-mdx-input
          defaultValue={DEMO_SOURCE}
          id="mdx-demo-input"
          maxLength={4000}
          readOnly
          spellCheck={false}
        />
      </div>
      <div className="flex min-w-0 flex-col">
        <section
          aria-label="HTML out: the published page"
          className="border-border border-b"
        >
          <div className="flex min-h-12 items-center border-border border-b px-4">
            <p className={paneLabel}>HTML out: acme.blode.md/quickstart</p>
          </div>
          <div
            className="mdx-demo-preview p-5"
            data-mdx-preview
            // oxlint-disable-next-line no-danger -- fixed example, output of the escaping renderer in public/landing.js
            dangerouslySetInnerHTML={{ __html: DEMO_HTML }}
          />
        </section>
        <section
          aria-label="Markdown out: what agents fetch"
          className="flex-1"
        >
          <div className="flex min-h-12 items-center border-border border-b px-4">
            <p className={paneLabel}>
              Markdown out: acme.blode.md/quickstart.md
            </p>
          </div>
          <pre
            className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-6 md:text-sm"
            data-mdx-output
          >
            {DEMO_MARKDOWN}
          </pre>
        </section>
      </div>
    </div>
    <p
      aria-live="polite"
      className="mx-auto mt-3 min-h-5 max-w-6xl text-left text-destructive text-sm"
      data-mdx-status
      id="mdx-demo-status"
      role="status"
    />
    <p className="mdx-demo-nojs mx-auto max-w-6xl text-left text-muted-foreground text-sm">
      Turn on JavaScript to edit the example.
    </p>
  </div>
);
