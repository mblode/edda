---
name: blodemd
description: Scaffolds, previews, and deploys MDX documentation sites with Blode.md, then verifies the llms.txt, llms-full.txt, and per-page .md exports the deploy publishes for AI agents. Use when the user wants to create a docs site, validate docs.json, preview locally, push or deploy docs to Blode.md, set up docs CI, or make Blode.md docs readable by agents. Triggers include "create docs", "deploy docs", "push docs", "preview docs", "scaffold a docs site", "validate docs.json", "set up docs deploys in CI".
user-invocable: true
argument-hint: <command> [options]
allowed-tools: Bash(npx blodemd *), Bash(blodemd *)
---

# Blode.md

Scaffold, preview, and deploy MDX documentation sites from the terminal. One deploy publishes the HTML and its agent-readable twins (`llms.txt`, `llms-full.txt`, per-page `.md`) from the same commit, so what an agent reads is what was merged.

- **IS:** running the `blodemd` CLI end to end (auth, scaffold, validate, preview, push) and confirming the published site serves its agent-readable exports.
- **IS NOT:** writing the docs prose, designing the site, or implementing agent-readiness on sites Blode.md does not host (that is the `agent-ready` skill where installed). Blode.md owns the machine-readable surfaces; the writer owns the content and `docs.json`.

## Auth

Check before any deploy:

```bash
npx blodemd whoami
```

Three credential paths, in the order the CLI resolves them:

- `--api-key` or `BLODEMD_API_KEY`: a project-scoped deploy key (`bmd_...`) for CI. Created in the dashboard under Settings, Deploy keys, or printed once when a logged-in `blodemd push` creates a new project. It belongs in a CI secret. Never ask the user to paste a key into the chat and never write one into the repo.
- Stored session from `npx blodemd login`: browser GitHub sign-in, cached and auto-refreshed. An agent cannot finish the browser step, so when `whoami` says `Not logged in`, ask the user to run that one command in their own terminal, then rerun `whoami`.
- GitHub App from `/app/<project>/git` in the dashboard: pushes to the configured branch deploy with no CLI at all. Recommend it whenever the docs live in a repo, because it removes the lag between merge and published docs.

In non-interactive runs pass `-y` to `new` and `--json` to `validate`, `push`, `whoami`, and `projects`. `npx blodemd schema` prints the CLI contract as JSON when you need the exact options.

## Workflow

```text
Docs progress:
- [ ] Step 0: Verify auth with `blodemd whoami`
- [ ] Step 1: Scaffold or locate the docs directory
- [ ] Step 2: Validate the configuration
- [ ] Step 3: Preview locally
- [ ] Step 4: Deploy to Blode.md
- [ ] Step 5: Verify the agent-readable exports on the live site
```

Steps 1 to 3 are local and reversible: run, fix, and rerun them without checking in. Step 4 publishes to a public URL, so confirm the project slug and the target site before the first push to a project.

Done when `validate` reports no errors, `push` reports `Published`, and Step 5 quotes `200` with `text/markdown` for a twin on the live site. A local preview alone is not done.

### Step 1: Scaffold a new docs site

```bash
npx blodemd new [directory] --slug <project-slug> --template <minimal|starter> -y
```

- `minimal` (default): `docs.json` and `index.mdx` only
- `starter`: brand assets, README, `CLAUDE.md`, `AGENTS.md`, and sample pages

Omit the directory to let the CLI prompt or default to `docs/`.

### Step 2: Validate the config

```bash
npx blodemd validate [dir] --json
```

Checks `docs.json` against the schema and reports warnings. Run it before every push.

### Step 3: Preview locally

```bash
npx blodemd dev --dir <dir> --port 3030 --no-open
```

Local Next.js dev server with hot reload.

### Step 4: Deploy

```bash
npx blodemd push [dir] --project <slug> --json
```

Uploads the docs directory and publishes it. The output names the deployment and manifest, not the site URL: the site is `https://<slug>.blode.md`, the project's custom domain, or `seo.siteUrl` from `docs.json` when the docs are proxied under another host.

### Step 5: Verify the agent-readable exports

```bash
SITE=https://<slug>.blode.md
curl -sSI "$SITE/llms.txt"
curl -sS "$SITE/llms.txt" | head -20
curl -sSI "$SITE/<page>.md"
curl -sSI "$SITE/<page>" -H "Accept: text/markdown"
```

Expect `200` on each, `text/markdown; charset=utf-8` on the `.md` twin and the `Accept` request, an index whose `## Docs` entries carry the page descriptions, and a `Link` header on the HTML page naming `llms.txt` and the markdown alternate. Quote the status and `Content-Type` lines in the report.

## What the deploy publishes for agents

Blode.md generates these from the MDX and `docs.json`; do not hand-author copies of them in the docs folder.

| Path                                                     | Content                                                                                                                                                                          | What the writer controls                                                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `/llms.txt`                                              | Index of every visible page as a `.md` link with its description, plus `Sitemap:`, `Full content:`, and `Skills:` lines and one `/llms/<group>.txt` segment per navigation group | `name` and `description` in `docs.json`; each page's frontmatter `description`; `navigation.hidden` or frontmatter `hidden` |
| `/llms-full.txt`                                         | Every visible page's markdown in one file                                                                                                                                        | Same as above                                                                                                               |
| `/<page>.md`, or `Accept: text/markdown` on the HTML URL | The page as markdown, opening with a blockquote that links the HTML page and `llms.txt`                                                                                          | Frontmatter and body                                                                                                        |
| `Link` header on every HTML page                         | `llms.txt`, `llms-full.txt`, the skills index, and the page's markdown alternate                                                                                                 | Nothing; always on                                                                                                          |
| `/.well-known/skills/index.json`                         | A generated skill describing the site for agents that install skills                                                                                                             | `name` and `description` in `docs.json`                                                                                     |
| `/mcp` on the site host                                  | MCP server over the same pages with search, fetch-by-path, and list tools, advertised at `/.well-known/mcp/server-card.json`                                                     | Nothing; always on                                                                                                          |
| `X-Llms-Txt` header on every response                    | The `llms.txt` path, for clients that read headers before bodies                                                                                                                 | Nothing; always on                                                                                                          |
| `/robots.txt`, `/sitemap.xml`                            | Crawler files with the same page set; `robots.txt` also carries comments naming `llms.txt`, `llms-full.txt`, the `.md` convention, and the skills index                          | `seo.indexing` in `docs.json`                                                                                               |

Two writer-side facts follow from how agents read. Agents choose a page from its `llms.txt` line, so a page without a frontmatter `description` lists as a bare title and gets skipped or guessed at; give every page a one-line description that says what question it answers. And agents act on what they fetch without checking the version, so docs should publish from the merge that changed the product (GitHub App or CI push on `main`), not from a later manual push.

## Output format

Report results in this structure. Include the `Agent exports` line only after a deploy.

```text
<blodemd_result>
Action: scaffold | validate | preview | deploy
Status: success | failed
Project: <slug>
Details: <summary of what happened>
Agent exports: verified (<status and Content-Type quoted>) | skipped (<reason>)
</blodemd_result>
```

## Gotchas

- `BLODEMD_API_KEY` in the environment wins over the stored login session, and a deploy key carries no user identity: `whoami` reports the key, and `push` cannot auto-create a project with it. Unset it or pass the intended project explicitly when the user expected their own session.
- `push` succeeds without printing the public URL. Derive it from the slug or `seo.siteUrl` before Step 5, or the verification curls hit the wrong host.
- A page missing from `navigation` in `docs.json` still publishes and still appears in `llms.txt` and `llms-full.txt`. To keep a page out of the index, list it under `navigation.hidden`, mark its group `hidden`, or set `hidden: true` in its frontmatter; do not delete pages to hide them.
- Docs proxied under `yourdomain.com/docs` without `seo.siteUrl` emit `llms.txt` and `.md` links on the `blode.md` host, which agents then fetch cross-host. Set `seo.siteUrl` to the proxied URL, path prefix included.
- `blodemd new` without `-y` prompts and hangs a non-interactive run; `dev` without `--no-open` tries to open a browser that is not there.
