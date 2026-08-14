import type { SiteConfig } from "@repo/models";
import Script from "next/script";
import type { ReactNode } from "react";

import { DocHeader } from "@/components/docs/doc-header";
import { DocSidebar } from "@/components/docs/doc-sidebar";
import { SidebarTabSync } from "@/components/docs/sidebar-tab-sync";
import { flattenNav } from "@/lib/navigation";
import type { NavEntry, NavTab } from "@/lib/navigation";
import { themeStylesFromConfig } from "@/lib/theme";

const DocScripts = ({
  scripts,
  strategy = "afterInteractive",
}: {
  scripts?: string[];
  strategy?: "afterInteractive" | "lazyOnload";
}) => {
  if (!scripts?.length) {
    return null;
  }

  return scripts.map((script) => (
    <Script key={script} src={script} strategy={strategy} />
  ));
};

const tabPathIndexScript = (basePath: string, tabs: NavTab[]) => {
  const pathIndex = Object.fromEntries(
    tabs.flatMap((tab, index) =>
      flattenNav(tab.entries).map((page) => [page.path, index])
    )
  );

  return `(function(){var base=${JSON.stringify(basePath)};var map=${JSON.stringify(pathIndex)};var path=location.pathname;if(base&&path.indexOf(base)===0)path=path.slice(base.length);path=path.replace(/^\\/+|\\/+$/g,"")||"index";var i=map[path]||0;document.querySelectorAll("[data-sidebar-tab]").forEach(function(el){el.hidden=Number(el.getAttribute("data-sidebar-tab"))!==i;});})();`;
};

export const DocChromeFallback = ({ children }: { children: ReactNode }) => (
  <div className="doc-chrome min-h-screen font-sans">
    <div className="h-(--header-height) shrink-0 border-b border-border" />
    <div className="container-wrapper flex flex-1 flex-col">
      <div
        className="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">{children}</div>
        <div className="hidden self-stretch lg:col-start-1 lg:row-start-1 lg:block" />
      </div>
    </div>
  </div>
);

export const DocChrome = ({
  anchors,
  basePath,
  children,
  config,
  nav,
  tabs,
  tenantSlug,
}: {
  anchors?: { label: string; href: string }[];
  basePath: string;
  children: ReactNode;
  config: SiteConfig;
  nav: NavEntry[];
  tabs?: NavTab[] | null;
  tenantSlug?: string;
}) => {
  const showSidebar = Boolean(
    (nav?.length ?? 0) || (anchors?.length ?? 0) || (tabs?.length ?? 0)
  );

  return (
    <div
      className="doc-chrome min-h-screen font-sans"
      data-has-dark-logo={config.logo?.dark ? "true" : "false"}
      style={themeStylesFromConfig(config)}
    >
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-sm"
        data-markdown-ignore=""
        href="#main-content"
      >
        Skip to content
      </a>
      <DocScripts scripts={config.scripts?.head} />
      <DocHeader basePath={basePath} config={config} nav={nav} tabs={tabs} />
      <div className="container-wrapper flex flex-1 flex-col">
        {showSidebar ? (
          <div
            className="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]"
            data-doc-chrome-body=""
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
              } as React.CSSProperties
            }
          >
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              {children}
            </div>
            <div
              className="self-stretch lg:col-start-1 lg:row-start-1"
              data-doc-sidebar=""
            >
              <DocSidebar
                anchors={anchors}
                basePath={basePath}
                nav={nav}
                tabs={tabs}
                tenantSlug={tenantSlug}
              />
              {tabs?.length ? (
                <>
                  <script
                    // oxlint-disable-next-line no-danger -- URL-derived tab panel before hydration
                    dangerouslySetInnerHTML={{
                      __html: tabPathIndexScript(basePath, tabs),
                    }}
                  />
                  <SidebarTabSync basePath={basePath} tabs={tabs} />
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:[--top-spacing:calc(var(--spacing)*4)]">
            {children}
          </div>
        )}
      </div>
      <DocScripts scripts={config.scripts?.body} strategy="lazyOnload" />
    </div>
  );
};
