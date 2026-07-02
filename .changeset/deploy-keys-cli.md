---
"blodemd": minor
---

CI-grade deploys with project-scoped keys.

- `blodemd push` now authenticates in CI with a project-scoped deploy key via
  `--api-key` or `BLODEMD_API_KEY` (sent as a Bearer token). Keys are created in
  the dashboard (Settings → Deploy keys) or printed once when `push` auto-creates
  a project.
- `--json` on `push` and `validate` for machine-readable output; progress and
  errors go to stderr in non-interactive/CI environments so stdout stays clean.
- New `blodemd projects` command lists your projects.
- Clearer failures: 401s map to a distinct exit code with an actionable hint, and
  a top-level boundary prints the message + hint (no raw stack traces).
