"use client";

import Link from "next/link";

import { useCurrentDocPath } from "@/components/docs/use-current-doc-path";
import { findActiveTabIndex } from "@/lib/navigation";
import type { NavTab } from "@/lib/navigation";
import { isExternalHref, resolveHref, toDocHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

export const HeaderTabs = ({
  tabs,
  basePath,
}: {
  tabs: NavTab[];
  basePath: string;
}) => {
  const currentPath = useCurrentDocPath(basePath);
  const activeTabIndex = findActiveTabIndex(tabs, currentPath);

  return (
    <nav
      aria-label="Navigation tabs"
      className="ml-4 hidden items-center gap-0.5 lg:flex"
    >
      {tabs.map((tab, index) => {
        const isActive = index === activeTabIndex;
        const href =
          (tab.href ? resolveHref(tab.href, basePath) : undefined) ??
          (tab.slugPrefix ? toDocHref(tab.slugPrefix, basePath) : undefined);

        if (!href) {
          return null;
        }

        const isExternal = Boolean(tab.href && isExternalHref(tab.href));

        return (
          <Link
            className={cn(
              "relative px-2.5 py-1.5 text-sm transition-colors",
              isActive
                ? "font-medium text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            href={href}
            key={tab.label}
            rel={isExternal ? "noopener noreferrer" : undefined}
            target={isExternal ? "_blank" : undefined}
          >
            {tab.label}
            {isActive ? (
              <span className="absolute inset-x-1 -bottom-3.5 h-0.5 rounded-full bg-primary" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
};
