import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "DOCS_APP_URL=http://127.0.0.1:3001 DASHBOARD_APP_URL=http://127.0.0.1:3002 npm run dev:e2e --workspace=apps/web",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: "http://localhost:3000",
    },
    {
      command: "npm run dev:e2e --workspace=apps/docs",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: "http://localhost:3001",
    },
    {
      command:
        "DATABASE_URL=postgresql://localhost/dummy NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=e2e-anon-key npm run dev:e2e --workspace=apps/dashboard",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: "http://localhost:3002",
    },
  ],
});
