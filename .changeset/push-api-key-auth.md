---
"blodemd": patch
---

`blodemd push` now authenticates with an API key via the `--api-key` flag or the
`BLODEMD_API_KEY` environment variable, resolved before stored `blodemd login`
credentials. This matches the documented credential order and unblocks
non-interactive CI deploys, which previously failed with "Not logged in".
