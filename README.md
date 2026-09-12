# DrJack Order Backend

Production backend for the DrJack AI agent.

## Guarantees

- Stock lookup by product + variant + color + size without exposing exact quantity.
- Complete-address validation before finalization.
- Idempotent checkout: one `idempotency_key` creates one Order ID and decrements stock once.
- PostgreSQL row locking prevents overselling.
- Order email is tracked through a signed Resend webhook.
- The agent receives `success: true` only after `email.delivered`.

## Endpoints

- `POST /api/check-stock`
- `POST /api/finalize-order`
- `POST /api/order-status`
- `POST /api/update-stock` (admin only; bulk import from Excel/JSON)
- `POST /api/resend-webhook`
- `GET /api/health`

Agent endpoints require `Authorization: Bearer <AGENT_API_KEY>`.
Stock updates require `Authorization: Bearer <ADMIN_API_KEY>`.

## Setup

1. Create a Supabase project and run `supabase/schema.sql`, then `supabase/seed.sql`.
2. Create a Resend API key and verify the sender domain.
3. Add the variables from `.env.example` to Netlify. Never commit secret values.
4. In Resend, configure the webhook URL as `https://YOUR-SITE.netlify.app/api/resend-webhook` and subscribe to delivered, bounced, failed and complained events.
5. Deploy to Netlify and configure the three agent Custom Functions from `AGJENTI_AI_SETUP.md`.

## Important

The same checkout must always reuse the same `idempotency_key`. A new customer order must use a new key. Instagram shared-post vision still depends on Stammer passing the actual media URL or bytes to the vision model.
