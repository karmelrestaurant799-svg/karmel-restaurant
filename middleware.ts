import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  // Auth.js names its session cookie "__Secure-authjs.session-token" over HTTPS
  // and "authjs.session-token" over HTTP, and salts the JWT with that name.
  // getToken() defaults to the HTTP name, which would reject every admin in
  // production — so match the protocol the way Auth.js itself does.
  const secureCookie =
    req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
  const token = await getToken({ req, secret: process.env.AUTH_SECRET, secureCookie });
  if (!token || (token as { role?: string }).role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
