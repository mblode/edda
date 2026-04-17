import { readTrimmedEnv } from "./env";
import { logError } from "./logger";

const docsAppUrl =
  readTrimmedEnv("DOCS_REVALIDATE_URL") ?? readTrimmedEnv("DOCS_APP_URL");
const revalidateSecret = readTrimmedEnv("REVALIDATE_SECRET");

// Preflight the configured docs URL once per process. This catches the class
// of misconfig where the env var points at a stale/renamed Vercel alias —
// revalidate calls would fail for up to 1h of ISR TTL before anyone noticed.
let preflightPromise: Promise<void> | null = null;
const preflightDocsUrl = () => {
  if (!docsAppUrl) {
    return;
  }
  preflightPromise ??= (async () => {
    try {
      const response = await fetch(new URL("/api/revalidate", docsAppUrl), {
        method: "HEAD",
      });
      if (response.status === 404) {
        logError(
          `DOCS_REVALIDATE_URL (${docsAppUrl}) returned 404 for /api/revalidate — docs revalidation after publish will silently fail; check that the URL matches the current docs deployment.`,
          null
        );
      }
    } catch (error) {
      logError(
        `Failed to preflight DOCS_REVALIDATE_URL (${docsAppUrl}); docs revalidation may be unreachable.`,
        error
      );
    }
  })();
  return preflightPromise;
};

export const revalidateProject = async (projectSlug: string) => {
  if (!(docsAppUrl && revalidateSecret)) {
    return;
  }

  await preflightDocsUrl();

  const url = new URL("/api/revalidate", docsAppUrl);
  const body = JSON.stringify({
    paths: [`/sites/${projectSlug}`],
    secret: revalidateSecret,
    tags: [`project:${projectSlug}`, "tenants"],
  });

  // Retry once on transient failures so a single flake doesn't leave ISR HTML
  // stale for up to an hour.
  let lastError: Error = new Error("Revalidation failed: unknown");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        body,
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      if (response.ok) {
        return;
      }
      lastError = new Error(`Revalidation failed: ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError;
};
