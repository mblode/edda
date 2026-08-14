import { cacheLife, cacheTag } from "next/cache";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { DocChrome, DocChromeFallback } from "@/components/docs/doc-chrome";
import { TenantAnalytics } from "@/components/tenant-analytics";
import { getDocChromeData, isDocChromeReady } from "@/lib/docs-runtime";
import { getProjectTag } from "@/lib/tenants";

const getCachedDocChromeData = async (tenantSlug: string) => {
  "use cache";
  cacheLife("hours");
  cacheTag(getProjectTag(tenantSlug), "tenants");
  return await getDocChromeData(tenantSlug);
};

const TenantChrome = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) => {
  const { tenant } = await params;
  const chrome = await getCachedDocChromeData(tenant);

  if (!isDocChromeReady(chrome)) {
    return children;
  }

  return (
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
  );
};

// Unknown slugs 404 in `proxy.ts` (`lookupTenantDocSlug`) before this layout
// renders, so the page can stream a loading shell without committing a soft-200.
// Chrome is tenant-stable and stays mounted across slug navigations. `params`
// stays inside Suspense so Cache Components can prerender the route shell.
export default function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  return (
    <>
      <Suspense fallback={<DocChromeFallback>{children}</DocChromeFallback>}>
        <TenantChrome params={params}>{children}</TenantChrome>
      </Suspense>
      <Suspense fallback={null}>
        <TenantAnalytics />
      </Suspense>
    </>
  );
}
