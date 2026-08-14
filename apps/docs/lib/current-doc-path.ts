import { normalizePath } from "@repo/common";

export const currentDocPathFromPathname = (
  pathname: string,
  basePath: string
) => {
  const stripped = basePath
    ? pathname.replace(new RegExp(`^${basePath}`), "")
    : pathname;
  return normalizePath(stripped) || "index";
};

export const articleMatchesUrlPath = (currentPath: string, urlPath: string) =>
  currentPath === urlPath;
