import { pino, type Logger } from "pino";

import type { AppConfig } from "../config/env.js";

const forbiddenLogFields = [
  "access_token",
  "public_token",
  "access_token_ciphertext",
  "access_token_iv",
  "access_token_auth_tag",
  "authorization",
  "transaction_description",
  "description",
  "merchant_name",
  "account_mask",
  "mask",
  "balance",
  "current_balance",
  "available_balance",
  "tool_arguments",
  "tool_result"
];

export type AppLogger = Logger;

export function createLogger(config: Pick<AppConfig, "logLevel" | "nodeEnv">): AppLogger {
  return pino({
    level: config.nodeEnv === "test" ? "silent" : config.logLevel,
    base: undefined,
    messageKey: "message",
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        ...forbiddenLogFields,
        "req.headers.authorization",
        "request.headers.authorization",
        "*.authorization",
        "*.access_token",
        "*.public_token",
        "*.access_token_ciphertext",
        "*.access_token_iv",
        "*.access_token_auth_tag"
      ],
      censor: "[redacted]",
      remove: false
    }
  });
}

export function toSafeErrorCode(error: unknown): string {
  if (error instanceof Error && error.name.length > 0) {
    return error.name;
  }

  return "UNKNOWN_ERROR";
}
