import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { userDao } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";

const DEFAULT_REDIRECT = "/app";

const fallbackEmail = (authId: string) => `${authId}@users.blode.invalid`;

const getSafeRedirectPath = (value: string | null, origin: string) => {
  if (!value) {
    return DEFAULT_REDIRECT;
  }

  try {
    const target = new URL(value, origin);
    const isDashboardPath =
      target.pathname === DEFAULT_REDIRECT ||
      target.pathname.startsWith(`${DEFAULT_REDIRECT}/`);
    if (target.origin !== origin || !isDashboardPath) {
      return DEFAULT_REDIRECT;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return DEFAULT_REDIRECT;
  }
};

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = getSafeRedirectPath(
    url.searchParams.get("redirect_to"),
    url.origin
  );
  const authorizationId = url.searchParams.get("authorization_id");

  if (!code) {
    const consent = new URL("/oauth/consent", url.origin);
    consent.searchParams.set("redirect_to", redirectTo);
    return NextResponse.redirect(consent);
  }

  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const failed = new URL("/oauth/consent", url.origin);
    failed.searchParams.set("error", error.message);
    failed.searchParams.set("redirect_to", redirectTo);
    return NextResponse.redirect(failed);
  }

  const authUser = data.session?.user;
  if (authUser) {
    try {
      const email =
        authUser.email?.trim().toLowerCase() || fallbackEmail(authUser.id);
      const metadata = authUser.user_metadata as
        | { full_name?: string; name?: string }
        | undefined;
      await userDao.upsertByAuthId({
        authId: authUser.id,
        email,
        name: metadata?.full_name ?? metadata?.name ?? null,
      });
    } catch (upsertError) {
      console.error("Failed to upsert user after OAuth callback", upsertError);
    }
  }

  if (authorizationId) {
    const consent = new URL("/oauth/consent", url.origin);
    consent.searchParams.set("authorization_id", authorizationId);
    return NextResponse.redirect(consent);
  }

  return NextResponse.redirect(new URL(redirectTo, url.origin));
};
