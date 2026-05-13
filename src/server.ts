// Start Here

import { serve } from "@hono/node-server";

import { createApp } from "./app.js";
import { parseEnv } from "./config/env.js";
import { createDatabaseHealthCheck, createDatabasePool } from "./db/pool.js";
import { createLogger } from "./logging/logger.js";

const config = parseEnv(process.env);
const logger = createLogger(config);
const pool = createDatabasePool(config);
const app = createApp({
  healthCheck: createDatabaseHealthCheck(pool),
  logger
});

const localBaseUrl = `http://localhost:${config.port}`;

const server = serve({
  fetch: app.fetch,
  port: config.port
}, (info) => {
  logger.info({
    route: "startup",
    port: info.port,
    setup_url: `${localBaseUrl}/setup`,
    mcp_url: `${config.mcpPublicBaseUrl}/mcp`
  }, "server_started");

  console.log(`Coffer-MCP listening on ${localBaseUrl}`);
  console.log(`Health URL: ${localBaseUrl}/healthz`);
  console.log(`Setup URL: ${localBaseUrl}/setup`);
  console.log(`MCP URL: ${config.mcpPublicBaseUrl}/mcp`);
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, "server_stopping");
  server.close();
  await pool.end();
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});
