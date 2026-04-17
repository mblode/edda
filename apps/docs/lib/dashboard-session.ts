import { cookies } from "next/headers";
import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase";

export interface DashboardSession {
  accessToken: string;
  userEmail: string;
  userName: string;
}

export const getDashboardSession = cache(
  async (): Promise<DashboardSession | null> => {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }

    const userEmail =
      session.user.email ?? session.user.user_metadata?.email ?? "";
    const userName =
      (session.user.user_metadata?.full_name as string | undefined) ??
      (session.user.user_metadata?.name as string | undefined) ??
      userEmail;

    return {
      accessToken: session.access_token,
      userEmail,
      userName,
    };
  }
);
