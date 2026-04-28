"use client";

import { normalizePath } from "@repo/common";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ACTIVE_CLASSES = ["border-accent", "bg-accent", "text-foreground"];

export const SidebarActiveHighlight = ({ basePath }: { basePath: string }) => {
  const pathname = usePathname();

  useEffect(() => {
    const stripped = basePath
      ? pathname.replace(new RegExp(`^${basePath}`), "")
      : pathname;
    const target = normalizePath(stripped) || "index";

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
