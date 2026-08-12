# Problem Score — Blode.md hosted docs for git-native Carol

Scored 2026-08-12 from the public product record and page-one research. The founder has not picked these values; they are agent-scored. Dissent lines mark where a more optimistic founder-score would change the verdict.

Live skill: [asb-problem](https://skills.asmartbear.com/skills/asb-problem/). Catalog: [skills.asmartbear.com](https://skills.asmartbear.com/).

## Target market (Scenario A — current)

Buyer: DX engineer or founder who already writes MDX in git for a developer-facing product, reviews docs in a pull request, will not use a CMS, will not file an RFP. (Carol in `.claude/knowledge/CAROL.md`.) · Problem: the public docs must match the commit that shipped, without standing up a docs app · Trade-offs: no visual editor, no marketplace, no SOC 2/SSO, founder support, pruned `docs.json` · Price: **$0 hosted** / MIT self-host · Ambition: indie (one founder, no revenue yet) · Evidence: 1 GitHub star, 0 public customers, pricing page “We don’t make money, yet.”

Named examples of the _category_ (git-native docs), not of Blode.md buyers: every Mintlify customer (they claim 20,000+), every Docusaurus/VitePress repo. No named Blode.md customer exists. The market is observed as a category; Blode.md’s share of it is not.

## Scores (Scenario A)

| Criterion           | Value | Justification                                                                                                                                                                                                                                                                                                                           | Class            |
| :------------------ | :---- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- |
| Plausible           | 100k  | Businesses that publish developer docs from git. Mintlify claims 20k+ customers as a lower bound of people who already bought a git-native host; Docusaurus/VitePress add the self-host remainder. Adjacent 10k is too tight for “has the problem”; 1M counts every SaaS brochure site.                                                 | [research]       |
| Self-Aware          | 0.5   | Docs-as-code is standard practice in developer tools. Thought-leaders evangelize it. Not 1.0: plenty of teams still live in Notion/GitBook and do not care. Not 0.1: this is not a market you must create.                                                                                                                              | [research]       |
| Lucrative           | $1    | Sticker is $0. Mintlify Starter is also $0/mo (custom domain, 5 editor seats, web editor — mintlify.com/pricing, 2026-08-12). Carol’s demonstrated allocation is often $0 (Docusaurus) or a refused seat invoice. Score the sticker. Exception (huge market + near-zero cost) would need Plausible at 10M consumers, which this is not. | [data]           |
| Liquid              | 0.1   | Switching a docs host is an annual-or-rarer decision (migration, DNS, `docs.json`). New launches (E4) are more liquid, but that is a slice. Not 1.0: they are not always in the market.                                                                                                                                                 | [fermi]          |
| Eager (identity)    | 0.1   | 1 star, no testimonials, no SOC 2, solo founder, hosted is $0 with no paid story. D3 buyers are structurally gone. MIT is the exception path (escape hatch) and is why this is 0.1 not 0. Dissent: a founder who scores 0.5 is counting “people like buying from indie OSS.” Evidence does not show that yet.                           | [data]           |
| Eager (comparative) | 0.5   | The difference some Carols would buy for alone is the refusal to ship a web editor, plus MIT. Not 1.0: Docusaurus already has no editor, free. Not 0.1: vs Mintlify Starter the editor refusal is material. **$0 is not the differentiator** — Mintlify Starter is $0.                                                                  | [research]       |
| Enduring            | 0.5   | Docs hosting is a recurring problem. At $0 there is no “paying.” Usage lock-in is the repo + domain. Free-user churn is unknown; no data. Not 1.0 (no system-of-record lock-in).                                                                                                                                                        | [fermi] low-conf |

**Total: 100,000 × 0.5 × 1 × 0.1 × 0.1 × 0.5 × 0.5 = 125 ÷ 625,000 = 0.0002** — not a viable business as scored. Indie threshold is ~1.

Weak links that dominate: **Lucrative ($0 sticker)** and **Eager identity (no track record)**. Comparative is only a voter if someone will eat the other costs; nobody public has.

What this score does not measure: reach, execution, whether Matthew can keep paying the host bill.

## Scenario B — same Carol, price what the market already allocates

Price: **$1,000/year** (order of Mintlify Pro / AI-credit teams in 2026 roundups; power of ten). Other scores carried except Lucrative and identity (paid + “will you still be here” is a harder identity ask, stays 0.1 until customers exist).

| Criterion | Value   | Change                                                                  |
| :-------- | :------ | :---------------------------------------------------------------------- |
| Lucrative | $1k     | Market allocation to a git-native host with extras, not the $0 sticker. |
| (rest)    | carried |                                                                         |

**Total: 100,000 × 0.5 × 1,000 × 0.1 × 0.1 × 0.5 × 0.5 = 125,000 ÷ 625,000 = 0.2** — still below indie. Identity is now the remaining killer.

If identity moved to 0.5 after real customers and MIT-as-escape-hatch: **1.0** — indie-viable. That is the path, not a current fact.

## Scenario C — OSS maintainer, $0 forever, MIT-only

Narrower Plausible (10k), Lucrative $1, identity maybe 0.5 (they want the founder’s MIT). Still a **project**, not a company. Do not score this as the rescue; it is a different ambition (keep the lights on via sponsors).

## Verdict & next steps

**Not viable as a business at $0.** Mintlify Starter is also $0 and includes the web editor. Competing on price against that is a game they can play without noticing. The only remaining voter is the editor refusal, and it is unproven.

Do not put “without the seats” or “$0 vs Mintlify” in the H1 or the FAQ as if it were the difference. Seats are no longer the Mintlify tax for small teams.

Decisions this score does not make for the founder: whether to charge ~$1k/year, whether to stay a sponsored OSS project, whether to stop. It does make this: **the current price story cannot be the strategy that wins against Mintlify.**

Verify with interviews (see `GOALS.md`): what they use today, whether they have ever paid, whether the missing editor mattered. Re-score Lucrative and both Eager scores when those answers exist.
