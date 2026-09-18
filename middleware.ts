import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  // Auth.js names its session cookie "__Secure-authjs.session-token" over HTTPS
  // and "authjs.session-token" over HTTP, and salts the JWT with that name.
  // Match the request's protocol the way Auth.js itself does. (Keying off
  // NODE_ENV alone breaks `next start` over plain HTTP, e.g. a local prod run.)
  const secureCookie =
    req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";

  const token = await getToken({ req, secret, secureCookie });

  if (!token || (token as { role?: string }).role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
