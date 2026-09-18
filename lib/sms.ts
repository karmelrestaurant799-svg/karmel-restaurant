import twilio from "twilio";

// Separate from Firebase (which only handles login OTP). This sends arbitrary
// transactional texts — reservation confirmations, cancellations, time-change
// requests. Stays inactive until Twilio env vars are set; never throws.
export async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_SMS_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.warn("[sms] Twilio SMS not configured — skipped:", to, body);
    return { sent: false as const };
  }

  try {
    const client = twilio(sid, token);
    await client.messages.create({ to, from, body });
    return { sent: true as const };
  } catch (err) {
    console.error("[sms] send failed:", err);
    return { sent: false as const };
  }
}