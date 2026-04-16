import type { ProjectRecord } from "@repo/db";
import { db, projects, projectSelect } from "@repo/db";

const assertRecord = <RecordType>(
  record: RecordType | undefined,
  message: string
): RecordType => {
  if (!record) {
    throw new Error(message);
  }

  return record;
};

export const createProject = async (input: {
  description?: string;
  name: string;
  slug: string;
  userId: string;
}): Promise<ProjectRecord> => {
  const [projectRecord] = await db
    .insert(projects)
    .values({
      deploymentName: input.slug,
      description: input.description,
      name: input.name,
      slug: input.slug,
      userId: input.userId,
    })
    .returning(projectSelect);

  return assertRecord(projectRecord, "Failed to create project.");
};
