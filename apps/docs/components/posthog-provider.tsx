"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthogJs from "posthog-js";
import { useEffect, useRef } from "react";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const TENANT_INSTANCE_NAME = "tenant";

interface PostHogProviderProps {
  projectKey: string;
  host?: string;
}

export const PostHogProvider = ({ projectKey, host }: PostHogProviderProps) => {
  const tenantPosthog = useRef<ReturnType<typeof posthogJs.init> | null>(null);

  useEffect(() => {
    if (!projectKey) {
      return;
    }
    tenantPosthog.current = posthogJs.init(
      projectKey,
      {
        api_host: host || DEFAULT_POSTHOG_HOST,
        capture_pageleave: true,
        capture_pageview: false,
        person_profiles: "identified_only",
      },
      TENANT_INSTANCE_NAME
    );
  }, [projectKey, host]);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const client = tenantPosthog.current;
    if (!(pathname && client)) {
      return;
    }
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    client.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
};
