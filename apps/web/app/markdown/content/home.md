# Blode.md

> Docs that match the code you shipped.

Write MDX in the repo. The pull request is the review. The merge publishes the site, including the Markdown files agents fetch from that commit.

Last updated: 12 August 2026

## Get started

- [Start shipping](https://blode.md/oauth/consent)
- [Read the docs](https://blode.md/docs)
- [Pricing](https://blode.md/pricing)

## How it works

Docs that live in a separate CMS lag the release. Then the agent answering your users cites the old API. Blode.md publishes from the same commit you merged.

### CLI

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

### GitHub

1. Add a `docs/` folder first (or run `blodemd new docs`)
2. Sign in with GitHub and pick the repo
3. Point at the folder with `docs.json`, then push to `main`

## What the merge publishes

Components, hosting, search, and an API reference, all from the MDX you already write. Hosted Blode.md is $0 with unlimited projects, pages, and seats — see [pricing](https://blode.md/pricing). How agents find that Markdown on the open web is in our [free online llms.txt resources](https://blode.md/free-online-llms-txt-resources).

- **GitHub auto-deploy**: install the GitHub App. Every push to main publishes. No workflow file to keep.
- **Custom domains**: point a domain, get SSL. Or proxy `/docs` on the site you already run.
- **MDX components**: 40 components: callouts, tabs, code groups, OpenAPI refs.
- **Search**: one full-text index. Same results in the docs search box.
- **Content types**: docs, blogs, changelogs, and courses on one domain, from one repo.
- **API reference**: point `docs.json` at an OpenAPI spec. Ship the reference in the same deploy.

## Keep docs on the domain they already trust

Proxy `/docs` through the marketing site. Paste-ready configs for Vercel, Cloudflare, Nginx, and Caddy.

See the [proxy guides](https://blode.md/docs/guides/proxy-vercel).

## FAQ

**What is Blode.md?**
Blode.md publishes MDX from your git repo. The pull request is the review. The merge is the deploy. You get a searchable site on your domain, plus `llms.txt` and per-page Markdown from that same commit.

**How much does Blode.md cost?**
Hosted Blode.md is $0: unlimited projects, pages, and team seats, with custom domains, search, MDX components, and API references included. The CLI and renderer are MIT-licensed if you prefer to self-host. See [pricing](https://blode.md/pricing).

**How do I get started?**
Install the CLI with `npm i -g blodemd`, run `blodemd login`, scaffold with `blodemd new docs`, then `blodemd push docs`. Or connect a GitHub repo once a docs folder with `docs.json` exists; every push to main deploys automatically.

**Do agents get Markdown, or only the HTML site?**
On every deploy the site writes `llms.txt`, `llms-full.txt`, robots.txt, a sitemap, and per-page `.md` exports from the MDX. Agents fetch those files instead of scraping HTML.

**Who builds Blode.md and how do I get support?**
Blode.md is built by [Matthew Blode](https://blode.co). For support, email [m@blode.co](mailto:m@blode.co) or open an issue on [GitHub](https://github.com/mblode/blodemd). Background is on the [About](https://blode.md/about) page.
