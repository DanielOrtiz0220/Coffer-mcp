# Summary

Run the prototype by configuring Auth0, Plaid, Postgres, and the Node app, then use the setup route and one MCP tool call as the smoke test.

## Required configuration

The app needs:

- Postgres connection string.
- Auth0 issuer, audience, JWKS URL, and allowed email.
- Plaid client ID, secret, and environment.
- Plaid token AES key.
- Public base URL for the MCP server.

## Local run

Copy the local example environment and fill in the Auth0 and Plaid placeholders:

```text
cp .env.example .env
```

Install dependencies, start local Postgres, run migrations, and start the app:

```text
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

The app prints the local health, setup, and MCP URLs on startup. For this foundation step, `GET /healthz` is the only implemented route; setup, Plaid sync, and MCP routes are added in later milestones.

Before opening a pull request, run:

```text
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Pre-commit checks run `pnpm lint`, `pnpm typecheck`, and `pnpm test` through Husky. Only bypass them intentionally with Git's standard `--no-verify` flag, or by setting `HUSKY=0` for a one-off command.

After later milestones add setup and sync routes, open the setup route, log in with the allowlisted Auth0 user, complete Plaid Link, and run sync.

## Remote smoke test

1. Open the Railway setup URL.
2. Log in with the allowlisted Auth0 user.
3. Confirm Plaid connection status.
4. Click sync now.
5. Connect Claude.ai or ChatGPT to the MCP URL.
6. Call `list_accounts`.
7. Call `search_transactions` with a small date range.

## Common failures

OAuth failures usually come from mismatched issuer, audience, public resource URL, missing scope, or a non-allowlisted user.

Plaid Link failures usually come from wrong Plaid environment, missing credentials, or a setup origin that Plaid does not expect.

Sync failures usually come from token decryption, stale Plaid item state, cursor problems, or Plaid data not being ready yet.

Tool failures usually come from invalid arguments, missing local user mapping, expired tokens, or no synced rows yet.

# Glossary

**JWKS:** JSON Web Key Set used to verify JWT signatures.

**Railway:** Hosting platform for the V1 Node app.

**Smoke test:** Small end-to-end check that proves the main path works.

**Sync now:** Setup-route action that fetches the latest Plaid changes.
