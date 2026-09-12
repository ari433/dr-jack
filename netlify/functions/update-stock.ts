import type { Config } from "@netlify/functions";
import { requireBearer } from "./_shared/auth.js";
import { errorResponse, json, readJson, ApiError } from "./_shared/http.js";
import { canonicalColor, canonicalProduct, canonicalVariant } from "./_shared/normalize.js";
import { rpc } from "./_shared/supabase.js";

export default async (req: Request) => {
  try {
    requireBearer(req, "ADMIN_API_KEY");
    const body = await readJson(req);
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 1000) {
      throw new ApiError(422, "INVALID_STOCK_BATCH");
    }
    const items = body.items.map((raw: any) => {
      const size = Number(raw.size), quantity = Number(raw.quantity), unitPrice = Number(raw.unit_price);
      if (!Number.isInteger(size) || !Number.isInteger(quantity) || quantity < 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new ApiError(422, "INVALID_STOCK_ITEM");
      }
      return { product: canonicalProduct(raw.product), variant: canonicalVariant(raw.variant),
        color: canonicalColor(raw.color), size, quantity, unit_price: unitPrice,
        sku: String(raw.sku || ""), source_date: raw.source_date || new Date().toISOString().slice(0,10) };
    });
    return json({ success: true, ...(await rpc("upsert_stock_bulk", { p_items: items })) });
  } catch (error) { return errorResponse(error); }
};
export const config: Config = { path: "/api/update-stock", method: ["POST"] };
