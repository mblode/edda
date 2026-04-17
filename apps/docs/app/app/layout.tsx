import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getDashboardSession } from "@/lib/dashboard-session";
import { docsApiBase } from "@/lib/env";

import { SignOutButton } from "./_components/sign-out-button";

const getApiOrigin = (): string | null => {
  try {
    return new URL(docsApiBase).origin;
  } catch {
    return null;
  }
};

const getSupabaseOrigin = (): string | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return null;
  }
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getDashboardSession();
  if (!session) {
    redirect("/oauth/consent?redirect_to=/app");
  }

  const apiOrigin = getApiOrigin();
  const supabaseOrigin = getSupabaseOrigin();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {apiOrigin && (
        <link crossOrigin="anonymous" href={apiOrigin} rel="preconnect" />
      )}
      {supabaseOrigin && (
        <link crossOrigin="anonymous" href={supabaseOrigin} rel="preconnect" />
      )}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="container flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/app"
              className="text-base font-semibold tracking-tight"
            >
              blode.md
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/app" className="hover:text-foreground">
                Projects
              </Link>
              <Link href="/docs" className="hover:text-foreground">
                Docs
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.userName}
            </span>
            <SignOutButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-10">{children}</div>
      </main>
    </div>
  );
}
