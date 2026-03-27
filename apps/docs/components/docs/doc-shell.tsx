import type { SiteConfig } from "@repo/models";
import Script from "next/script";
import type { ReactNode } from "react";

import { DocHeader } from "@/components/docs/doc-header";
import { DocSidebar } from "@/components/docs/doc-sidebar";
import { DocToc } from "@/components/docs/doc-toc";
import type { NavEntry } from "@/lib/navigation";
import { toDocHref } from "@/lib/routes";
import { themeStylesFromConfig } from "@/lib/theme";
import type { TocItem } from "@/lib/toc";

const renderScripts = (scripts?: string[]) =>
  scripts?.map((script) => (
    <Script key={script} src={script} strategy="afterInteractive" />
  )) ?? null;

const Breadcrumbs = ({
  basePath,
  breadcrumbs,
}: {
  basePath: string;
  breadcrumbs: { label: string; path: string }[];
}) => {
  if (!breadcrumbs.length) {
    return null;
  }

  return (
    <nav className="doc-breadcrumbs">
      {breadcrumbs.map((crumb, index) => {
        const key = `${crumb.path || "current"}-${crumb.label}`;
        const isLast = index === breadcrumbs.length - 1;
        return (
          <span key={key}>
            {crumb.path ? (
              <a href={toDocHref(crumb.path, basePath)}>{crumb.label}</a>
            ) : (
              <span>{crumb.label}</span>
            )}
            {isLast ? null : <span className="doc-breadcrumbs__sep">/</span>}
          </span>
        );
      })}
    </nav>
  );
};

export const DocShell = ({
  config,
  nav,
  toc,
  content,
  currentPath,
  breadcrumbs,
  pageTitle,
  pageDescription,
  searchItems,
  anchors,
  basePath,
  headerLabel,
}: {
  config: SiteConfig;
  nav: NavEntry[];
  toc: TocItem[];
  content: ReactNode;
  currentPath: string;
  breadcrumbs: { label: string; path: string }[];
  pageTitle: string;
  pageDescription?: string;
  searchItems: { title: string; path: string }[];
  anchors?: { label: string; href: string }[];
  basePath: string;
  headerLabel?: string;
}) => {
  const hasSidebar = Boolean((nav?.length ?? 0) || (anchors?.length ?? 0));
  const hasToc =
    config.features?.rightToc !== false &&
    config.features?.toc !== false &&
    toc.length > 0;
  const layoutClass =
    hasSidebar || hasToc ? "docs-layout" : "docs-layout docs-layout--single";

  return (
    <div
      className={`docs-root theme-${config.theme ?? "mint"}`}
      data-has-dark-logo={config.logo?.dark ? "true" : "false"}
      style={themeStylesFromConfig(config)}
    >
      {renderScripts(config.scripts?.head)}
      <DocHeader
        basePath={basePath}
        config={config}
        label={headerLabel}
        searchItems={searchItems}
      />
      <div className={layoutClass}>
        {hasSidebar ? (
          <DocSidebar
            anchors={anchors}
            basePath={basePath}
            currentPath={currentPath}
            entries={nav}
          />
        ) : null}
        <main className="doc-main">
          <div className="doc-content">
            <Breadcrumbs basePath={basePath} breadcrumbs={breadcrumbs} />
            <h1>{pageTitle}</h1>
            {pageDescription ? (
              <p className="doc-description">{pageDescription}</p>
            ) : null}
            <div className="doc-body">{content}</div>
          </div>
        </main>
        {hasToc ? <DocToc toc={toc} /> : null}
      </div>
      {renderScripts(config.scripts?.body)}
    </div>
  );
};
