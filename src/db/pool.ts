import pg from "pg";

import type { AppConfig } from "../config/env.js";

export type DatabaseHealthCheck = () => Promise<void>;

export function createDatabasePool(config: AppConfig): pg.Pool {
  return new pg.Pool({
    connectionString: config.databaseUrl,
    max: 10
  });
}

export function createDatabaseHealthCheck(pool: pg.Pool): DatabaseHealthCheck {
  return async () => {
    const client = await pool.connect();
    try {
      await client.query("select 1");
    } finally {
      client.release();
    }
  };
}
