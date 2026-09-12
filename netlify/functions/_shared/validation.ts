import { ApiError } from "./http.js";
import { canonicalColor, canonicalProduct, canonicalVariant, normalize } from "./normalize.js";

export type OrderInput = {
  idempotency_key: string; conversation_id: string; product: string; variant: string; color: string;
  size: number; quantity: number; first_name: string; last_name: string; phone: string;
  street_address: string; city: string;
};

const text = (v: unknown, name: string, min = 1, max = 160) => {
  const value = String(v ?? "").trim();
  if (value.length < min || value.length > max) throw new ApiError(422, `INVALID_${name.toUpperCase()}`);
  return value;
};

export function validateOrder(body: Record<string, unknown>): OrderInput {
  const street = text(body.street_address, "street_address", 5);
  const city = text(body.city, "city", 2, 80);
  if (normalize(street) === normalize(city) || !/[a-zA-Z0-9ëËçÇ]{3}/.test(street)) {
    throw new ApiError(422, "FULL_STREET_ADDRESS_REQUIRED");
  }
  const size = Number(body.size), quantity = Number(body.quantity);
  if (!Number.isInteger(size) || size < 30 || size > 50) throw new ApiError(422, "INVALID_SIZE");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new ApiError(422, "INVALID_QUANTITY");
  const phone = text(body.phone, "phone", 7, 30);
  if (!/^[+\d][\d\s()-]{6,29}$/.test(phone)) throw new ApiError(422, "INVALID_PHONE");
  const idempotency = text(body.idempotency_key, "idempotency_key", 8, 160);
  return {
    idempotency_key: idempotency,
    conversation_id: text(body.conversation_id, "conversation_id", 3, 160),
    product: canonicalProduct(body.product), variant: canonicalVariant(body.variant), color: canonicalColor(body.color),
    size, quantity,
    first_name: text(body.first_name, "first_name", 2, 80), last_name: text(body.last_name, "last_name", 2, 80),
    phone, street_address: street, city
  };
}
