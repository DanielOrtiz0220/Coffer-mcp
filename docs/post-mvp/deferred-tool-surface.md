# Deferred Tool Surface

V1 exposes only four read-only tools. The tools below were cut from the MVP.

## Broader read tools

- `list_assets_and_liabilities`
- `list_outstanding_debts`
- `list_investment_holdings`
- `list_recurring_transactions`
- `search_investment_activity`

Why deferred: V1 only stores cash/card accounts and transactions.

## SQL tools

- `query_cash_sql`
- `query_investment_sql`

Original safety model:

1. Narrow database role with read privileges only.
2. Read-only transaction mode.
3. Statement timeout.
4. Parse submitted statements and allow only read statements.
5. Tenant isolation enforced below the tool layer.

Why deferred: free-form query tools are powerful but expand the security and test surface. V1 should ship fixed tools first.

## Export and notification tools

- `export_cash_transactions`
- `email_me`

Why deferred: exports require object storage and signed URLs; email requires delivery provider setup, rate limits, and user messaging policy.

## Write tools

- `create_custom_asset_or_liability`
- `update_custom_asset_or_liability`
- `archive_custom_asset_or_liability`

Why deferred: V1 is read-only. Write actions require clearer confirmation, audit, and recovery behavior.

## Versioning note

When these tools are reintroduced, add them as explicit new tool names and scopes. Do not widen the V1 scope silently.
