# Positioning statements — Blode.md

Targets Carol (`.claude/knowledge/CAROL.md`). Needs stack: `.claude/knowledge/NEEDS-STACK.md`. Pricing strategy: **More for Less** — a real git-native docs host (custom domains, search, MDX, API refs, agent Markdown exports, unlimited seats) at `$0` hosted / MIT self-host, with named trade-offs (no WYSIWYG, no plugin marketplace, no SOC 2/SSO, founder support). Price may appear as a fact; affordability must not be the identity ("Get started free" is a mixed signal and is retired).

Statements are numbered in settle order and frozen. Homepage copy should reuse these, not invent a parallel story.

## What you promise (one level up)

**P1.** The docs they read match the code you shipped. [N4; K1; E1]
Reworked from: "The knowledge layer your AI runs on."

**P2.** A coding agent answering from your docs is answering from the commit you merged — `llms.txt` and `.md` pages come from that same deploy, not from scraped HTML. [N4; K3; E3]
Reworked from: "AI agents learn your product from your docs. Blode.md keeps them in your repo, versioned with the code, readable by people and machines."

## What you do (your level — features)

**P3.** Write MDX in the repo. The pull request is the review. The merge publishes the site. [N1; K1]
Reworked from: "Docs that ship with the code" / intro post: "We wanted Markdown in a repo and a URL."

**P4.** Two publish paths: `blodemd login` → `blodemd new docs` → `blodemd push docs`, or install the GitHub App and push to `main` once a folder with `docs.json` exists. [N1; S5]
Reworked from: homepage How-it-works CLI/GitHub tabs (kept as the feature block under P3).

**P5.** 40 MDX components (callouts, tabs, code groups, OpenAPI refs, and the rest of the map in `apps/docs/components/mdx/index.tsx`). [N1]
Reworked from: "30+ components out of the box."

**P6.** Point `docs.json` at an OpenAPI spec and ship the API reference in the same deploy as the guides. [N1]
Reworked from: "Point at an OpenAPI spec. Ship a reference developers and agents can follow."

**P7.** Hosted Blode.md is `$0` — unlimited projects, pages, and seats — with custom domains, search, MDX, and API references included. The CLI and renderer are MIT if you want the same binary on your own Postgres. [N1; K4]
Reworked from: "One MDX project, one domain, one price" and "Get started free."

## Against the vendors above (bracket cites the level countered)

**P8.** A docs CMS (GitBook, Notion, Confluence) will take the writing out of the pull request. Carol keeps git as the source of truth so the answer can still match the release. [N4; K1; D1]
Reworked from: "Most docs tools want you to leave your editor. Blode.md doesn't."

**P9.** An AI search box on top of drifted CMS copy still answers from the wrong version. Blode.md does not replace git with a bot; it publishes Markdown from the same commit the HTML came from. [N4; K3]
Gap-fill: vendors above at the "agent answers" level.

## What you make obsolete (below)

**P10.** You do not stand up a Docusaurus or Next docs app, a search index, SSL, or a custom-domain pipeline to get a URL. Sign in with GitHub and push. [N2; E4]
Reworked from: "A folder of MDX in your repo becomes fast docs on your domain."

**P11.** Hosted: you do not buy a separate docs renderer, blob store, or database. Self-host: same CLI, your Postgres — that plan exists for the buyer who still wants N3. [N2, N3]
Reworked from: pricing "Hosted by us" / "Hosted by you."

**P12.** You do not hand-author `llms.txt` on every release. The deploy writes `llms.txt`, `llms-full.txt`, and per-page `.md` from the MDX. [N2; K3]
Reworked from: "Is Blode.md built for AI agents?" FAQ.

## Commiseration (inciting events — provenance marked in the bracket)

**P13.** Docs that live in a separate CMS lag the release. Then the agent answering your users cites the old API. [E1, E3] — HYPOTHESIZED (no customer interview; pattern from the about page: "Docs in a separate CMS drift. Agents reading drifted docs give the wrong answer.")
Reworked from: "Docs that drift from the code start telling agents the wrong thing."

**P14.** If brand or SEO will not let docs live on a third-party hostname, proxy `/docs` through the site you already run. Paste-ready configs for Vercel, Cloudflare, Nginx, and Caddy. [E5; K2] — HYPOTHESIZED as the trigger; the configs are shipped.
Reworked from: "Keep docs under the domain your users already trust."

## Aspirations (reference, never promise)

**P15.** When the feature and the docs merge together, the integration a developer attempts is the one you actually shipped. That is the part Blode.md plays in adoption — it does not claim it will get you the users. [N5, N6]
Gap-fill: far-above levels.

## Retired without a statement

- "The knowledge layer your AI runs on." — killed by level fit (aspiration/jargon doing H1 duty), Opposite Test (who would claim their docs are not a knowledge layer?), and mechanism/generic wording. Replaced by P1.
- "Ship the knowledge layer your AI needs." — same gates. Replaced by P3 as the closing CTA frame.
- "Get started free." — killed by price-story fit: affordability identity in a More-for-Less file. Replaced by the existing product CTA "Start shipping" (P7 may state `$0` as a fact, not as the button).
- "One MDX project, one domain, one price." — "one price" is affordability identity while hosted is `$0`; widening three-way claim. Replaced by P7 + feature enumeration on the page.
- "fast docs" / "in seconds" — generic / unverified timing. Replaced by P10 without a stopwatch claim.
- "people and agents alike" / "people and machines" — widening conjunction treating mechanism and audience as peers. Subordinated under P2/P12.
- "for everyone" / plugin-marketplace envy — anti-market (D1). Not a statement.

## Facts to verify

- ~~[VERIFY: MDX component count]~~ — landed: 40 named tags in `createMdxComponents` (`apps/docs/components/mdx/index.tsx`), filled into P5.
- [VERIFY: rebuild duration] — not used; no timing claim in survivors.
- [VERIFY: E1/E3 as observed] — still hypothesized; P13 keeps the about-page wording, not a fake testimonial.

## Next steps

Reuse these statements on the homepage, ads, and sales scripts. Land E1/E3 as OBSERVED before spending on commiseration ads. If a VOTERS.md is built later, lead future headlines with those voters and re-run the weakest lines (P5 is a spec, not a voter).
