# Summary

Coffer-MCP V1 lets one allowlisted person connect bank and card accounts through Plaid, then ask Claude.ai or ChatGPT questions through four read-only MCP tools.

## The product shape

There are two surfaces:

- A small browser setup route for connecting Plaid and running sync.
- A public MCP endpoint for tool calls from Claude.ai or ChatGPT.

The setup route is not a full app. It exists so the user can complete Plaid Link, check connection status, and trigger sync.

## What the app can answer

V1 can answer questions like:

- What accounts are connected?
- What is my current cash position?
- What did I spend at a merchant?
- How much did I spend by category last month?
- Which transactions match this date range?

## What the app cannot do

V1 cannot move money, send messages, edit financial rows, create exports, or manage many users. It only reads normalized account and transaction data for the allowlisted user.

## Main components

- Node/Hono app on Railway.
- Postgres database.
- Plaid API.
- Auth0 tenant.
- MCP clients such as Claude.ai and ChatGPT.

# Glossary

**Allowlisted user:** The one Auth0 user permitted to use V1.

**MCP tool:** A named server function an AI client can call.

**Normalized data:** The subset of Plaid data stored in our own tables.

**Setup route:** The private browser route used to connect and sync Plaid.
