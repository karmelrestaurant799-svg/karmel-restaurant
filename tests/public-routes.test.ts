import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const prismaMock = vi.hoisted(() => ({
  reservation: { findUnique: vi.fn(), update: vi.fn() },
}));
const authMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({ auth: authMock }));

import { GET as respond } from "@/app/api/reservations/respond/route";
import { POST as translate } from "@/app/api/translate/route";

describe("GET /api/reservations/respond", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("escapes guest-supplied fields in the HTML page it serves from our origin", async () => {
    const payload = `<img src=x onerror="alert(1)">`;
    prismaMock.reservation.findUnique.mockResolvedValue({
      id: "r1", name: payload, time: payload, date: new Date("2030-05-17"), requestedTime: null,
    });
    prismaMock.reservation.update.mockResolvedValue({});

    const res = await respond(new NextRequest("http://localhost/api/reservations/respond?token=abc&action=decline"));
    const html = await res.text();
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("still serves a normal page for an unknown token", async () => {
    prismaMock.reservation.findUnique.mockResolvedValue(null);
    const res = await respond(new NextRequest("http://localhost/api/reservations/respond?token=nope&action=accept"));
    expect(await res.text()).toContain("Link already used");
  });
});

describe("POST /api/translate (unused by the app; proxies the paid DeepL account)", () => {
  const ORIGINAL = process.env.INTERNAL_API_SECRET;
  const req = (headers: Record<string, string> = {}) =>
    new NextRequest("http://localhost/api/translate", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({ text: "Hallo", targetLang: "en" }),
    });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    authMock.mockResolvedValue(null);
  });
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.INTERNAL_API_SECRET;
    else process.env.INTERNAL_API_SECRET = ORIGINAL;
  });

  it("rejects anonymous callers even when INTERNAL_API_SECRET is unset", async () => {
    delete process.env.INTERNAL_API_SECRET;
    expect((await translate(req())).status).toBe(401);
  });

  it("rejects a non-admin session and a wrong secret", async () => {
    process.env.INTERNAL_API_SECRET = "s3cret";
    authMock.mockResolvedValue({ user: { role: "USER" } });
    expect((await translate(req({ "x-internal-secret": "wrong" }))).status).toBe(401);
  });

  it("lets an admin or a correct secret past the gate (503 = reached the DeepL-not-configured check)", async () => {
    process.env.INTERNAL_API_SECRET = "s3cret";
    expect((await translate(req({ "x-internal-secret": "s3cret" }))).status).not.toBe(401);
    authMock.mockResolvedValue({ user: { role: "ADMIN" } });
    expect((await translate(req())).status).not.toBe(401);
  });
});
