import type { ReactNode } from "react";
import { Suspense } from "react";

import { TenantAnalytics } from "@/components/tenant-analytics";

// Unknown slugs 404 in `proxy.ts` (`lookupTenantDocSlug`) before this layout
// renders, so the page can stream a loading shell without committing a soft-200.
export default function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <TenantAnalytics />
      </Suspense>
    </>
  );
}
