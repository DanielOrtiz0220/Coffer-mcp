export const up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      auth0_sub text UNIQUE NOT NULL,
      email text NOT NULL,
      allowlisted boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE plaid_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plaid_item_id text UNIQUE NOT NULL,
      access_token_ciphertext text NOT NULL,
      access_token_iv text NOT NULL,
      access_token_auth_tag text NOT NULL,
      institution_id text,
      institution_name text,
      status text NOT NULL DEFAULT 'ok',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT plaid_items_status_check CHECK (status IN ('ok', 'error', 'revoked'))
    );

    CREATE TABLE accounts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id uuid NOT NULL REFERENCES plaid_items(id) ON DELETE CASCADE,
      plaid_account_id text UNIQUE NOT NULL,
      name text NOT NULL,
      official_name text,
      mask text,
      type text NOT NULL,
      subtype text,
      current_balance numeric(14,2),
      available_balance numeric(14,2),
      iso_currency_code text NOT NULL DEFAULT 'USD',
      last_synced_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT accounts_type_check CHECK (type IN ('depository', 'credit'))
    );

    CREATE TABLE transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      plaid_transaction_id text UNIQUE NOT NULL,
      posted_at date NOT NULL,
      authorized_at date,
      amount numeric(14,2) NOT NULL,
      direction text NOT NULL,
      description text NOT NULL,
      merchant_name text,
      category_primary text,
      category_detailed text,
      pending boolean NOT NULL DEFAULT false,
      iso_currency_code text NOT NULL DEFAULT 'USD',
      removed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT transactions_direction_check CHECK (direction IN ('inflow', 'outflow')),
      CONSTRAINT transactions_amount_nonnegative_check CHECK (amount >= 0)
    );

    CREATE TABLE sync_state (
      item_id uuid PRIMARY KEY REFERENCES plaid_items(id) ON DELETE CASCADE,
      transactions_cursor text,
      last_started_at timestamptz,
      last_completed_at timestamptz,
      last_error text
    );

    CREATE INDEX accounts_user_id_idx ON accounts(user_id);
    CREATE INDEX accounts_item_id_idx ON accounts(item_id);
    CREATE INDEX transactions_user_id_posted_at_idx ON transactions(user_id, posted_at DESC);
    CREATE INDEX transactions_account_id_posted_at_idx ON transactions(account_id, posted_at DESC);
    CREATE INDEX transactions_user_id_merchant_name_idx ON transactions(user_id, merchant_name);
    CREATE INDEX transactions_user_id_category_primary_idx ON transactions(user_id, category_primary);
    CREATE INDEX transactions_user_id_removed_at_idx ON transactions(user_id, removed_at);

    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER plaid_items_set_updated_at
    BEFORE UPDATE ON plaid_items
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

    CREATE TRIGGER accounts_set_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

    CREATE TRIGGER transactions_set_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS transactions_set_updated_at ON transactions;
    DROP TRIGGER IF EXISTS accounts_set_updated_at ON accounts;
    DROP TRIGGER IF EXISTS plaid_items_set_updated_at ON plaid_items;
    DROP FUNCTION IF EXISTS set_updated_at();
    DROP TABLE IF EXISTS sync_state;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS accounts;
    DROP TABLE IF EXISTS plaid_items;
    DROP TABLE IF EXISTS users;
  `);
};
