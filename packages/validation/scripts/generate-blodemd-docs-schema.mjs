import fs from "node:fs/promises";

const sourcePath = new URL(
  "../vendor/mintlify-docs-schema.json",
  import.meta.url
);
const outputPath = new URL("../src/blodemd-docs-schema.json", import.meta.url);

const ALLOWED_TOP_LEVEL_FIELDS = new Set([
  "$schema",
  "api",
  "appearance",
  "contextual",
  "description",
  "favicon",
  "logo",
  "metadata",
  "name",
  "navbar",
  "navigation",
  "search",
  "seo",
]);

const PROJECT_SLUG_SCHEMA = {
  description:
    "URL-safe project slug used for deployments and the default `{slug}.blode.md` hostname.",
  minLength: 1,
  pattern: "^[a-z0-9-]+$",
  type: "string",
};

const CONTEXTUAL_OPTIONS = [
  "add-mcp",
  "aistudio",
  "assistant",
  "chatgpt",
  "claude",
  "copy",
  "cursor",
  "devin",
  "devin-mcp",
  "grok",
  "mcp",
  "perplexity",
  "view",
  "vscode",
  "windsurf",
];

const getBaseVariant = (source) => {
  const baseVariant = structuredClone(source.anyOf?.[0]);
  if (!baseVariant || typeof baseVariant !== "object") {
    throw new Error("Expected a theme variant in mintlify-docs-schema.json.");
  }

  return baseVariant;
};

const getAllowedProperties = (baseVariant) =>
  Object.fromEntries(
    Object.entries(baseVariant.properties ?? {}).filter(([key]) =>
      ALLOWED_TOP_LEVEL_FIELDS.has(key)
    )
  );

const updateLogoProperty = (properties) => {
  if (!properties.logo) {
    return;
  }

  properties.logo.description =
    "Your site logo. Provide a single image path or separate files for light and dark mode.";
  const objectVariant = properties.logo.anyOf?.find(
    (entry) => entry?.type === "object"
  );
  if (objectVariant?.properties?.alt) {
    delete objectVariant.properties.alt;
  }
};

const updateContextualProperty = (properties) => {
  const contextualEnum =
    properties.contextual?.properties?.options?.items?.anyOf?.find((entry) =>
      Array.isArray(entry?.enum)
    );

  if (contextualEnum) {
    contextualEnum.enum = CONTEXTUAL_OPTIONS;
  }
};

const updateSeoProperty = (properties) => {
  if (!properties.seo) {
    return;
  }

  properties.seo = {
    additionalProperties: false,
    description: "SEO indexing configuration.",
    properties: {
      indexing: {
        description:
          "Set `all` to index every page, or `default` to respect page-level `noindex` frontmatter.",
        enum: ["all", "default"],
        type: "string",
      },
    },
    type: "object",
  };
};

const customizeProperties = (properties) => {
  if (properties.$schema) {
    properties.$schema.default = "https://blode.md/docs.json";
    properties.$schema.description = "JSON Schema URL for editor autocomplete.";
  }

  if (properties.name) {
    properties.name.description =
      "Display name for your site, project, or organization.";
  }

  properties.slug = PROJECT_SLUG_SCHEMA;

  if (properties.favicon) {
    properties.favicon.description =
      "Path to your favicon file, including the file extension. Provide a single file or separate files for light and dark mode.";
  }

  if (properties.appearance) {
    properties.appearance.description = "Light and dark mode settings.";
  }

  updateLogoProperty(properties);
  updateContextualProperty(properties);
  updateSeoProperty(properties);
};

const main = async () => {
  const source = JSON.parse(await fs.readFile(sourcePath, "utf8"));
  const baseVariant = getBaseVariant(source);
  const properties = getAllowedProperties(baseVariant);
  customizeProperties(properties);

  const schema = {
    $id: "https://blode.md/docs.json",
    $schema: source.$schema,
    additionalProperties: false,
    definitions: source.definitions,
    description:
      "Schema for Blode.md docs.json configuration files. Derived from the vendored Mintlify schema and pruned to the supported Blode.md surface.",
    properties,
    required: ["name", "navigation"],
    type: "object",
  };

  await fs.writeFile(outputPath, `${JSON.stringify(schema, null, 2)}\n`);
};

await main();
