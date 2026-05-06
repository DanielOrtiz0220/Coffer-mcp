# Deferred Data Model

V1 stores users, Plaid items, accounts, transactions, and sync state. The schema below captures data work deferred from the MVP.

## Investment data

Deferred tables:

```text
investment_holdings(
  id uuid primary key,
  user_id uuid not null,
  account_id uuid not null,
  security_id text,
  ticker text,
  name text,
  quantity numeric(20,8),
  institution_value numeric(14,2),
  cost_basis numeric(14,2),
  iso_currency_code text
)

investment_activity(
  id uuid primary key,
  user_id uuid not null,
  account_id uuid not null,
  plaid_transaction_id text unique,
  type text,
  ticker text,
  quantity numeric(20,8),
  price numeric(14,4),
  amount numeric(14,2),
  posted_at date
)
```

Why deferred: the first useful private MVP can answer account and transaction questions without investments, brokerage positions, or activity.

## Liability data

Deferred tables:

```text
credit_details(
  account_id uuid primary key,
  user_id uuid not null,
  apr_percentage numeric(5,2),
  last_payment_amount numeric(14,2),
  last_payment_date date,
  next_payment_due date,
  minimum_payment numeric(14,2)
)

loan_details(
  account_id uuid primary key,
  user_id uuid not null,
  apr_percentage numeric(5,2),
  loan_type text,
  principal_balance numeric(14,2),
  origination_date date,
  expected_payoff_date date
)
```

Why deferred: V1 includes credit account balances through the transactions product, but not deeper debt-product fields.

## Custom rows

Deferred table:

```text
custom_financial_rows(
  id uuid primary key,
  user_id uuid not null,
  kind text not null,
  name text not null,
  value numeric(14,2) not null,
  currency text not null,
  notes text,
  archived_at timestamptz
)
```

Why deferred: custom rows require write tools and a stronger audit/recovery model.

## Raw Plaid payloads

The previous plan stored raw transaction payloads for replaying enrichment.

Why deferred: raw payloads increase privacy surface and are unnecessary for the first fixed tools. Revisit only when a concrete reprocessing need appears.
