const MARKETING_MARKDOWN: Record<string, string> = {
  "/": `# Docs agents can navigate

Agents now read more docs than people do, so every merge publishes HTML for people and indexed Markdown for agents from the same commit.

Edda, knowledge docs for agents. Hosted is $0. The CLI and renderer are MIT.

## Your majority reader is an agent

- **257M** agent requests vs 131M human page loads, across Mintlify-hosted docs in August 2026
- **83%** of agent traffic came through \`.md\` pages, \`llms.txt\` or agent skills
- **0.11** failed requests per task when Markdown links to an index, vs 2.23 for HTML

Source: [Mintlify, 2026 State of Knowledge Report](https://www.mintlify.com/state-of-knowledge/2026).

Edda ships all three routes on every deploy, and every Markdown page links to the index before its first heading.

## Agents draft. People merge.

Most teams now have agents drafting docs changes, and most still want a person to approve them. In Edda that approval is the pull request you already review, and merging it is the publish. No second editor, no sync job, no docs that lag the release.

## The merge is the deploy

1. Install the GitHub app at github.com/apps/blodemd
2. Pick a repo and a docs folder
3. Push to \`main\`, deployed to \`acme.blode.md\`

Or use the CLI:

\`\`\`
npm i -g edda-docs
edda login
edda new docs
edda push docs
\`\`\`

## Choose your edition

- **No second editor**: $0 hosted. Sign in with GitHub and push.
- **Your Postgres**: MIT. Clone the repo and run the same CLI.
- **Moving from Mintlify?** [Migrate from Mintlify](https://blode.co/edda/docs/guides/migrate-from-mintlify)

## Links

- [About](https://blode.md/about)
- [Blog](https://blode.md/blog)
- [Changelog](https://blode.md/changelog)
- [Free online llms.txt resources](https://blode.md/free-online-llms-txt-resources)
- [Privacy](https://blode.md/privacy)
- [Terms](https://blode.md/terms)
- [Security](https://blode.md/security)
- [Docs](https://blode.md/docs)
- [GitHub](https://github.com/mblode/edda)
`,
  "/about": `# About Edda

I will not ship a second editor. Docs stay in the git repo. Hosted is $0. MIT if you run it yourself.
`,
  "/blog": `# Blog

Notes from the team building Edda.
`,
  "/changelog": `# Changelog

Latest updates to the Edda platform.
`,
  "/free-online-llms-txt-resources": `# Free online llms.txt resources

Educational resource by [Matthew Blode](https://blode.co) / Edda. Last updated 19 September 2026.

llms.txt is a proposed Markdown file served at \`/llms.txt\` that gives language models a curated, LLM-friendly index of a website. It starts with an H1 title, a short summary, and lists of linked Markdown resources so agents can load concise documentation without scraping noisy HTML. The informal standard is documented at [llmstxt.org](https://llmstxt.org/).

## Table of contents

1. [What is llms.txt](#what-is-llms-txt)
2. [Why it matters](#why-it-matters)
3. [How to add one](#how-to-add-one)
4. [Examples](#examples)
5. [Specs & standards](#specs-and-standards)
6. [Tools & generators](#tools-and-generators)
7. [Related docs on Edda](#related-docs-on-edda)
8. [FAQ](#faq)

## What is llms.txt

**Short answer:** A root (or docs-base) Markdown file that tells an LLM what your site is and which clean Markdown URLs to load next.

HTML pages mix navigation, scripts, and chrome that waste context. The [llms.txt proposal](https://llmstxt.org/) asks sites to publish a small Markdown index plus \`.md\` alternates of important pages. Models and tools can fetch those files on demand instead of parsing the full DOM.

## Why it matters

**Short answer:** Agents answering product questions need a trustworthy, size-bounded map of your docs, not every URL in the sitemap.

| File | Primary audience | Job |
| --- | --- | --- |
| \`robots.txt\` | Crawlers | Access rules and crawl hints |
| \`sitemap.xml\` | Search engines | Exhaustive list of indexable URLs |
| \`llms.txt\` | LLMs and agents | Curated, concise Markdown index |

## How to add one

**Short answer:** Publish Markdown at \`/llms.txt\`, link \`.md\` versions of key pages, keep the file short, and test that an LLM can answer from it.

If you host docs on Edda, the platform generates tenant-aware \`llms.txt\`, \`llms-full.txt\`, and \`.md\` page exports from your MDX. See [SEO and sitemaps](https://blode.md/docs/features/seo).

## Specs & standards

- [llmstxt.org](https://llmstxt.org/): proposal and examples
- [AnswerDotAI/llms-txt](https://github.com/AnswerDotAI/llms-txt): source and discussion

## FAQ

### What is llms.txt?

A Markdown file at \`/llms.txt\` that gives language models a curated title, summary, and links to LLM-friendly content. Informal proposal at llmstxt.org, not a W3C standard.

### Does Edda generate llms.txt automatically?

Yes. Edda sites get tenant-aware \`/llms.txt\`, \`/llms-full.txt\`, robots.txt, sitemap.xml, and per-page \`.md\` exports. See [/docs/features/seo](https://blode.md/docs/features/seo).

## Links

- [Full HTML resource](https://blode.md/free-online-llms-txt-resources)
- [blode.md/llms.txt](https://blode.md/llms.txt)
- [Docs](https://blode.md/docs)
`,
  "/pricing": `# Pricing

Edda is currently free for hosted projects and MIT licensed for self-hosting.
`,
  "/privacy": `# Privacy Policy

How Edda collects, uses, and protects your information. The product is hosted at blode.md.
`,
  "/security": `# Security

Security practices for Edda, the docs platform at blode.md.
`,
  "/terms": `# Terms of Service

Terms governing your use of Edda at blode.md.
`,
};

export const getMarketingMarkdown = (pathname: string): string | null => {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return MARKETING_MARKDOWN[normalized] ?? null;
};

export const hasMarketingMarkdown = (pathname: string): boolean =>
  getMarketingMarkdown(pathname) !== null;
