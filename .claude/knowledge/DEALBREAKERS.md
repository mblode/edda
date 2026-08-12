# Deal-breakers — Blode.md

Works from `.claude/knowledge/STRENGTHS-WEAKNESSES.md` and `.claude/knowledge/KEYSTONES.md`. Deal-breakers disqualify outright and trump keystones. Friction items cost points but disqualify no one.

## Deal-breakers

**D1.** The writer will not use git or MDX. They need a WYSIWYG or a CMS as the source of truth. [W1]
Anti-market segments: mixed product/marketing teams whose docs live in GitBook, Notion, or Confluence; technical writers who are not granted repo access.

**D2.** Purchase requires SOC 2, SSO/SAML procurement, a signed SLA, or a named customer-success manager. [W2]
Anti-market segments: enterprise IT/security review for a company that cannot put a solo-founder MIT host on the vendor list.

**D3.** The buyer needs a vendor with a public customer roster, category-roundup presence, or a paid contract they can show finance. [W3, W4]
Anti-market segments: procurement-led evaluations that score "references" and "viability" before a trial; teams forbidden from depending on a `$0` host with no stated paid plan.

**D4.** The purchase requires first-party themes, first-party analytics dashboards, or a team-accounts product as shipped today. [W5]
Anti-market segments: docs teams whose RFP lists those three as must-haves; companies that will not BYO PostHog or wait on the intro-post roadmap.

**D5.** The team is GitLab- or Bitbucket-only and will only buy a zero-config _app_ install on that host (not a CLI/CI key). [W7]
Anti-market segments: GitLab.com shops whose policy is "no GitHub App, no CLI tokens."

## Friction (costs points; disqualifies no one)

- Pruned Mintlify `docs.json` surface — a migrating Mintlify project may need to drop unsupported keys; that is conversion work, not an automatic no unless they demanded a byte-identical schema (not recorded as a deal-breaker without that evidence). [W6]
- One GitHub star and no testimonials — slows a cautious buyer; D3 covers the ones who refuse. [W3]

## Anti-market statement

Do not spend ads, sales time, or roadmap on: non-git writers, enterprise procurement that needs SOC 2/SSO/SLA, buyers who require a famous vendor logo wall, or teams whose must-have list is themes + first-party analytics + team accounts. Homepage language should tell a GitBook/Notion writer they are in the wrong place ("the pull request is the review") and should not impersonate Mintlify Enterprise. Do not build a WYSIWYG to chase that tail.

## Strategy-input list (fix-it ideas parked during the walk)

- GitLab App install would remove D5 — parked; that is a new market, not a qualifier dodge.
- SOC 2 / SSO would remove D2 — parked; that is a different company.
- Paid hosted tier would change D3 for viability-anxious buyers — parked; pricing strategy is its own decision.
- First-party themes/analytics/team accounts are already on the intro-post list — parked here so they are not treated as shipped.

## Next steps

Inciting events couple to the honed keystones in `KEYSTONES.md`. Then `asb-carol-define` synthesizes Carol.
