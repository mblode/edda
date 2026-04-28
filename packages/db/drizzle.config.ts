import { defineConfig } from "drizzle-kit";

// Prefer the direct Postgres connection for migrations. Pooled URLs (Supabase
// pgbouncer on :6543) hang drizzle-kit because each pg_catalog introspection
// query round-trips through the pooler and prepared statements break in
// transaction mode.
//
// `||` (not `??`) so an explicitly-empty value falls through — Vercel's env
// system can hand back `""` for Encrypted vars in some pulls.
const databaseUrl =
  process.env.DIRECT_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DIRECT_URL, POSTGRES_URL_NON_POOLING, or DATABASE_URL is required to run drizzle-kit commands."
  );
}

export default defineConfig({
  dbCredentials: {
    url: databaseUrl,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema.ts",
  schemaFilter: ["public"],
  tablesFilter: [
    "users",
    "projects",
    "domains",
    "deployments",
    "git_connections",
    "github_installations",
  ],
});
