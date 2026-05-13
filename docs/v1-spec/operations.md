# Operations

V1 operations are built for a private prototype.

## Environments

| Env | Purpose | Plaid env | Auth0 | Database |
|-----|---------|-----------|-------|----------|
| local | Developer laptop | sandbox | development tenant/app | local or hosted dev Postgres |
| production | Private remote server | sandbox first, production after Plaid approval | production tenant/app | hosted Postgres |

## Hosting

| Component | Location |
|-----------|----------|
| Node/Hono app | Railway |
| Postgres | Hosted Postgres provider |
| Identity | Auth0 |
| Financial data vendor | Plaid |

## Deploy checklist

1. Set all required environment variables.
2. Run database migrations.
3. Verify `MCP_PUBLIC_BASE_URL` is HTTPS and matches Auth0 audience/resource settings.
4. Verify Auth0 allowed email is correct.
5. Verify Plaid environment and credentials.
6. Open the setup route and complete Plaid Link.
7. Run manual sync.
8. Connect an MCP client and call `list_accounts`.

## Local run checklist

The local foundation uses Docker Compose for Postgres and pnpm for the Node app:

```text
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

The app should print the local setup URL and MCP URL on startup.

## Debugging

### OAuth failure

Check:

- Auth0 issuer matches `AUTH0_ISSUER`.
- Auth0 API identifier matches `AUTH0_AUDIENCE`.
- The token includes `read:financial_data`.
- The user email matches `AUTH0_ALLOWED_EMAIL`.
- The public base URL matches the resource metadata.

### Plaid Link failure

Check:

- Plaid env matches credentials.
- `PLAID_CLIENT_ID` and `PLAID_SECRET` are present.
- The setup route is served over the expected origin.
- The Link token request includes the V1 product and user ID.

### Sync returns no rows

Check:

- The Plaid item exists.
- The Plaid token decrypts.
- The stored cursor is not corrupted.
- Plaid may still be preparing transaction data; run manual sync again later.

### Tool returns stale data

Check:

- `sync_state.last_completed_at`.
- Whether lazy sync timed out.
- Plaid API errors stored in `sync_state.last_error`.
