# Vercel Deployment Review

This file reflects the intended post-split deployment topology as of April 23, 2026.

## Current State

- The repo targets four Vercel projects:
  - `blodemd-web` at `https://blode.md`
  - `blodemd-docs` at `https://docs.blode.md`
  - `blodemd-dashboard` at `https://app.blode.md`
  - `blodemd-api` at `https://api.blode.md`
- The web frontend owns the marketing site and performs host-preserving rewrites:
  - `/docs` to the docs frontend
  - `/app` and `/oauth/*` to the dashboard frontend
- The docs frontend remains the multi-tenant Next.js app for:
  - tenant docs on `/<slug>` behind the web rewrite
  - tenant docs on `<slug>.blode.md`
  - product docs through the tenant slug `docs`

## Production Routing Facts

- `https://blode.md/docs` resolves only if the production API can resolve a tenant with slug `docs`.
- `https://docs.blode.md` resolves only if:
  - the `docs` tenant exists in production data
  - `docs.blode.md` is aliased to `blodemd-docs`
  - wildcard or explicit DNS for `*.blode.md` reaches Vercel
- `https://blode.md/app` and `https://blode.md/oauth/consent` should stay on the `blode.md` host while being served by `blodemd-dashboard`.
- `https://app.blode.md/app` is the direct dashboard deployment URL and should serve the same dashboard/auth bytes as the web rewrite.
- The root DNS zone should include:
  - an apex `ALIAS` for `blode.md`
  - a `www` alias for `www.blode.md`
  - a wildcard `ALIAS` for `*.blode.md`

## March 31, 2026 Incident

The production issue was not a missing docs page in the app. It was a missing tenant in production data.

- Before the fix:
  - `https://docs.blode.md` failed externally
  - `https://blode.md/docs` returned a tenant-resolution `404`
  - `GET https://api.blode.md/tenants/docs` returned `404`
- After the fix:
  - the `docs` project exists in production
  - `GET https://api.blode.md/tenants/docs` returns `200`
  - `https://blode.md/docs` returns `200`
  - `https://docs.blode.md` returns `200`

## Drift To Watch

- Older notes in this repo that describe a two-project frontend topology are stale after the dashboard split.
- `blodemd-web` must keep `DOCS_APP_URL` and `DASHBOARD_APP_URL` aligned with the active docs/dashboard aliases.
- Production data still contains legacy tenants like `orbit` and `atlas`.
- Seed data expects `docs`, `blode`, and `example`; if production is recreated from scratch, verify the seed and production inventory match.

## Verification Commands

```sh
vercel project ls
vercel alias ls --limit 50
vercel dns list blode.md
curl -I https://blode.md/docs
curl -I https://docs.blode.md
curl -I https://blode.md/app
curl -I https://app.blode.md/app
curl https://api.blode.md/tenants | jq -r '.[].slug'
```
