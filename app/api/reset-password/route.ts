import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { sha256 } from "@/lib/hash";
import { readJson, badRequest } from "@/lib/http";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const email = body?.email;
  const token = body?.token;
  const password = body?.password;
  if (typeof email !== "string" || !email) return badRequest();

  const limited = await rateLimit("otp", email);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  // bcrypt only uses the first 72 bytes; cap input so a multi-MB body can't be
  // used to burn CPU on hashing.
  if (password.length > 200) {
    return NextResponse.json({ error: "Password is too long." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    typeof token !== "string" ||
    !token ||
    user.resetToken !== sha256(token) ||
    !user.resetTokenExpires ||
    user.resetTokenExpires < new Date()
  ) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email },
    data: { passwordHash, resetToken: null, resetTokenExpires: null },
  });

  return NextResponse.json({ ok: true });
}
