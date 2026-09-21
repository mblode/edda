# Vercel Deployment - Target Setup

This file reflects the repo target after the dashboard split as of April 23, 2026. Verify aliases before treating it as live.

## Active Projects

| Surface            | Vercel Project   | Root Directory   | Build Command                          | Output Directory  | Production URL          |
| ------------------ | ---------------- | ---------------- | -------------------------------------- | ----------------- | ----------------------- |
| Web frontend       | `edda-web`       | `.`              | `npx turbo run build --filter=web...`  | `apps/web/.next`  | `https://blode.md`      |
| Docs frontend      | `edda-docs`      | `.`              | `npx turbo run build --filter=docs...` | `apps/docs/.next` | `https://docs.blode.md` |
| Dashboard frontend | `edda-dashboard` | `apps/dashboard` | `bash ./scripts/vercel-build.sh`       | `.next`           | `https://app.blode.md`  |
| API                | `edda-api`       | `apps/api`       | `npx turbo run build --filter=api...`  | `dist`            | `https://api.blode.md`  |

## Domain Notes

- `blode.md` and `www.blode.md` point at `edda-web`.
- `blode.md/docs` is a host-preserving rewrite from `edda-web` to `edda-docs`.
- `blode.md/app` and `blode.md/oauth/*` are host-preserving rewrites from `edda-web` to `edda-dashboard`.
- `docs.blode.md` and `*.blode.md` point at `edda-docs`.
- `app.blode.md` points at `edda-dashboard`.
- `api.blode.md` points at `edda-api`.
- Product docs are tenant content, not a special hardcoded route. Both `https://docs.blode.md` and `https://blode.md/docs` work only when the production API contains a tenant with slug `docs`.

## Re-Linking A Project

If you need to relink any project in Vercel:

### Web frontend

1. Open `https://vercel.com/blode/edda-web/settings/git`.
2. Connect `mblode/edda`.
3. Set **Root Directory** to `.`.
4. Keep the project build settings in sync with [apps/web/vercel.json](/Users/mblode/Code/mblode/edda/apps/web/vercel.json).

### Docs frontend

1. Open `https://vercel.com/blode/edda-docs/settings/git`.
2. Connect `mblode/edda`.
3. Set **Root Directory** to `.`.
4. Keep the project build settings in sync with [apps/docs/vercel.json](/Users/mblode/Code/mblode/edda/apps/docs/vercel.json).

### Dashboard frontend

1. Open `https://vercel.com/blode/edda-dashboard/settings/git`.
2. Connect `mblode/edda`.
3. Set **Root Directory** to `.`.
4. Keep the project build settings in sync with [apps/dashboard/vercel.json](/Users/mblode/Code/mblode/edda/apps/dashboard/vercel.json).

### API

1. Open `https://vercel.com/blode/edda-api/settings/git`.
2. Connect `mblode/edda`.
3. Set **Root Directory** to `apps/api`.
4. Keep the project build settings in sync with [apps/api/vercel.json](/Users/mblode/Code/mblode/edda/apps/api/vercel.json).

## Required Environment Variables

### `edda-web`

- `DOCS_APP_URL`
- `DASHBOARD_APP_URL`

### `edda-docs`

- `NEXT_PUBLIC_API_URL`
- `PLATFORM_ROOT_DOMAIN`
- `REVALIDATE_SECRET`
- optional `EDGE_CONFIG`
- optional `PLATFORM_ASSET_PREFIX` — defaults to `/_docs` on Vercel so docs
  chunks do not collide with the marketing build's `/_next/*`. Overriding it
  means updating `DOCS_ASSET_PREFIX` in `apps/web/next.config.js` to match.

### `edda-dashboard`

- `DATABASE_URL`
- `NEXT_PUBLIC_API_URL`
- `PLATFORM_ROOT_DOMAIN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_JWT_SECRET`
- optional `PLATFORM_ASSET_PREFIX` — defaults to `/_app` on Vercel so dashboard
  chunks do not collide with the marketing build's `/_next/*`. Overriding it
  means updating `DASHBOARD_ASSET_PREFIX` in `apps/web/next.config.js` and the
  `/_app/_next` rewrite in `apps/docs/next.config.js` to match.

`edda-dashboard` runs `npm run db:push:ci --workspace=packages/db` as part of
production builds before Next.js compiles. That keeps the production schema in
sync with the deployed dashboard code and prevents schema drift from breaking
`/app`.

### `edda-api`

- `DATABASE_URL`
- `DOCS_APP_URL`
- optional `DOCS_REVALIDATE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BLOB_READ_WRITE_TOKEN`
- `PLATFORM_ROOT_DOMAIN`
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`
- optional `VERCEL_TEAM_ID`
- optional `VERCEL_TEAM_SLUG`
- optional `VERCEL_EDGE_CONFIG_ID`

## Verification Checklist

- `vercel project ls` shows `edda-web`, `edda-docs`, `edda-dashboard`, and `edda-api`.
- `vercel alias ls` includes `blode.md`, `docs.blode.md`, `app.blode.md`, and `api.blode.md`.
- `curl -I https://blode.md/docs` returns `200`.
- `curl -I https://docs.blode.md` returns `200`.
- `curl -I https://blode.md/app` returns `307` to `/oauth/consent` when unauthenticated.
- `curl -I https://app.blode.md/app` returns `307` to `/oauth/consent` when unauthenticated.
