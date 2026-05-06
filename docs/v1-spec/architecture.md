# Architecture

Coffer-MCP V1 is a single public service with a small setup surface and an MCP surface.

```
┌────────────┐      HTTPS       ┌──────────────────────────┐
│  Browser   │ ───────────────► │  Coffer-MCP Node app     │
│ setup only │                  │  Hono + MCP transport    │
└────────────┘                  │  Hosted on Railway       │
                                └──────┬───────────┬───────┘
                                       │           │
                          OAuth token  │           │ Plaid API
                                       ▼           ▼
                              ┌────────────┐  ┌─────────┐
                              │   Auth0    │  │ Plaid   │
                              └────────────┘  └─────────┘
                                       │
                                       │ normalized rows
                                       ▼
                                ┌──────────┐
                                │ Postgres │
                                └──────────┘

┌────────────────────┐
│ Claude.ai/ChatGPT  │
│ MCP client         │
└─────────┬──────────┘
          │ MCP over HTTPS + Bearer token
          ▼
┌──────────────────────────┐
│ Coffer-MCP Node app      │
└──────────────────────────┘
```

## Containers

### Node/Hono app

The single app owns:

- Minimal setup routes for Plaid Link.
- Plaid token exchange and sync routes.
- MCP endpoints and tool handlers.
- Auth0 token verification.
- Postgres reads and writes for the private prototype.

Why one app: the first target is a working private server, not product separation. Splitting setup, sync, and MCP into separate deploys would create more configuration than the MVP needs.

### Postgres

Postgres stores the internal user row, connected Plaid items, accounts, transactions, and sync state. It stores normalized fields only by default so the prototype has a smaller privacy surface.

### Plaid

Plaid handles institution login and returns account and transaction data. The long-lived Plaid access token is encrypted before storage and decrypted only for sync calls.

### Auth0

Auth0 issues the access tokens used by MCP clients. V1 has one allowlisted user and one read scope.

## Flows

### Connect an institution

1. Browser opens the setup route on the Railway app.
2. The app creates a Plaid `link_token`.
3. Browser opens Plaid Link.
4. Plaid Link returns a short-lived `public_token` to the browser.
5. Browser posts the `public_token` to the app.
6. The app exchanges it for a Plaid `access_token`.
7. The app encrypts the `access_token`, stores the item, and runs initial sync.

The long-lived Plaid token never goes to the browser.

### Sync data

Initial sync runs immediately after the token exchange. Later sync happens when the user triggers "sync now" from the setup route or when a tool handler detects stale data and refreshes before answering.

The sync path calls Plaid `/transactions/sync`, applies `added`, `modified`, and `removed` changes, and stores the latest cursor in Postgres.

### Answer an MCP tool call

1. Claude.ai or ChatGPT calls the MCP endpoint with an Auth0 Bearer token.
2. The app verifies issuer, audience, expiration, allowlisted user, and `read:financial_data`.
3. The tool handler reads normalized rows from Postgres.
4. The app returns compact JSON to the MCP client.

## Non-goals

V1 does not include a broad account dashboard, generated exports, notification delivery, custom financial rows, scheduled background processing, public tenant management, or broader product data. Those are tracked in [../post-mvp/README.md](../post-mvp/README.md).
