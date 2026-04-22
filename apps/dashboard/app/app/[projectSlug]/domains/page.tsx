import { mapDomain } from "@repo/db";

import { domainDao } from "@/lib/db";
import { platformRootDomain } from "@/lib/env";

import { requireProjectContext } from "../_lib";
import { DomainsManager } from "./domains-manager";

interface DomainsPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ProjectDomainsPage({ params }: DomainsPageProps) {
  const { projectSlug } = await params;
  const { accessToken, project } = await requireProjectContext(projectSlug);
  const records = await domainDao.listByProject(project.id);
  const domains = records.map(mapDomain);

  return (
    <DomainsManager
      accessToken={accessToken}
      initialDomains={domains}
      project={project}
      rootDomain={platformRootDomain}
    />
  );
}
