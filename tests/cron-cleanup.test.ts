import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/cron/cleanup/route";

const ORIGINAL_SECRET = process.env.CRON_SECRET;

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = ORIGINAL_SECRET;
});

describe("GET /api/cron/cleanup", () => {
  it("rejects requests with no CRON_SECRET configured", async () => {
    delete process.env.CRON_SECRET;
    const req = new NextRequest("http://localhost/api/cron/cleanup");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("rejects requests with a missing or wrong bearer token", async () => {
    process.env.CRON_SECRET = "correct-secret";
    const req = new NextRequest("http://localhost/api/cron/cleanup", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
