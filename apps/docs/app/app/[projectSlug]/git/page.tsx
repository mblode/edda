import { mapGitConnection } from "@repo/db";

import { gitConnectionDao } from "@/lib/db";

import { requireProjectContext } from "../_lib";
import { GitConnectionPanel } from "./git-panel";

interface GitPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ProjectGitPage({ params }: GitPageProps) {
  const { projectSlug } = await params;
  const { accessToken, project } = await requireProjectContext(projectSlug);
  const record = await gitConnectionDao.getByProject(project.id);
  const connection = record ? mapGitConnection(record) : null;

  return (
    <GitConnectionPanel
      accessToken={accessToken}
      initialConnection={connection}
      project={project}
    />
  );
}
