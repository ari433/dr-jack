import type { Config } from "@netlify/functions";
import { json } from "./_shared/http.js";

export default async () => json({ ok: true, service: "drjack-orders", time: new Date().toISOString() });
export const config: Config = { path: "/api/health", method: ["GET"] };
