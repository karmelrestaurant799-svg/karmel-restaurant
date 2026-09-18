import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const since = req.nextUrl.searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 60_000);

  const newReservations = await prisma.reservation.findMany({
    where: { createdAt: { gt: sinceDate } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, date: true, time: true, partySize: true, createdAt: true },
  });

  // Server clock, not the browser's — avoids missed/duplicate alerts from clock drift.
  return NextResponse.json({ reservations: newReservations, serverTime: new Date().toISOString() });
}