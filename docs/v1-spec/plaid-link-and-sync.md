# Plaid Link And Sync

V1 uses Plaid Link for institution connection and Plaid `/transactions/sync` for account and transaction updates.

## Products

V1 requests the Plaid `transactions` product only.

The account types expected in V1 are:

- `depository`
- `credit`

## Link flow

```
Browser             Coffer-MCP app          Plaid
   │                      │                   │
   │ open setup           │                   │
   ├─────────────────────►│                   │
   │                      │ /link/token/create│
   │                      ├──────────────────►│
   │ link_token           │                   │
   │◄─────────────────────┤                   │
   │ open Plaid Link      │                   │
   ├─────────────────────────────────────────►│
   │ public_token         │                   │
   │◄─────────────────────────────────────────┤
   │ POST public_token    │                   │
   ├─────────────────────►│                   │
   │                      │ /item/public_token/exchange
   │                      ├──────────────────►│
   │                      │ access_token      │
   │                      │◄──────────────────┤
   │                      │ encrypt + store   │
   │                      │ initial sync      │
   │ done                 │                   │
   │◄─────────────────────┤                   │
```

The browser only receives the short-lived `link_token` and `public_token`. The long-lived `access_token` stays server-side and is encrypted before storage.

## Initial sync

After token exchange, the app immediately:

1. Loads and decrypts the Plaid access token.
2. Calls `/transactions/sync` with no cursor.
3. Upserts accounts returned by Plaid account data.
4. Applies `added`, `modified`, and `removed` transaction changes.
5. Stores `next_cursor` in `sync_state.transactions_cursor`.
6. Repeats while Plaid returns `has_more = true`.
7. Stores `sync_state.last_completed_at`.

The first run may return no transaction rows while Plaid prepares data. That is acceptable. The next manual or lazy sync resumes from the stored cursor.

## Manual sync

The setup route should expose a private "sync now" action. It runs the same sync code used after Link and returns:

```json
{
  "started_at": "2026-05-06T12:00:00.000Z",
  "completed_at": "2026-05-06T12:00:03.000Z",
  "accounts_upserted": 4,
  "transactions_added": 12,
  "transactions_modified": 2,
  "transactions_removed": 0
}
```

## Lazy sync

Tool handlers may sync before answering when `sync_state.last_completed_at` is older than the configured freshness window. Keep the freshness window conservative in V1 so tool calls do not spend most of their time waiting on Plaid.

Recommended default:

- Freshness window: 6 hours.
- Per-tool sync timeout: 8 seconds.
- If sync times out, answer from existing rows and include `last_synced_at`.

## Error handling

- Plaid item requires user action: set `plaid_items.status = 'login_required'` and return a setup-route message.
- Plaid rate or transient error: keep the old cursor, store `sync_state.last_error`, and answer from existing rows.
- Pagination error while syncing: discard partial cursor advancement and retry from the previous stored cursor.

## Sources

- Plaid Transactions overview: https://plaid.com/docs/transactions/
- Plaid Transactions API: https://plaid.com/docs/api/products/transactions/
