import test from "node:test";
import assert from "node:assert/strict";
import { validateOrder } from "../netlify/functions/_shared/validation.js";
import { canonicalColor } from "../netlify/functions/_shared/normalize.js";

const valid = { idempotency_key:"conversation-77-checkout-1", conversation_id:"conversation-77", product:"Basel", variant:"Femra", color:"e bardhe", size:40, quantity:1, first_name:"Ana", last_name:"Krasniqi", phone:"+38344111222", street_address:"Rruga B, nr. 12", city:"Ferizaj" };

test("rejects city-only address", () => assert.throws(() => validateOrder({...valid, street_address:"Ferizaj"}), /FULL_STREET_ADDRESS_REQUIRED/));
test("accepts complete order", () => assert.equal(validateOrder(valid).product, "basel"));
test("normalizes Albanian colors", () => assert.equal(canonicalColor("E bardhë"), "e bardhe"));
