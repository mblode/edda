# Needs Stack — Blode.md

Whose stack this is: Carol in `.claude/knowledge/CAROL.md` — the git-native MDX writer shipping a developer product, for whom the pull request is the docs review. No interview quotes; phrasing is inferred from the product record and Carol's scoreboard (correct answers from the version that shipped).

Levels are numbered in settle order. Position in the list is stack order: top ends before bottom means.

## The stack

**N6.** ★ Be trusted as the person whose product developers can actually use — the docs were right, the integration worked, nobody got burned. — _purpose level: no product satisfies this directly; material for higher-purpose stories, never for promises._

**N5.** → Developers adopt the product (they integrate, they stay, they tell someone else).
Occupants: DX programs, "read the docs" onboarding, community, sales engineers, comparison blogs.
Role: aspiration — show the part you play; never promise adoption.
Why your level still wins for Carol: she keeps the docs in the same PR as the feature. An adoption agency or a docs CMS would take that away.

**N4.** → A user or a coding agent gets the current, correct answer about the product.
Occupants: the docs site itself; ChatGPT / Cursor / Claude fetching docs; support; "ask our bot."
Role: **the promise** — the outcome claimed as a consequence of N1.
Why your level still wins for Carol: she keeps git as source of truth. A hosted AI search box on stale CMS copy would obviate the _reading_ and still be wrong.

**N1.** → Publish versioned MDX docs from the same git repo as the product. ← YOU ARE HERE
Occupants: Blode.md; Mintlify; Docusaurus; VitePress; GitBook (git sync); ReadMe.
Role: **what you do** — features live here; meet searchers where they are.

**N2.** → Run a docs renderer, search index, SSL, and a custom domain (or `/docs` proxy) yourself.
Occupants: Vercel + Docusaurus; Cloudflare Pages + VitePress; nginx + static site; self-hosted Mintlify-shaped renderers.
Role: advancement — a step you make obsolete; brag about it.

**N3.** → Buy servers, blobs, and a database so a docs app can run.
Occupants: Vercel, Fly, Railway, AWS, a Postgres you already have (self-host plan).
Role: advancement — hosted Blode.md makes this invisible; self-host still touches it, which is the trade-off that plan exists for.

## Uses beyond positioning

Measure whether Carol's readers get the _current_ answer (one level up: N4), not only whether a deploy succeeded (N1). Purpose level N6 is the story you tell when a launch goes out and the docs match. Moving the product up to "make developers adopt you" is a different business; the realistic climb is agent exports, `/docs` on their domain, and keeping git as the review.

## Next steps

The stack feeds positioning: features at N1, promise N4, aspiration N5/N6, brag about obviating N2/N3, counter Mintlify/GitBook/Docusaurus at N1 and AI-search-on-CMS at N4. Convert homepage copy with `asb-positioning` against this file and `CAROL.md`.
