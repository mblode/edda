// oxlint-disable require-await -- execute signatures must return Promise for WebMCP

interface JSONSchemaObject {
  additionalProperties?: boolean;
  description?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  type: string;
}

interface WebMCPTool {
  description: string;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
  inputSchema: JSONSchemaObject;
  name: string;
}

interface NavigatorModelContext {
  provideContext?: (context: { tools: WebMCPTool[] }) => void | Promise<void>;
}

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
];

export const registerWebMcpTools = () => {
  const nav = navigator as Navigator & {
    modelContext?: NavigatorModelContext;
  };
  if (!nav.modelContext?.provideContext) {
    return;
  }
  void nav.modelContext.provideContext({ tools: buildTools() });
};
