# Live skills catalog — Blode.md

Checked 2026-08-12 against [skills.asmartbear.com](https://skills.asmartbear.com/). Snapshot ZIP: [asb-skills.zip](https://skills.asmartbear.com/asb-skills.zip). Source: [github.com/asmartbear/asb-skills](https://github.com/asmartbear/asb-skills).

Install for a session (do not vendor into this repo; the ZIP is a snapshot):

```sh
npx skills add asmartbear/asb-skills
```

The catalog does not think for you. Files below are the founder’s answers, not the skill’s. Do not invent `WHO-ME.md` or interview debriefs.

## Workshops

### Find Your Carol — done (hypothesized)

| Step                     | Skill                       | File                                      |
| ------------------------ | --------------------------- | ----------------------------------------- |
| 1 Observations           | `asb-carol-observations`    | `OBSERVATIONS.md`                         |
| 2 Strengths & Weaknesses | `asb-carol-strengths`       | `STRENGTHS-WEAKNESSES.md`                 |
| 3 Keystones              | `asb-carol-keystones`       | `KEYSTONES.md`                            |
| 4 Deal-Breakers          | `asb-carol-dealbreakers`    | `DEALBREAKERS.md`                         |
| 5 Inciting Events        | `asb-carol-inciting-events` | `INCITING-EVENTS.md` (E1–E5 hypothesized) |
| 6 Define Carol           | `asb-carol-define`          | `CAROL.md`                                |

Carol is derived from the public product record, not from customer interviews. Re-run from step 5 when debriefs exist.

### Customer Interviews — steps 1–3 done; 4–6 blocked

| Step                  | Skill                      | File                                      |
| --------------------- | -------------------------- | ----------------------------------------- |
| 1 Goal Questions      | `asb-interview-goals`      | `GOALS.md`                                |
| 2 Hypotheses          | `asb-interview-hypotheses` | `HYPOTHESES.md`                           |
| 3 Interview Questions | `asb-interview-questions`  | `QUESTIONS.md`                            |
| 4 Interview Debrief   | `asb-interview-debrief`    | none — needs one transcript or notes dump |
| 5 Learning            | `asb-interview-learning`   | blocked on a stack of debriefs            |
| 6 Interview Report    | `asb-interview-report`     | blocked on `FINAL-REPORT.md`              |

Ask the next signups the six questions in `QUESTIONS.md` verbatim. Do not mention the editor, `$0`, or Mintlify unless she names them. After each conversation, run `asb-interview-debrief` into `.claude/knowledge/interviews/`.

### Find Yourself — step 1 blocked; step 2 is a product-record stand-in

| Step       | Skill        | File                                                                                                                                         |
| ---------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Who, Me? | `asb-who-me` | **no `WHO-ME.md`** — the skill interviews the person; it refuses labels without episodes and refuses a company portrait in place of a person |
| 2 Voters   | `asb-voters` | `VOTERS.md` — distilled from `STRENGTHS-WEAKNESSES.md` / `CAROL.md` because the self-portrait does not exist yet                             |

`VOTERS.md` V1 (refusal of a second editor) is a product constraint. It is not yet proven as Matthew’s voter. Re-run `asb-voters` after `WHO-ME.md` exists. It is fine to distill before outside-in homework returns.

## Standalone

| Skill             | File                 | Status                                                                                       |
| ----------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| `asb-rude-qa`     | `RUDE-QA-LANDING.md` | Done. Outcome: sharpened-plan, executed into homepage/about/pricing.                         |
| `asb-problem`     | `PROBLEM-SCORE.md`   | Done. Scenario A (`$0`): 0.0002, not a viable business. Does not pick charge vs OSS vs stop. |
| `asb-positioning` | `POSITIONING.md`     | Done. Locked decisions at the top. Shop rhythm: H1 is P1, anti-market beat is V1.            |
| `asb-needs-stack` | `NEEDS-STACK.md`     | Done. Promise is N4 (current correct answer).                                                |

## Do not run next unless the input exists

- `asb-who-me` — Matthew answers the prompts. First drive prompt is in the session that starts it. Do not scrape the about page into a self-portrait; that is the product talking to itself.
- `asb-interview-debrief` — one real conversation.
- Re-score `PROBLEM-SCORE.md` Lucrative and both Eager rows when interview evidence exists.
- Do not silently rewrite homepage copy to answer the next interrogation. Locked decisions live in `POSITIONING.md`.
