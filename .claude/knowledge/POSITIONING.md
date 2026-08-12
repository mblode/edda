# Positioning statements — Blode.md

Targets Carol (`.claude/knowledge/CAROL.md`) as a **hypothesis**; until onboarding interviews exist, the about page speaks first-person as the founder. Needs stack: `.claude/knowledge/NEEDS-STACK.md`. Voter: `.claude/knowledge/VOTERS.md`.

## Locked decisions (2026-08-12 rude-QA)

These are real decisions. The opposite of each is also smart. Consequences are accepted.

1. **Named enemy is Mintlify** (price/surface fork with a harder refusal), not GitBook and not Docusaurus. GitBook is D1 anti-market in the FAQ. Docusaurus is P10 (you do not stand up the app) — supporting, not the H1 war. Accepted: we cannot steal "git-native MDX" as the H1; we say we are the smaller, stricter Mintlify. We do not claim drop-in `docs.json` compatibility.
2. **Price story is More for Less.** A real git-native host (custom domains, search, MDX, API refs, agent Markdown, unlimited seats) at `$0` hosted / MIT self-host, with **named** trade-offs: no WYSIWYG, no plugin marketplace, no SOC 2/SSO/SLA, founder support, pruned config surface. `$0` is a fact. "Get started free" and "What's the catch? None." are retired. Accepted: D3 buyers who need a paid viability story still bounce.
3. **H1 is V1** (the refusal), not P1 (the shared promise). P1 closes the page. Accepted: mixed teams who want a web editor bounce on the first line.
4. **Carol stays hypothesized.** Homepage says "you" to a git-native MDX writer. About is first-person. Hypothesized inciting events (P13) do not appear as commiseration until they are observed in onboarding.

Statements are numbered in settle order. Homepage copy should reuse these, not invent a parallel story.

## What you promise (one level up)

**P1.** The answer they read matches the commit you merged. [N4; K1]
Reworked from: "Docs that match the code you shipped." Homepage role: **closing H2**, not the H1 (stealable vs Mintlify).

**P2.** A coding agent answering from your docs is answering from the commit you merged — `llms.txt` and `.md` pages come from that same deploy, not from scraped HTML. [N4; K3]
Reworked from: "AI agents learn your product from your docs."

## What you do (your level — features)

**P3.** Write MDX in the repo. The pull request is the review. The merge publishes the site. [N1; K1]
Reworked from: "Docs that ship with the code." Homepage role: subhead.

**P4.** Two publish paths: `blodemd login` → `blodemd new docs` → `blodemd push docs`, or install the GitHub App and push to `main` once a folder with `docs.json` exists. [N1; S5]
Homepage role: How-it-works tabs. CTA verb is "Connect GitHub" (the oauth click), not "Start shipping."

**P5.** Callouts, tabs, code groups, OpenAPI refs — the component map lives in the docs, not as a homepage brag. [N1]
Reworked from: "40 components" on the homepage (cut: a spec, not a reason to buy).

**P6.** Point `docs.json` at an OpenAPI spec and ship the API reference in the same deploy as the guides. [N1]

**P7.** Hosted Blode.md is `$0` — unlimited projects, pages, and seats — with custom domains, search, MDX, and API references included. The CLI and renderer are MIT if you want the same binary on your own Postgres. [N1; K4]
Homepage role: subhead + viability card. Not the button.

## Against the vendors above (bracket cites the level countered)

**P8.** Mintlify's git workflow is MDX in the repo, plus a web editor that commits back, plus seats and a marketplace. Blode.md is that git path without the editor, the marketplace, or the seat tax. We do not claim drop-in compatibility with every Mintlify config key. [N1; V1; W6]
Gap-fill: named enemy. Homepage role: FAQ H2 ("Is this Mintlify without the seats?").

**P8b.** A docs CMS (GitBook, Notion, Confluence) will take the writing out of the pull request. If that is the workflow you want, this is the wrong tool. [N4; K1; D1]
Supporting anti-market. FAQ "Is there a visual editor?" — not the H1. Do not say "most docs tools want you to leave your editor"; that is false of Mintlify's git workflow.

**P9.** An AI search box on top of drifted CMS copy still answers from the wrong version. Blode.md does not replace git with a bot; it publishes Markdown from the same commit the HTML came from. [N4; K3]

## What you make obsolete (below)

**P10.** You do not stand up a Docusaurus or Next docs app, a search index, SSL, or a custom-domain pipeline to get a URL. Sign in with GitHub and push. [N2; E4]
Homepage role: TextReveal + How-it-works body. Not the named enemy.

**P11.** Hosted: you do not buy a separate docs renderer, blob store, or database. Self-host: same CLI, your Postgres — that plan exists for the buyer who still wants N3, and for the bus-factor case. [N2, N3]

**P12.** You do not hand-author `llms.txt` on every release. The deploy writes `llms.txt`, `llms-full.txt`, and per-page `.md` from the MDX. [N2; K3]

## Commiseration (inciting events — provenance marked in the bracket)

**P13.** Docs that live in a separate CMS lag the release. Then the agent answering your users cites the old API. [E1, E3] — HYPOTHESIZED. **Do not use on the homepage** until observed in onboarding. The about page may state the founder's reason for building; it may not impersonate a customer quote.

**P14.** If brand or SEO will not let docs live on a third-party hostname, proxy `/docs` through the site you already run. Paste-ready configs for Vercel, Cloudflare, Nginx, and Caddy. [E5; K2] — trigger hypothesized; configs shipped.

## Aspirations (reference, never promise)

**P15.** When the feature and the docs merge together, the integration a developer attempts is the one you actually shipped. That is the part Blode.md plays in adoption — it does not claim it will get you the users. [N5, N6]

## The H1 (voter)

**P16.** No second editor. On purpose. [V1]
Mintlify added a web editor. We will not. Opposite: ship a visual editor so mixed teams can write without a repo — that is a rational product (Mintlify picked it). Homepage role: **H1**. SEO title must say the same thing.

## Retired without a statement

- "The knowledge layer your AI runs on." / "The knowledge layer belongs with the code." / "Your docs are your AI interface." — killed by level fit, Opposite Test, and the about-page recant.
- "Ship the knowledge layer your AI needs."
- "Get started free." / "Start shipping." — fluff; Opposite of "don't start" is nonsense. Replaced by "Connect GitHub."
- "What's the catch? None." — contradicts More for Less. Replaced by named trade-offs.
- "Most docs tools want you to leave your editor. Blode.md doesn't." — true of GitBook, false of Mintlify's git workflow. Retired from homepage/H1. The intro post may keep it as origin history.
- "One MDX project, one domain, one price."
- "fast docs" / "in seconds" / "in about a minute" / "under a minute" — unverified timing.
- "40 components" as a homepage brag.
- "Docs that match the code you shipped." as H1 — stealable vs Mintlify. Survives as P1 on the close.

## Facts to verify

- ~~[VERIFY: MDX component count]~~ — 40 named tags; not a homepage claim.
- [VERIFY: rebuild duration] — not used.
- [VERIFY: E1/E3 as observed] — still hypothesized; P13 stays off the homepage.

## Next steps

Ask the next five signups what prompted them, verbatim. Do not run commiseration ads on E1/E3 until observed.
