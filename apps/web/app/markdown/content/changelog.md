# Changelog

Latest updates to the Edda platform.

## September 2026

- Published Docs for agents: what every deploy writes for agents, why the `llms.txt` link in each Markdown twin matters, and what to put in page descriptions.
- `edda validate` now warns when pages have no description, since that line is how agents pick pages from `llms.txt`.
- Consolidated the `Link` header on tenant docs to the rels scanners probe: `describedby` and the llmstxt.org rel for `llms.txt`, a `text/markdown` alternate per page, and the agentskills.io rel for the skills index.
- Updated the edda agent skill to verify `llms.txt` and the `.md` exports on the live site after a push.

## April 2026

- Split marketing, docs, and dashboard into separate deployments.
- Added tenant-aware `llms.txt`, sitemap, and robots outputs.
- Added GitHub app installation and deploy flows for docs projects.
