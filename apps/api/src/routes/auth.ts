import { Hono } from "hono";

import { getAuthenticatedUser } from "../lib/project-auth.js";
import { unauthorized } from "../lib/responses.js";
import { mapUser } from "../mappers/records.js";

export const auth = new Hono();

auth.get("/me", async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return unauthorized(c, "Authentication required.");
  }
  return c.json(mapUser(user), 200);
});
