import { cacheLife, cacheTag } from "next/cache";
import type { ReactNode } from "react";
import { Suspense } from "react";

import {
  DocChromeBodyScripts,
  DocChromeFrame,
  DocChromeHeader,
  DocChromeSidebar,
  DocChromeThemeStyle,
} from "@/components/docs/doc-chrome";
import { TenantAnalytics } from "@/components/tenant-analytics";
import { getDocChromeData, isDocChromeReady } from "@/lib/docs-runtime";
import { getProjectTag } from "@/lib/tenants";

const getCachedDocChromeData = async (tenantSlug: string) => {
  "use cache";
  cacheLife("hours");
  cacheTag(getProjectTag(tenantSlug), "tenants");
  return await getDocChromeData(tenantSlug);
};

const getReadyChrome = async (params: Promise<{ tenant: string }>) => {
  const { tenant } = await params;
  const chrome = await getCachedDocChromeData(tenant);
  if (!isDocChromeReady(chrome)) {
    return null;
  }
  return { chrome, tenant };
};

const ChromeTheme = async ({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) => {
  const ready = await getReadyChrome(params);
  return ready ? <DocChromeThemeStyle config={ready.chrome.config} /> : null;
};

const ChromeHeader = async ({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) => {
  const ready = await getReadyChrome(params);
  if (!ready) {
    return null;
  }

  return (
    <DocChromeHeader
      basePath={ready.chrome.basePath}
      config={ready.chrome.config}
      nav={ready.chrome.visibleNav}
      tabs={ready.chrome.tabs}
    />
  );
};

const ChromeSidebar = async ({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) => {
  const ready = await getReadyChrome(params);
  if (!ready) {
    return null;
  }

  return (
    <DocChromeSidebar
      anchors={ready.chrome.anchors}
      basePath={ready.chrome.basePath}
      nav={ready.chrome.visibleNav}
      tabs={ready.chrome.tabs}
      tenantSlug={ready.tenant}
    />
  );
};

const ChromeBodyScripts = async ({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) => {
  const ready = await getReadyChrome(params);
  return ready ? <DocChromeBodyScripts config={ready.chrome.config} /> : null;
};

// Article (`children`) stays outside every chrome Suspense. Awaiting tenant
// params in a wrapper that also owns the page lets Instant Navigations keep a
// previous article in the shared `[[...slug]]` shell.
export default function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  return (
    <>
      <DocChromeFrame
        header={
          <Suspense
            fallback={<div className="h-(--header-height) shrink-0 border-b" />}
          >
            <ChromeHeader params={params} />
          </Suspense>
        }
        scriptsBody={
          <Suspense fallback={null}>
            <ChromeBodyScripts params={params} />
          </Suspense>
        }
        sidebar={
          <Suspense fallback={null}>
            <ChromeSidebar params={params} />
          </Suspense>
        }
        theme={
          <Suspense fallback={null}>
            <ChromeTheme params={params} />
          </Suspense>
        }
      >
        {children}
      </DocChromeFrame>
      <Suspense fallback={null}>
        <TenantAnalytics />
      </Suspense>
    </>
  );
}
