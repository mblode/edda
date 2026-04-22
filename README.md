# Blode.md

Ship beautiful docs from your terminal. Write MDX locally, deploy with one command.

Blode.md is a multi-app documentation platform — marketing in `apps/web`, tenant docs in `apps/docs`, dashboard/auth in `apps/dashboard`, and a Hono API behind them.

## Apps

| App              | Description                                                                         | Port     |
| ---------------- | ----------------------------------------------------------------------------------- | -------- |
| `apps/web`       | Next.js marketing frontend and rewrite entrypoint for `/docs`, `/app`, and `/oauth` | portless |
| `apps/docs`      | Next.js docs frontend with dynamic tenant routing and MDX rendering                 | 3001     |
| `apps/dashboard` | Next.js dashboard and auth frontend for `/app` and `/oauth`                         | 3002     |
| `apps/api`       | Hono REST API for multi-tenant data, content, and Vercel Blob storage               | 4000     |
| `apps/cli`       | CLI tool for deploying docs content via the API                                     | —        |

## Packages

| Package                   | Description                                 |
| ------------------------- | ------------------------------------------- |
| `@repo/contracts`         | Zod schemas shared between frontend and API |
| `@repo/db`                | Drizzle ORM setup and PostgreSQL migrations |
| `@repo/models`            | Core data models                            |
| `@repo/common`            | Shared utilities                            |
| `@repo/validation`        | Validation logic built on `@repo/models`    |
| `@repo/ui`                | Shared React component library              |
| `@repo/api-client`        | HTTP client utilities for consuming the API |
| `@repo/prebuild`          | Pre-build YAML processing                   |
| `@repo/previewing`        | Preview data handling                       |
| `@repo/typescript-config` | Shared `tsconfig.json` configurations       |

## Requirements

- Node >= 18
- npm 10.9.3

## Quick Start

```sh
npm install
cp .env.example .env.local   # fill in DATABASE_URL, BLOB_READ_WRITE_TOKEN, etc.
npm run dev                  # web → portless blodemd.localhost, docs → :3001, dashboard → :3002, api → :4000
```

## Development

```sh
# All apps
npm run dev

# Single app
npx turbo run dev --filter=web
npx turbo run dev --filter=docs
npx turbo run dev --filter=dashboard
npx turbo run dev --filter=api

# Build all
npm run build
```

## Testing

```sh
npm run test              # full suite: unit → component → integration → smoke → e2e
npm run test:unit         # Vitest unit tests
npm run test:component    # Vitest component tests
npm run test:integration  # Vitest integration tests
npm run test:smoke        # Vitest smoke tests
npm run test:e2e          # Playwright end-to-end tests
```

## Code Quality

```sh
npm run fix           # Ultracite auto-fix (lint + format)
npm run check         # Ultracite check without fixing
npm run check-types   # TypeScript type check across all workspaces
npm run lint          # Oxlint across monorepo
npm run format        # Oxfmt across monorepo
```

## Agent Skill

Install the slash command for Claude Code or any [skills.sh](https://skills.sh)-compatible agent:

```sh
npx skills add mblode/blodemd -g --all -y
```

Scaffold and deploy docs with natural language:

```
/blodemd new my-project --template starter
/blodemd push docs/ --project my-project
```

## License

[MIT](LICENSE)
