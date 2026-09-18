import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const prismaMock = vi.hoisted(() => ({
  user: { deleteMany: vi.fn() },
  reservation: { deleteMany: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const DAY = 24 * 60 * 60 * 1000;
const ENV_KEYS = ["CRON_SECRET", "UNVERIFIED_ACCOUNT_RETENTION_DAYS", "RESERVATION_RETENTION_MONTHS"] as const;
const saved: Record<string, string | undefined> = {};

// The route reads its retention env vars at import time, so re-import per case.
async function runCleanup(env: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, { CRON_SECRET: "s3cret", ...env });
  vi.resetModules();
  const { GET } = await import("@/app/api/cron/cleanup/route");
  return GET(new NextRequest("http://localhost/api/cron/cleanup", { headers: { authorization: "Bearer s3cret" } }));
}

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  prismaMock.user.deleteMany.mockResolvedValue({ count: 0 });
  prismaMock.reservation.deleteMany.mockResolvedValue({ count: 0 });
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.clearAllMocks();
});

function userCutoffDaysAgo() {
  const lt: Date = prismaMock.user.deleteMany.mock.calls[0][0].where.createdAt.lt;
  return (Date.now() - lt.getTime()) / DAY;
}

describe("retention config parsing", () => {
  it("defaults to 7 days when unset", async () => {
    await runCleanup({});
    expect(userCutoffDaysAgo()).toBeCloseTo(7, 0);
  });

  it.each(["", "   ", "abc", "0", "-5"])(
    "falls back to 7 days instead of deleting everything for env value %j",
    async (raw) => {
      const res = await runCleanup({ UNVERIFIED_ACCOUNT_RETENTION_DAYS: raw, RESERVATION_RETENTION_MONTHS: raw });
      expect(res.status).toBe(200);
      expect(userCutoffDaysAgo()).toBeCloseTo(7, 0);
      const resCutoff: Date = prismaMock.reservation.deleteMany.mock.calls[0][0].where.date.lt;
      // ~24 months back, definitely not "now"
      expect((Date.now() - resCutoff.getTime()) / DAY).toBeGreaterThan(700);
    }
  );

  it("honours a valid override", async () => {
    await runCleanup({ UNVERIFIED_ACCOUNT_RETENTION_DAYS: "30" });
    expect(userCutoffDaysAgo()).toBeCloseTo(30, 0);
  });
});

describe("unverified-user purge scope", () => {
  it("never targets admins or users with a linked Google/Facebook account", async () => {
    await runCleanup({});
    expect(prismaMock.user.deleteMany.mock.calls[0][0].where).toMatchObject({
      emailVerified: null,
      role: "USER",
      accounts: { none: {} },
    });
  });
});
