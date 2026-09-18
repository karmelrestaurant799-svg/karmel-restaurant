import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMail, otpEmailHtml } from "@/lib/mailer";
import { generateOtp, otpExpiry } from "@/lib/otp";
import { rateLimit } from "@/lib/rateLimit";
import { sha256 } from "@/lib/hash";
import { readJson } from "@/lib/http";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { email } = parsed.data;

  const limited = await rateLimit("otp", email);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return ok — don't leak whether an email is registered or verified.
  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const code = generateOtp();
  await prisma.user.update({
    where: { email },
    data: { emailOtp: sha256(code), emailOtpExpires: otpExpiry(10) },
  });
  const result = await sendMail(email, "Your new verification code", otpEmailHtml(code));
  if (result.error) console.error("[mailer] failed to send OTP to", email);

  return NextResponse.json({ ok: true });
}
