import type { Config } from "@netlify/functions";
import { requireBearer } from "./_shared/auth.js";
import { ApiError, errorResponse, json, readJson } from "./_shared/http.js";
import { rpc } from "./_shared/supabase.js";

export default async (req: Request) => {
  try {
    requireBearer(req);
    const body = await readJson(req);
    const id = Number(body.order_id);
    if (!Number.isInteger(id)) throw new ApiError(422, "INVALID_ORDER_ID");
    const order = await rpc("get_order_status", { p_order_id: id });
    return json({ success: order.status === "confirmed", ...order });
  } catch (error) { return errorResponse(error); }
};
export const config: Config = { path: "/api/order-status", method: ["POST"] };
