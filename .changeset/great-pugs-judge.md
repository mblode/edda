---
"blodemd": patch
"blodemd-dev": patch
---

Update dependencies across the CLI and dev-server template, and fix a cancel-handling bug the upgrade uncovered.

`@clack/prompts` 1.8 types a prompt's result as `T | symbol` but narrows `isCancel` to a `unique symbol`, so the negative branch never dropped `symbol` and cancelling a prompt could carry a symbol into code expecting a string. `isCancel` is now wrapped once behind a proper `value is symbol` guard, so pressing Ctrl+C during `blodemd new` or `blodemd push` exits cleanly at every prompt.
