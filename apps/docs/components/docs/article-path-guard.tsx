"use client";

import type { ReactNode } from "react";

import { DocArticleSkeleton } from "@/components/docs/doc-article-skeleton";
import { useCurrentDocPath } from "@/components/docs/use-current-doc-path";
import { articleMatchesUrlPath } from "@/lib/current-doc-path";

export const ArticlePathGuard = ({
  basePath,
  children,
  currentPath,
}: {
  basePath: string;
  children: ReactNode;
  currentPath: string;
}) => {
  const urlPath = useCurrentDocPath(basePath);
  if (!articleMatchesUrlPath(currentPath, urlPath)) {
    return <DocArticleSkeleton />;
  }

  return children;
};
