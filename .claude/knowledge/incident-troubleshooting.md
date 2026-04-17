# Incident Troubleshooting

Incident debugging and recovery. Known failure modes, debugging approaches, runbooks, recovery steps.

## "Deployment Successful" but tenant URL shows "no docs deployment yet"

**Symptom.** Dashboard (`blode.md/app/<slug>/deployments`) shows a deploy as **Successful**, but `<slug>.blode.md` renders the "Unpublished Project — has no docs deployment yet" empty state.

**Counter-intuitive cause.** The deploy pipeline succeeded end-to-end (DB, Blob, Edge Config all correct). The docs app is serving **stale ISR HTML** because the post-finalize call to `revalidateProject(slug)` failed silently.

Two classes of silent failure have caused this:

1. **`DOCS_REVALIDATE_URL` points at a dead/renamed Vercel alias.** The API POSTs to `<URL>/api/revalidate`; if the URL returns 404 (because the docs project was renamed, the alias was removed, etc.), the call throws, gets swallowed by a `catch { logWarn(...) }`, and the deployment row still reads "Successful". The startup preflight in `apps/api/src/lib/revalidate.ts` now logs this at ERROR level, but operators must actually be watching logs.
2. **`revalidateTag` without tagged fetches is a no-op.** Early versions of the API only sent `tags: ["project:<slug>", "tenants"]` in the revalidate POST — but the docs pages cache via time-based `export const revalidate = 3600`, not tagged fetches. The POST "succeeded" but nothing was invalidated. The API now also sends `paths: ["/sites/<slug>"]` so `revalidatePath` busts the ISR HTML for the tenant subtree.

### Diagnostic order (30-second checks)

Work from the outside in — it's usually the CDN/revalidate layer, not Edge Config:

1. Cache-busted URL renders correctly? `curl -s "https://<slug>.blode.md?ts=$(date +%s)"` — if this shows real content, the data pipeline is fine and the bug is ISR/CDN cache.
2. API `/tenants/<slug>` is correct? `curl https://api.blode.md/tenants/<slug>` — should return `activeDeploymentManifestUrl` matching the Blob URL of the latest successful deployment row.
3. Edge Config is fresh? `curl -H "Authorization: Bearer <TOKEN_FROM_EDGE_CONFIG_URL>" https://edge-config.vercel.com/<ID>/item/ts_<slug>`.
4. `DOCS_REVALIDATE_URL` alive? `curl -s -o /dev/null -w "%{http_code}\n" -X POST "$(vercel env pull ... ; grep DOCS_REVALIDATE_URL)/api/revalidate"` — should return **401** (secret missing), NOT 404 (dead alias).

If steps 1–3 are healthy but the canonical URL is stale: step 4 is broken.

### Fix

1. **Update the env var** (if the alias died):
   ```bash
   cd apps/api
   vercel env rm DOCS_REVALIDATE_URL production --yes
   echo "https://blode.md" | vercel env add DOCS_REVALIDATE_URL production
   ```
2. **Redeploy the API** so the new value is live: `vercel --prod --yes`.
3. **Bust the stale HTML** without waiting 1h:
   - Either re-run `blodemd push --project <slug>` (easiest; exercises the full path),
   - Or POST directly to `https://blode.md/api/revalidate` with `{"secret": "$REVALIDATE_SECRET", "paths": ["/sites/<slug>"], "tags": ["project:<slug>"]}`.
4. Verify: `curl -s https://<slug>.blode.md | grep -oE 'Welcome|Unpublished'`.

### Gotchas when redeploying via the CLI from this monorepo

- `vercel` CLI deployed from `apps/docs/` uploads only that subtree, so workspace packages (`@repo/*`) fail to resolve during build. Always deploy via `git push` (triggers Vercel's git integration from the repo root) unless you have a specific reason not to.
- The `blodemd-docs` project at one point had `installCommand` set to `null` (vs `npm install --ignore-scripts` at the repo `vercel.json`) — CLI deploys from `apps/docs` lose the repo-root `vercel.json`. If a CLI deploy fails with `Missing \`packageManager\` field`, this is why.
- `REVALIDATE_SECRET` is stored as a **Sensitive** env var — it's never returned by `vercel env pull` or the Vercel API. If you lose it, you must rotate it on both `blodemd-api` and `blodemd-docs` together and redeploy both in lock-step.

### Related code

- `apps/api/src/lib/revalidate.ts` — preflight, retry, and the POST body that now includes `paths`.
- `apps/api/src/routes/deployments.ts:267-293` — post-finalize orchestration; `revalidateProject` and `syncProjectTenantEdgeConfig` failures log at ERROR level.
- `apps/docs/app/api/revalidate/route.ts` — receives the POST, calls `revalidatePath` + `revalidateTag`, clears in-process tenant caches.
- `apps/docs/app/sites/[tenant]/[[...slug]]/page.tsx:27` — `export const revalidate = 3600` (the ISR TTL that makes stale cache particularly painful when revalidation is broken).
- `apps/docs/lib/docs-runtime.tsx:188-196` — where the "unpublished" empty state gets returned (only when `tenant.activeDeploymentManifestUrl` is missing **and** `docs.json` can't be loaded locally).
