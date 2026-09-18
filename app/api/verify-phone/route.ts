import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getFirebaseAdminAuth } from "@/lib/firebaseAdmin";
import { rateLimit } from "@/lib/rateLimit";
import { readJson, badRequest } from "@/lib/http";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const idToken = body?.idToken;
  const phone = body?.phone;
  if (typeof idToken !== "string" || typeof phone !== "string" || !idToken || !phone) {
    return badRequest();
  }

  const limited = await rateLimit("otp", phone);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let decoded;
  try {
    const auth = getFirebaseAdminAuth();
    decoded = await auth.verifyIdToken(idToken);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Firebase Admin is not configured")) {
      console.error("[verify-phone]", err.message);
      return NextResponse.json(
        { error: "Phone verification is temporarily unavailable." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Invalid or expired verification." }, { status: 400 });
  }

  if (!decoded.phone_number || decoded.phone_number !== phone) {
    return NextResponse.json({ error: "Phone number mismatch." }, { status: 400 });
  }

  try {
    await prisma.user.update({ where: { phone }, data: { phoneVerified: new Date() } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "No account found for this phone number." }, { status: 400 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
