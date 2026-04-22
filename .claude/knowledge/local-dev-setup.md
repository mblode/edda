# Local Development Setup

## Node version

- `.nvmrc` pins `24.15.0`. Use `nvm use` before running `npm run test:unit` or any vitest command so local development, CI, and deploy automation all use the same Node 24 runtime.

## Package tests

- Unit tests live alongside source as `*.unit.test.ts` and run via `npm run test:unit -- <path>` from the repo root (runs `vitest run --project unit <path>`). Example: `npm run test:unit -- packages/contracts`.
- The `pretest:unit` hook always runs `npm run build:packages` first, so package test runs type-check their compiled outputs too.

## Drizzle

- `@repo/db` uses `drizzle-kit push` (not migrations). After editing `packages/db/src/schema.ts`, run `npm run db:push` (against a live DATABASE_URL) or `npm run db:local:push` (against the Supabase local stack) to apply. No SQL migration files are generated or committed.
