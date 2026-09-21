---
"edda-docs": major
"edda-docs-dev": major
---

**Breaking:** the published CLI is now `edda-docs` (bin `edda`). The previous unscoped `blodemd` package name is retired. Bare `edda` is taken on npm, and the package name must not include Blode. Install with `npm i -g edda-docs`. The `blodemd` binary remains as a compatibility alias.

The companion dev-server package is now `edda-docs-dev` (bins `edda-dev` and `blodemd-dev`).

`EDDA_API_KEY`, `EDDA_PROJECT`, `EDDA_API_URL`, `EDDA_BRANCH`, and `EDDA_COMMIT_MESSAGE` are the documented environment variables. The previous `BLODEMD_*` names still work.
