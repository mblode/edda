"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

import { shouldInitPlatformPostHog } from "@/lib/platform-analytics";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const PostHogIdentity = () => {
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (
      !(
        supabaseUrl &&
        supabaseAnonKey &&
        posthog.__loaded &&
        shouldInitPlatformPostHog()
      )
    ) {
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const identify = (user: User) => {
      if (!(user.id && identifiedUserId.current !== user.id)) {
        return;
      }

      if (identifiedUserId.current) {
        posthog.reset();
      }

      const properties: Record<string, string> = {};
      if (typeof user.email === "string") {
        properties.email = user.email;
      }
      const name = user.user_metadata.full_name ?? user.user_metadata.name;
      if (typeof name === "string") {
        properties.name = name;
      }

      posthog.identify(user.id, properties);
      identifiedUserId.current = user.id;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        if (identifiedUserId.current) {
          posthog.reset();
        }
        identifiedUserId.current = null;
        return;
      }

      if (session?.user) {
        identify(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
};
