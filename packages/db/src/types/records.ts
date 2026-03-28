import type {
  apiKeys,
  deployments,
  domains,
  projects,
  users,
} from "../schema.js";

type UserRow = typeof users.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;
type DomainRow = typeof domains.$inferSelect;
type DeploymentRow = typeof deployments.$inferSelect;
type ApiKeyRow = typeof apiKeys.$inferSelect;

export type UserRecord = Pick<
  UserRow,
  "authId" | "createdAt" | "email" | "id" | "name" | "updatedAt"
>;

export type ProjectRecord = Pick<
  ProjectRow,
  | "createdAt"
  | "deploymentName"
  | "description"
  | "id"
  | "name"
  | "slug"
  | "updatedAt"
  | "userId"
>;

export type DomainRecord = Pick<
  DomainRow,
  | "createdAt"
  | "hostname"
  | "id"
  | "pathPrefix"
  | "projectId"
  | "status"
  | "verifiedAt"
>;

export type DeploymentRecord = Pick<
  DeploymentRow,
  | "branch"
  | "changes"
  | "commitMessage"
  | "createdAt"
  | "environment"
  | "fileCount"
  | "id"
  | "manifestUrl"
  | "previewUrl"
  | "projectId"
  | "promotedAt"
  | "status"
  | "updatedAt"
>;

export type ApiKeyRecord = Pick<
  ApiKeyRow,
  | "createdAt"
  | "id"
  | "lastUsedAt"
  | "name"
  | "prefix"
  | "projectId"
  | "revokedAt"
>;

export type ApiKeyAuthRecord = ApiKeyRecord & Pick<ApiKeyRow, "tokenHash">;
