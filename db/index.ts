import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Load .env.local for local dev / CLI scripts (e.g. `npm run db:seed`).
// In production (Vercel etc.) DATABASE_URL is already set as a real env
// var, so this is a no-op there.
if (!process.env.DATABASE_URL) {
  require("dotenv").config({ path: ".env.local" });
}

// -----------------------------------------------------------------------
// Database client.
//
// Uses the standard `pg` (node-postgres) driver, which works against any
// Postgres server: local Postgres, Supabase, Railway, RDS, etc.
//
// If you deploy to Vercel and use Neon specifically, swap this file's
// contents for the Neon HTTP driver (see README "Switching to Neon's
// serverless driver") for lower cold-start latency on serverless functions.
// The rest of the app is unaffected either way — everything imports the
// `db` export from this file.
// -----------------------------------------------------------------------

declare global {
  var __pgPool: Pool | undefined;
}

const pool =
  global.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

export const db = drizzle(pool, { schema });
