#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${APP_ROOT}/../.." && pwd)"

run_db_push() {
  if [[ -z "${DIRECT_URL:-}${POSTGRES_URL_NON_POOLING:-}${DATABASE_URL:-}" ]]; then
    echo "One of DIRECT_URL, POSTGRES_URL_NON_POOLING, or DATABASE_URL must be set for production dashboard builds." >&2
    exit 1
  fi

  if [[ -z "${DIRECT_URL:-}${POSTGRES_URL_NON_POOLING:-}" ]]; then
    echo "WARNING: DIRECT_URL/POSTGRES_URL_NON_POOLING not set; drizzle-kit will use the pooled DATABASE_URL." >&2
    echo "  Schema introspection through pgbouncer can hang for several minutes — set DIRECT_URL to the :5432 connection to fix." >&2
  fi

  (cd "${REPO_ROOT}" && npm run db:push:ci --workspace=packages/db)
}

if [[ "${VERCEL_ENV:-}" == "production" ]]; then
  # Skip the slow schema push when nothing in the schema or its sync triggers
  # changed since the previous deploy. SKIP_DB_PUSH=1 forces skip; FORCE_DB_PUSH=1
  # forces a push regardless of diff.
  if [[ "${FORCE_DB_PUSH:-}" == "1" ]]; then
    run_db_push
  elif [[ "${SKIP_DB_PUSH:-}" == "1" ]]; then
    echo "Skipping db:push (SKIP_DB_PUSH=1)."
  elif [[ -n "${VERCEL_GIT_PREVIOUS_SHA:-}" ]] && (cd "${REPO_ROOT}" && git rev-parse --quiet --verify "${VERCEL_GIT_PREVIOUS_SHA}^{commit}" >/dev/null 2>&1); then
    if (cd "${REPO_ROOT}" && git diff --quiet "${VERCEL_GIT_PREVIOUS_SHA}" HEAD -- packages/db/src/schema.ts); then
      echo "Skipping db:push (packages/db/src/schema.ts unchanged since ${VERCEL_GIT_PREVIOUS_SHA})."
    else
      run_db_push
    fi
  else
    run_db_push
  fi
fi

(cd "${REPO_ROOT}" && npx turbo run build --filter=dashboard...)
