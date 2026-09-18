import { describe, it, expect } from "vitest";
import { sha256 } from "@/lib/hash";

describe("sha256", () => {
  it("produces a 64-character hex digest", () => {
    expect(sha256("hello")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(sha256("123456")).toBe(sha256("123456"));
  });

  it("differs for different inputs", () => {
    expect(sha256("123456")).not.toBe(sha256("654321"));
  });
});
