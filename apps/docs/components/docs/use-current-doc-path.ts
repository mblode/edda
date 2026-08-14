"use client";

import { usePathname } from "next/navigation";

import { currentDocPathFromPathname } from "@/lib/current-doc-path";

export const useCurrentDocPath = (basePath: string) => {
  const pathname = usePathname();
  return currentDocPathFromPathname(pathname, basePath);
};
