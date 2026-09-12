import type { Config } from "@netlify/functions";
import { requireBearer } from "./_shared/auth.js";
import { errorResponse, json, readJson, ApiError } from "./_shared/http.js";
import { canonicalColor, canonicalProduct, canonicalVariant } from "./_shared/normalize.js";
import { rpc } from "./_shared/supabase.js";

export default async (req: Request) => {
  try {
    requireBearer(req);
    const body = await readJson(req);
    const size = Number(body.size);
    if (!Number.isInteger(size)) throw new ApiError(422, "INVALID_SIZE");
    const result = await rpc("check_stock", {
      p_product: canonicalProduct(body.product), p_variant: canonicalVariant(body.variant),
      p_color: canonicalColor(body.color), p_size: size
    });
    return json({ success: true, ...result });
  } catch (error) { return errorResponse(error); }
};
export const config: Config = { path: "/api/check-stock", method: ["POST"] };
