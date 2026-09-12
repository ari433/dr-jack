export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  }
});

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const type = req.headers.get("content-type") || "";
  if (!type.includes("application/json")) throw new ApiError(415, "CONTENT_TYPE_REQUIRED");
  try {
    const value = await req.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "INVALID_JSON");
  }
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, public details?: unknown) { super(code); }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) return json({ success: false, error: error.code, details: error.details }, error.status);
  console.error(error);
  return json({ success: false, error: "INTERNAL_ERROR" }, 500);
}
