import { prisma } from "@/lib/prisma";
import CalendarView from "./CalendarView";

export default async function AdminCalendarPage() {
  const reservations = await prisma.reservation.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return (
    <>
      <h1 className="text-4xl text-white mb-10">Calendar</h1>
      <CalendarView reservations={JSON.parse(JSON.stringify(reservations))} />
    </>
  );
}