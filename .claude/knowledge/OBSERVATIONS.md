# Observations — Blode.md

These are RAW OBSERVATIONS, deliberately not yet classified as strengths or weaknesses. They are derived from public product artifacts (marketing pages, pricing, about, intro blog, README, GitHub, schema comments, architecture notes) rather than a live founder write-storm or customer interviews. No customer quotes exist in the public record. Categories that need private evidence are marked thin.

Blode.md is a docs-as-code platform: MDX in a git repo, published via CLI (`blodemd login` / `new` / `push`) or a GitHub App, hosted at `$0` with unlimited projects, pages, and seats, or self-hosted under MIT. Built by Matthew Blode. GitHub repo `mblode/blodemd` (created 2025-12-30; 1 star, 0 forks as of 2026-08-12). Support is `m@blode.co` or GitHub issues.

## External research (public sources — seed material, not yet confirmed)

- **[GitHub / mblode/blodemd]** 1 star, 0 forks, MIT license, homepage https://blode.md. README: "Beautiful documentation sites from MDX, scaffolded and deployed from your terminal." Demo cited: captain.blode.md.
- **[GitHub / npm]** CLI package `blodemd`; commands documented: login, new, dev, validate, push, projects, analytics. CI path uses project-scoped `bmd_` deploy keys.
- **[blode.md/pricing]** Hosted plan is `$0 · Unlimited projects, pages, and seats`. Self-host is MIT. FAQ: "What's the catch? None." "How do you make money? We don't, yet."
- **[blode.md/blog/intro-to-blode-md]** "Most docs tools want you to leave your editor. Blode.md doesn't." "Existing docs platforms charge per seat or per page." "We wanted Markdown in a repo and a URL." Roadmap named: themes, analytics, team accounts.
- **[blode.md/about]** "No plugin marketplace, no deep config. If a feature does not move docs closer to the code that produced them, it does not ship."
- **[packages/validation]** `docs.json` schema is "Derived from the vendored Mintlify schema and pruned to the supported Blode.md surface."
- **[Public reviews / press / forums]** No G2, Capterra, Reddit, Hacker News, or comparison-roundup mentions of Blode.md found. Category chatter is Mintlify vs GitBook (git-first MDX vs WYSIWYG knowledge base; Mintlify pricing jumps past solo usage).
- **[GitHub issues]** Open issues: 0 on the public repo snapshot used for this file.

## 1. Undeniable comparative strength

**O1.** Hosted Blode.md is priced at `$0` with unlimited projects, pages, and team seats, including custom domains with SSL, full-text search, MDX components, and API references. The pricing page states this in those words.

**O2.** The CLI, renderer, and API are MIT-licensed. The same CLI is used for hosted and self-hosted. Pricing copy: "Clone the repo, point it at a Postgres, and run the same CLI we do." "No license keys, no telemetry" on the self-host plan.

**O3.** Docs are authored as MDX files in the customer's git repo. The about page and intro post both state: "The pull request is the review. The merge is the deploy."

**O4.** Two first-party publish paths are documented: `blodemd login` → `blodemd new docs` → `blodemd push docs`, and a GitHub App that deploys on push to `main` once a folder with `docs.json` exists. CI can push with a project-scoped `bmd_` deploy key.

**O5.** Every hosted site generates tenant-aware `/llms.txt`, `/llms-full.txt`, `robots.txt`, `sitemap.xml`, and per-page `.md` exports from the MDX. This is documented on the SEO docs and the llms.txt resources page.

**O6.** Paste-ready reverse-proxy snippets for Vercel, Cloudflare Workers, Nginx, and Caddy are on the homepage so `/docs` can sit on the customer's existing domain.

## 2. Consistent complaints

**O7.** No public cancellation, review, or support-thread corpus exists. The complaint surface that _is_ on the record is the company's own: existing docs platforms "charge per seat or per page" and "ask your team to learn a new editor and a new review flow" (intro post).

**O8.** _(Nothing surfaced after prompting against public channels — no Reddit, HN, G2, or GitHub issue complaints to file. Revisit when customers exist in public.)_

## 3. Proud of

**O9.** The about page states the surface is kept small on purpose: "No plugin marketplace, no deep config. If a feature does not move docs closer to the code that produced them, it does not ship."

**O10.** Support is the founder: email `m@blode.co` or a GitHub issue. The about page names Matthew Blode as the builder.

**O11.** The `docs.json` schema is vendored from Mintlify and pruned to the supported Blode.md surface (`packages/validation/src/blodemd-docs-schema.json`). That is an engineering artifact, not a homepage claim.

## 4. Head/tail differential

**O12.** No customer P&L, cohort, or "best vs worst" data is in the public record. The product's designed-in split is: a buyer who already writes MDX in git and reviews docs in pull requests versus a buyer who wants a WYSIWYG/CMS editor (the GitBook-shaped market the intro post refuses).

**O13.** _(No observed profitable-vs-unprofitable customer differential. The designed anti-customer is the non-git, non-MDX writer.)_

## 5. We wish / say we're great, but we're not

**O14.** The current homepage hero is "The knowledge layer your AI runs on." The intro post and about page describe a git-native MDX publisher. Those are different products in language.

**O15.** The intro post lists themes, analytics, and team accounts as "next on the list." The CLI already has `blodemd analytics` (BYO PostHog). Hosted copy already says "unlimited team seats." The gap is first-party themes / first-party analytics / a team-accounts product, not the words on the pricing card.

**O16.** Pricing FAQ: "How do you make money? We don't, yet." Hosting is offered at `$0` while the company pays for it.

## 6. Customers advocate for

**O17.** No public customer testimonials, case studies, tweets, or unsolicited screenshots were found. GitHub shows 1 star.

**O18.** The company advocates for itself with a live demo at captain.blode.md and by using the same platform for blode.md docs.

## 7. Clear and present existential threats

**O19.** Mintlify and GitBook both ship git-synced Markdown/MDX, llms.txt, and agent features in 2026 category roundups. A git-native MDX host with agent exports is no longer an empty cell.

**O20.** Hosted is `$0` with no revenue. The pricing page says paid tiers are later. A 70%-likely disruption within a few years is running out of runway before a paid story exists — recorded as a public-statement fact, not a forecast of the bank account.

**O21.** Category buyers comparing "docs platforms" are trained by Mintlify vs GitBook articles. Blode.md does not appear in those roundups.

## 8. Organizational capabilities

**O22.** One named builder (Matthew Blode). Support, product, and marketing all route to `m@blode.co` or the GitHub repo.

**O23.** The repo is a Turborepo of five apps (web, docs, dashboard, api, cli) plus shared packages. Production dashboard deploys run `db:push:ci` before build. Architecture notes document dual `Tenant` types, edge-config as request-time source of truth, and Next.js 16 `proxy.ts` tenancy.

## 9. Technical architecture and capabilities

**O24.** Tenant config is resolved in `apps/docs/proxy.ts` and passed as `x-tenant-*` headers; the docs app does not hit the DB per request. Edge Config is the request-time source of truth after `syncProjectTenantEdgeConfig`.

**O25.** Agent exports are generated from MDX: `llms.txt`, `llms-full.txt`, per-page `.md`, with placeholder-URL sanitisation and internal-link absolutising before emission (`apps/docs/lib/tenant-static.ts`).

**O26.** The MDX component map in `apps/docs/components/mdx/index.tsx` registers 40 named tags (Accordion through Warning, excluding the `a` and `pre` remaps). Homepage copy currently says "30+."

**O27.** `docs.json` is a pruned Mintlify-shaped schema. Unsupported Mintlify surface is not in the Blode.md schema.

## 10. Envy of / constantly losing sales to competitors

**O28.** No lost-deal log exists. The intro post names the competitors' weapons: per-seat/per-page pricing, and a new editor plus a new review flow.

**O29.** Mintlify owns the "modern API-docs aesthetic" in 2026 comparison articles. GitBook owns mixed-team WYSIWYG. Blode.md is not in those articles.

## 11. Philosophy

**O30.** Docs belong next to code. Stated as a constraint: features that widen the gap between code and docs do not ship.

**O31.** The writing surface is the customer's editor and git, not a Blode.md CMS. Intro post: "Most docs tools want you to leave your editor. Blode.md doesn't."

**O32.** Core renderer and CLI stay free (pricing FAQ). Hosted is currently `$0` to "earn trust now."

## 12. Great ideas

**O33.** Intro post roadmap: themes, analytics, team accounts.

**O34.** Agent skill install: `npx skills add mblode/blodemd` so coding agents can scaffold and push docs in natural language.

## Side-list (ideas parked during the session — not processed)

- Rewrite the homepage hero off "knowledge layer" and onto git-native publish + matching answers.
- Count MDX components as 40, not "30+."
- Do not claim Mintlify drop-in compatibility on the homepage; the schema is pruned.
- Validate hypothesized inciting events with the next customers: what prompted them to look?

## Next steps

Distill these observations into the few attributes that matter, then classify each as a strength, a weakness, or deliberately both. That is `asb-carol-strengths` on this file.
