import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";

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

// The session lives in a cookie, so it cannot be read while the shell
// prerenders. Awaiting it here rather than in the layout body would bake the
// signed-out answer into the static output and send every visitor, signed in or
// not, to the consent screen. It renders nothing; the redirect is the point.
const AuthGate = async () => {
  const session = await getDashboardSession();
  if (!session) {
    redirect("/oauth/consent?redirect_to=/app");
  }
  return null;
};

const SessionUserName = async () => {
  const session = await getDashboardSession();
  if (!session) {
    return null;
  }

  return (
    <span className="hidden text-sm text-muted-foreground sm:inline">
      {session.userName}
    </span>
  );
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const apiOrigin = getApiOrigin();
  const supabaseOrigin = getSupabaseOrigin();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Suspense fallback={null}>
        <AuthGate />
      </Suspense>
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
            <Suspense
              fallback={
                <span className="hidden h-4 w-24 animate-pulse rounded bg-muted sm:inline-block" />
              }
            >
              <SessionUserName />
            </Suspense>
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
