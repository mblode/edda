---
"blodemd": minor
"blodemd-dev": minor
---

Split the heavy Next.js dev-server payload out of the `blodemd` CLI into a new
companion package, `blodemd-dev`.

`npx blodemd push` (and every other CLI command) now installs a lean CLI with
no `next`/`react`/Tailwind/shiki payload. `blodemd dev` keeps working: inside
the monorepo it runs `apps/dev-server` directly as before, and when installed
from npm it delegates to `blodemd-dev` (pinned to the matching version) which
vendors and boots the Next.js dev server on demand. The two packages version
and publish together.
