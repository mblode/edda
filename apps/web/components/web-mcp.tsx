"use client";

// oxlint-disable require-await -- execute signatures must return Promise for WebMCP
// oxlint-disable func-style -- exported component uses function-declaration style
// oxlint-disable no-void -- provideContext returns a promise we intentionally discard

import { useEffect } from "react";

import { siteConfig } from "@/lib/config";

interface JSONSchemaObject {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  description?: string;
  additionalProperties?: boolean;
}

interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchemaObject;
  annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean };
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

// Chrome ships WebMCP on `document.modelContext`; earlier preview builds used
// `navigator.modelContext`, and the earliest only implemented `provideContext`.
interface ModelContextLike {
  provideContext?: (context: { tools: WebMCPTool[] }) => unknown;
  registerTool?: (
    tool: WebMCPTool,
    options?: { signal?: AbortSignal }
  ) => unknown;
}

const getModelContext = (): ModelContextLike | null => {
  const fromDocument = (document as Document & { modelContext?: unknown })
    .modelContext;
  if (fromDocument && typeof fromDocument === "object") {
    return fromDocument as ModelContextLike;
  }
  const fromNavigator = (navigator as Navigator & { modelContext?: unknown })
    .modelContext;
  if (fromNavigator && typeof fromNavigator === "object") {
    return fromNavigator as ModelContextLike;
  }
  return null;
};

const buildTools = (): WebMCPTool[] => [
  {
    description:
      "Return the shell command that scaffolds a new Edda docs site with the given project slug.",
    execute: async ({ slug, template }) => {
      const projectSlug = typeof slug === "string" && slug ? slug : "my-docs";
      const variant =
        template === "starter" || template === "minimal" ? template : "minimal";
      return {
        command: `npx edda-docs new docs --slug ${projectSlug} --template ${variant} -y`,
      };
    },
    inputSchema: {
      additionalProperties: false,
      properties: {
        slug: {
          description: "Project slug (lowercase, hyphen-separated).",
          type: "string",
        },
        template: {
          description: "Template to use: 'minimal' or 'starter'.",
          type: "string",
        },
      },
      required: ["slug"],
      type: "object",
    },
    name: "edda_scaffold_command",
    annotations: { readOnlyHint: true },
  },
  {
    description:
      "Return the shell command that deploys a local Edda docs directory to the given project.",
    execute: async ({ directory, project }) => {
      const dir =
        typeof directory === "string" && directory ? directory : "docs";
      const projectSlug =
        typeof project === "string" && project ? project : "my-docs";
      return {
        command: `npx edda-docs push ${dir} --project ${projectSlug}`,
      };
    },
    inputSchema: {
      additionalProperties: false,
      properties: {
        directory: {
          description: "Local directory containing the docs.",
          type: "string",
        },
        project: {
          description: "Target Edda project slug.",
          type: "string",
        },
      },
      required: ["project"],
      type: "object",
    },
    name: "edda_deploy_command",
    annotations: { readOnlyHint: true },
  },
  {
    description: "Open the Edda dashboard in the current tab.",
    execute: async () => {
      if (typeof window !== "undefined") {
        window.location.assign("/app");
      }
      return { ok: true };
    },
    inputSchema: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
    name: "edda_open_dashboard",
  },
  {
    description: "Navigate to the Edda pricing page.",
    execute: async () => {
      if (typeof window !== "undefined") {
        window.location.assign("/pricing");
      }
      return { ok: true };
    },
    inputSchema: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
    name: "navigate_to_pricing",
  },
  {
    description: "Open the Edda documentation.",
    execute: async () => {
      if (typeof window !== "undefined") {
        window.location.assign("/docs");
      }
      return { ok: true };
    },
    inputSchema: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
    name: "open_docs",
  },
  {
    description: "Return the support contact email for Edda as a mailto URL.",
    execute: async () => ({
      email: siteConfig.links.email,
      mailto: `mailto:${siteConfig.links.email}`,
    }),
    inputSchema: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
    name: "contact_support",
    annotations: { readOnlyHint: true },
  },
  {
    description: "Open the Edda source repository on GitHub in a new tab.",
    execute: async () => {
      if (typeof window !== "undefined") {
        window.open(siteConfig.links.github, "_blank", "noopener,noreferrer");
      }
      return { url: siteConfig.links.github };
    },
    inputSchema: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
    name: "open_github",
  },
];

export function WebMcpTools() {
  useEffect(() => {
    const context = getModelContext();
    if (!context) {
      return;
    }
    const tools = buildTools();
    if (typeof context.registerTool === "function") {
      const controller = new AbortController();
      for (const tool of tools) {
        void context.registerTool(tool, { signal: controller.signal });
      }
      return () => {
        controller.abort();
      };
    }
    if (typeof context.provideContext === "function") {
      void context.provideContext({ tools });
    }
  }, []);

  return null;
}
