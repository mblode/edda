"use client";

import { useEffect } from "react";

interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (
    input: Record<string, unknown>
  ) => Promise<{ content: { type: "text"; text: string }[] }>;
}

interface ModelContext {
  provideContext?: (context: { tools: WebMcpTool[] }) => void;
}

declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }
}

const DOCS_INDEX_URL = "/llms.txt";
const DOCS_QUICKSTART_URL = "/docs/quickstart";
const DOCS_CLI_URL = "/docs/cli/overview";
const DOCS_API_URL = "/docs/api/overview";

const TOOLS: WebMcpTool[] = [
  {
    description:
      "Return the Blode.md documentation index in llms.txt format (URLs + titles).",
    execute: async () => {
      const response = await fetch(DOCS_INDEX_URL, {
        headers: { accept: "text/plain" },
      });
      const text = await response.text();
      return { content: [{ text, type: "text" }] };
    },
    inputSchema: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
    name: "get_docs_index",
  },
  {
    description:
      "Open a Blode.md docs section in the current tab. Section must be one of: quickstart, cli, api.",
    execute: (input) => {
      const section = String(input.section ?? "quickstart");
      const routes: Record<string, string> = {
        api: DOCS_API_URL,
        cli: DOCS_CLI_URL,
        quickstart: DOCS_QUICKSTART_URL,
      };
      const target = routes[section] ?? DOCS_QUICKSTART_URL;
      if (typeof window !== "undefined") {
        window.location.assign(target);
      }
      return Promise.resolve({
        content: [{ text: `Navigating to ${target}`, type: "text" as const }],
      });
    },
    inputSchema: {
      additionalProperties: false,
      properties: {
        section: {
          description: "Docs section to open",
          enum: ["quickstart", "cli", "api"],
          type: "string",
        },
      },
      required: ["section"],
      type: "object",
    },
    name: "open_docs_section",
  },
];

export const WebMcpContext = () => {
  useEffect(() => {
    navigator.modelContext?.provideContext?.({ tools: TOOLS });
  }, []);

  return null;
};
