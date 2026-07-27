import type { Tenant } from "@repo/contracts";
import {
  TenantEdgeHostRecordSchema,
  TenantEdgeSlugRecordSchema,
  getTenantEdgeHostKeys,
  getTenantEdgeHostKey,
  getTenantEdgeSlugKey,
  getTenantEdgeSlugKeys,
} from "@repo/contracts";

import { rootDomain, validConfiguredDomainStatus } from "./config";
import { domainDao } from "./db";
import { readTrimmedEnv } from "./env";
import { buildTenant } from "./tenant-builder";

const VERCEL_API_BASE = "https://api.vercel.com";

export { getTenantEdgeHostKey, getTenantEdgeSlugKey };

interface VercelEdgeConfigConfig {
  edgeConfigId: string;
  teamId?: string;
  teamSlug?: string;
  token: string;
}

type EdgeConfigItemOperation =
  | {
      key: string;
      operation: "delete";
    }
  | {
      key: string;
      operation: "upsert";
      value: unknown;
    };

const getVercelEdgeConfig = (): VercelEdgeConfigConfig | null => {
  const edgeConfigId = readTrimmedEnv("VERCEL_EDGE_CONFIG_ID");
  const token = readTrimmedEnv("VERCEL_TOKEN");
  if (!(edgeConfigId && token)) {
    return null;
  }

  return {
    edgeConfigId,
    teamId: readTrimmedEnv("VERCEL_TEAM_ID"),
    teamSlug: readTrimmedEnv("VERCEL_TEAM_SLUG"),
    token,
  };
};

const buildVercelUrl = (pathname: string, config: VercelEdgeConfigConfig) => {
  const url = new URL(pathname, VERCEL_API_BASE);
  if (config.teamId) {
    url.searchParams.set("teamId", config.teamId);
  }
  if (config.teamSlug) {
    url.searchParams.set("slug", config.teamSlug);
  }
  return url;
};

const applyEdgeConfigItems = async (items: EdgeConfigItemOperation[]) => {
  const config = getVercelEdgeConfig();
  if (!(config && items.length)) {
    return;
  }

  const response = await fetch(
    buildVercelUrl(`/v1/edge-config/${config.edgeConfigId}/items`, config),
    {
      body: JSON.stringify({ items }),
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    }
  );

  if (response.ok) {
    return;
  }

  const errorText = await response.text();
  throw new Error(
    `Edge Config update failed (${response.status}): ${errorText}`
  );
};

const EDGE_CONFIG_KEY_REGEX = /^[A-Za-z0-9_-]{1,256}$/;

// Legacy `tenant:host:` / `tenant:slug:` keys predate Edge Config's key rules,
// so they can never exist there — and including one makes Vercel reject the
// whole batch with a validation error, taking the valid operations with it.
const dedupeEdgeConfigItems = (items: EdgeConfigItemOperation[]) => {
  const map = new Map<string, EdgeConfigItemOperation>();
  for (const item of items) {
    if (EDGE_CONFIG_KEY_REGEX.test(item.key)) {
      map.set(item.key, item);
    }
  }
  return [...map.values()];
};

const addDeleteOperation = (items: EdgeConfigItemOperation[], key: string) => {
  items.push({
    key,
    operation: "delete",
  });
};

const addUpsertOperation = (
  items: EdgeConfigItemOperation[],
  key: string,
  value: unknown
) => {
  items.push({
    key,
    operation: "upsert",
    value,
  });
};

export const isTenantEdgeConfigSyncEnabled = () =>
  Boolean(getVercelEdgeConfig());

export const buildTenantEdgeConfigItems = (input: {
  domains: {
    hostname: string;
    pathPrefix?: string | null;
    status: string;
  }[];
  removedHosts?: string[];
  tenant: Tenant;
}) => {
  const items: EdgeConfigItemOperation[] = [];

  addUpsertOperation(
    items,
    getTenantEdgeSlugKey(input.tenant.slug),
    TenantEdgeSlugRecordSchema.parse({
      slug: input.tenant.slug,
      tenant: input.tenant,
      version: 1,
    })
  );
  addUpsertOperation(
    items,
    getTenantEdgeHostKey(`${input.tenant.subdomain}.${rootDomain}`),
    TenantEdgeHostRecordSchema.parse({
      host: `${input.tenant.subdomain}.${rootDomain}`,
      strategy: "subdomain",
      tenant: input.tenant,
      version: 1,
    })
  );

  for (const domain of input.domains) {
    if (domain.status !== validConfiguredDomainStatus) {
      for (const key of getTenantEdgeHostKeys(domain.hostname)) {
        addDeleteOperation(items, key);
      }
      continue;
    }

    addUpsertOperation(
      items,
      getTenantEdgeHostKey(domain.hostname),
      TenantEdgeHostRecordSchema.parse({
        host: domain.hostname,
        pathPrefix: domain.pathPrefix ?? undefined,
        strategy: "custom-domain",
        tenant: input.tenant,
        version: 1,
      })
    );
  }

  for (const host of input.removedHosts ?? []) {
    for (const key of getTenantEdgeHostKeys(host)) {
      addDeleteOperation(items, key);
    }
  }

  return dedupeEdgeConfigItems(items);
};

export const buildTenantEdgeConfigRemovalItems = (input: {
  hosts: string[];
  slug: string;
}) => {
  const items: EdgeConfigItemOperation[] = [];

  for (const key of getTenantEdgeSlugKeys(input.slug)) {
    addDeleteOperation(items, key);
  }
  for (const host of input.hosts) {
    for (const key of getTenantEdgeHostKeys(host)) {
      addDeleteOperation(items, key);
    }
  }

  return dedupeEdgeConfigItems(items);
};

// Stops the edge from routing anything to a project: its slug record, its
// subdomain, and every custom host it answered on.
export const removeProjectTenantEdgeConfig = async (input: {
  hosts: string[];
  slug: string;
}) => {
  if (!isTenantEdgeConfigSyncEnabled()) {
    return;
  }

  await applyEdgeConfigItems(
    buildTenantEdgeConfigRemovalItems({
      hosts: [`${input.slug}.${rootDomain}`, ...input.hosts],
      slug: input.slug,
    })
  );
};

export const syncProjectTenantEdgeConfig = async (
  projectId: string,
  options: { removedHosts?: string[] } = {}
) => {
  if (!isTenantEdgeConfigSyncEnabled()) {
    return;
  }

  const tenant = await buildTenant(projectId);
  if (!tenant) {
    return;
  }

  const domains = await domainDao.listByProject(projectId);
  await applyEdgeConfigItems(
    buildTenantEdgeConfigItems({
      domains,
      removedHosts: options.removedHosts,
      tenant,
    })
  );
};
