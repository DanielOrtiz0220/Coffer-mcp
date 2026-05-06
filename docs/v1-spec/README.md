# V1 Spec

V1 is the private MVP for Coffer-MCP. The goal is to connect one allowlisted user to Plaid, sync enough account and transaction data to be useful, and answer questions from MCP clients without exposing write actions or broad product scope.

## Read in this order

1. [Architecture](architecture.md)
2. [Tools](tools.md)
3. [Data model](data-model.md)
4. [Plaid Link and sync](plaid-link-and-sync.md)
5. [MCP auth](mcp-auth.md)
6. [Privacy and security](privacy-and-security.md)
7. [Operations](operations.md)
8. [Onboarding](onboarding/README.md)

## V1 commitments

- One public Node/Hono app on Railway.
- One Postgres database.
- Plaid for account and transaction data.
- Auth0 for OAuth access from remote MCP clients.
- One allowlisted Auth0 user.
- One read scope: `read:financial_data`.
- Four tools: `get_overview`, `list_accounts`, `search_transactions`, and `summarize_transactions`.
- Plaid token encryption with an environment-held AES key.
- Manual or lazy sync after Plaid Link.
- No raw Plaid payload storage by default.
- No tool argument-value logging.

## Deferred work

Post-MVP work lives in [../post-mvp/README.md](../post-mvp/README.md). Do not import deferred requirements into V1 unless the implementation cannot function without them.
