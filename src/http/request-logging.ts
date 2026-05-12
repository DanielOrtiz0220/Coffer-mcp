import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

import type { MiddlewareHandler } from "hono";

import { toSafeErrorCode, type AppLogger } from "../logging/logger.js";

export interface AppVariables {
  requestId: string;
}

export function requestLogging(logger: AppLogger): MiddlewareHandler<{ Variables: AppVariables }> {
  return async (context, next) => {
    const requestId = context.req.header("x-request-id") ?? randomUUID();
    const startedAt = performance.now();

    context.set("requestId", requestId);
    context.header("x-request-id", requestId);

    try {
      await next();
    } catch (error) {
      logger.error({
        request_id: requestId,
        route: context.req.path,
        method: context.req.method,
        error_code: toSafeErrorCode(error)
      }, "request_failed");
      throw error;
    } finally {
      logger.info({
        request_id: requestId,
        route: context.req.path,
        method: context.req.method,
        status_code: context.res.status,
        duration_ms: Math.round(performance.now() - startedAt)
      }, "request_completed");
    }
  };
}
