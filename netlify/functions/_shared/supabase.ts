import { env } from "./env.js";
import { ApiError } from "./http.js";

export async function supabase(path: string, init: RequestInit = {}) {
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${env("SUPABASE_URL")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(init.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new ApiError(502, "DATABASE_ERROR", data);
  return data;
}

export function rpc(name: string, body: unknown) {
  return supabase(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}
