import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getDashboardSession } from "@/lib/dashboard-session";

import { NewProjectWizard } from "./wizard";

// The wizard needs the access token off the session cookie, which a prerender
// cannot read. Behind a boundary the shell still ships static and the signed-out
// redirect stays a real answer rather than a baked-in one.
const Wizard = async () => {
  const session = await getDashboardSession();
  if (!session) {
    redirect("/oauth/consent?redirect_to=/app/new");
  }
  return <NewProjectWizard accessToken={session.accessToken} />;
};

const WizardSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 w-56 animate-pulse rounded bg-muted" />
    <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
  </div>
);

export default function NewProjectPage() {
  return (
    <Suspense fallback={<WizardSkeleton />}>
      <Wizard />
    </Suspense>
  );
}
