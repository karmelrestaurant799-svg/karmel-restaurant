import { prisma } from "@/lib/prisma";
import CalendarView from "./CalendarView";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const viewDate = date ? new Date(date) : new Date();

  const startOfWeek = new Date(viewDate);
  startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const reservations = await prisma.reservation.findMany({
    where: {
      date: { gte: startOfWeek, lte: endOfWeek },
      status: { not: "CANCELLED" },
    },
    orderBy: { date: "asc" },
  });

  // Convert Date to ISO string for client component
  const serializedReservations = reservations.map((r) => ({
    ...r,
    date: r.date.toISOString().split("T")[0],
    createdAt: r.createdAt.toISOString(),
    consentAt: r.consentAt?.toISOString() || null,
    requestedTime: r.requestedTime?.toISOString() || null,
  }));

  return <CalendarView initialReservations={serializedReservations} viewDate={viewDate} />;
}