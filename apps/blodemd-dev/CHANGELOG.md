# blodemd-dev

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
