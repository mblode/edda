import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "apps/docs"),
    },
  },
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    include: ["**/*.unit.test.ts", "**/*.unit.test.tsx"],
    passWithNoTests: false,
  },
});
