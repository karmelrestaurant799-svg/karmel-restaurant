import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail, resetPasswordHtml } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";
import { sha256 } from "@/lib/hash";
import { readJson, badRequest } from "@/lib/http";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const email = body?.email;
  if (typeof email !== "string" || !email) return badRequest();

  const limited = await rateLimit("otp", email);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return ok — don't leak whether an email is registered.
  if (!user) return NextResponse.json({ ok: true });

  const resetToken = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { email },
    data: { resetToken: sha256(resetToken), resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000) },
  });

  const link = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  const result = await sendMail(email, "Reset your password — Karmel Café & Restaurant", resetPasswordHtml(link));
  if (result.error) console.error("[forgot-password] failed to send reset email to", email);

  return NextResponse.json({ ok: true });
}
