// oxlint-disable eslint/class-methods-use-this
import { desc, eq } from "drizzle-orm";

import { assertRecord } from "../assert-record.js";
import { db } from "../client.js";
import { deployKeys } from "../schema.js";
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
      .from(deployKeys)
      .where(eq(deployKeys.projectId, projectId))
      .orderBy(desc(deployKeys.createdAt));
  }

  async getById(id: string): Promise<ApiKeyRecord | null> {
    const [record] = await db
      .select(apiKeySelect)
      .from(deployKeys)
      .where(eq(deployKeys.id, id))
      .limit(1);
    return record ?? null;
  }

  async getByHash(keyHash: string): Promise<ApiKeyRecord | null> {
    const [record] = await db
      .select(apiKeySelect)
      .from(deployKeys)
      .where(eq(deployKeys.keyHash, keyHash))
      .limit(1);
    return record ?? null;
  }

  async create(input: ApiKeyCreateInput): Promise<ApiKeyRecord> {
    const [record] = await db
      .insert(deployKeys)
      .values(input)
      .returning(apiKeySelect);
    return assertRecord(record, "Failed to create API key.");
  }

  async delete(id: string): Promise<ApiKeyRecord> {
    const [record] = await db
      .delete(deployKeys)
      .where(eq(deployKeys.id, id))
      .returning(apiKeySelect);
    return assertRecord(record, "Failed to delete API key.");
  }

  async touchLastUsed(id: string): Promise<void> {
    await db
      .update(deployKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(deployKeys.id, id));
  }
}
