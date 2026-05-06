# Summary

This onboarding path explains only the V1 private MVP. Read it when you need to understand what the prototype does, how data moves from Plaid into Postgres, how MCP tools answer questions, and how to run or debug the app.

## Read in this order

1. [What the app does](what-the-app-does.md)
2. [Plaid data flow](plaid-data-flow.md)
3. [MCP tools flow](mcp-tools-flow.md)
4. [Run and debug](run-and-debug.md)

Future work is tracked in [../../post-mvp/README.md](../../post-mvp/README.md).

# Glossary

**Auth0:** Identity provider that logs in the allowlisted user and issues access tokens for MCP clients.

**MCP:** Model Context Protocol, the tool protocol used by clients like Claude.ai and ChatGPT.

**Plaid:** Vendor that connects to financial institutions and returns account and transaction data.

**V1:** The private, single-user, read-only MVP.
