"use client";

import { useState, useEffect, useCallback } from "react";
import BookingModal from "./BookingModal";

interface Booking {
  id: string;
  title: string;
  start: string;
  end: string;
  creator: string;
  creatorEmail: string;
}

interface Props {
  userEmail: string;
  userName: string;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7-21
const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarClient({ userEmail, userName }: Props) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [events, setEvents] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ start: Date; end: Date } | null>(null);
  const [toast, setToast] = useState("");

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/events?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`
      );
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setEvents(data);
    } catch {
      setError("Error al cargar el calendario");
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function isBooked(date: Date, hour: number): Booking | undefined {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    return events.find((e) => {
      const eStart = new Date(e.start);
      const eEnd = new Date(e.end);
      return slotStart < eEnd && slotEnd > eStart;
    });
  }

  function handleSlotClick(date: Date, hour: number) {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    if (start < new Date()) return;

    const booking = isBooked(date, hour);
    if (booking) return;

    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);
    setModal({ start, end });
  }

  async function handleBook(start: Date, end: Date) {
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: start.toISOString(), end: end.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setModal(null);
      showToast("✅ ¡Piscina reservada!");
      fetchEvents();
    } catch (e: any) {
      showToast(`❌ ${e.message}`);
    }
  }

  async function handleCancel(eventId: string) {
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("✅ Reserva cancelada");
      fetchEvents();
    } catch (e: any) {
      showToast(`❌ ${e.message}`);
    }
  }

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  const weekLabel = `Semana del ${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()]}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Week nav */}
      <div className="flex items-center justify-between p-3 border-b">
        <button
          onClick={() => {
            const prev = new Date(weekStart);
            prev.setDate(prev.getDate() - 7);
            setWeekStart(prev);
          }}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          ← Semana anterior
        </button>
        <span className="font-semibold text-sm">{weekLabel}</span>
        <button
          onClick={() => {
            const next = new Date(weekStart);
            next.setDate(next.getDate() + 7);
            setWeekStart(next);
          }}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Siguiente →
        </button>
      </div>

      {/* Today button */}
      <div className="px-3 pb-2 pt-1">
        <button
          onClick={() => setWeekStart(getWeekStart(new Date()))}
          className="text-xs text-gray-400 hover:text-blue-600"
        >
          Volver a hoy
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center text-gray-400">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-gray-100 rounded mx-4" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-8 text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button onClick={fetchEvents} className="text-blue-600 underline text-sm">
            Reintentar
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          {/* Header row: days */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[600px]">
            <div className="p-1 text-xs text-gray-400 text-right pr-2" />
            {weekDays.map((d, i) => {
              const isToday = formatDate(d) === formatDate(new Date());
              return (
                <div
                  key={i}
                  className={`p-1 text-center text-xs font-medium ${
                    isToday ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  <div>{DAYS[d.getDay()]}</div>
                  <div className={`text-lg ${isToday ? "bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto" : ""}`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}

            {/* Hour rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="text-xs text-gray-400 text-right pr-2 py-3 border-t">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {weekDays.map((d, di) => {
                  const booking = isBooked(d, hour);
                  const isPast =
                    new Date(d).setHours(hour, 0, 0, 0) < Date.now();
                  const isMine =
                    booking?.creatorEmail === userEmail;

                  let bg = "bg-white hover:bg-blue-50 cursor-pointer";
                  if (isPast) bg = "bg-gray-50";
                  else if (booking) bg = isMine ? "bg-blue-100" : "bg-red-50";
                  else bg = "bg-white hover:bg-blue-50 cursor-pointer";

                  return (
                    <div
                      key={di}
                      className={`border-t border-l min-h-[36px] relative group ${bg}`}
                      onClick={() => !isPast && handleSlotClick(d, hour)}
                    >
                      {/* Booking label */}
                      {booking && (
                        <div
                          className={`absolute inset-0 text-[10px] leading-tight p-0.5 overflow-hidden ${
                            isMine ? "text-blue-800" : "text-red-700"
                          }`}
                        >
                          <span className="font-medium truncate block">
                            {isMine ? "Tú" : booking.creator.split(" ")[0]}
                          </span>
                          {isMine && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(booking.id);
                              }}
                              className="text-[9px] underline opacity-50 hover:opacity-100"
                            >
                              cancelar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <BookingModal
          start={modal.start}
          end={modal.end}
          userName={userName}
          onConfirm={handleBook}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
