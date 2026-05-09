import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

/** Dummy URL only so modules load during `next build` when DATABASE_URL is unset. Runtime requires a real Neon URL. */
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://127.0.0.1:5432/postgres?sslmode=disable";

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "test") {
  console.warn(
    "[db] DATABASE_URL is not set — using placeholder for build. Set Neon URL for runtime."
  );
}

const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle(pool, { schema });
