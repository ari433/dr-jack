import { timingSafeEqual } from "node:crypto";
import { ApiError } from "./http.js";
import { env } from "./env.js";

function equalSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function requireBearer(req: Request, variable = "AGENT_API_KEY") {
  const header = req.headers.get("authorization") || "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!supplied || !equalSecret(supplied, env(variable))) throw new ApiError(401, "UNAUTHORIZED");
}
