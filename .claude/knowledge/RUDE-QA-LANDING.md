# Rude Q&A — Blode.md landing page + Carol stack

---

phase: D
target: "Shipped homepage (commits 1d5c936, 97f629d) plus CAROL.md / POSITIONING.md / VOTERS.md"
started: 2026-08-12
concluded: 2026-08-12
outcome: sharpened-plan
executed: 2026-08-12
---

This file attacked the homepage after commits 1d5c936 and 97f629d. The founder then said execute the plan. Decisions below were locked and shipped in copy. The interrogation above is the record of the attack, not current page copy.

Method: `asb-rude-qa` (Berkun / Cohen). Craft bar: [shop.hiddenmultipliers.com](https://shop.hiddenmultipliers.com). Rival checked on 2026-08-12: [mintlify.com](https://www.mintlify.com/) ("The knowledge infrastructure agents build on") plus Mintlify's own docs: git is source of truth; the web editor is an optional third workflow that commits back to the repo.

## What we are beating up

The claim that this homepage, and the Carol/positioning files behind it, are a defensible strategy for winning a buyer who already writes MDX in git.

Verbatim, the page currently says:

- **H1:** "Docs that match the code you shipped."
- **Subhead:** "Write MDX in the repo. Most docs tools want you to leave your editor. The pull request is the review. The merge publishes the site, including the Markdown agents fetch from that commit."
- **CTA:** "Start shipping"
- **TextReveal:** "Most docs tools want you to leave your editor. Blode.md doesn't."
- **How-it-works H2:** "The merge is the deploy" — CMS lag → agent cites the old API
- **Features H2:** "What the merge publishes" — no marketplace / no second editor; `$0`; six Mintlify-shaped cards including "40 components"
- **Closing:** "Push a docs folder. You're live."
- **SEO title:** "Blode.md: MDX docs from git, live on merge"

Supporting files: `.claude/knowledge/CAROL.md`, `NEEDS-STACK.md`, `POSITIONING.md` (More for Less), `VOTERS.md` (V1 = refusal of a second editor).

## Supporting context

- Evidence for Carol is public product artifacts only. Every inciting event is marked HYPOTHESIZED. GitHub: 1 star, 0 forks (2026-08-12). No testimonials.
- `docs.json` is a pruned vendored Mintlify schema (`packages/validation`).
- Pricing FAQ still answers "What's the catch?" with "None" and "How do you make money?" with "We don't, yet."
- About page still leads with "Your docs are your AI interface" and "The knowledge layer belongs with the code" — lines the homepage recanted.
- Mintlify (2026-08-12): MDX in git, `docs.json`, push-to-deploy, `mint dev`, llms.txt, custom domains, **plus** a web editor that writes commits/PRs. Logo wall: Anthropic, Coinbase, HubSpot, AT&T, Lovable, Replit, Perplexity. H1: "The knowledge infrastructure agents build on."
- Docusaurus / VitePress: MDX in git, no second editor, free, you run the host.

## Frame decisions

- **In scope:** whether the strategy is defensible. Copy, Carol, voter, price story, named enemy.
- **Out of scope this pass:** inventing testimonials, building a WYSIWYG, changing the hosted price, rewriting the homepage to answer the interrogation.
- **Already committed on the branch (not re-litigated as facts, re-litigated as strategy):** no "knowledge layer" on the homepage; no "Get started free"; V1 named on the page; More for Less claimed in `POSITIONING.md`.
- **Reversibility:** homepage copy is a two-way door. Carol-as-product-constraint (never ship an editor) is closer to one-way if the schema and roadmap keep refusing it.
- **Worst case if this positioning is wrong:** the page dunks on GitBook while the actual buyer is comparing Mintlify and Docusaurus; Carol never shows up because she was the founder; `$0` + "no catch" trains the market that this is a hobby host.
- **Who is affected:** Matthew Blode (solo). No cofounder, no employees, no investors on the record.
- **Time pressure:** none except the cost of a homepage that points at the wrong war.

## Interrogation findings

### Decisions made (real ones)

None in this pass. The founder has not picked. Candidate decisions that would _become_ real if chosen:

1. **Named enemy is Mintlify (price/surface fork)** over GitBook (editor dunk). Opposite is also smart: GitBook is easier to beat in a sentence. Accepted consequence if you pick Mintlify: you cannot steal "git-native MDX" as the H1; you have to say you are the smaller Mintlify. Accepted consequence if you pick GitBook: Mintlify customers bounce because you described their current tool as "leave your editor," which is false.
2. **Named enemy is Docusaurus (no host to maintain)** over both SaaS docs tools. Opposite is also smart: then you are a host, not a philosophy. Accepted consequence: the voter (no editor) does no work, because Docusaurus already has that, free.
3. **`$0` is Less for Less** (name the missing amenities: no editor, no marketplace, no SOC 2, founder support, pruned schema) **or** More for Less (keep the amenities list and stop saying "no catch"). Both are smart. The current file claims More for Less and the pricing page says there is no catch. That is not a decision; it is a contradiction.
4. **Carol is a hypothesis to validate** over **Carol is the ICP we will write for until disproven**. Opposite of "we have an ICP" is "we do not know who buys yet, so the homepage is a mechanism page." That is a rational early-product choice. Treating a self-portrait as an ICP is not.

### Fluff replaced

These are still on the page. Replacements are proposed, not shipped.

| On the page now                                                          | Why it fails                                                                                                         | Specific replacement (if you pick a side)                                                                |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| "Start shipping"                                                         | Opposite of "don't start" is nonsense. Opposite Test fail.                                                           | "Push a docs folder" / "Connect the GitHub App" — a verb that is the product.                            |
| "Common questions"                                                       | Category furniture.                                                                                                  | Delete the H2 or name the actual objection ("Is this Mintlify without the seats?").                      |
| "What you get"                                                           | Feature-tour label.                                                                                                  | Keep "What the merge publishes" and kill the eyebrow, or name the trade-off in the eyebrow.              |
| Search card: "One full-text index. Same results in the docs search box." | Tautology. Search searches.                                                                                          | Cut the card, or say what is _not_ there (no Algolia bill, no separate index to keep).                   |
| "40 components"                                                          | STRENGTHS-WEAKNESSES already cut this as a brag. Then it went on the homepage.                                       | Spec in docs. Not a reason to buy.                                                                       |
| SEO title vs H1                                                          | Title is mechanism ("MDX from git, live on merge"). H1 is promise ("docs match the code"). Two products in two tags. | One story. If P1 is the promise, the title has to say that, or the H1 has to come down to the mechanism. |
| Closing: "Push a docs folder. You're live."                              | A URL arriving is a deliverable, not a change on Carol's scoreboard (correct answers from the version that shipped). | If you keep P1, the close has to be about the answer matching the merge, not about a hostname appearing. |

### Threats clarified (present tense)

- **Mintlify already occupies git-native MDX + agent Markdown + custom domains + `docs.json`.** Their homepage is the "knowledge infrastructure" line this repo retired. Their editor commits to git; it does not replace git. The homepage sentence "Most docs tools want you to leave your editor" is true of GitBook/Notion and **false of Mintlify's git workflow**. Punching GitBook because it is easier is the present-tense mistake.
- **Docusaurus and VitePress already give Carol MDX in git, no second editor, MIT/free.** The sale against them is P10 (you do not stand up the app). The homepage barely makes that sale. The feature grid looks like Mintlify's grid, not like "you can delete your docs app."
- **Viability is present tense, not hypothetical.** Hosted is `$0`. Pricing says "We don't [make money], yet." One named builder. 1 GitHub star. D3 buyers are already gone. MIT self-host is the bus-factor answer and is not above the fold.
- **The unfair question that is actually fair:** Mintlify drops a `$0` hobby tier tomorrow. What remains? The no-editor voter. Docusaurus already has that, free. So the residual is "Mintlify-shaped host, no editor, `$0`, MIT if we disappear." That sentence is ugly and true. It is not on the page.

### Scars surfaced

- **Mintlify-shaped product, GitBook-shaped enemy.** The schema is vendored from Mintlify. The feature cards are Mintlify's list (GitHub deploy, domains, MDX, search, content types, API ref). The intro post and V1 dunk on "leave your editor," which is GitBook's product. The scar is: it is easier to refuse the tool you would never use than to differentiate from the tool you forked.
- **Founder-as-Carol.** The workshop was run on marketing copy, the about page, and the intro post. Those are the founder's words. Find-Your-Carol without interviews produces a self-portrait. That is a category error in the method, not a small data gap.
- **Previous rude-QA implemented itself.** The first pass said "put V1 on the page"; the next commit did. Answering your own interrogation is how you stay attached. This pass does not ship a rewrite.

### Where the interrogation would dwell (founder has not answered)

**1. Carol is not a customer. She is you.**

No interviews. Observations were of the product, not of buyers. Inciting events are hypothesized, then P13 puts "the agent cites the old API" on the homepage as if it were commiseration. That is the company talking to itself. The shop's commiseration works because Hidden Multipliers has sold the book; the pain is observed. Yours is laundered from the about page.

Candidate answers (pick one):

- A. Carol stays hypothetical. Homepage is a mechanism page until five signups say why they came. Kill P13 as if it were a quote.
- B. Treat the founder as the first Carol and say so: "I built this because I would not leave the editor." First-person is honest. Third-person Carol on zero interviews is not.

**2. The H1 is stealable against the real rival.**

"Docs that match the code you shipped" is a sentence Mintlify can paste. It fails the shop's stealable-H1 test versus Mintlify. It only passes versus GitBook/Notion. The voter (we will not ship the editor) is the thing Mintlify will not paste. It is in the subhead and the TextReveal, not in the H1. So the largest type on the page is the claim you do not uniquely own.

Candidate answers:

- A. Keep P1 as H1. Accept that Mintlify owns the same promise, and compete on price/surface underneath.
- B. Put V1 in the H1 ("Most docs tools want you to leave your editor. Blode.md doesn't." or a shorter refusal). Accept that you are a smaller, stricter Mintlify and that mixed teams bounce.
- C. Put P10 in the H1 (you do not stand up Docusaurus). Accept that you are a host, not a philosophy.

**3. V1 is unproven as a voter.**

`asb-voters`: if you cannot name a real cost that people who value the voter have eaten, the voter may be imaginary. Nobody public has chosen Blode.md _because_ there is no editor, _despite_ no logo wall, no SOC 2, founder support, pruned schema. Extremity is asserted from the about page. Rarity vs Mintlify is real (they added the editor). Decisiveness is theoretical. One star is not a customer who ate the cost.

**4. More for Less is fighting the pricing page.**

`POSITIONING.md` retired "Get started free" because affordability must not be the identity. The homepage still leads a features intro with `$0` unlimited. Pricing FAQ: "What's the catch? None." More for Less without named missing amenities is Less for Less wearing a costume — or it is a free host that has not admitted it. "None" is the opposite of a trade-off.

**5. The page is still a Mintlify tour.**

Hero, CLI/GitHub tabs, six feature cards, four proxy tabs, FAQ, CTA. The shop is a thesis with a named anti-market. This page copied one shop line (the editor refusal) and kept a category layout. Subhead is four claims jammed together (write MDX / leave editor / PR is review / agents fetch Markdown). The voter is a clause in a mechanism dump, then repeated in TextReveal. That is not leading with the voter; that is sprinkling it.

**6. About and pricing recant the homepage.**

Homepage killed "knowledge layer." About H1 is still "Your docs are your AI interface." About H2 is still "The knowledge layer belongs with the code." Pricing still says there is no catch. Three URLs, three stories. A sharp homepage with a contradictory about page is not a strategy.

**7. The CTA sells a URL, not the promise.**

P1 says the docs match the code. The close says a folder becomes a site. Those are different jobs. If Carol's scoreboard is correct answers, "you're live" is N1 (a deploy succeeded), one level below the promise.

## Conclusion

**Sharpened plan.** The founder executed the honest line. Decisions (chose A over B; consequence accepted):

1. **Named enemy is Mintlify** over GitBook and Docusaurus. Accepted: H1 cannot be "git-native MDX" (table stakes). GitBook is D1 in the FAQ. Docusaurus is P10 on the scroll beat.
2. **More for Less** over Less for Less. Accepted: name the holes (no editor, no marketplace, no SOC 2/SSO, founder support, pruned schema). "What's the catch? None." is deleted.
3. **H1 is P1** (shop: promise first). V1 is the anti-market beat ("You're not in the 5th grade" slot). Accepted: mixed teams bounce one scroll later.
4. **Carol stays hypothesized**; about is first-person. P13 stays off the homepage until observed.
5. **About + pricing recant** to the same story.
6. **Viability on the fold:** hosted price plus MIT if we disappear, in the subhead and a feature card.

Whether this is _correct_ (leveraged, asymmetric) is still a later question. It is now a defensible story.

The interrogation above this heading is historical. Current copy lives in `apps/web/app/page.tsx`.

## Open questions

- Ask the next five signups what prompted them (verbatim). V1 is still unproven by customers.
- Do not run commiseration ads on E1/E3 until observed.
- Paid hosted tier is still "later"; D3 buyers remain gone.
