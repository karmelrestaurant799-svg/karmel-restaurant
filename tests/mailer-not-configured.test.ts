import { describe, it, expect } from "vitest";
import { sendMail } from "@/lib/mailer";

// RESEND_API_KEY is unset in this environment — sendMail must degrade
// gracefully (return an error result) instead of throwing at import or call
// time, which is the exact regression this fix addresses.
describe("sendMail without RESEND_API_KEY", () => {
  it("returns a not_configured result instead of throwing", async () => {
    const result = await sendMail("test@example.com", "Subject", "<p>Body</p>");
    expect(result.error).toBe("not_configured");
    expect(result.id).toBeNull();
  });
});
