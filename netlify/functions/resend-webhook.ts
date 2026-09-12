import type { Config } from "@netlify/functions";
import { Webhook } from "svix";
import { env } from "./_shared/env.js";
import { errorResponse, json, ApiError } from "./_shared/http.js";
import { rpc } from "./_shared/supabase.js";

export default async (req: Request) => {
  try {
    const payload = await req.text();
    let event: any;
    try {
      event = new Webhook(env("RESEND_WEBHOOK_SECRET")).verify(payload, {
        "svix-id": req.headers.get("svix-id") || "",
        "svix-timestamp": req.headers.get("svix-timestamp") || "",
        "svix-signature": req.headers.get("svix-signature") || ""
      });
    } catch { throw new ApiError(401, "INVALID_WEBHOOK_SIGNATURE"); }

    const emailId = event?.data?.email_id;
    if (!emailId) throw new ApiError(422, "MISSING_EMAIL_ID");
    if (event.type === "email.delivered") await rpc("mark_email_delivered", { p_email_id: emailId });
    if (["email.bounced", "email.failed", "email.complained"].includes(event.type)) {
      await rpc("mark_email_failed", { p_email_id: emailId, p_error: event.type });
    }
    return json({ received: true });
  } catch (error) { return errorResponse(error); }
};
export const config: Config = { path: "/api/resend-webhook", method: ["POST"] };
