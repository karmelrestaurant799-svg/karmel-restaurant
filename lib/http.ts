import { NextResponse } from "next/server";

// Malformed/empty JSON bodies would otherwise throw out of the route handler
// and surface as an opaque 500. Returns null so callers can answer with a 400.
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function badRequest(message = "Invalid request.") {
  return NextResponse.json({ error: message }, { status: 400 });
}

// x-forwarded-for can be a comma-separated proxy chain ("client, proxy1, ...");
// the first entry is the originating client. Falls back to the same "unknown"
// bucket the routes used before.
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}
