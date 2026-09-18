import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Art. 20 DSGVO (data portability): lets a logged-in user download every
// piece of personal data we hold on them, in a portable JSON format.
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      date: true,
      time: true,
      partySize: true,
      tableNumber: true,
      notes: true,
      status: true,
      consentAt: true,
      createdAt: true,
    },
  });

  const exportData = {
    exportedAt: new Date().toISOString(),
    account: user,
    reservations,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="karmel-my-data-${user.id}.json"`,
    },
  });
}