import { mapApiKey } from "@repo/db";

import { apiKeyDao } from "@/lib/db";

import { requireProjectContext } from "../_lib";
import { ProjectSettingsForm } from "./settings-form";

interface SettingsPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ProjectSettingsPage({
  params,
}: SettingsPageProps) {
  const { projectSlug } = await params;
  const { accessToken, project } = await requireProjectContext(projectSlug);
  const records = await apiKeyDao.listByProject(project.id);
  const apiKeys = records.map(mapApiKey);

  return (
    <ProjectSettingsForm
      accessToken={accessToken}
      initialApiKeys={apiKeys}
      project={project}
    />
  );
}
