import { describe, it, expect } from "vitest";
import { generateOtp, otpExpiry } from "@/lib/otp";

describe("generateOtp", () => {
  it("returns a 6-digit numeric string", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtp();
      expect(code).toMatch(/^\d{6}$/);
      const n = Number(code);
      expect(n).toBeGreaterThanOrEqual(100000);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });
});

describe("otpExpiry", () => {
  it("defaults to 10 minutes from now", () => {
    const before = Date.now();
    const expiry = otpExpiry();
    const after = Date.now();
    expect(expiry.getTime()).toBeGreaterThanOrEqual(before + 10 * 60 * 1000 - 100);
    expect(expiry.getTime()).toBeLessThanOrEqual(after + 10 * 60 * 1000 + 100);
  });

  it("respects a custom minute count", () => {
    const expiry = otpExpiry(30);
    const expected = Date.now() + 30 * 60 * 1000;
    expect(Math.abs(expiry.getTime() - expected)).toBeLessThan(1000);
  });
});
