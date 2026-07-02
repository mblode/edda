# blodemd

## 0.1.0

### Minor Changes

- 661f04a: CI-grade deploys with project-scoped keys.

  - `blodemd push` now authenticates in CI with a project-scoped deploy key via
    `--api-key` or `BLODEMD_API_KEY` (sent as a Bearer token). Keys are created in
    the dashboard (Settings → Deploy keys) or printed once when `push` auto-creates
    a project.
  - `--json` on `push` and `validate` for machine-readable output; progress and
    errors go to stderr in non-interactive/CI environments so stdout stays clean.
  - New `blodemd projects` command lists your projects.
  - Clearer failures: 401s map to a distinct exit code with an actionable hint, and
    a top-level boundary prints the message + hint (no raw stack traces).

## 0.0.15

### Patch Changes

- 5e66722: `blodemd push` now authenticates with an API key via the `--api-key` flag or the
  `BLODEMD_API_KEY` environment variable, resolved before stored `blodemd login`
  credentials. This matches the documented credential order and unblocks
  non-interactive CI deploys, which previously failed with "Not logged in".

## 0.0.14

### Patch Changes

- e6b6149: Bug fixes bundled into the CLI's vendored preview/prebuild pipeline:

  - Preserve code content containing `$&`, `$1`, `` $` ``, or `$$` when generating agent markdown (was corrupted by substitution patterns).
  - `extractToc` now strips `~~~` fenced blocks (not just backticks) and guarantees unique heading ids.
  - Return `listFiles` paths relative to the listed directory so collections with a non-empty root resolve correctly.
  - Validate parsed OpenAPI specs are objects with a record-shaped `paths` before use, failing with a clear error instead of crashing.
  - Reject malformed slugs (bare, leading/trailing, or consecutive hyphens) in docs config.

  Internal: decomposed the CLI entry into focused command modules (no behavior or flag changes).

## 0.0.13

### Patch Changes

- 8260a9e: Harden `blodemd dev` runtime scaffolding so the CLI works under hoisted / npx-cache layouts where `<cliPackageRoot>/node_modules/next` isn't the package's own copy. The standalone runtime now resolves `next/package.json` through `require.resolve` and uses the owning `node_modules` directory, fixing "next not found" errors when the CLI is installed as a global or executed via `npx` without local hoisting.

## 0.0.12

### Patch Changes

- 85c7a6a: Fix `npx blodemd` failing with `Cannot find package '@repo/common'`. The CLI build now builds the workspace `@repo/*` packages before running tsdown so their compiled output is inlined into the published bundle, and the npm publish workflow runs the CLI build through turbo so `^build` ordering is respected.

## 0.0.11

### Patch Changes

- Split display name from deploy slug in project config and fix deploy workflow issues

## 0.0.10

### Patch Changes

- Fix SiteConfig format validation in docs.json previewing

## 0.0.9

### Patch Changes

- Refactor API with CORS support, header-based auth, and domains/tenants overhaul; add new CLI commands (new, scaffold, upload, logout, whoami); improve docs UI components and search

## 0.0.8

### Patch Changes

- Refactor edge-config handling, enhance CLI dev server and packaging, remove Cloudflare DNS integration

## 0.0.7

### Patch Changes

- Update docs components, icons, deployment configuration, and CLI dev server improvements including db:seed script and content directory scanning fixes

## 0.0.6

### Patch Changes

- Add product documentation at docs.blode.md, remove orbit example, rename atlas to example

## 0.0.5

### Patch Changes

- Support external content roots and improve multi-tenant doc rendering

## 0.0.4

### Patch Changes

- b04215c: Rename npm package from `blode-docs` to `blodemd`

## 0.0.3

### Patch Changes

- Migrate API to Hono and fix Vercel deployment configuration

## 0.0.2

### Patch Changes

- Fix monorepo build and deployment issues; move CLI from packages/docs-cli to apps/cli with ESM compatibility improvements.
