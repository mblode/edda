import type { PageMode, SiteConfig } from "@repo/models";
import type { ReactNode } from "react";

import { DocArticle } from "@/components/docs/doc-article";
import { DocChrome } from "@/components/docs/doc-chrome";
import type { NavEntry, NavTab } from "@/lib/navigation";
import type { TocItem } from "@/lib/toc";

export const DocShell = ({
  config,
  nav,
  prevPage,
  nextPage,
  toc,
  content,
  currentPath,
  breadcrumbs,
  pageTitle,
  pageDescription,
  anchors,
  basePath,
  markdownHref,
  rawContent,
  tabs,
  tenantSlug,
  mode,
  deprecated,
  hideFooterPagination,
}: {
  config: SiteConfig;
  nav: NavEntry[];
  prevPage?: { title: string; path: string };
  nextPage?: { title: string; path: string; description?: string };
  toc: TocItem[];
  content: ReactNode;
  currentPath: string;
  breadcrumbs: { label: string; path: string }[];
  pageTitle: string;
  pageDescription?: string;
  anchors?: { label: string; href: string }[];
  activeTabIndex?: number;
  basePath: string;
  markdownHref?: string;
  rawContent?: string;
  tabs?: NavTab[] | null;
  tenantSlug?: string;
  mode?: PageMode;
  deprecated?: boolean;
  hideFooterPagination?: boolean;
}) => (
  <DocChrome
    anchors={anchors}
    basePath={basePath}
    config={config}
    nav={nav}
    tabs={tabs}
    tenantSlug={tenantSlug}
  >
    <DocArticle
      basePath={basePath}
      breadcrumbs={breadcrumbs}
      config={config}
      content={content}
      currentPath={currentPath}
      deprecated={deprecated}
      hideFooterPagination={hideFooterPagination}
      markdownHref={markdownHref}
      mode={mode}
      nextPage={nextPage}
      pageDescription={pageDescription}
      pageTitle={pageTitle}
      prevPage={prevPage}
      rawContent={rawContent}
      toc={toc}
    />
  </DocChrome>
);
