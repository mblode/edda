import { z } from "zod";

import { IsoDateSchema } from "./dates.js";
import { EmailSchema, IdSchema } from "./ids.js";

export const UserSchema = z.object({
  createdAt: IsoDateSchema,
  email: EmailSchema,
  id: IdSchema,
  name: z.string().nullable(),
});
export type User = z.infer<typeof UserSchema>;
