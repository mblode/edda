import { randomUUID } from "node:crypto";

import type * as RepoDb from "@repo/db";
import { sql } from "drizzle-orm";

type DbModule = typeof RepoDb;

interface ProjectFixture {
  projectId: string;
}

export const createProjectFixture = async (
  dbModule: DbModule,
  input: {
    description?: string;
    slug: string;
  }
): Promise<ProjectFixture> => {
  const projectId = randomUUID();
  await dbModule.db.execute(sql`
    insert into "projects" (
      "id",
      "deployment_name",
      "description",
      "name",
      "slug"
    )
    values (
      ${projectId},
      ${input.slug},
      ${input.description ?? null},
      ${input.slug},
      ${input.slug}
    )
  `);

  return { projectId };
};

export const cleanupProjectFixture = async (
  dbModule: DbModule,
  fixture: ProjectFixture
) => {
  await new dbModule.ProjectDao().delete(fixture.projectId);
};
