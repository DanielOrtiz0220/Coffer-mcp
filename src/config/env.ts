import { Buffer } from "node:buffer";

import { z } from "zod";

const allowedPlaidEnvs = ["sandbox", "development", "production"] as const;
const allowedLogLevels = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;

const urlString = z.string().trim().min(1).refine((value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, "Expected a valid URL");

const postgresUrlString = z.string().trim().min(1).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "postgres:" || url.protocol === "postgresql:";
  } catch {
    return false;
  }
}, "Expected a valid Postgres connection URL");

const aesKeySchema = z.string().trim().min(1).superRefine((value, context) => {
  const isBase64 = value.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(value);
  if (!isBase64) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expected a standard base64-encoded AES key"
    });
    return;
  }

  const decoded = Buffer.from(value, "base64");
  if (decoded.length !== 32) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "PLAID_TOKEN_AES_KEY_BASE64 must decode to a 32-byte AES-256 key"
    });
  }
}).transform((value) => Buffer.from(value, "base64"));

const envSchema = z.object({
  DATABASE_URL: postgresUrlString,
  AUTH0_ISSUER: urlString,
  AUTH0_AUDIENCE: urlString,
  AUTH0_JWKS_URL: urlString,
  AUTH0_ALLOWED_EMAIL: z.string().trim().email(),
  PLAID_CLIENT_ID: z.string().trim().min(1),
  PLAID_SECRET: z.string().trim().min(1),
  PLAID_ENV: z.enum(allowedPlaidEnvs),
  PLAID_TOKEN_AES_KEY_BASE64: aesKeySchema,
  MCP_PUBLIC_BASE_URL: urlString.transform((value) => value.replace(/\/+$/, "")),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(allowedLogLevels).default("info"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

export class ConfigError extends Error {
  public readonly issues: z.ZodIssue[];

  public constructor(issues: z.ZodIssue[]) {
    const fields = issues.map((issue) => issue.path.join(".") || "environment").join(", ");
    super(`Invalid environment configuration: ${fields}`);
    this.name = "ConfigError";
    this.issues = issues;
  }
}

export interface AppConfig {
  databaseUrl: string;
  auth0Issuer: string;
  auth0Audience: string;
  auth0JwksUrl: string;
  auth0AllowedEmail: string;
  plaidClientId: string;
  plaidSecret: string;
  plaidEnv: (typeof allowedPlaidEnvs)[number];
  plaidTokenAesKey: Buffer;
  mcpPublicBaseUrl: string;
  port: number;
  logLevel: (typeof allowedLogLevels)[number];
  nodeEnv: "development" | "test" | "production";
}

export function parseEnv(env: NodeJS.ProcessEnv): AppConfig {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    throw new ConfigError(result.error.issues);
  }

  return {
    databaseUrl: result.data.DATABASE_URL,
    auth0Issuer: result.data.AUTH0_ISSUER,
    auth0Audience: result.data.AUTH0_AUDIENCE,
    auth0JwksUrl: result.data.AUTH0_JWKS_URL,
    auth0AllowedEmail: result.data.AUTH0_ALLOWED_EMAIL,
    plaidClientId: result.data.PLAID_CLIENT_ID,
    plaidSecret: result.data.PLAID_SECRET,
    plaidEnv: result.data.PLAID_ENV,
    plaidTokenAesKey: result.data.PLAID_TOKEN_AES_KEY_BASE64,
    mcpPublicBaseUrl: result.data.MCP_PUBLIC_BASE_URL,
    port: result.data.PORT,
    logLevel: result.data.LOG_LEVEL,
    nodeEnv: result.data.NODE_ENV
  };
}
