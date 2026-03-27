import { ApiKeyDao, DeploymentDao, DomainDao, ProjectDao } from "@repo/db";

export const projectDao = new ProjectDao();
export const domainDao = new DomainDao();
export const deploymentDao = new DeploymentDao();
export const apiKeyDao = new ApiKeyDao();
