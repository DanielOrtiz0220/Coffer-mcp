# Privacy And Security

V1 is private, but it still handles financial data and long-lived Plaid tokens. Keep the security model small and strict.

## Principles

- One allowlisted user.
- Read-only tools only.
- One read scope.
- No plaintext Plaid tokens in storage or logs.
- No tool argument-value logging.
- No raw Plaid payload storage by default.
- No broad admin surface.

## Secrets

Required environment variables:

```text
DATABASE_URL=
AUTH0_ISSUER=
AUTH0_AUDIENCE=
AUTH0_JWKS_URL=
AUTH0_ALLOWED_EMAIL=
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox
PLAID_TOKEN_AES_KEY_BASE64=
MCP_PUBLIC_BASE_URL=
```

`PLAID_TOKEN_AES_KEY_BASE64` must decode to a 32-byte AES key.

## Logging

Allowed log fields:

- `request_id`
- route or tool name
- authenticated user ID
- status code
- duration
- row count
- sync counts
- error code or safe error class

Forbidden log fields:

- Plaid access tokens
- Plaid public tokens
- Plaid token ciphertext material
- transaction descriptions
- merchant names
- account masks
- balances
- tool argument values
- tool return values

## MCP tool safety

Tool handlers should use fixed query builders or parameterized queries. They should validate date ranges, limits, enum fields, and account IDs before reading from Postgres.

## Private setup route

The setup route is not a product surface. It should require Auth0 login, reject non-allowlisted users, and expose only:

- connection status
- launch Plaid Link
- sync now
- latest sync result
- basic error state

## Data retention

For V1, keep rows until the private user asks for deletion. Deletion should remove:

- Plaid item rows
- encrypted Plaid token material
- account rows
- transaction rows
- sync state

Also call Plaid item removal when intentionally disconnecting an institution.
