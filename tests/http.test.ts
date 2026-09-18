import { describe, it, expect } from "vitest";
import { readJson, clientIp } from "@/lib/http";

const req = (body: string, headers: Record<string, string> = {}) =>
  new Request("http://localhost/x", { method: "POST", body, headers });

describe("readJson", () => {
  it("parses a JSON object", async () => {
    expect(await readJson(req('{"a":1}'))).toEqual({ a: 1 });
  });
  it("returns null for malformed, empty, or non-object bodies", async () => {
    expect(await readJson(req("{oops"))).toBeNull();
    expect(await readJson(req(""))).toBeNull();
    expect(await readJson(req("[1,2]"))).toBeNull();
    expect(await readJson(req("null"))).toBeNull();
    expect(await readJson(req('"str"'))).toBeNull();
  });
});

describe("clientIp", () => {
  it("uses the first hop of x-forwarded-for", () => {
    expect(clientIp(req("", { "x-forwarded-for": "1.2.3.4, 10.0.0.1, 10.0.0.2" }))).toBe("1.2.3.4");
    expect(clientIp(req("", { "x-forwarded-for": "1.2.3.4" }))).toBe("1.2.3.4");
  });
  it("falls back to 'unknown' when absent or blank", () => {
    expect(clientIp(req(""))).toBe("unknown");
    expect(clientIp(req("", { "x-forwarded-for": " " }))).toBe("unknown");
  });
});
