import { prisma } from "@/lib/prisma";
import AdminTableClient from "./AdminTableClient";

export default async function AdminPage() {
  const reservations = await prisma.reservation.findMany({
    where: { date: { gte: new Date(new Date().toDateString()) } },
    orderBy: { date: "asc" },
    include: { user: { select: { name: true, email: true } } },
    take: 500,
  });

  const formatted = reservations.map((r) => ({
    id: r.id,
    name: r.user?.name || r.name,
    email: r.user?.email || r.email,
    phone: r.phone,
    date: r.date.toISOString().split("T")[0],
    time: r.time,
    partySize: r.partySize,
    tableNumber: r.tableNumber,
    status: r.status,
    notes: r.notes,
  }));

  return <AdminTableClient initial={formatted} />;
}