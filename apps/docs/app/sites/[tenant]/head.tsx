import { getTenantMetadata } from "@/lib/tenant-static";
import { getTenantBySlug } from "@/lib/tenants";

export default async function Head({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return null;
  }

  const config = await getTenantMetadata(tenant);
  if (!config?.fonts?.cssUrl) {
    return null;
  }

  return <link href={config.fonts.cssUrl} rel="stylesheet" />;
}
