import { z } from "zod";

import {
  HostnameSchema,
  IdSchema,
  PathSchema,
  SlugSchema,
  UrlSchema,
} from "./ids.js";

export const TenantStatusSchema = z.enum(["active", "disabled"]);
export type TenantStatus = z.infer<typeof TenantStatusSchema>;

export const TenantSchema = z.object({
  activeDeploymentId: IdSchema.optional(),
  activeDeploymentManifestUrl: UrlSchema.optional(),
  customDomains: z.array(HostnameSchema),
  description: z.string().optional(),
  id: IdSchema,
  name: z.string().min(1),
  pathPrefix: PathSchema.optional(),
  primaryDomain: HostnameSchema,
  slug: SlugSchema,
  status: TenantStatusSchema,
  subdomain: SlugSchema,
});
export type Tenant = z.infer<typeof TenantSchema>;

export const TenantResolutionSchema = z.object({
  basePath: z.string(),
  host: HostnameSchema,
  rewrittenPath: z.string(),
  strategy: z.enum(["preview", "custom-domain", "subdomain", "path"]),
  tenant: TenantSchema,
});
export type TenantResolution = z.infer<typeof TenantResolutionSchema>;

const TenantEdgeRecordVersionSchema = z.literal(1);

export const TenantEdgeHostRecordSchema = z.object({
  host: HostnameSchema,
  pathPrefix: PathSchema.optional(),
  strategy: z.enum(["custom-domain", "subdomain"]),
  tenant: TenantSchema,
  version: TenantEdgeRecordVersionSchema,
});
export type TenantEdgeHostRecord = z.infer<typeof TenantEdgeHostRecordSchema>;

export const TenantEdgeSlugRecordSchema = z.object({
  slug: SlugSchema,
  tenant: TenantSchema,
  version: TenantEdgeRecordVersionSchema,
});
export type TenantEdgeSlugRecord = z.infer<typeof TenantEdgeSlugRecordSchema>;
