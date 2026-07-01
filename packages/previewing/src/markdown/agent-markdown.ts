import { NEWLINE_REGEX } from "../constants.js";
import { absolutiseInternalLinks, sanitizePlaceholderUrls } from "./links.js";

const FENCED_CODE_BLOCK_REGEX =
  /(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2(?=\n|$)/g;
const TYPE_TABLE_REGEX = /<TypeTable\s+type=\{\{([\s\S]*?)\}\}\s*\/>/g;
const TYPE_TABLE_ROW_HEADER_REGEX =
  /^\s*(["']?[\w$./<>|{}\-\s]+["']?)\s*:\s*\{\s*$/;
const STRING_FIELD_REGEX = (field: string) =>
  new RegExp(`${field}:\\s*(?:"([^"]*)"|'([^']*)'|\`([^\`]*)\`)`, "s");
const BOOLEAN_FIELD_REGEX = (field: string) =>
  new RegExp(`${field}:\\s*(true|false)`, "s");

const getStringProp = (attributes: string, name: string) => {
  const match = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\\s*"([^"]*)"\\s*\\}|\\{\\s*'([^']*)'\\s*\\})`
  ).exec(attributes);
  return match?.slice(1).find((value) => typeof value === "string");
};

const protectFencedCodeBlocks = (source: string) => {
  const blocks: string[] = [];
  const text = source.replace(FENCED_CODE_BLOCK_REGEX, (match) => {
    const placeholder = `\n@@BLODEMD_CODE_BLOCK_${blocks.length}@@\n`;
    blocks.push(match.trim());
    return placeholder;
  });
  return { blocks, text };
};

const restoreFencedCodeBlocks = (source: string, blocks: string[]) => {
  let restored = source;
  for (const [index, block] of blocks.entries()) {
    // Function replacer: code may contain `$&`, `$1`, `` $` `` etc. which a
    // string replacement would interpret as substitution patterns.
    restored = restored.replace(`@@BLODEMD_CODE_BLOCK_${index}@@`, () => block);
  }
  return restored;
};

const INLINE_CODE_REGEX = /(?<![\\`])`([^`\n]+)`(?!`)/g;

const protectInlineCode = (source: string) => {
  const spans: string[] = [];
  const text = source.replace(INLINE_CODE_REGEX, (match) => {
    const placeholder = `@@BLODEMD_INLINE_CODE_${spans.length}@@`;
    spans.push(match);
    return placeholder;
  });
  return { spans, text };
};

const restoreInlineCode = (source: string, spans: string[]) => {
  let restored = source;
  for (const [index, span] of spans.entries()) {
    restored = restored.replace(`@@BLODEMD_INLINE_CODE_${index}@@`, () => span);
  }
  return restored;
};

const compactMarkdown = (source: string) =>
  source
    .replaceAll(/[ \t]+\n/g, "\n")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim();

const getFieldStringValue = (block: string, field: string) => {
  const match = STRING_FIELD_REGEX(field).exec(block);
  return match?.slice(1).find((value) => typeof value === "string");
};

const getFieldBooleanValue = (block: string, field: string) => {
  const match = BOOLEAN_FIELD_REGEX(field).exec(block);
  return match?.[1];
};

const renderTypeTable = (_match: string, body: string) => {
  const rows: string[] = [];
  const lines = body.split(NEWLINE_REGEX);

  for (let index = 0; index < lines.length; index += 1) {
    const header = TYPE_TABLE_ROW_HEADER_REGEX.exec(lines[index] ?? "");
    if (!header) {
      continue;
    }

    const name = (header[1] ?? "").replaceAll(/^["']|["']$/g, "").trim();
    const blockLines: string[] = [];
    index += 1;
    while (index < lines.length) {
      const line = lines[index] ?? "";
      if (/^\s*\},?\s*$/.test(line)) {
        break;
      }
      blockLines.push(line);
      index += 1;
    }

    const block = blockLines.join("\n");
    const type = getFieldStringValue(block, "type") ?? "";
    const description = getFieldStringValue(block, "description") ?? "";
    const required = getFieldBooleanValue(block, "required") ?? "";
    const defaultValue = getFieldStringValue(block, "default") ?? "";
    const meta = [
      type ? `type: ${type}` : null,
      required ? `required: ${required}` : null,
      defaultValue ? `default: ${defaultValue}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    rows.push(`- \`${name}\`${meta ? ` (${meta})` : ""}: ${description}`);
  }

  return rows.length ? rows.join("\n") : "";
};

const transformMdxComponents = (source: string) => {
  let output = source;

  output = output.replaceAll(TYPE_TABLE_REGEX, renderTypeTable);
  output = output.replaceAll(
    /<Installer\s+([^>]*)\/>/g,
    (_match, attributes: string) => {
      const command = getStringProp(attributes, "command");
      return command ? `\`\`\`bash\n${command}\n\`\`\`` : "";
    }
  );
  output = output.replaceAll(
    /<Tree\.Folder\s+([^>]*)>/g,
    (_match, attributes: string) => {
      const name = getStringProp(attributes, "name") ?? "folder";
      return `- ${name}/`;
    }
  );
  output = output.replaceAll(
    /<Tree\.File\s+([^>]*)\/>/g,
    (_match, attributes: string) => {
      const name = getStringProp(attributes, "name") ?? "file";
      return `- ${name}`;
    }
  );
  output = output.replaceAll("</Tree.Folder>", "");
  output = output.replaceAll(/<\/?Tree[^>]*>/g, "");
  output = output.replaceAll(
    /<Frame(?=[\s>])\s*([^>]*)>([\s\S]*?)<\/Frame>/g,
    (_match, attributes: string, children: string) => {
      const caption = getStringProp(attributes, "caption");
      const hint = getStringProp(attributes, "hint");
      return compactMarkdown(
        [hint, children.trim(), caption ? `Caption: ${caption}` : null]
          .filter(Boolean)
          .join("\n\n")
      );
    }
  );
  output = output.replaceAll(
    /<Callout(?=[\s>])\s*([^>]*)>([\s\S]*?)<\/Callout>/g,
    (_match, attributes: string, children: string) => {
      const type = (getStringProp(attributes, "type") ?? "note").toUpperCase();
      return `> [!${type}]\n${children
        .trim()
        .split(NEWLINE_REGEX)
        .map((line) => `> ${line}`)
        .join("\n")}`;
    }
  );
  for (const [tag, type] of [
    ["Note", "NOTE"],
    ["Warning", "WARNING"],
    ["Info", "INFO"],
    ["Tip", "TIP"],
    ["Check", "CHECK"],
    ["Danger", "DANGER"],
  ] as const) {
    output = output.replaceAll(
      new RegExp(`<${tag}(?=[\\s>])\\s*[^>]*>([\\s\\S]*?)</${tag}>`, "g"),
      (_match, children: string) =>
        `> [!${type}]\n${children
          .trim()
          .split(NEWLINE_REGEX)
          .map((line) => `> ${line}`)
          .join("\n")}`
    );
  }
  output = output.replaceAll(
    /<Accordion(?=[\s>])\s*([^>]*)>([\s\S]*?)<\/Accordion>/g,
    (_match, attributes: string, children: string) => {
      const title = getStringProp(attributes, "title") ?? "Details";
      return `### ${title}\n\n${children.trim()}`;
    }
  );
  output = output.replaceAll(
    /<Tab\s+([^>]*)>([\s\S]*?)<\/Tab>/g,
    (_match, attributes: string, children: string) => {
      const title =
        getStringProp(attributes, "title") ??
        getStringProp(attributes, "label") ??
        "Tab";
      return `### ${title}\n\n${children.trim()}`;
    }
  );
  output = output.replaceAll(
    /<Step\s+([^>]*)>([\s\S]*?)<\/Step>/g,
    (_match, attributes: string, children: string) => {
      const title = getStringProp(attributes, "title") ?? "Step";
      return `1. **${title}**\n\n${children.trim()}`;
    }
  );
  output = output.replaceAll(
    /<Expandable(?=[\s>])\s*([^>]*)>([\s\S]*?)<\/Expandable>/g,
    (_match, attributes: string, children: string) => {
      const title = getStringProp(attributes, "title") ?? "Details";
      return `### ${title}\n\n${children.trim()}`;
    }
  );
  output = output.replaceAll(
    /<Card(?=[\s>])\s*([^>]*)>([\s\S]*?)<\/Card>/g,
    (_match, attributes: string, children: string) => {
      const title = getStringProp(attributes, "title");
      const href = getStringProp(attributes, "href");
      const heading = title
        ? `### ${href ? `[${title}](${href})` : title}`
        : "";
      return compactMarkdown(
        [heading, children.trim()].filter(Boolean).join("\n\n")
      );
    }
  );
  output = output.replaceAll(
    /<\/?(?:Columns|Column|CodeGroup|Tabs|Steps|AccordionGroup|CardGroup)[^>]*>/g,
    ""
  );

  return compactMarkdown(output);
};

export const toAgentMarkdown = (source: string): string => {
  const { blocks, text: codeProtected } = protectFencedCodeBlocks(source);
  const { spans, text: inlineProtected } = protectInlineCode(codeProtected);
  const transformed = transformMdxComponents(inlineProtected);
  const inlineRestored = restoreInlineCode(transformed, spans);
  return compactMarkdown(restoreFencedCodeBlocks(inlineRestored, blocks));
};

export const prepareLlmsFullContent = (
  source: string,
  origin: string,
  basePath: string
) =>
  absolutiseInternalLinks(
    sanitizePlaceholderUrls(toAgentMarkdown(source)),
    origin,
    basePath
  );
