import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, next, react],
  ignorePatterns: core.ignorePatterns,
  rules: {
    complexity: "off",
    "func-name-matching": "off",
    "hook-use-state": "off",
    "logical-assignment-operators": "off",
    "method-signature-style": "off",
    "no-await-in-loop": "off",
    "no-object-type-as-default-prop": "off",
    "no-noninteractive-element-interactions": "off",
    "prefer-export-from": "off",
    "prefer-import-meta-properties": "off",
    "prefer-named-capture-group": "off",
    "prefer-number-coercion": "off",
    "prefer-single-call": "off",
    "prefer-tag-over-role": "off",
    // Next.js App Router route files are function declarations by convention.
    "react/function-component-definition": "off",
    "react/iframe-missing-sandbox": "off",
    // `react/todo` is not a correctness rule: it reports syntax the React
    // Compiler cannot lower yet (try/finally, computed keys in a destructuring
    // pattern, dynamic `import()`). The code it names is valid and correct, so
    // the only way to satisfy it is to rewrite working code around a compiler
    // limitation. The other React Compiler rules below are on and do catch real
    // bugs; this one stays off deliberately.
    "react/todo": "off",
    "require-unicode-regexp": "off",
    "sort-keys": "off",
    "text-encoding-identifier-case": "off",
    "unicorn/import-style": "off",
  },
});
