# Edda

> Knowledge docs for agents.

Write MDX in git. The merge publishes the site and the Markdown from that commit. Hosted is $0. MIT if I disappear.

Last updated: 21 September 2026

## Get started

- [Connect GitHub](https://blode.md/oauth/consent)
- [Read the docs](https://blode.md/docs)
- [Pricing](https://blode.co/edda)

## No second editor. On purpose.

Git-native docs hosts added a web editor that commits back to the repo, plus a marketplace. If you want that, that product exists.

If you want a CMS, this is the wrong tool. You're not looking for a second review flow.

Write MDX in the repo. The pull request is the review. The merge publishes the site, including the Markdown agents fetch from that commit.

## What's inside

### The merge is the deploy

Sign in with GitHub and push. You do not run Docusaurus, a search index, or a custom-domain pipeline to get a public URL.

#### CLI

```bash
# install the CLI
npm i -g edda-docs

# browser sign-in with GitHub
edda login

# scaffold from your project root
edda new docs

# ship it
edda push docs
```

Deployed to `acme.blode.md`.

#### GitHub

1. Add a `docs/` folder first (or run `edda new docs`)
2. Sign in with GitHub and pick the repo
3. Point at the folder with `docs.json`, then push to `main`

### Markdown from that commit

`llms.txt`, `llms-full.txt`, and per-page `.md` exports are written from the same MDX as the HTML.

### On the domain they already trust

Proxy `/docs` through the site you already run. See the [proxy guides](https://blode.md/docs/guides/proxy-vercel).

### MIT if I disappear

Same CLI and renderer, your Postgres. Source on [GitHub](https://github.com/mblode/edda). If hosted goes away, you still have the source.

## Choose your edition

Named for what you do not get. Hosted is $0: no visual editor, no marketplace, no SOC 2. Detail is on [pricing](https://blode.co/edda).

- **No second editor:** $0 hosted. [Connect GitHub](https://blode.md/oauth/consent)
- **Your Postgres:** MIT. [View on GitHub](https://github.com/mblode/edda)

## FAQ

**Who should use Edda?**
People who already write MDX in git and review docs in a pull request. If you want a visual editor, a plugin marketplace, or a CMS, this is the wrong tool.

**How is this different from Mintlify?**
Mintlify Starter is also $0 and includes a web editor. We will not ship one. The merge publishes the site plus `llms.txt` from that commit. We do not claim drop-in compatibility with every Mintlify config key.

**How much does Edda cost?**
Hosted is $0. What you do not get: a visual editor, a plugin marketplace, SOC 2, SSO, an SLA, or a logo wall. Support is the founder. The CLI and renderer are MIT. See [pricing](https://blode.co/edda).

**Is there a visual editor?**
No. The pull request is the review.

**Do agents get Markdown, or only the HTML site?**
On every deploy the site writes `llms.txt`, `llms-full.txt`, robots.txt, a sitemap, and per-page `.md` exports from the MDX. Each `.md` page opens with a link back to `llms.txt`, the shape Mintlify's 2026 benchmark measured at 0.11 failed requests per task against 2.23 for HTML.

**Who builds Edda and how do I get support?**
Edda is built by [Matthew Blode](https://blode.co). Email [m@blode.co](mailto:m@blode.co) or open an issue on [GitHub](https://github.com/mblode/edda).
