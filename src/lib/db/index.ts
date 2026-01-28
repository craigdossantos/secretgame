import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set!");
}

const client = postgres(connectionString || "", {
  prepare: false, // Required for Supabase connection pooler (transaction mode)
  ssl: "require", // Required for Supabase connections
});

export const db = drizzle(client, { schema });
