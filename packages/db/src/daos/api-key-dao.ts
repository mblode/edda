// oxlint-disable eslint/class-methods-use-this
import { desc, eq } from "drizzle-orm";

import { assertRecord } from "../assert-record.js";
import { db } from "../client.js";
import { apiKeys } from "../schema.js";
import type { ApiKeyRecord } from "../types/records.js";
import { apiKeySelect } from "../types/selects.js";

export interface ApiKeyCreateInput {
  projectId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
}

export class ApiKeyDao {
  async listByProject(projectId: string): Promise<ApiKeyRecord[]> {
    return await db
      .select(apiKeySelect)
      .from(apiKeys)
      .where(eq(apiKeys.projectId, projectId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async getById(id: string): Promise<ApiKeyRecord | null> {
    const [record] = await db
      .select(apiKeySelect)
      .from(apiKeys)
      .where(eq(apiKeys.id, id))
      .limit(1);
    return record ?? null;
  }

  async getByHash(keyHash: string): Promise<ApiKeyRecord | null> {
    const [record] = await db
      .select(apiKeySelect)
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);
    return record ?? null;
  }

  async create(input: ApiKeyCreateInput): Promise<ApiKeyRecord> {
    const [record] = await db
      .insert(apiKeys)
      .values(input)
      .returning(apiKeySelect);
    return assertRecord(record, "Failed to create API key.");
  }

  async delete(id: string): Promise<ApiKeyRecord> {
    const [record] = await db
      .delete(apiKeys)
      .where(eq(apiKeys.id, id))
      .returning(apiKeySelect);
    return assertRecord(record, "Failed to delete API key.");
  }

  async touchLastUsed(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, id));
  }
}
