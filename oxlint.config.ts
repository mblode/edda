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
    // oxlint 1.82 split the single `react-compiler` switch this repo used into
    // individually named React Compiler rules. These six restore that setting.
    // Re-enabling them is a deliberate call: ~13 existing sites would need
    // review, several of which are intentional mount-effect patterns.
    "react/exhaustive-effect-dependencies": "off",
    "react/immutability": "off",
    "react/purity": "off",
    "react/set-state-in-effect": "off",
    "react/static-components": "off",
    "react/todo": "off",
    "require-unicode-regexp": "off",
    "sort-keys": "off",
    "text-encoding-identifier-case": "off",
    "unicorn/import-style": "off",
  },
});
