# blodemd-dev

## 1.0.0

### Major Changes

- ab834cb: **Breaking:** the published CLI is now `edda-docs` (bin `edda`). The previous unscoped `blodemd` package name is retired. Bare `edda` is taken on npm, and the package name must not include Blode. Install with `npm i -g edda-docs`. The `blodemd` binary remains as a compatibility alias.

  The companion dev-server package is now `edda-docs-dev` (bins `edda-dev` and `blodemd-dev`).

  `EDDA_API_KEY`, `EDDA_PROJECT`, `EDDA_API_URL`, `EDDA_BRANCH`, and `EDDA_COMMIT_MESSAGE` are the documented environment variables. The previous `BLODEMD_*` names still work.

### Minor Changes

- cb1255a: `blodemd validate` now warns when visible pages have no frontmatter `description`. Each page's line in the generated `llms.txt` is `[title](url.md): description`, and that line is how coding agents choose which page to fetch, so a page without one lists as a bare title. Hidden pages are not reported. The scaffolded `CLAUDE.md` carries the same reminder.

## 0.2.2

### Patch Changes

- ec5af14: Update dependencies across the CLI and dev-server template, and fix a cancel-handling bug the upgrade uncovered.

  `@clack/prompts` 1.8 types a prompt's result as `T | symbol` but narrows `isCancel` to a `unique symbol`, so the negative branch never dropped `symbol` and cancelling a prompt could carry a symbol into code expecting a string. `isCancel` is now wrapped once behind a proper `value is symbol` guard, so pressing Ctrl+C during `blodemd new` or `blodemd push` exits cleanly at every prompt.

## 0.2.1

## 0.2.0

### Minor Changes

- c248a58: Split the heavy Next.js dev-server payload out of the `blodemd` CLI into a new
  companion package, `blodemd-dev`.

  `npx blodemd push` (and every other CLI command) now installs a lean CLI with
  no `next`/`react`/Tailwind/shiki payload. `blodemd dev` keeps working: inside
  the monorepo it runs `apps/dev-server` directly as before, and when installed
  from npm it delegates to `blodemd-dev` (pinned to the matching version) which
  vendors and boots the Next.js dev server on demand. The two packages version
  and publish together.
