import { cookies } from "next/headers";

import { SiteHeaderNav } from "@/components/ui/site-header-nav";
import { createSupabaseServerClient } from "@/lib/supabase";

export const getDashboardHref = async (): Promise<string> => {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session ? "/app" : "/oauth/consent";
  } catch {
    return "/oauth/consent";
  }
};

interface SiteHeaderProps {
  dashboardHref: string;
  isSignedIn: boolean;
}

export const SiteHeader = ({ dashboardHref, isSignedIn }: SiteHeaderProps) => (
  <SiteHeaderNav dashboardHref={dashboardHref} isSignedIn={isSignedIn} />
);
