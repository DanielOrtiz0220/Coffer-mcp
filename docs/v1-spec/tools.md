# Tools

The V1 MCP tool surface is intentionally small. Every tool is read-only and requires the same Auth0 scope: `read:financial_data`.

## Tool index

| Tool | Purpose |
|------|---------|
| `get_overview` | Return current balances and recent cash-flow totals. |
| `list_accounts` | Return connected accounts with institution, type, subtype, and balances. |
| `search_transactions` | Return matching transactions with filters. |
| `summarize_transactions` | Return grouped transaction totals for common questions. |

## Shared behavior

- Tools never write financial data.
- Tools never return the encrypted Plaid access token.
- Tools read from normalized Postgres rows.
- Tools may run a lazy sync before answering if the data is stale.
- Tool logs include tool name, status, duration, and row count only. They do not log argument values or returned financial values.

## `get_overview`

Use this for broad questions like "How am I doing?" or "What changed recently?"

Args:

```json
{}
```

Returns:

```json
{
  "as_of": "2026-05-06T12:00:00.000Z",
  "total_cash": "1234.56",
  "total_credit_balance": "456.78",
  "net_cash_position": "777.78",
  "monthly_inflow": "5000.00",
  "monthly_outflow": "3200.00",
  "accounts_count": 4,
  "last_synced_at": "2026-05-06T11:58:00.000Z"
}
```

Notes:

- `total_credit_balance` is the amount currently owed on connected credit accounts.
- `net_cash_position` is depository balances minus credit balances.
- Monthly totals use the current calendar month unless the implementation adds an optional date range later.

## `list_accounts`

Use this when the client needs account names, masks, balances, or IDs for follow-up filters.

Args:

```json
{
  "type": "depository"
}
```

`type` is optional. Valid values are `depository` and `credit`.

Returns:

```json
[
  {
    "account_id": "acc_123",
    "institution_name": "Plaid Checking",
    "name": "Checking",
    "mask": "0000",
    "type": "depository",
    "subtype": "checking",
    "current_balance": "1234.56",
    "available_balance": "1200.00",
    "currency": "USD",
    "last_synced_at": "2026-05-06T11:58:00.000Z"
  }
]
```

## `search_transactions`

Use this for transaction lookup, merchant questions, date ranges, category filters, and account-specific searches.

Args:

```json
{
  "date_from": "2026-05-01",
  "date_to": "2026-05-31",
  "merchant": "coffee",
  "category": "Food and Drink",
  "account_id": "acc_123",
  "amount_min": "0.00",
  "amount_max": "100.00",
  "limit": 100,
  "offset": 0
}
```

All fields are optional. Defaults:

- `limit`: `100`
- Maximum `limit`: `500`
- `offset`: `0`

Returns:

```json
[
  {
    "transaction_id": "txn_123",
    "account_id": "acc_123",
    "posted_at": "2026-05-05",
    "authorized_at": "2026-05-04",
    "amount": "4.85",
    "direction": "outflow",
    "merchant_name": "Coffee Shop",
    "description": "Coffee Shop",
    "category_primary": "Food and Drink",
    "category_detailed": "Coffee",
    "pending": false,
    "currency": "USD"
  }
]
```

## `summarize_transactions`

Use this for grouped answers like "How much did I spend by category last month?" or "Which merchants cost the most?"

Args:

```json
{
  "date_from": "2026-04-01",
  "date_to": "2026-04-30",
  "group_by": "category_primary",
  "direction": "outflow",
  "account_id": "acc_123",
  "limit": 20
}
```

Required:

- `group_by`: `category_primary`, `category_detailed`, `merchant_name`, `account_id`, or `month`

Optional:

- `direction`: `inflow` or `outflow`
- `limit`: default `20`, max `100`

Returns:

```json
[
  {
    "group": "Food and Drink",
    "transaction_count": 18,
    "total_amount": "245.90",
    "currency": "USD"
  }
]
```

## Versioning

V1 tool names are stable for the private prototype. Add optional arguments or return fields only when the existing behavior remains valid for current clients.
