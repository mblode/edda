import type { Metadata } from "next";
import { Suspense } from "react";

import type { OAuthSearchParams } from "../search-params";
import { getSearchParam } from "../search-params";
import { ConsentForm } from "./consent-form";

export const metadata: Metadata = {
  description: "Sign in with GitHub to access Blode.md.",
  title: "Sign in · Blode.md",
};

// The three params only steer where sign-in returns to, so reading them behind
// a boundary leaves the rest of the route a static shell.
const Consent = async ({
  searchParams,
}: {
  searchParams: Promise<OAuthSearchParams>;
}) => {
  const resolvedSearchParams = await searchParams;

  return (
    <ConsentForm
      authorizationId={getSearchParam(resolvedSearchParams, "authorization_id")}
      errorMessage={getSearchParam(resolvedSearchParams, "error")}
      redirectTo={getSearchParam(resolvedSearchParams, "redirect_to")}
    />
  );
};

export default function OAuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<OAuthSearchParams>;
}) {
  return (
    // The same empty frame ConsentForm renders while it checks for a session,
    // so the card lands in one step rather than two.
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4" />
      }
    >
      <Consent searchParams={searchParams} />
    </Suspense>
  );
}
