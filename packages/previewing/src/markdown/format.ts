import { slugify } from "@repo/common";
import YAML from "yaml";

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
const LEADING_H1_REGEX = /^#\s+([^\r\n]+)(?:\r?\n(?:\r?\n)?)?/;

export const parseFrontmatter = (source: string) => {
  const match = FRONTMATTER_REGEX.exec(source);
  if (!match) {
    return { body: source, frontmatter: {} };
  }
  const raw = match[1] ?? "";
  const data = YAML.parse(raw) ?? {};
  const body = source.slice(match[0].length);
  return { body, frontmatter: data };
};

export const stripFrontmatter = (source: string) =>
  parseFrontmatter(source).body.trim();

const stripMatchingLeadingH1 = (source: string, title: string) => {
  const trimmed = source.trimStart();
  const match = LEADING_H1_REGEX.exec(trimmed);
  if (!match) {
    return trimmed.trim();
  }

  const [headingLine = "", headingTitle = ""] = match;
  if (slugify(headingTitle) !== slugify(title)) {
    return trimmed.trim();
  }

  return trimmed.slice(headingLine.length).trim();
};

export const formatMarkdownPage = (
  title: string,
  source: string,
  description?: string
) => {
  const content = stripMatchingLeadingH1(source, title);
  const descriptionBlock = description ? `\n\n${description}` : "";
  if (!content) {
    return `# ${title}${descriptionBlock}`;
  }

  return `# ${title}${descriptionBlock}\n\n${content}`;
};

export const formatMarkdownPageSection = (
  title: string,
  url: string,
  source: string,
  description?: string
) => {
  const content = stripMatchingLeadingH1(source, title);
  const descriptionBlock = description ? `\n\n${description}` : "";
  if (!content) {
    return `# ${title} (${url})${descriptionBlock}`;
  }

  return `# ${title} (${url})${descriptionBlock}\n\n${content}`;
};
