<h1 align="center">Blode.md</h1>

<p align="center">Deploy and manage documentation sites from the command line.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/blodemd"><img src="https://img.shields.io/npm/v/blodemd.svg" alt="npm version"></a>
</p>

- **One-command deploy:** Push your entire docs folder to Blode.md with `blodemd push`.
- **Scaffold in seconds:** Generate a ready-to-edit docs folder with `blodemd new`.
- **Config validation:** Catch `docs.json` errors before deploying.
- **Zero keys:** Sign in once with GitHub in your browser — the CLI handles the rest.

## Install

```bash
npm install -g blodemd
```

Or run without installing:

```bash
npx blodemd
```

Requires Node.js 24.x.

## Quick Start

```bash
# Sign in with GitHub (opens your browser)
blodemd login

# Create a new docs site
blodemd new

# Preview locally
blodemd dev

# Deploy
blodemd push
```

## Commands

```bash
blodemd new [directory]   Create a new blode.md documentation site
blodemd login             Sign in with GitHub in your browser
blodemd logout            Remove stored credentials
blodemd whoami            Show current authentication
blodemd validate [dir]    Validate docs.json
blodemd push [dir]        Deploy docs
blodemd dev [dir]         Start the local docs preview server
```

### `push` Options

```
--project <slug>    Project slug (env: BLODEMD_PROJECT)
--api-url <url>     API URL (env: BLODEMD_API_URL)
--branch <name>     Git branch (env: BLODEMD_BRANCH)
--message <msg>     Deploy message (env: BLODEMD_COMMIT_MESSAGE)
```

The CLI reads the project slug from the `slug` field in `docs.json` when `--project` is not set.

### `dev` Options

```bash
--dir <dir>       Docs directory
--port <port>     Local preview port (default: 3030)
--no-open         Don't open the browser automatically
```

## Auto-deploy without the CLI

Install the **Blode.md GitHub App** from your project's Git tab in the dashboard. Pushes to your configured branch deploy automatically — no CLI, no tokens, no workflows.

## Configuration

The CLI looks for a `docs.json` file in the docs directory. Minimal example:

```json
{
  "$schema": "https://blode.md/docs.json",
  "slug": "my-project",
  "name": "My Project"
}
```

The CLI searches for `docs.json` in the current directory, then `docs/`, then `apps/docs/`.

## License

This repository is licensed under MIT. Generated docs folders do not include a license file by default.
