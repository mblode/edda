const PLACEHOLDER_URL_PATTERN = [
  "https?://(?:[a-z0-9-]+\\.)*example\\.(?:com|org|net)\\b[^\\s)\\]\"'<>]*",
  "https?://discord\\.gg/example\\b[^\\s)\\]\"'<>]*",
  "https?://(?:[a-z0-9-]+\\.)+(?:test|invalid)(?:[/?#:][^\\s)\\]\"'<>]*)?",
  "https?://localhost(?::\\d+)?[^\\s)\\]\"'<>]*",
  "https?://(?:[a-z0-9-]+\\.)*your[-_]?domain\\.[a-z]+\\b[^\\s)\\]\"'<>]*",
  "https?://acme\\.blode\\.md\\b[^\\s)\\]\"'<>]*",
  "https?://github\\.com/example/[^\\s)\\]\"'<>]*",
  "https?://(?:us|eu)\\.i\\.posthog\\.com\\b[^\\s)\\]\"'<>]*",
].join("|");
const PLACEHOLDER_URL_RE = new RegExp(PLACEHOLDER_URL_PATTERN, "gi");
const PLACEHOLDER_MARKDOWN_LINK_RE = new RegExp(
  `\\[([^\\]]+)\\]\\((?:${PLACEHOLDER_URL_PATTERN})\\)`,
  "gi"
);
const INTERNAL_MARKDOWN_LINK_RE = /(!?\[[^\]]+\])\((\/[^)\s]*)\)/g;

const defangUrl = (value: string) => value.replace(/^https?:\/\//i, "");

export const sanitizePlaceholderUrls = (text: string): string =>
  text
    .replace(PLACEHOLDER_MARKDOWN_LINK_RE, "$1")
    .replace(PLACEHOLDER_URL_RE, (match) => `\`${defangUrl(match)}\``);

export const absolutiseInternalLinks = (
  source: string,
  origin: string,
  basePath: string
): string => {
  const normalizedBase = basePath
    ? `/${basePath}`.replaceAll(/\/+/g, "/").replace(/\/$/, "")
    : "";
  return source.replaceAll(
    INTERNAL_MARKDOWN_LINK_RE,
    (_match, label, linkPath) => {
      const alreadyPrefixed =
        normalizedBase &&
        (linkPath === normalizedBase ||
          linkPath.startsWith(`${normalizedBase}/`));
      const absolutePath = alreadyPrefixed
        ? linkPath
        : `${normalizedBase}${linkPath}`.replaceAll(/\/+/g, "/");
      return `${label}(${origin}${absolutePath})`;
    }
  );
};
