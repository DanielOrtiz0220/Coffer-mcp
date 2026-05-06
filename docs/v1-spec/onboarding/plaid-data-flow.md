# Summary

Plaid data enters V1 through Plaid Link, then sync stores normalized account and transaction rows in Postgres.

## Step 1: Create a Link token

The setup route asks the server for a Plaid `link_token`. The server creates it with the allowlisted local user ID and the V1 product.

The browser can safely receive the `link_token` because it is short-lived and only starts the Link flow.

## Step 2: User completes Plaid Link

The browser opens Plaid Link. The user chooses an institution, signs in with that institution, and completes any required challenge. The app never sees the institution password.

When Link succeeds, Plaid gives the browser a `public_token`.

## Step 3: Exchange for an access token

The browser posts the `public_token` to the server. The server exchanges it with Plaid for a long-lived `access_token`.

The server encrypts that token immediately and stores only encrypted token material in Postgres.

## Step 4: Sync account and transaction data

The server calls Plaid `/transactions/sync`. The response contains changes:

- `added`
- `modified`
- `removed`

The server applies those changes to the local tables and stores Plaid's next cursor. The next sync resumes from that cursor.

## Step 5: Tools read local rows

MCP tools do not ask Plaid for every answer. They read the local Postgres rows. A tool may refresh data first if the last sync is stale.

# Glossary

**Access token:** Long-lived Plaid token used by the server to fetch data.

**Cursor:** Plaid marker showing where the next transaction sync should resume.

**Link token:** Short-lived token used to launch Plaid Link in the browser.

**Public token:** Short-lived token returned by Plaid Link and exchanged server-side.
