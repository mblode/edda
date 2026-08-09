import { headers } from "next/headers";
import { Suspense } from "react";

import {
  decodeTenantAnalyticsHeader,
  TENANT_HEADERS,
} from "@/lib/tenant-headers";

import { PostHogProvider } from "./posthog-provider";

export const TenantAnalytics = async () => {
  if (process.env.VERCEL_ENV !== "production") {
    return null;
  }

  const headerStore = await headers();
  const analytics = decodeTenantAnalyticsHeader(
    headerStore.get(TENANT_HEADERS.ANALYTICS)
  );
  if (!analytics?.posthog?.projectKey) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <PostHogProvider
        host={analytics.posthog.host}
        projectKey={analytics.posthog.projectKey}
      />
    </Suspense>
  );
};
