# Blode.md

> Docs your users love. And their AI understands.

Ship Markdown docs from your terminal in minutes. Versioned, searchable, and built so the LLMs your users ask can actually read them.

## Get started

- [Sign in with GitHub](https://blode.md/oauth/consent)
- [Read the docs](https://blode.md/docs)

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

Components, hosting, search, and an API reference, all from the same repo. Everything to keep people and agents reading the same docs. Background on the Markdown index agents fetch is in our [free online llms.txt resources](https://blode.md/free-online-llms-txt-resources).

- **GitHub auto-deploy**: install once. Every push to your branch deploys in seconds.
- **Custom domains**: point a domain, get SSL. Or proxy docs at yourdomain.com/docs.
- **MDX components**: 30+ out of the box: callouts, tabs, code groups, API refs.
- **Search**: full-text search across every page. No plugin, no config.
- **Content types**: docs, blogs, changelogs, and courses in one project, one domain.
- **API reference**: point at an OpenAPI spec, ship an interactive API reference.

## Keep docs on your domain

Proxy `/docs` through your marketing site so Blode.md never looks like a detour. Ready-made configs for Vercel, Cloudflare, Nginx, and Caddy.

See the [proxy guides](https://blode.md/docs/guides/proxy-vercel).
