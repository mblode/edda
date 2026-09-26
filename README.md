<div align="center">

# [Edda](https://blode.co/edda)

**Knowledge docs for agents. Git-native MDX. Publish on merge.**

<p align="center">
  <a href="https://www.npmjs.com/package/edda-docs">
    <img src="https://img.shields.io/npm/v/edda-docs?style=flat&colorA=000000&colorB=000000" />
  </a>
  <a href="https://github.com/mblode/edda/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/mblode/edda?style=flat&colorA=000000&colorB=000000" />
  </a>
</p>

</div>

## Demo

<p>
<a href="https://blode.co/edda">
<img alt="Read the docs" src=".github/assets/demo.svg" width="200" />
</a>
</p>

## Install

```bash
npm install -g edda-docs
```

## Quickstart

```bash
# Sign in with GitHub in your browser, once
edda login

# Scaffold a docs site into ./docs
edda new docs --template starter

# Preview it at localhost:3030, reloading as you edit
edda dev

# Deploy
edda push docs
```

Your site is live on its own `blode.md` subdomain, taking its name, navigation, and theme from the `docs.json` that `edda new` writes.

## Commands

| Command           | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `edda login`      | Authenticate with GitHub in your browser, no API key to manage |
| `edda new [dir]`  | Scaffold a docs site, `--template minimal` or `starter`        |
| `edda dev`        | Serve the docs locally and reload on save                      |
| `edda validate`   | Check `docs.json` before you deploy                            |
| `edda push [dir]` | Deploy a docs directory to its project                         |
| `edda projects`   | List the projects on your account                              |
| `edda analytics`  | Manage PostHog: `get`, `set posthog <key>`, `unset posthog`    |

## Agent skill

Install the slash command for Claude Code or any [skills.sh](https://skills.sh)-compatible agent:

```bash
npx skills add mblode/edda -g --all -y
```

Then scaffold and deploy in plain language:

```text
/edda new my-project --template starter
/edda push docs/ --project my-project
```

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

## Notes

- Node.js 24.
- `push`, `validate`, and `projects` take `--json`, and `push` reads `EDDA_PROJECT` / `BLODEMD_PROJECT`, `EDDA_API_KEY` / `BLODEMD_API_KEY`, and `EDDA_BRANCH` / `BLODEMD_BRANCH` from the environment, so CI can deploy without an interactive login.
- Install the GitHub App from your project's dashboard to deploy automatically on every push to a branch.

## License

MIT

---

Crafted by [<img src="https://blode.co/avatar-circle.png" width="20" align="top" />](https://blode.co) [Matthew Blode](https://blode.co)
