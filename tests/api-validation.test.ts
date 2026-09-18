import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  reservation: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  user: { findUnique: vi.fn(), update: vi.fn() },
}));
const authMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({ auth: authMock }));

import { POST as createReservation } from "@/app/api/reservations/route";
import { PATCH, DELETE } from "@/app/api/reservations/[id]/route";
import { POST as verifyEmail } from "@/app/api/verify-email/route";
import { POST as resetPassword } from "@/app/api/reset-password/route";
import { POST as forgotPassword } from "@/app/api/forgot-password/route";

const json = (url: string, body: unknown, method = "POST") =>
  new NextRequest(`http://localhost${url}`, {
    method,
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const validReservation = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+4917621313818",
  date: "2030-05-17",
  time: "18:00",
  partySize: "2", // the form posts a string
  notes: "",
  consent: true,
};

const ctx = (id = "res1") => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.reservation.create.mockResolvedValue({ id: "res1" });
  authMock.mockResolvedValue(null);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/reservations", () => {
  it("accepts the payload the reservation form actually sends", async () => {
    const res = await createReservation(json("/api/reservations", validReservation));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: "res1" });
    expect(prismaMock.reservation.create).toHaveBeenCalledOnce();
  });

  it("returns 400 (not 500) for malformed JSON", async () => {
    const res = await createReservation(json("/api/reservations", "{not json"));
    expect(res.status).toBe(400);
    expect(typeof (await res.json()).error).toBe("string");
  });

  it("returns 400 for an unparseable or past date instead of crashing in Prisma", async () => {
    const res = await createReservation(json("/api/reservations", { ...validReservation, date: "not-a-date" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/today or in the future/i);
    expect(prismaMock.reservation.create).not.toHaveBeenCalled();
  });

  it("rejects oversized fields", async () => {
    const res = await createReservation(json("/api/reservations", { ...validReservation, name: "x".repeat(5000) }));
    expect(res.status).toBe(400);
    expect(prismaMock.reservation.create).not.toHaveBeenCalled();
  });

  it("still requires privacy consent", async () => {
    const res = await createReservation(json("/api/reservations", { ...validReservation, consent: false }));
    expect(res.status).toBe(400);
  });
});

describe("PATCH/DELETE /api/reservations/[id]", () => {
  const existing = {
    id: "res1", name: "Jane", email: "jane@example.com", phone: "+491", time: "18:00",
    date: new Date("2030-05-17"), partySize: 2, status: "PENDING",
  };

  it("rejects non-admins", async () => {
    authMock.mockResolvedValue({ user: { role: "USER" } });
    expect((await PATCH(json("/x", { status: "CONFIRMED" }, "PATCH"), ctx())).status).toBe(403);
    expect((await DELETE(json("/x", {}, "DELETE"), ctx())).status).toBe(403);
    expect(prismaMock.reservation.update).not.toHaveBeenCalled();
  });

  describe("as admin", () => {
    beforeEach(() => {
      authMock.mockResolvedValue({ user: { role: "ADMIN" } });
      prismaMock.reservation.findUnique.mockResolvedValue(existing);
    });

    it("updates status", async () => {
      prismaMock.reservation.update.mockResolvedValue({ ...existing, status: "CONFIRMED" });
      const res = await PATCH(json("/x", { status: "CONFIRMED" }, "PATCH"), ctx());
      expect(res.status).toBe(200);
      expect(prismaMock.reservation.update).toHaveBeenCalledOnce();
    });

    it("returns 400 (not 500) for malformed JSON or an invalid status/table", async () => {
      expect((await PATCH(json("/x", "{bad", "PATCH"), ctx())).status).toBe(400);
      expect((await PATCH(json("/x", { status: "FOO" }, "PATCH"), ctx())).status).toBe(400);
      expect((await PATCH(json("/x", { tableNumber: 2.5 }, "PATCH"), ctx())).status).toBe(400);
      expect(prismaMock.reservation.update).not.toHaveBeenCalled();
    });

    it("returns 404 when the reservation does not exist", async () => {
      prismaMock.reservation.findUnique.mockResolvedValue(null);
      expect((await PATCH(json("/x", { status: "CANCELLED" }, "PATCH"), ctx())).status).toBe(404);
      expect(prismaMock.reservation.update).not.toHaveBeenCalled();
    });

    it("DELETE returns 404 (not 500) when the reservation is already gone", async () => {
      prismaMock.reservation.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("gone", { code: "P2025", clientVersion: "test" })
      );
      expect((await DELETE(json("/x", {}, "DELETE"), ctx())).status).toBe(404);
    });
  });
});

describe("OTP / password endpoints reject malformed bodies with 400", () => {
  it("verify-email: bad JSON, missing email, non-string code", async () => {
    expect((await verifyEmail(json("/api/verify-email", "{"))).status).toBe(400);
    expect((await verifyEmail(json("/api/verify-email", { code: "123456" }))).status).toBe(400);

    prismaMock.user.findUnique.mockResolvedValue({
      emailOtp: "somehash",
      emailOtpExpires: new Date(Date.now() + 60_000),
    });
    const res = await verifyEmail(json("/api/verify-email", { email: "a@b.de", code: 123456 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Incorrect code.");
  });

  it("reset-password: bad JSON, short and oversized passwords, non-string token", async () => {
    expect((await resetPassword(json("/api/reset-password", "{"))).status).toBe(400);
    expect((await resetPassword(json("/api/reset-password", { email: "a@b.de", token: "t", password: "short" }))).status).toBe(400);
    expect((await resetPassword(json("/api/reset-password", { email: "a@b.de", token: "t", password: "x".repeat(201) }))).status).toBe(400);

    prismaMock.user.findUnique.mockResolvedValue({ resetToken: "h", resetTokenExpires: new Date(Date.now() + 60_000) });
    const res = await resetPassword(json("/api/reset-password", { email: "a@b.de", token: { a: 1 }, password: "longenough" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid or expired/i);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("forgot-password: bad JSON / missing email -> 400; unknown email still returns ok (no enumeration)", async () => {
    expect((await forgotPassword(json("/api/forgot-password", "{"))).status).toBe(400);
    expect((await forgotPassword(json("/api/forgot-password", {}))).status).toBe(400);

    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await forgotPassword(json("/api/forgot-password", { email: "nobody@example.com" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
