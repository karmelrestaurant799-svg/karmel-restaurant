import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { encode } from "next-auth/jwt";
import middleware from "@/middleware";

const SECRET = "test-secret-for-middleware";

// Auth.js names the session cookie "__Secure-authjs.session-token" over HTTPS
// (production) and "authjs.session-token" over plain HTTP (local dev). The JWT
// is also salted with that cookie name, so the middleware must look up the
// right one or every admin is bounced to /login in production.
async function adminRequest(url: string, cookieName: string, role: string) {
  const jwt = await encode({ token: { email: "a@b.de", role }, secret: SECRET, salt: cookieName });
  return new NextRequest(url, { headers: { cookie: `${cookieName}=${jwt}` } });
}

function isRedirectToLogin(res: Response) {
  return res.status >= 300 && res.status < 400 && !!res.headers.get("location")?.includes("/login");
}

beforeAll(() => {
  process.env.AUTH_SECRET = SECRET;
});

describe("middleware admin guard", () => {
  it("lets an ADMIN through over HTTPS (secure cookie name)", async () => {
    const res = await middleware(await adminRequest("https://example.com/admin", "__Secure-authjs.session-token", "ADMIN"));
    expect(isRedirectToLogin(res)).toBe(false);
  });

  it("lets an ADMIN through over HTTP (dev cookie name)", async () => {
    const res = await middleware(await adminRequest("http://localhost:3000/admin", "authjs.session-token", "ADMIN"));
    expect(isRedirectToLogin(res)).toBe(false);
  });

  it("redirects a non-admin to /login", async () => {
    const res = await middleware(await adminRequest("https://example.com/admin", "__Secure-authjs.session-token", "USER"));
    expect(isRedirectToLogin(res)).toBe(true);
  });

  it("redirects an anonymous visitor to /login", async () => {
    const res = await middleware(new NextRequest("https://example.com/admin"));
    expect(isRedirectToLogin(res)).toBe(true);
  });

  it("does not accept a token signed with a different secret", async () => {
    const cookieName = "__Secure-authjs.session-token";
    const jwt = await encode({ token: { role: "ADMIN" }, secret: "attacker-secret", salt: cookieName });
    const req = new NextRequest("https://example.com/admin", { headers: { cookie: `${cookieName}=${jwt}` } });
    expect(isRedirectToLogin(await middleware(req))).toBe(true);
  });

  it("ignores non-admin routes", async () => {
    const res = await middleware(new NextRequest("https://example.com/"));
    expect(isRedirectToLogin(res)).toBe(false);
  });
});
