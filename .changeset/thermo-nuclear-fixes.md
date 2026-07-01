---
"blodemd": patch
---

Bug fixes bundled into the CLI's vendored preview/prebuild pipeline:

- Preserve code content containing `$&`, `$1`, `` $` ``, or `$$` when generating agent markdown (was corrupted by substitution patterns).
- `extractToc` now strips `~~~` fenced blocks (not just backticks) and guarantees unique heading ids.
- Return `listFiles` paths relative to the listed directory so collections with a non-empty root resolve correctly.
- Validate parsed OpenAPI specs are objects with a record-shaped `paths` before use, failing with a clear error instead of crashing.
- Reject malformed slugs (bare, leading/trailing, or consecutive hyphens) in docs config.

Internal: decomposed the CLI entry into focused command modules (no behavior or flag changes).
