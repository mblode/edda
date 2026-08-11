# Blode.md

> Docs your users love. And their AI understands.

Ship Markdown docs from your terminal in minutes. Versioned, searchable, and built so the LLMs your users ask can actually read them.

Last updated: 11 August 2026

## Get started

- [Sign in with GitHub](https://blode.md/oauth/consent)
- [Read the docs](https://blode.md/docs)
- [Pricing](https://blode.md/pricing)

## How it works

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

## What you get

Components, hosting, search, and an API reference, all from the same repo. Hosted Blode.md is free with unlimited projects, pages, and seats — see [pricing](https://blode.md/pricing). Background on the Markdown index agents fetch is in our [free online llms.txt resources](https://blode.md/free-online-llms-txt-resources).

- **GitHub auto-deploy**: install once. Every push to your branch deploys in seconds.
- **Custom domains**: point a domain, get SSL. Or proxy docs at yourdomain.com/docs.
- **MDX components**: 30+ out of the box: callouts, tabs, code groups, API refs.
- **Search**: full-text search across every page. No plugin, no config.
- **Content types**: docs, blogs, changelogs, and courses in one project, one domain.
- **API reference**: point at an OpenAPI spec, ship an interactive API reference.

## Keep docs on your domain

Proxy `/docs` through your marketing site so Blode.md never looks like a detour. Ready-made configs for Vercel, Cloudflare, Nginx, and Caddy.

See the [proxy guides](https://blode.md/docs/guides/proxy-vercel).

## FAQ

**What is Blode.md?**
Blode.md is a documentation platform for MDX projects. Keep docs in your git repo, deploy with the CLI or GitHub auto-deploy, and serve versioned, searchable docs that people and AI agents can both read.

**How much does Blode.md cost?**
Hosted Blode.md is free: unlimited projects, pages, and team seats, with custom domains, search, MDX components, and API references included. The CLI and renderer are MIT-licensed if you prefer to self-host. See [pricing](https://blode.md/pricing).

**How do I get started?**
Install the CLI with `npm i -g blodemd`, run `blodemd login`, scaffold with `blodemd new docs`, then `blodemd push docs`. Or connect a GitHub repo once a docs folder with `docs.json` exists; every push to main deploys automatically.

**Is Blode.md built for AI agents?**
Yes. Sites get `llms.txt`, `llms-full.txt`, robots.txt, sitemaps, and per-page Markdown exports so agents can load concise docs without scraping HTML.

**Who builds Blode.md and how do I get support?**
Blode.md is built by [Matthew Blode](https://blode.co). For support, email [m@blode.co](mailto:m@blode.co) or open an issue on [GitHub](https://github.com/mblode/blodemd). Background is on the [About](https://blode.md/about) page.
