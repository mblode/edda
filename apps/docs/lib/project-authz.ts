import type { ProjectRecord, UserRecord } from "@repo/db";
import { cache } from "react";

import { getDashboardSession } from "./dashboard-session";
import { projectDao, userDao } from "./db";

export interface AuthorizedProjectContext {
  accessToken: string;
  project: ProjectRecord;
  user: UserRecord;
}

export const resolveCurrentUser = cache(
  async (): Promise<{
    accessToken: string;
    user: UserRecord;
  } | null> => {
    const session = await getDashboardSession();
    if (!session) {
      return null;
    }
    const user = await userDao.getByAuthId(session.authId);
    if (!user) {
      return null;
    }
    return { accessToken: session.accessToken, user };
  }
);

export const getAuthorizedProjectBySlug = cache(
  async (slug: string): Promise<AuthorizedProjectContext | null> => {
    const current = await resolveCurrentUser();
    if (!current) {
      return null;
    }
    const project = await projectDao.getBySlugUnique(slug);
    if (!project || project.userId !== current.user.id) {
      return null;
    }
    return { accessToken: current.accessToken, project, user: current.user };
  }
);
