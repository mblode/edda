const MARKETING_MARKDOWN: Record<string, string> = {
  "/": `# Blode.md

No second editor. On purpose.

Write MDX in the repo. The pull request is the review. The merge publishes the site, including the Markdown agents fetch from that commit. Hosted is $0. MIT if you self-host.

## How it works

Sign in with GitHub and push. You do not run Docusaurus, a search index, or a custom-domain pipeline to get a public URL. The merge publishes the site from that commit.

1. Install the GitHub app at github.com/apps/blodemd
2. Pick a repo and a docs folder
3. Push to \`main\`, deployed to \`acme.blode.md\`

Or use the CLI:

\`\`\`
npm i -g blodemd
blodemd login
blodemd new docs
blodemd push docs
\`\`\`

## What the merge publishes

No plugin marketplace. No second editor. No SOC 2, no SSO, no logo wall. Support is the founder.

- **GitHub auto-deploy**: install the GitHub App. Every push to main publishes.
- **Custom domains**: point a domain, get SSL. Or proxy /docs on the site you already run.
- **Search**: full-text search included. No separate Algolia project to bill.
- **Content types**: docs, blogs, changelogs, and courses on one domain, from one repo.
- **API reference**: point docs.json at an OpenAPI spec. Ship the reference in the same deploy.
- **MIT if we disappear**: same CLI and renderer, your Postgres.

## Links

- [About](https://blode.md/about)
- [Blog](https://blode.md/blog)
- [Changelog](https://blode.md/changelog)
- [Free online llms.txt resources](https://blode.md/free-online-llms-txt-resources)
- [Privacy](https://blode.md/privacy)
- [Terms](https://blode.md/terms)
- [Security](https://blode.md/security)
- [Docs](https://blode.md/docs)
- [GitHub](https://github.com/mblode/blodemd)
`,
  "/about": `# About Blode.md

I will not ship a second editor. Docs stay in the git repo. Hosted is $0. MIT if you run it yourself.
`,
  "/blog": `# Blog

Notes from the team building blode.md.
`,
  "/changelog": `# Changelog

Latest updates to the blode.md platform.
`,
  "/free-online-llms-txt-resources": `# Free online llms.txt resources

Educational resource by [Matthew Blode](https://blode.co) / Blode.md. Last updated 10 August 2026.

llms.txt is a proposed Markdown file served at \`/llms.txt\` that gives language models a curated, LLM-friendly index of a website. It starts with an H1 title, a short summary, and lists of linked Markdown resources so agents can load concise documentation without scraping noisy HTML. The informal standard is documented at [llmstxt.org](https://llmstxt.org/).

## Table of contents

1. [What is llms.txt](#what-is-llms-txt)
2. [Why it matters](#why-it-matters)
3. [How to add one](#how-to-add-one)
4. [Examples](#examples)
5. [Specs & standards](#specs-and-standards)
6. [Tools & generators](#tools-and-generators)
7. [Related docs on Blode.md](#related-docs-on-blode-md)
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

If you host docs on Blode.md, the platform generates tenant-aware \`llms.txt\`, \`llms-full.txt\`, and \`.md\` page exports from your MDX. See [SEO and sitemaps](https://blode.md/docs/features/seo).

## Specs & standards

- [llmstxt.org](https://llmstxt.org/): proposal and examples
- [AnswerDotAI/llms-txt](https://github.com/AnswerDotAI/llms-txt): source and discussion

## FAQ

### What is llms.txt?

A Markdown file at \`/llms.txt\` that gives language models a curated title, summary, and links to LLM-friendly content. Informal proposal at llmstxt.org, not a W3C standard.

### Does Blode.md generate llms.txt automatically?

Yes. Blode.md sites get tenant-aware \`/llms.txt\`, \`/llms-full.txt\`, robots.txt, sitemap.xml, and per-page \`.md\` exports. See [/docs/features/seo](https://blode.md/docs/features/seo).

## Links

- [Full HTML resource](https://blode.md/free-online-llms-txt-resources)
- [blode.md/llms.txt](https://blode.md/llms.txt)
- [Docs](https://blode.md/docs)
`,
  "/pricing": `# Pricing

Blode.md is currently free for hosted projects and MIT licensed for self-hosting.
`,
  "/privacy": `# Privacy Policy

How blode.md collects, uses, and protects your information.
`,
  "/security": `# Security

Security practices at blode.md.
`,
  "/terms": `# Terms of Service

Terms governing your use of blode.md.
`,
};

export const getMarketingMarkdown = (pathname: string): string | null => {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return MARKETING_MARKDOWN[normalized] ?? null;
};

export const hasMarketingMarkdown = (pathname: string): boolean =>
  getMarketingMarkdown(pathname) !== null;
