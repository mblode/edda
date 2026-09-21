<h1 align="center">Edda</h1>

<p align="center">Deploy and manage documentation sites from the command line.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/edda-docs"><img src="https://img.shields.io/npm/v/edda-docs.svg" alt="npm version"></a>
</p>

- **One-command deploy:** Push your entire docs folder to Edda with `edda push`.
- **Scaffold in seconds:** Generate a ready-to-edit docs folder with `edda new`.
- **Config validation:** Catch `docs.json` errors before deploying.
- **Zero keys locally:** Sign in once with GitHub in your browser — no keys for local deploys. CI uses a project deploy key.

## Install

```bash
npm install -g edda-docs
```

Or run without installing:

```bash
npx edda-docs
```

Requires Node.js 24.x.

## Quick Start

```bash
# Sign in with GitHub (opens your browser)
edda login

# Create a new docs site
edda new

# Preview locally
edda dev

# Deploy
edda push
```

## Deploy from CI

The [GitHub App](#auto-deploy-without-the-cli) is the recommended zero-config path. To run the deploy yourself from GitHub Actions, use a project deploy key stored in the `BLODEMD_API_KEY` secret:

```yaml
name: Deploy docs
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
      - run: npx edda-docs@latest push --project your-project-slug
        env:
          BLODEMD_API_KEY: ${{ secrets.BLODEMD_API_KEY }}
```

Create a deploy key in the dashboard under **Settings → Deploy keys**, or copy the `bmd_...` key that `edda push` prints the first time it auto-creates a project. Deploy keys are project-scoped and deploy-only — store them as CI secrets, never commit them.

## Commands

```bash
edda new [directory]   Create a new Edda documentation site
edda login             Sign in with GitHub in your browser
edda logout            Remove stored credentials
edda whoami            Show current authentication
edda validate [dir]    Validate docs.json
edda push [dir]        Deploy docs
edda projects          List projects on your account
edda analytics         Manage PostHog (`get`, `set posthog`, `unset`)
edda dev               Start the local docs preview server
```

### `push` Options

```
--project <slug>    Project slug (env: EDDA_PROJECT or BLODEMD_PROJECT)
--api-key <token>   API key (env: EDDA_API_KEY or BLODEMD_API_KEY)
--api-url <url>     API URL (env: EDDA_API_URL or BLODEMD_API_URL)
--branch <name>     Git branch (env: EDDA_BRANCH or BLODEMD_BRANCH)
--message <msg>     Deploy message (env: EDDA_COMMIT_MESSAGE or BLODEMD_COMMIT_MESSAGE)
--json              Print machine-readable JSON
```

`validate` and `projects` also accept `--json`. `dev` takes `--dir`, not a positional directory.

The CLI reads the project slug from the `slug` field in `docs.json` when `--project` is not set.

### `dev` Options

```bash
-d, --dir <dir>     Docs directory
-p, --port <port>   Local preview port (default: 3030)
--no-open           Don't open the browser automatically
```

## Auto-deploy without the CLI

Install the **Edda GitHub App** from your project's Git tab in the dashboard. Pushes to your configured branch deploy automatically — no CLI, no tokens, no workflows.

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

## Environment and exit codes

| Variable                           | Purpose                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `EDDA_API_KEY` / `BLODEMD_API_KEY` | API key. Used ahead of a stored login session, so CI needs no `edda login`. |
| `EDDA_PROJECT` / `BLODEMD_PROJECT` | Default value for `--project`.                                              |
| `EDDA_API_URL` / `BLODEMD_API_URL` | API origin. Defaults to the hosted API.                                     |

Every command exits with one of these, so a CI gate can branch on the number:

| Code | Meaning                                |
| ---- | -------------------------------------- |
| `0`  | Success                                |
| `1`  | Error                                  |
| `2`  | Cancelled, including a declined prompt |
| `3`  | Invalid input or config                |
| `4`  | Authentication required                |
| `5`  | Network failure                        |

With `--json`, a failure is data too: the command writes one line to stdout shaped `{"error":true,"code":"AUTH_REQUIRED","message":"...","hint":"..."}`. Branch on `code`, which is stable, rather than on `message`, which is written for a human.

## License

This repository is licensed under MIT. Generated docs folders do not include a license file by default.
