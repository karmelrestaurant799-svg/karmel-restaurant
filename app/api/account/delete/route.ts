import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Art. 17 DSGVO (right to erasure). Deletes the account and its reservation
// history. If your business needs to retain reservation records for a period
// after cancellation (e.g. accounting law, §147 AO — 10 years for invoices),
// swap the reservation delete below for an anonymize step instead of a hard
// delete. As written, this assumes reservations carry no independent legal
// retention requirement beyond what's already enforced by the cleanup cron.
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.reservation.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}