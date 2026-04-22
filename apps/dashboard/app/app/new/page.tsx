import { redirect } from "next/navigation";

import { getDashboardSession } from "@/lib/dashboard-session";

import { NewProjectWizard } from "./wizard";

export default async function NewProjectPage() {
  const session = await getDashboardSession();
  if (!session) {
    redirect("/oauth/consent?redirect_to=/app/new");
  }
  return <NewProjectWizard accessToken={session.accessToken} />;
}
