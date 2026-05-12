import { createApp } from "../src/app.js";
import { createLogger } from "../src/logging/logger.js";

const logger = createLogger({ logLevel: "silent", nodeEnv: "test" });

describe("GET /healthz", () => {
  it("returns ok when the database check passes", async () => {
    const app = createApp({
      healthCheck: async () => undefined,
      logger
    });

    const response = await app.request("/healthz");

    await expect(response.json()).resolves.toEqual({ status: "ok" });
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });

  it("returns a safe 503 error when the database check fails", async () => {
    const app = createApp({
      healthCheck: async () => {
        throw new Error("connection refused: postgres://user:pass@localhost/db");
      },
      logger
    });

    const response = await app.request("/healthz");

    await expect(response.json()).resolves.toEqual({
      status: "error",
      error: {
        code: "DATABASE_UNAVAILABLE"
      }
    });
    expect(response.status).toBe(503);
  });
});
