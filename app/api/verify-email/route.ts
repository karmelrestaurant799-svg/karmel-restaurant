import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { sha256 } from "@/lib/hash";
import { readJson, badRequest } from "@/lib/http";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const email = body?.email;
  const code = body?.code;
  if (typeof email !== "string" || !email) return badRequest();

  const limited = await rateLimit("otp", email);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.emailOtp || !user.emailOtpExpires) {
    return NextResponse.json({ error: "No pending verification for this email." }, { status: 400 });
  }
  if (user.emailOtpExpires < new Date()) {
    return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
  }
  if (typeof code !== "string" || user.emailOtp !== sha256(code)) {
    return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date(), emailOtp: null, emailOtpExpires: null },
  });

  return NextResponse.json({ ok: true });
}
