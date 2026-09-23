import { defineConfig } from "@playwright/test";

const servers = {
  dashboard: {
    command:
      "DATABASE_URL=postgresql://localhost/dummy NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=e2e-anon-key npm run dev:e2e --workspace=apps/dashboard",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://localhost:3002",
  },
  docs: {
    command: "npm run dev:e2e --workspace=apps/docs",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // `/` is tenant-routed and 404s on localhost, which Playwright never
    // treats as ready.
    url: "http://localhost:3001/api/health",
  },
  web: {
    command:
      "DOCS_APP_URL=http://127.0.0.1:3001 DASHBOARD_APP_URL=http://127.0.0.1:3002 npm run dev:e2e --workspace=apps/web",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://localhost:3000",
  },
};

// `E2E_APPS=web` starts only the servers a spec needs (`npm run test:instant`
// touches apps/web alone). Unset, every app starts.
const webServer = (process.env.E2E_APPS ?? "web,docs,dashboard")
  .split(",")
  .map((name) => {
    const server = servers[name.trim() as keyof typeof servers];
    if (!server) {
      throw new Error(
        `Unknown E2E_APPS entry "${name}". Use ${Object.keys(servers).join(", ")}.`
      );
    }
    return server;
  });

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer,
});
