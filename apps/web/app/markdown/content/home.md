# Blode.md

> No second editor. On purpose.

Write MDX in the repo. The pull request is the review. The merge publishes the site, including the Markdown agents fetch from that commit. Hosted is $0. MIT if you self-host.

Last updated: 12 August 2026

## Get started

- [Connect GitHub](https://blode.md/oauth/consent)
- [Read the docs](https://blode.md/docs)
- [Pricing](https://blode.md/pricing)

## How it works

Sign in with GitHub and push. You do not run Docusaurus, a search index, or a custom-domain pipeline to get a public URL. The merge publishes the site from that commit.

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

No plugin marketplace. No second editor. No SOC 2, no SSO, no logo wall. Support is the founder. If a feature does not move docs closer to the code, it does not ship. Hosted Blode.md is $0 with unlimited projects, pages, and seats — see [pricing](https://blode.md/pricing). How agents find that Markdown on the open web is in our [free online llms.txt resources](https://blode.md/free-online-llms-txt-resources).

- **GitHub auto-deploy**: install the GitHub App. Every push to main publishes. No workflow file to keep.
- **Custom domains**: point a domain, get SSL. Or proxy `/docs` on the site you already run.
- **Search**: full-text search included. No separate Algolia project to bill.
- **Content types**: docs, blogs, changelogs, and courses on one domain, from one repo.
- **API reference**: point `docs.json` at an OpenAPI spec. Ship the reference in the same deploy.
- **MIT if we disappear**: same CLI and renderer, your Postgres.

## Keep docs on the domain they already trust

Proxy `/docs` through the marketing site. Paste-ready configs for Vercel, Cloudflare, Nginx, and Caddy.

See the [proxy guides](https://blode.md/docs/guides/proxy-vercel).

## FAQ

**Is this Mintlify without the seats?**
It is the git-native MDX path without the seat tax, the plugin marketplace, or a second editor. We do not claim drop-in compatibility with every Mintlify config key.

**How much does Blode.md cost?**
Hosted Blode.md is $0: unlimited projects, pages, and team seats, with custom domains, search, MDX, and API references included. What you do not get: a visual editor, a plugin marketplace, SOC 2, SSO, an SLA, or a logo wall. Support is the founder. The CLI and renderer are MIT. See [pricing](https://blode.md/pricing).

**Is there a visual editor?**
No. The pull request is the review. If your team writes docs in a CMS instead of git, this is the wrong tool.

**Do I have to stand up Docusaurus?**
No. Sign in with GitHub and push.

**Do agents get Markdown, or only the HTML site?**
On every deploy the site writes `llms.txt`, `llms-full.txt`, robots.txt, a sitemap, and per-page `.md` exports from the MDX. Agents fetch those files instead of scraping HTML.

**Who builds Blode.md and how do I get support?**
Blode.md is built by [Matthew Blode](https://blode.co). For support, email [m@blode.co](mailto:m@blode.co) or open an issue on [GitHub](https://github.com/mblode/blodemd). Background is on the [About](https://blode.md/about) page.
