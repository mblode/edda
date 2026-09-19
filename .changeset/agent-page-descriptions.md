---
"blodemd": minor
"blodemd-dev": minor
---

`blodemd validate` now warns when visible pages have no frontmatter `description`. Each page's line in the generated `llms.txt` is `[title](url.md): description`, and that line is how coding agents choose which page to fetch, so a page without one lists as a bare title. Hidden pages are not reported. The scaffolded `CLAUDE.md` carries the same reminder.
