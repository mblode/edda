# Inciting events — Blode.md

Maps triggers for `.claude/knowledge/KEYSTONES.md`. No customer-interview findings exist. Every event below is HYPOTHESIZED until a real customer is asked, right after purchase, "what prompted you to start looking?"

## Inciting events

**E1.** The last three product PRs merged without a docs update because docs live in Notion or GitBook, and the person who can publish there was not on the PR. A user (or an agent) then follows a page that describes the old API. [K1] — HYPOTHESIZED (validate: ask new customers what prompted them to look)
Findability: mostly messaging-only ("if your docs missed the last three PRs…"). Public signals: job posts for "docs in GitBook/Notion"; changelog vs docs-page mismatch on a site. Search phrases: "docs out of date after release", "move docs from notion to github", "gitbook vs docs in repo".

**E2.** A Mintlify or GitBook invoice arrives with a per-seat or per-page jump the team will not pay for Markdown they already wrote. [K4] — HYPOTHESIZED
Findability: pricing-page comparison traffic; search phrases: "mintlify pricing", "gitbook per user", "mintlify too expensive", "open source mintlify alternative". Targetable via those queries; do not lead the homepage with savings — use this in ads and FAQ, not as the H1.

**E3.** A coding agent (Cursor, Claude, ChatGPT) answers a user from scraped HTML or a stale page. The engineer pastes the wrong snippet, or a support thread starts with "your bot said." [K3] — HYPOTHESIZED
Findability: messaging-only unless they post the thread. Search phrases: "llms.txt generator", "docs for ai agents", "stop llm scraping html", "mintlify llms.txt". The llms.txt resources page already captures some of this intent.

**E4.** A new API, SDK, or CLI is launching this week and the team will not stand up a Docusaurus/Next docs app to get a URL. [K1, K2] — HYPOTHESIZED
Findability: launch weeks, "show HN", Product Hunt, "we shipped" posts that still 404 `/docs`. Search phrases: "deploy markdown docs", "docs.json github", "mintlify alternative self host".

**E5.** Legal, brand, or SEO says docs cannot live on a third-party hostname. They need `yourproduct.com/docs` this quarter. [K2] — HYPOTHESIZED
Findability: search phrases: "proxy docs to /docs", "custom domain documentation", "mintlify custom domain". Homepage proxy snippets are the on-site answer.

## Gaps

- No observed trigger stories. Ask the next five signups: "What happened that made you look today?" File answers here and flip status to OBSERVED without renumbering.

## Next steps

Validate hypothesized events at onboarding. Synthesize strengths, keystones, deal-breakers, and these events into `CAROL.md` (`asb-carol-define`).
