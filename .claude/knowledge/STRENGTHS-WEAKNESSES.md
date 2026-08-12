# Strengths & Weaknesses — Blode.md

Distilled from `.claude/knowledge/OBSERVATIONS.md`. Attributes classified with the two-question rubric. Evidence is the public product record; there are no customer-interview citations.

Best-vs-worst differential on the record: the designed-in split is a buyer who already writes MDX in git and reviews docs in pull requests versus a buyer who wants a WYSIWYG/CMS editor. No observed P&L differential.

## Strengths

**S1.** Docs are MDX files in the customer's git repo. The pull request is the review. The merge is the deploy. [O3, O4, O30, O31]
Rubric: 1b — this is the reason the intro post says the product exists; a CMS-shaped buyer is told to look elsewhere.

**S2.** Hosted is `$0` with unlimited projects, pages, and seats, including custom domains, search, MDX components, and API references. [O1, O32]
Rubric: 1a/1b — per-seat and per-page pricing is the competitor behavior the intro post names; `$0` unlimited is the counter.

**S3.** CLI, renderer, and API are MIT. Hosted and self-host use the same CLI. No license keys on self-host. [O2, O32]
Rubric: 1b — some buyers will only run software they can inspect and host; the pricing page offers that path as a first-class plan.

**S4.** On every deploy the site emits `llms.txt`, `llms-full.txt`, and per-page `.md` from the same MDX humans browse. [O5, O25]
Rubric: 1b — the product treats agent-readable Markdown as a publish output, not a hand-maintained extra file.

**S5.** Two publish paths: `blodemd push` after GitHub browser login, and a GitHub App that deploys on push to `main`. CI uses a project-scoped deploy key. [O4]
Rubric: 1a — git-native teams already expect this shape; the CLI is the path that does not require a workflow file for local deploys.

**S6.** `/docs` can be proxied onto the customer's existing domain. Homepage ships paste-ready Vercel, Cloudflare, Nginx, and Caddy configs. [O6]
Rubric: 1b — some teams will refuse a `*.blode.md` URL as the public docs origin.

**S7.** No plugin marketplace and no second editor. Features that do not move docs closer to the code do not ship. [O9, O30, O31]
Rubric: 1b — the same attribute is a weakness for marketplace/CMS buyers (see W1). Flagged as both.

**S8.** Support is the founder at `m@blode.co` or a GitHub issue. [O10, O22]
Rubric: 1b — a small-team buyer who wants a human, not a ticket queue. Also a weakness for buyers who need an SLA (see W2).

## Weaknesses

**W1.** <= S7; deliberately both — segments disagree: git-native MDX authors read "no marketplace, no CMS editor" as the point; mixed teams who need a WYSIWYG (GitBook's market) read it as a hard gap. [O9, O12, O31]
Rubric: 2b — a non-technical writer who will not use git cannot use the product as designed.

**W2.** <= S8; deliberately both — solo/small-team buyers may want the founder; buyers who need SOC 2, SSO procurement, an SLA, or a named CSM cannot buy. [O10, O22]
Rubric: 2b — enterprise procurement that requires vendor certifications and 24/7 support will refuse.

**W3.** No public customers, testimonials, or category-roundup presence. GitHub: 1 star, 0 forks. [O17, O18, O21]
Rubric: 2a — a third of a cautious market will not pick an unlisted vendor over Mintlify or GitBook.

**W4.** Hosted has no revenue. Paid tiers are explicitly "later." [O16, O20]
Rubric: 2a — buyers who need a vendor they believe will still be hosting in three years will hesitate; some will refuse.

**W5.** First-party themes, first-party analytics, and a team-accounts product are named as not yet shipped. [O15, O33]
Rubric: 2b — a team whose purchase requires those three will wait or buy Mintlify/GitBook.

**W6.** `docs.json` is a pruned Mintlify-shaped schema, not the full Mintlify surface. [O11, O27]
Rubric: 2b — a team expecting every Mintlify component and config key to work unchanged will hit missing surface.

**W7.** GitHub App auto-deploy is GitHub-shaped. GitLab/Bitbucket are not documented as first-class app installs. [O4]
Rubric: 2b — a GitLab-only shop cannot use the zero-config GitHub App path (CLI/CI may still work; the App path does not).

## Cuts (nobody cares — attention stops here)

- Dual `Tenant` types and Edge Config header plumbing — real architecture, not a customer-facing attribute. [O23, O24]
- Exact MDX tag count as a brag by itself — 40 is a spec, not a reason to buy, until it sits under a feature claim. [O26]

## Notes for downstream steps (parked, not attributes)

- Homepage hero ("knowledge layer") does not match S1 — for positioning: the current H1 is a mechanism/aspiration claim at the wrong level.
- Designed anti-customer is the WYSIWYG/CMS writer — for deal-breakers.
- Agent-wrong-answer-from-stale-docs is the hypothesized trigger — for inciting events; not observed.
- Do not claim "Mintlify compatible" — for positioning truth gate. [W6]

## Next steps

Refine each strength into keystones — the circumstances that make a customer need an extreme version of it — then mirror that work on the weaknesses (deal-breakers and the anti-market). That is `asb-carol-keystones` on this file.
