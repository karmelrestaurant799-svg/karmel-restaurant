import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendMail } from "@/lib/mailer";

// Without Gmail credentials sendMail must degrade gracefully (return an error
// result) instead of throwing at import or call time. The variables are cleared
// explicitly so the test doesn't depend on the developer's shell environment.
describe("sendMail without Gmail credentials", () => {
  beforeEach(() => {
    vi.stubEnv("GMAIL_USER", "");
    vi.stubEnv("GMAIL_APP_PASSWORD", "");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns a not_configured result instead of throwing", async () => {
    const result = await sendMail("test@example.com", "Subject", "<p>Body</p>");
    expect(result.error).toBe("not_configured");
    expect(result.id).toBeNull();
  });
});
