import path from "node:path";

import { defineConfig } from "vitest/config";

const sharedExclude = [
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "apps/cli/dev-server/**",
  "apps/cli/docs/**",
  "apps/cli/packages/**",
];

const docsAlias = {
  "@": path.resolve(import.meta.dirname, "apps/docs"),
};

const webAlias = {
  "@": path.resolve(import.meta.dirname, "apps/web"),
};

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        oxc: { jsx: { runtime: "automatic" } },
        resolve: { alias: docsAlias },
        test: {
          environment: "node",
          exclude: [...sharedExclude, "apps/web/**"],
          include: ["**/*.unit.test.ts", "**/*.unit.test.tsx"],
          name: "unit",
        },
      },
      {
        extends: true,
        oxc: { jsx: { runtime: "automatic" } },
        resolve: { alias: webAlias },
        test: {
          environment: "node",
          exclude: sharedExclude,
          include: [
            "apps/web/**/*.unit.test.ts",
            "apps/web/**/*.unit.test.tsx",
          ],
          name: "unit-web",
        },
      },
      {
        extends: true,
        oxc: { jsx: { runtime: "automatic" } },
        resolve: { alias: docsAlias },
        test: {
          environment: "jsdom",
          exclude: sharedExclude,
          include: ["**/*.component.test.tsx"],
          name: "component",
          passWithNoTests: true,
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          environment: "node",
          exclude: sharedExclude,
          include: ["**/*.int.test.ts", "**/*.int.test.tsx"],
          name: "integration",
        },
      },
      {
        extends: true,
        test: {
          environment: "node",
          exclude: sharedExclude,
          include: ["**/*.smoke.test.ts", "**/*.smoke.test.tsx"],
          name: "smoke",
        },
      },
    ],
  },
});
