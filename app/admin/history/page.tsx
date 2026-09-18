import { prisma } from "@/lib/prisma";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AdminHistoryPage() {
  const reservations = await prisma.reservation.findMany({
    where: { date: { lt: new Date(new Date().toDateString()) } },
    orderBy: { date: "desc" },
    take: 200,
  });

  return (
    <>
      <h1 className="text-4xl text-white mb-10">Reservation History</h1>
      <div className="overflow-x-auto border border-white/10">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-stone-400 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="p-3">Day</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Name</th>
              <th className="p-3">Guests</th>
              <th className="p-3">Table #</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              const d = new Date(r.date);
              return (
                <tr key={r.id} className="border-t border-white/10 text-stone-300">
                  <td className="p-3">{DAY_NAMES[d.getDay()]}</td>
                  <td className="p-3">{d.toLocaleDateString("en-GB")}</td>
                  <td className="p-3">{r.time}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.partySize}</td>
                  <td className="p-3">{r.tableNumber ?? "—"}</td>
                  <td className="p-3">{r.status}</td>
                </tr>
              );
            })}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-stone-500">No past reservations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}