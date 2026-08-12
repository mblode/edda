# Blode.md

> The answer matches the commit you merged.

I built this for people who already write MDX in git. Hosted is $0. MIT if I disappear.

Last updated: 12 August 2026

## Get started

- [Connect GitHub](https://blode.md/oauth/consent)
- [Read the docs](https://blode.md/docs)
- [Pricing](https://blode.md/pricing)

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
npm i -g blodemd

# browser sign-in with GitHub
blodemd login

# scaffold from your project root
blodemd new docs

# ship it
blodemd push docs
```

Deployed to `acme.blode.md`.

#### GitHub

1. Add a `docs/` folder first (or run `blodemd new docs`)
2. Sign in with GitHub and pick the repo
3. Point at the folder with `docs.json`, then push to `main`

### Markdown from that commit

`llms.txt`, `llms-full.txt`, and per-page `.md` exports are written from the same MDX as the HTML.

### On the domain they already trust

Proxy `/docs` through the site you already run. See the [proxy guides](https://blode.md/docs/guides/proxy-vercel).

### MIT if I disappear

Same CLI and renderer, your Postgres. Source on [GitHub](https://github.com/mblode/blodemd).

## Choose your edition

Named for what you do not get. The catch is on [pricing](https://blode.md/pricing).

- **No second editor** — $0 hosted. [Connect GitHub](https://blode.md/oauth/consent)
- **Your Postgres** — MIT. [View on GitHub](https://github.com/mblode/blodemd)

## FAQ

**Who should use Blode.md?**
People who already write MDX in git and review docs in a pull request. If you want a visual editor, a plugin marketplace, or a CMS, this is the wrong tool.

**How is this different from Mintlify?**
Mintlify Starter is also $0 and includes a web editor. We will not ship one. We do not claim drop-in compatibility with every Mintlify config key.

**How much does Blode.md cost?**
Hosted is $0. What you do not get: a visual editor, a plugin marketplace, SOC 2, SSO, an SLA, or a logo wall. Support is the founder. The CLI and renderer are MIT. See [pricing](https://blode.md/pricing).

**Is there a visual editor?**
No. The pull request is the review.

**Do agents get Markdown, or only the HTML site?**
On every deploy the site writes `llms.txt`, `llms-full.txt`, robots.txt, a sitemap, and per-page `.md` exports from the MDX.

**Who builds Blode.md and how do I get support?**
Blode.md is built by [Matthew Blode](https://blode.co). Email [m@blode.co](mailto:m@blode.co) or open an issue on [GitHub](https://github.com/mblode/blodemd).
