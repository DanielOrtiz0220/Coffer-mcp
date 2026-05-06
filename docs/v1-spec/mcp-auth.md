# MCP Auth

V1 uses Auth0 as the authorization server for remote MCP clients. The resource server is the Coffer-MCP Railway app.

## Why OAuth remains in V1

The data is customer-specific financial data. ChatGPT's Apps SDK authentication guidance says apps that expose customer-specific data should authenticate users, and authenticated MCP servers are expected to implement OAuth 2.1 with the MCP authorization spec.

Source: https://developers.openai.com/apps-sdk/build/auth

## Auth0 configuration

V1 needs:

- One Auth0 tenant.
- One API identifier for the MCP server resource.
- One allowed user email.
- One scope: `read:financial_data`.
- Dynamic client registration if required by the MCP client flow.
- Authorization Code with PKCE.

## Discovery endpoints

The Railway app should expose the metadata MCP clients need:

- `/.well-known/oauth-protected-resource`
- `/.well-known/oauth-authorization-server` if proxying or publishing Auth0 metadata from the resource host is needed by the client.

The protected resource metadata should identify:

- `resource`: the canonical HTTPS URL of the Railway app.
- `authorization_servers`: the Auth0 issuer URL.
- `scopes_supported`: `["read:financial_data"]`.

## Token checks

Every MCP request must verify:

1. Bearer token exists.
2. JWT signature validates against Auth0's JWKS.
3. `iss` equals the Auth0 issuer.
4. `aud` equals the MCP API identifier.
5. `exp` is in the future.
6. `scope` includes `read:financial_data`.
7. `sub` maps to a local `users` row.
8. The local user is allowlisted.

If any check fails, return `401` and do not run tool code.

## Local user mapping

The first successful setup login can create the `users` row if the Auth0 email is allowlisted. Tool calls should not create users implicitly; they should require the user row to already exist.

## Client behavior

Claude.ai and ChatGPT connect to the public HTTPS MCP endpoint, complete OAuth, receive an access token from Auth0, and include that token on tool calls. The app treats both clients the same.
