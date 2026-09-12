# Agjenti AI Custom Functions

## 1. check_stock

- Method: `POST`
- URL: `https://YOUR-SITE.netlify.app/api/check-stock`
- Header: `Authorization: Bearer YOUR_AGENT_API_KEY`
- Parameters: `product`, `variant`, `color`, `size`

Call before answering any stock question. Never expose exact quantity.

## 2. finalize_order

- Method: `POST`
- URL: `https://YOUR-SITE.netlify.app/api/finalize-order`
- Header: `Authorization: Bearer YOUR_AGENT_API_KEY`
- Parameters: `idempotency_key`, `conversation_id`, `product`, `variant`, `color`, `size`, `quantity`, `first_name`, `last_name`, `phone`, `street_address`, `city`

Call only after the customer confirms the complete Final Order Summary. Reuse the same `idempotency_key` on retries. Say the order is confirmed only when the response contains `success=true`, `status=confirmed` and `order_id`.

## 3. order_status

- Method: `POST`
- URL: `https://YOUR-SITE.netlify.app/api/order-status`
- Header: `Authorization: Bearer YOUR_AGENT_API_KEY`
- Parameter: `order_id`

If finalization returns `awaiting_email_delivery`, do not claim success. Check status again. Confirm only when `success=true`.

## System prompt block

```text
Before answering a stock question, call check_stock() using the active product, variant, color and size.

Do not show Final Order Summary until product, variant, color, size, quantity, first name, last name, phone, full street address and city are complete. A city alone is not a street address.

After the customer confirms the summary, call finalize_order() exactly once using a stable idempotency_key for that checkout. Reuse the same key on retries. Never invent an Order ID and never claim success from your own text.

Confirm the order only when the function returns success=true, status=confirmed and order_id. Otherwise explain briefly that the order is still processing or transfer it to staff.
```
