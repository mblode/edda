# Docs agents can navigate

> Agents now read more docs than people do, so every merge publishes HTML for people and indexed Markdown for agents from the same commit.

Edda, knowledge docs for agents. Hosted is $0. The CLI and renderer are MIT.

Last updated: 22 September 2026

- [Connect GitHub to publish](https://blode.md/oauth/consent)
- [Read the docs](https://blode.co/edda/docs)
- [Moving from Mintlify?](https://blode.co/edda/docs/guides/migrate-from-mintlify)

## MDX in, HTML and Markdown out

This MDX:

<!-- prettier-ignore -->
```mdx
# Quickstart

Install the CLI, then publish your first page.

<Note>
Run `edda login` once per machine.
</Note>

## Publish

1. Run `edda new docs`
2. Run `edda push docs`

Read the [CLI guide](/docs/cli/overview).
```

publishes an HTML page at `acme.blode.md/quickstart` and this Markdown at `acme.blode.md/quickstart.md`:

<!-- prettier-ignore -->
```md
> ## Documentation Index
> [HTML page](https://acme.blode.md/quickstart)
> [Documentation index](https://acme.blode.md/llms.txt)
> Use the index to discover all available pages before exploring further.

# Quickstart

Install the CLI, then publish your first page.

> [!NOTE]
> Run `edda login` once per machine.

## Publish

1. Run `edda new docs`
2. Run `edda push docs`

Read the [CLI guide](/docs/cli/overview).
```

## Your majority reader is an agent

- **257M** agent requests vs 131M human page loads, across Mintlify-hosted docs in August 2026
- **83%** of agent traffic came through `.md` pages, `llms.txt` or agent skills
- **0.11** failed requests per task when Markdown links to an index, vs 2.23 for HTML

Source: [Mintlify, 2026 State of Knowledge Report](https://www.mintlify.com/state-of-knowledge/2026).

Edda ships all three routes on every deploy, and every Markdown page links to the index before its first heading.

## Agents draft. People merge.

Most teams now have agents drafting docs changes, and most still want a person to approve them. In Edda that approval is the pull request you already review, and merging it is the publish. No second editor, no sync job, no docs that lag the release.

## The merge is the deploy

### Indexed Markdown on every page

Each page has a `.md` twin that opens with a link to `llms.txt`, so an agent that lands on one page can find the rest instead of guessing URLs.

### Tools for browser agents

Every page registers five WebMCP tools (`search_docs`, `read_page`, `get_site_overview`, `read_skill`, `navigate_page`), so an agent driving a browser tab reads your docs through typed calls.

### Review in the pull request

Whether a person or an agent wrote it, a docs change is a diff your team approves beside the code it describes.

### Publish on merge

The GitHub App deploys on every push to `main`, so the docs change ships the day the product does.

### Hosted or self-hosted

Use hosted Edda on a `blode.md` subdomain or your own domain, or run the same MIT CLI and renderer on your Postgres. If hosted goes away, you keep the source.

## Hosted or self-hosted

No visual editor, plugin marketplace, SOC 2, SSO or SLA. Support is the founder.

- **No second editor:** $0 hosted. Unlimited projects, pages and seats. Custom domains, search, MDX and API references included. [Connect GitHub to publish](https://blode.md/oauth/consent)
- **Your Postgres:** MIT. Self-host the same CLI and renderer on your Postgres. No licence keys or telemetry. [View the source on GitHub](https://github.com/mblode/edda)

## FAQ

**What is Edda?**
Edda is a docs platform for teams that keep MDX in git. Every merge publishes an HTML site for people and, for agents, llms.txt, a Markdown copy of every page and WebMCP tools. Hosting is $0 and the source is MIT.

**How is Edda different from Mintlify?**
Edda is the git path without the web editor or marketplace: the same MDX files, a smaller docs.json and one command to publish. Hosted Edda is $0, and you can self-host the MIT source. Moving over takes a docs.json rewrite, not a content rewrite.
[Migrate from Mintlify](https://blode.co/edda/docs/guides/migrate-from-mintlify)

**What do agents get from an Edda site?**
llms.txt and llms-full.txt, a .md twin of every page (also served for Accept: text/markdown), discovery headers on every HTML page, a generated agent skill, and five WebMCP tools for browser agents. All of it is rebuilt from the commit you merged.

**Can an AI agent write my docs?**
An agent can draft the change as a pull request like any other code change. Edda publishes what you merge, so a person stays the approver. Edda doesn't include a writing agent of its own.

**Can I see how much agent traffic my docs get?**
Not in Edda yet. Agents fetch server-side and run no JavaScript, so PostHog counts people only. To count agents today, put a proxy you can log in front of the docs and count .md, llms.txt and AI user-agent requests.
[Proxy with Vercel](https://blode.co/edda/docs/guides/proxy-vercel), [Proxy with Cloudflare](https://blode.co/edda/docs/guides/proxy-cloudflare), [Proxy with Nginx](https://blode.co/edda/docs/guides/proxy-nginx)

**What does Edda cost?**
Hosted Edda is $0 with unlimited projects, pages and seats, including custom domains, search, MDX and API references. You do not get a visual editor, a plugin marketplace, SOC 2, SSO or an SLA, and support is the founder. The CLI and renderer are MIT if you self-host.

## Your next reader is an agent.

Give it docs it can navigate, from the commit you merged.

[Connect GitHub to publish](https://blode.md/oauth/consent), or install the CLI and publish from your terminal:

```bash
npm i -g edda-docs
edda login
edda new docs
edda push docs
```
