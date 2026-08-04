import type { ReactNode } from "react";
import { Suspense } from "react";

import { DocShellSkeleton } from "@/components/docs/doc-shell-skeleton";
import { TenantAnalytics } from "@/components/tenant-analytics";

// A tenant page is resolved entirely from the request: the proxy passes the
// tenant on a header and the slug arrives as a route param. Neither can be read
// during a prerender, so both boundaries live here and the App Shell above them
// is what ships static.
export default function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<DocShellSkeleton />}>{children}</Suspense>
      <Suspense fallback={null}>
        <TenantAnalytics />
      </Suspense>
    </>
  );
}
