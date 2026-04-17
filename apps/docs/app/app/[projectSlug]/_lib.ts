import type { Project } from "@repo/contracts";
import { redirect } from "next/navigation";
import { cache } from "react";

import { ApiError, apiFetch } from "@/lib/api-client";
import { getDashboardSession } from "@/lib/dashboard-session";

export interface ProjectContext {
  accessToken: string;
  project: Project;
}

export const requireProjectContext = cache(
  async (projectSlug: string): Promise<ProjectContext> => {
    const session = await getDashboardSession();
    if (!session) {
      redirect(`/oauth/consent?redirect_to=/app/${projectSlug}`);
    }

    let project: Project | null = null;
    try {
      project = await apiFetch<Project>(`/projects/by-slug/${projectSlug}`, {
        accessToken: session.accessToken,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          redirect(`/oauth/consent?redirect_to=/app/${projectSlug}`);
        }
        if (error.status === 404) {
          redirect("/app");
        }
      }
      throw error;
    }

    return { accessToken: session.accessToken, project };
  }
);
