import { ApiError } from "./http.js";

export function env(name: string): string {
  const value = Netlify.env.get(name);
  if (!value) throw new ApiError(500, `MISSING_ENV_${name}`);
  return value;
}
