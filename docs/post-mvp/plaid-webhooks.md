# Plaid Webhooks

Plaid webhook automation is deferred from V1. V1 uses manual or lazy sync after Plaid Link.

## Future design

When reintroduced, expose a Plaid webhook endpoint that receives Plaid update notifications, verifies the signed request, records the event, and enqueues or runs sync outside the response path.

## Verification

Plaid sends a JWT in the `Plaid-Verification` header. Verification should:

1. Read the JWT header and extract `kid`.
2. Call Plaid `/webhook_verification_key/get` with that `kid`.
3. Interpret the returned key as a JWK.
4. Verify the JWT signature.
5. Reject if `iat` is more than five minutes old.
6. Read `request_body_sha256` from the JWT payload.
7. Compute SHA-256 over the exact raw request body bytes.
8. Compare the computed hash to `request_body_sha256` with a constant-time comparison.
9. Reject if any check fails.

Source: https://plaid.com/docs/api/webhooks/webhook-verification/

## Transactions sync trigger

For `/transactions/sync`, the future handler should listen for `SYNC_UPDATES_AVAILABLE`.

After receiving a verified `SYNC_UPDATES_AVAILABLE` event:

1. Locate the matching Plaid item.
2. Load the stored transactions cursor.
3. Decrypt the Plaid access token.
4. Call `/transactions/sync`.
5. Apply `added`, `modified`, and `removed` changes.
6. Persist `next_cursor` only after all pages have been applied.

Plaid documents `SYNC_UPDATES_AVAILABLE` as the recommended update notification for `/transactions/sync`; older transaction webhooks may still be sent for compatibility but do not need to drive the future sync logic.

Sources:

- https://plaid.com/docs/api/products/transactions/
- https://plaid.com/docs/transactions/webhooks/

## Why not V1

Webhook automation adds public endpoint verification, replay protection, event persistence, queueing behavior, and operational alerts. Manual and lazy sync are enough for the private MVP.
