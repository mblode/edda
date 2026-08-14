import type { ReactNode } from "react";
import { Suspense } from "react";

import { DocChrome } from "@/components/docs/doc-chrome";
import { TenantAnalytics } from "@/components/tenant-analytics";
import { getDocChromeData, isDocChromeReady } from "@/lib/docs-runtime";

// Unknown slugs 404 in `proxy.ts` (`lookupTenantDocSlug`) before this layout
// renders, so the page can stream a loading shell without committing a soft-200.
// Chrome is tenant-stable and stays mounted across slug navigations.
export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const chrome = await getDocChromeData(tenant);

  return (
    <>
      {isDocChromeReady(chrome) ? (
        <DocChrome
          anchors={chrome.anchors}
          basePath={chrome.basePath}
          config={chrome.config}
          nav={chrome.visibleNav}
          tabs={chrome.tabs}
          tenantSlug={tenant}
        >
          {children}
        </DocChrome>
      ) : (
        children
      )}
      <Suspense fallback={null}>
        <TenantAnalytics />
      </Suspense>
    </>
  );
}
