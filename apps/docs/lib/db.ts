import {
  DeploymentDao,
  DomainDao,
  GitConnectionDao,
  ProjectDao,
  UserDao,
} from "@repo/db";

export const projectDao = new ProjectDao();
export const deploymentDao = new DeploymentDao();
export const userDao = new UserDao();
export const gitConnectionDao = new GitConnectionDao();
export const domainDao = new DomainDao();
