import { ConfigError, parseEnv } from "../src/config/env.js";

function validEnv(): NodeJS.ProcessEnv {
  return {
    DATABASE_URL: "postgres://coffer:coffer_dev_password@localhost:5432/coffer_mcp",
    AUTH0_ISSUER: "https://example-dev.us.auth0.com/",
    AUTH0_AUDIENCE: "https://coffer-mcp.local",
    AUTH0_JWKS_URL: "https://example-dev.us.auth0.com/.well-known/jwks.json",
    AUTH0_ALLOWED_EMAIL: "you@example.com",
    PLAID_CLIENT_ID: "plaid-client-id",
    PLAID_SECRET: "plaid-secret",
    PLAID_ENV: "sandbox",
    PLAID_TOKEN_AES_KEY_BASE64: Buffer.alloc(32, 1).toString("base64"),
    MCP_PUBLIC_BASE_URL: "http://localhost:3000/"
  };
}

describe("parseEnv", () => {
  it("returns normalized config for a valid environment", () => {
    const config = parseEnv(validEnv());

    expect(config.databaseUrl).toBe("postgres://coffer:coffer_dev_password@localhost:5432/coffer_mcp");
    expect(config.plaidEnv).toBe("sandbox");
    expect(config.plaidTokenAesKey).toHaveLength(32);
    expect(config.mcpPublicBaseUrl).toBe("http://localhost:3000");
    expect(config.port).toBe(3000);
  });

  it("rejects missing required fields", () => {
    const env = validEnv();
    delete env.DATABASE_URL;

    expect(() => parseEnv(env)).toThrow(ConfigError);
    expect(() => parseEnv(env)).toThrow(/DATABASE_URL/);
  });

  it("rejects invalid URLs", () => {
    const env = validEnv();
    env.AUTH0_ISSUER = "not-a-url";

    expect(() => parseEnv(env)).toThrow(/AUTH0_ISSUER/);
  });

  it("rejects invalid Plaid environments", () => {
    const env = validEnv();
    env.PLAID_ENV = "local";

    expect(() => parseEnv(env)).toThrow(/PLAID_ENV/);
  });

  it("rejects AES keys that are not 32 decoded bytes", () => {
    const env = validEnv();
    env.PLAID_TOKEN_AES_KEY_BASE64 = Buffer.alloc(16, 1).toString("base64");

    expect(() => parseEnv(env)).toThrow(/PLAID_TOKEN_AES_KEY_BASE64/);
  });
});
