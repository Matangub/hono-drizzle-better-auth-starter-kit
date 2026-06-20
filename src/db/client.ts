import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "../env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 1,
});

export const db = drizzle(pool);

// Exported for graceful database shutdown in server teardown
// fallow-ignore-next-line unused-export
export const closeDatabase = async (): Promise<void> => {
  await pool.end();
};
