import { requireProjectContext } from "../_lib";
import { ProjectSettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

interface SettingsPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ProjectSettingsPage({
  params,
}: SettingsPageProps) {
  const { projectSlug } = await params;
  const { accessToken, project } = await requireProjectContext(projectSlug);

  return <ProjectSettingsForm accessToken={accessToken} project={project} />;
}
