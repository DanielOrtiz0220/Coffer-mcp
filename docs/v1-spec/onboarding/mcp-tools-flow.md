# Summary

MCP tools answer questions by verifying the Auth0 token, reading local Postgres rows, and returning compact JSON to the AI client.

## Step 1: Client gets access

Claude.ai or ChatGPT connects to the public MCP URL. The client follows the OAuth flow through Auth0 and receives an access token for the Coffer-MCP resource.

## Step 2: Client calls a tool

The client sends a tool request with:

- tool name
- JSON arguments
- `Authorization: Bearer <token>`

## Step 3: Server verifies the token

The server checks:

- token signature
- issuer
- audience
- expiration
- `read:financial_data` scope
- allowlisted local user

If any check fails, the server rejects the request before reading data.

## Step 4: Tool reads Postgres

The tool validates arguments, reads normalized rows, and shapes the result for the client.

The four V1 tools are:

- `get_overview`
- `list_accounts`
- `search_transactions`
- `summarize_transactions`

## Step 5: Client writes the answer

The server returns JSON. The AI client uses that JSON to write the user-facing answer.

# Glossary

**Audience:** The token field that identifies which API the token is for.

**Bearer token:** Access token sent in the HTTP `Authorization` header.

**Scope:** Permission string attached to the token.

**Tool handler:** Server code that implements one MCP tool.
