"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { currentDocPathFromPathname } from "@/lib/current-doc-path";

const ACTIVE_CLASSES = ["border-accent", "bg-accent", "text-foreground"];

export const SidebarActiveHighlight = ({ basePath }: { basePath: string }) => {
  const pathname = usePathname();

  useEffect(() => {
    const target = currentDocPathFromPathname(pathname, basePath);

    const links = document.querySelectorAll<HTMLElement>(
      "[data-sidebar-link][data-path]"
    );
    for (const link of links) {
      const isActive = link.dataset.path === target;
      if (isActive) {
        link.dataset.active = "true";
        link.classList.add(...ACTIVE_CLASSES);
      } else {
        delete link.dataset.active;
        link.classList.remove(...ACTIVE_CLASSES);
      }
    }
  }, [basePath, pathname]);

  return null;
};
