import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      reservations: {
        orderBy: { date: "desc" },
      },
      accounts: true,
      sessions: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const exportData = {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      privacyConsentAt: user.privacyConsentAt,
      createdAt: user.createdAt,
    },
    reservations: user.reservations.map((r) => ({
      id: r.id,
      date: r.date,
      time: r.time,
      partySize: r.partySize,
      tableNumber: r.tableNumber,
      notes: r.notes,
      status: r.status,
      consentAt: r.consentAt,
      createdAt: r.createdAt,
    })),
    oauthAccounts: user.accounts.map((a) => ({
      provider: a.provider,
      providerAccountId: a.providerAccountId,
    })),
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="karmel-account-data-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}