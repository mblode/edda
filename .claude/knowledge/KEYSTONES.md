# Keystones — Blode.md

Refines `.claude/knowledge/STRENGTHS-WEAKNESSES.md`. Keystones are customer circumstances that REQUIRE an extreme version of a strength. Segment lines below are honed — see change log.

## Keystones

**K1.** Docs are reviewed the same way code is: the only review that exists is a git pull request, and the writer is already in an editor. A second CMS or WYSIWYG would split the release. [S1, S7]
Example segments: a DX engineer or founder shipping an API, SDK, CLI, or library who already keeps Markdown/MDX in the product repo; a team that tried GitBook or Notion and watched docs lag the last three releases because the editor was not in the PR.

**K2.** The public docs origin must be the product domain (typically `/docs` on the marketing site), not a `*.otherdocs.com` hostname. [S6]
Example segments: a developer-tool company whose users and agents already trust `yourproduct.com`; a team proxying through Vercel, Cloudflare, Nginx, or Caddy.

**K3.** Agents (Cursor, Claude, ChatGPT, internal RAG) already answer product questions from docs, so the Markdown those agents fetch must be produced by the same deploy as the HTML. A hand-maintained `llms.txt` that can drift is not acceptable. [S4]
Example segments: a team whose users paste docs URLs into coding agents; a product whose support load is now "the agent told me X" against last week's API.

**K4.** Will not pay per-seat or per-page for a docs host, and will not accept a license key to publish Markdown they already wrote. [S2, S3]
Example segments: a solo founder or a small engineering team that just saw a Mintlify/GitBook seat quote; an open-source project that will only run MIT software; a team that wants the option to self-host the same CLI later.

## Table stakes (true, but compels no one — cut)

- GitHub App + CLI publish paths — expected of any git-native docs host in 2026; Mintlify and others already do this. Compels no one by itself. [S5]
- Founder answers email — nice for some, not a circumstance that requires an extreme version unless the buyer is already in the "no procurement" segment, which is covered by K4 and D2. [S8]

## Change log

- 2026-08-12: K1 segment honed — added 'writer already in an editor / PR is the only review' and excluded WYSIWYG-first teams [D1]. K2 honed — public origin must be the product domain [D1, D5]. K3 honed — agents already answering from docs; hand-maintained llms.txt is not enough [D4]. K4 honed — per-seat/per-page refusal plus MIT/self-host option [D2, D3]. K-table-stakes (GitHub App, founder email) reviewed — GitHub App remains table stakes; founder email not promoted.

## Next steps

Inciting events — the trigger moments that move a keystone-fit customer from could-buy to buying-today — live in `INCITING-EVENTS.md`. Deal-breakers that honed these segments live in `DEALBREAKERS.md`.
