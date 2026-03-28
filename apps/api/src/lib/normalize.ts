const PORT_REGEX = /:\d+$/;
const PROTOCOL_REGEX = /^https?:\/\//;
const TRAILING_SLASHES_REGEX = /\/+$/;
const LEADING_SLASHES_REGEX = /^\/+/;
const BACKSLASH_TO_SLASH_REGEX = /\\/g;

export const normalizeHost = (host: string) =>
  host.replace(PORT_REGEX, "").toLowerCase();

export const normalizeHostnameInput = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  const withoutProtocol = trimmed.replace(PROTOCOL_REGEX, "");
  const withoutPath = withoutProtocol.split("/")[0] ?? "";
  return normalizeHost(withoutPath);
};

export const normalizePathPrefix = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(TRAILING_SLASHES_REGEX, "");
};

export const slugifyPath = (value: string) => {
  const trimmed = value
    .replace(BACKSLASH_TO_SLASH_REGEX, "/")
    .replace(TRAILING_SLASHES_REGEX, "");
  return trimmed.replace(LEADING_SLASHES_REGEX, "");
};

export const stripPrefix = (
  pathname: string,
  prefix: string | null
): string | null => {
  if (!prefix) {
    return slugifyPath(pathname);
  }
  const normalizedPath = slugifyPath(pathname);
  const normalizedPrefix = slugifyPath(prefix);
  if (!normalizedPrefix) {
    return normalizedPath;
  }
  if (normalizedPath === normalizedPrefix) {
    return "";
  }
  if (normalizedPath.startsWith(`${normalizedPrefix}/`)) {
    return normalizedPath.slice(normalizedPrefix.length + 1);
  }
  return null;
};
