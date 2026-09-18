import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isDisposableEmail } from "@/lib/disposableEmail";
import { sendMail, otpEmailHtml } from "@/lib/mailer";
import { generateOtp, otpExpiry } from "@/lib/otp";
import { rateLimit } from "@/lib/rateLimit";
import { sha256 } from "@/lib/hash";
import { readJson, clientIp } from "@/lib/http";

// Upper bounds are generous; they only stop abusive payloads (multi-MB names,
// bcrypt-hashing a huge password) from being stored or processed.
const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().min(6).max(32),
  password: z.string().min(8).max(200),
  consent: z.boolean().refine((v) => v === true, {
    message: "You must accept the privacy policy to register.",
  }),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit("register", clientIp(req));
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await readJson(req);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, email, phone, password } = parsed.data;
  const consentAt = new Date();

  if (await isDisposableEmail(email)) {
    return NextResponse.json(
      { error: "Please use a real, permanent email address (temporary/disposable emails are not allowed)." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email or phone already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const emailOtp = generateOtp();

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        emailOtp: sha256(emailOtp),
        emailOtpExpires: otpExpiry(10),
        privacyConsentAt: consentAt,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "An account with this email or phone already exists." }, { status: 409 });
    }
    throw err;
  }

  const result = await sendMail(email, "Verify your email — Karmel Café & Restaurant", otpEmailHtml(emailOtp));
  if (result.error) console.error("[register] failed to send verification email to", email);

  return NextResponse.json({ ok: true, userId: user.id });
}
