import { headers } from "next/headers";

import { getRequestHost, getRequestProtocol, resolveTenant } from "./tenancy";
import { getTenantBySlug } from "./tenants";

export const resolveRequestTenant = async (pathname: string) => {
  const headerStore = await headers();
  const host = getRequestHost(headerStore);
  if (!host) {
    return null;
  }

  const resolution = await resolveTenant(host, pathname);
  if (!resolution) {
    return null;
  }

  const tenant = await getTenantBySlug(resolution.tenant.slug);
  if (!tenant) {
    return null;
  }

  return {
    host,
    protocol: getRequestProtocol(headerStore),
    resolution,
    tenant,
  };
};
