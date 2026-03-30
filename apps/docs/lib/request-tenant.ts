import { headers } from "next/headers";

import { getRequestHost, getRequestProtocol, resolveTenant } from "./tenancy";

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

  return {
    host,
    protocol: getRequestProtocol(headerStore),
    resolution,
    tenant: resolution.tenant,
  };
};
