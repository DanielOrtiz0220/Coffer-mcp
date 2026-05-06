# Data Model

V1 uses one Postgres database and a small normalized schema. The schema exists to answer account and transaction questions, not to preserve every field Plaid returns.

## Tables

```text
users(
  id uuid primary key,
  auth0_sub text unique not null,
  email text not null,
  allowlisted boolean not null default false,
  created_at timestamptz not null default now()
)

plaid_items(
  id uuid primary key,
  user_id uuid not null references users(id),
  plaid_item_id text unique not null,
  access_token_ciphertext text not null,
  access_token_iv text not null,
  access_token_auth_tag text not null,
  institution_id text,
  institution_name text,
  status text not null default 'ok',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

accounts(
  id uuid primary key,
  user_id uuid not null references users(id),
  item_id uuid not null references plaid_items(id),
  plaid_account_id text unique not null,
  name text not null,
  official_name text,
  mask text,
  type text not null,
  subtype text,
  current_balance numeric(14,2),
  available_balance numeric(14,2),
  iso_currency_code text not null default 'USD',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

transactions(
  id uuid primary key,
  user_id uuid not null references users(id),
  account_id uuid not null references accounts(id),
  plaid_transaction_id text unique not null,
  posted_at date not null,
  authorized_at date,
  amount numeric(14,2) not null,
  direction text not null,
  description text not null,
  merchant_name text,
  category_primary text,
  category_detailed text,
  pending boolean not null default false,
  iso_currency_code text not null default 'USD',
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

sync_state(
  item_id uuid primary key references plaid_items(id),
  transactions_cursor text,
  last_started_at timestamptz,
  last_completed_at timestamptz,
  last_error text
)
```

## Data rules

- `users.allowlisted` must be true before a user can connect Plaid or call tools.
- `plaid_items.access_token_*` fields store encrypted token material only.
- `accounts.type` is limited to `depository` and `credit` for V1.
- `transactions.direction` is derived as `inflow` or `outflow` so tools do not need to expose Plaid's sign convention.
- Removed transactions are soft-marked with `removed_at` so repeated syncs stay idempotent.
- Raw Plaid payloads are not stored by default.

## Indexes

```text
accounts(user_id)
accounts(item_id)
transactions(user_id, posted_at desc)
transactions(account_id, posted_at desc)
transactions(user_id, merchant_name)
transactions(user_id, category_primary)
transactions(user_id, removed_at)
```

## Token encryption

V1 uses application-side AES-256-GCM with a single base64-encoded key from the app environment.

Stored fields:

- `access_token_ciphertext`
- `access_token_iv`
- `access_token_auth_tag`

Rules:

- The key is never stored in Postgres.
- The plaintext Plaid access token is held in memory only for Plaid calls.
- Logs must never include plaintext tokens, ciphertext, IVs, or auth tags.
- Key rotation is a manual private-MVP operation: decrypt with the old key and re-encrypt with the new key during a maintenance window.

The more advanced production key design is deferred in [../post-mvp/operations-and-security.md](../post-mvp/operations-and-security.md).
