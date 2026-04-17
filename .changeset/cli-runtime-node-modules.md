---
"blodemd": patch
---

Harden `blodemd dev` runtime scaffolding so the CLI works under hoisted / npx-cache layouts where `<cliPackageRoot>/node_modules/next` isn't the package's own copy. The standalone runtime now resolves `next/package.json` through `require.resolve` and uses the owning `node_modules` directory, fixing "next not found" errors when the CLI is installed as a global or executed via `npx` without local hoisting.
