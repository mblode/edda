"use client";

import { useLayoutEffect } from "react";

import { useCurrentDocPath } from "@/components/docs/use-current-doc-path";
import { findActiveTabIndex } from "@/lib/navigation";
import type { NavTab } from "@/lib/navigation";

export const SidebarTabSync = ({
  basePath,
  tabs,
}: {
  basePath: string;
  tabs: NavTab[];
}) => {
  const currentPath = useCurrentDocPath(basePath);
  const activeTabIndex = findActiveTabIndex(tabs, currentPath);

  useLayoutEffect(() => {
    const panels = document.querySelectorAll<HTMLElement>("[data-sidebar-tab]");
    for (const panel of panels) {
      panel.hidden = Number(panel.dataset.sidebarTab) !== activeTabIndex;
    }
  }, [activeTabIndex]);

  return null;
};
