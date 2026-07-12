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
    "react/iframe-missing-sandbox": "off",
    "react-compiler": "off",
    "require-unicode-regexp": "off",
    "sort-keys": "off",
    "text-encoding-identifier-case": "off",
    "unicorn/import-style": "off",
  },
});
