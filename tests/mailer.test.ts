import { describe, it, expect } from "vitest";
import { otpEmailHtml, reservationAdminHtml, reservationUserHtml } from "@/lib/mailer";

describe("otpEmailHtml", () => {
  it("includes the code", () => {
    expect(otpEmailHtml("123456")).toContain("123456");
  });
});

describe("reservationUserHtml", () => {
  it("escapes HTML in the guest name", () => {
    const html = reservationUserHtml({
      name: "<script>alert(1)</script>",
      date: "01/01/2026",
      time: "19:00",
      partySize: 2,
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("reservationAdminHtml", () => {
  it("escapes HTML in notes and name", () => {
    const html = reservationAdminHtml({
      name: "<img src=x onerror=alert(1)>",
      email: "guest@example.com",
      phone: "+1234567890",
      date: "01/01/2026",
      time: "19:00",
      partySize: 4,
      dayName: "Thursday",
      notes: "<b>hello</b> & <i>world</i>",
    });
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<b>hello</b>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&amp;");
  });

  it("renders a dash for missing notes", () => {
    const html = reservationAdminHtml({
      name: "Guest",
      email: "guest@example.com",
      phone: "+1234567890",
      date: "01/01/2026",
      time: "19:00",
      partySize: 2,
      dayName: "Friday",
    });
    expect(html).toContain("Notes: -");
  });
});
