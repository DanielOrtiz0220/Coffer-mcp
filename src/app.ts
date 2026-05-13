import { Hono } from "hono";

import type { DatabaseHealthCheck } from "./db/pool.js";
import { requestLogging, type AppVariables } from "./http/request-logging.js";
import { createLogger, type AppLogger } from "./logging/logger.js";

export interface CreateAppOptions {
  healthCheck?: DatabaseHealthCheck;
  logger?: AppLogger;
}

export function createApp(options: CreateAppOptions = {}): Hono<{ Variables: AppVariables }> {
  const logger = options.logger ?? createLogger({ logLevel: "silent", nodeEnv: "test" });
  const healthCheck = options.healthCheck ?? (() => Promise.resolve());
  const app = new Hono<{ Variables: AppVariables }>();

  app.use("*", requestLogging(logger));

  app.get("/healthz", async (context) => {
    try {
      await healthCheck();
      return context.json({ status: "ok" }, 200);
    } catch {
      logger.warn({
        request_id: context.get("requestId"),
        route: "/healthz",
        error_code: "DATABASE_UNAVAILABLE"
      }, "health_check_failed");

      return context.json({
        status: "error",
        error: {
          code: "DATABASE_UNAVAILABLE"
        }
      }, 503);
    }
  });

  return app;
}
