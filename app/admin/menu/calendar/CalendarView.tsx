"use client";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/languageContext";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  tableNumber: number | null;
  status: string;
};

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarView({ reservations }: { reservations: Reservation[] }) {
  const { t } = useLanguage();
  const today = new Date();
  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));

  const byDate = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of reservations) {
      const key = r.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [reservations]);

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toDateKey(new Date(year, month, d)));
  }

  const dayReservations = (byDate.get(selectedDate) || []).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10">
      {/* Month grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setMonthCursor(new Date(year, month - 1, 1))}
            className="text-stone-400 hover:text-amber-500 text-sm"
          >
            {t.admin.prev}
          </button>
          <span className="text-white text-sm uppercase tracking-widest">
            {monthCursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() => setMonthCursor(new Date(year, month + 1, 1))}
            className="text-stone-400 hover:text-amber-500 text-sm"
          >
            {t.admin.next}
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-stone-500 uppercase mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((key, i) => {
            if (!key) return <div key={i} />;
            const count = byDate.get(key)?.length || 0;
            const isSelected = key === selectedDate;
            const isToday = key === toDateKey(today);
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(key)}
                className={`aspect-square flex flex-col items-center justify-center border text-xs relative ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-500"
                    : isToday
                    ? "border-amber-500 text-amber-500"
                    : "border-stone-800 text-stone-300 hover:border-stone-600"
                }`}
              >
                {Number(key.slice(8, 10))}
                {count > 0 && (
                  <span
                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-black" : "bg-amber-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail */}
      <div>
        <h2 className="text-lg text-white mb-4">
          {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}{" "}
          <span className="text-stone-500 text-sm">({dayReservations.length} {t.admin.reservations})</span>
        </h2>
        <div className="flex flex-col gap-3">
          {dayReservations.map((r) => (
            <div key={r.id} className="border border-white/10 p-4 flex justify-between items-center text-sm">
              <div>
                <p className="text-white">{r.time} — {r.name}</p>
                <p className="text-stone-500 text-xs">{r.partySize} {t.admin.guests} · {r.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400">
                  {t.admin.table} {r.tableNumber ?? "—"}
                </span>
                <span
                  className={`text-[10px] uppercase px-2 py-1 border ${
                    r.status === "CONFIRMED"
                      ? "border-green-500/40 text-green-400"
                      : r.status === "CHANGE_REQUESTED"
                      ? "border-amber-500/40 text-amber-400"
                      : "border-stone-600 text-stone-400"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}
          {dayReservations.length === 0 && (
            <p className="text-stone-600 text-sm">{t.admin.noReservationsThisDay}</p>
          )}
        </div>
      </div>
    </div>
  );
}