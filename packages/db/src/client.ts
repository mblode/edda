import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let instance: DrizzleDb | null = null;

const getDb = (): DrizzleDb => {
  if (instance) {
    return instance;
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }
  const client = postgres(connectionString, { prepare: false });
  instance = drizzle({ client, schema });
  return instance;
};

export const db = new Proxy({} as DrizzleDb, {
  get: (_target, prop, receiver) =>
    Reflect.get(getDb() as object, prop, receiver),
}) as DrizzleDb;
