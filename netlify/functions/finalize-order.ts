import type { Config } from "@netlify/functions";
import { requireBearer } from "./_shared/auth.js";
import { errorResponse, json, readJson } from "./_shared/http.js";
import { rpc } from "./_shared/supabase.js";
import { validateOrder } from "./_shared/validation.js";
import { sendOrderEmail } from "./_shared/email.js";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async (req: Request) => {
  try {
    requireBearer(req);
    const input = validateOrder(await readJson(req));
    let order = await rpc("reserve_order", { p_order: input });

    if (order.status === "confirmed") return json({ success: true, status: "confirmed", order_id: order.order_id, replayed: true });

    if (!order.email_id) {
      const emailId = await sendOrderEmail(order);
      order = await rpc("mark_email_sent", { p_order_id: order.order_id, p_email_id: emailId });
    }

    // Give the signed delivery webhook a short window to confirm actual delivery.
    for (let i = 0; i < 12; i++) {
      const status = await rpc("get_order_status", { p_order_id: order.order_id });
      if (status.status === "confirmed") return json({ success: true, status: "confirmed", order_id: status.order_id });
      if (status.status === "email_failed") return json({ success: false, status: "email_failed", order_id: status.order_id }, 502);
      await wait(500);
    }

    return json({ success: false, status: "awaiting_email_delivery", order_id: order.order_id,
      message: "Porosia eshte ruajtur, por emaili ende nuk eshte konfirmuar si delivered. Mos deklaro sukses." }, 202);
  } catch (error) { return errorResponse(error); }
};
export const config: Config = { path: "/api/finalize-order", method: ["POST"] };
