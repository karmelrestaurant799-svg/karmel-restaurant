import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rateLimit";

// This repo has no .env configured in this environment, so Upstash vars are
// unset here — vitest runs with NODE_ENV=test, not "production", so the
// module must load without throwing and simply allow all requests through.
describe("rateLimit (no Upstash configured, non-production)", () => {
  it("does not throw on import and allows requests through", async () => {
    const result = await rateLimit("otp", "test-key");
    expect(result.success).toBe(true);
  });
});
