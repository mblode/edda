import type { ReactNode } from "react";
import { Suspense } from "react";

import { TenantAnalytics } from "@/components/tenant-analytics";

// Do not wrap `{children}` in Suspense. With Cache Components, a Suspense
// fallback streams first and commits HTTP 200 before the page can call
// `notFound()`, which produced soft-404s for unknown slugs. The page segment
// opts out of instant rendering (`instant = false`) so the existence check can
// block and return a real 404. Analytics stays in its own boundary.
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
