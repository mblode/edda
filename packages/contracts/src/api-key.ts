import { z } from "zod";

import { IsoDateSchema } from "./dates.js";
import { IdSchema } from "./ids.js";

export const ApiKeySchema = z.object({
  createdAt: IsoDateSchema,
  id: IdSchema,
  keyPrefix: z.string().min(1),
  lastUsedAt: IsoDateSchema.optional(),
  name: z.string().min(1),
  projectId: IdSchema,
});
export type ApiKey = z.infer<typeof ApiKeySchema>;

export const ApiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});
export type ApiKeyCreateInput = z.infer<typeof ApiKeyCreateSchema>;

// Returned exactly once, at creation time — the only moment the plaintext key
// is available. Callers must store `key`; the server keeps only its hash.
export const ApiKeyCreatedSchema = z.object({
  apiKey: ApiKeySchema,
  key: z.string().min(1),
});
export type ApiKeyCreated = z.infer<typeof ApiKeyCreatedSchema>;
