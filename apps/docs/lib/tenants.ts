import { TenantSchema } from "@repo/contracts";
import type { Tenant } from "@repo/models";

import { getTenantDocsPath } from "./content-root";
import { docsApiBase } from "./env";

export const getProjectTag = (slug: string) => `project:${slug}`;

const mapTenant = (tenant: {
  activeDeploymentId?: string;
  activeDeploymentManifestUrl?: string;
  id: string;
  slug: string;
  name: string;
  description?: string;
  primaryDomain: string;
  subdomain: string;
  customDomains: string[];
  pathPrefix?: string;
  status: "active" | "disabled";
}): Tenant => ({
  ...tenant,
  docsPath: getTenantDocsPath(tenant.slug),
});

const fetchTenant = async (slug: string): Promise<Tenant | null> => {
  const url = new URL(`/tenants/${slug}`, docsApiBase);
  const response = await fetch(url.toString(), {
    next: { tags: [getProjectTag(slug), "tenants"] },
  });
  if (!response.ok) {
    return null;
  }
  const json = (await response.json()) as unknown;
  const parsed = TenantSchema.safeParse(json);
  if (!parsed.success) {
    return null;
  }
  return mapTenant(parsed.data);
};

const fetchTenants = async (): Promise<Tenant[]> => {
  const url = new URL("/tenants", docsApiBase);
  const response = await fetch(url.toString(), {
    next: { tags: ["tenants"] },
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as unknown;
  const parsed = TenantSchema.array().safeParse(json);
  if (!parsed.success) {
    return [];
  }
  return parsed.data.map(mapTenant);
};

export const getTenantBySlug = fetchTenant;

export const getDefaultTenant = async () => {
  const tenants = await fetchTenants();
  return tenants[0] ?? null;
};
