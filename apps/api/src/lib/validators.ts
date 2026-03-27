import { zValidator } from "@hono/zod-validator";
import type { z } from "zod";

export const validateJson = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Invalid request body.",
          issues: result.error.issues,
        },
        400
      );
    }
  });

export const validateParams = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  zValidator("param", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Invalid route parameters.",
          issues: result.error.issues,
        },
        400
      );
    }
  });

export const validateQuery = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  zValidator("query", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Invalid query parameters.",
          issues: result.error.issues,
        },
        400
      );
    }
  });
