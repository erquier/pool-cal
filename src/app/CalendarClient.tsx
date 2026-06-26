"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import BookingModal from "./BookingModal";

interface Booking {
  id: string;
  title: string;
  start: string;
  end: string;
  creator: string;
  creatorEmail: string;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 7);

function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? "p. m." : "a. m.";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12} ${ampm}`;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDayDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${formatHour(s.getHours())} — ${formatHour(e.getHours())}`;
}

function isFutureBooking(end: string): boolean {
  return new Date(end) > new Date();
}

function isPastBooking(end: string): boolean {
  return new Date(end) < new Date();
}

interface Props {
  initialEvents: Booking[];
  userEmail: string | null;
  userName: string | null;
  initialWeekStart: string;
}

export default function CalendarClient({
  initialEvents,
  userEmail,
  userName,
  initialWeekStart,
}: Props) {
  const [weekStart, setWeekStart] = useState(() => new Date(initialWeekStart));
  const [events, setEvents] = useState<Booking[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ start: Date; end: Date } | null>(null);
  const [toast, setToast] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStart]);

  const showToast = (msg: string, duration = 4000) => {
    setToast(msg);
    setTimeout(() => setToast(""), duration);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/events?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}&_=${Date.now()}`
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

    if (!userEmail) {
      window.location.href = "/login";
      return;
    }

    const booking = isBooked(date, hour);
    if (booking) return;

    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);
    setModal({ start, end });
  }

  async function handleBook(start: Date, end: Date) {
    setLastError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: start.toISOString(), end: end.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      setModal(null);
      showToast("✅ ¡Piscina reservada!", 5000);
      fetchEvents();
    } catch (e: any) {
      setLastError(e.message);
      showToast(`❌ ${e.message}`, 8000);
    }
  }

  async function handleCancel(eventId: string) {
    setLastError(null);
    setCancelling(eventId);
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
      setLastError(e.message);
      showToast(`❌ ${e.message}`, 8000);
    } finally {
      setCancelling(null);
    }
  }

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  const weekLabel = `Semana del ${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()]}`;
  const isThisWeek = formatDate(weekStart) === formatDate(getWeekStart(new Date()));

  // My bookings
  const myBookings = useMemo(
    () => events.filter((e) => e.creatorEmail === userEmail),
    [events, userEmail]
  );
  const upcomingBookings = myBookings.filter((b) => isFutureBooking(b.end));
  const pastBookings = myBookings.filter((b) => isPastBooking(b.end));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Calendar Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm shadow-xl animate-[fadeIn_200ms_ease-out] max-w-[90vw] text-center">
            {toast}
          </div>
        )}

        {/* Week nav */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100">
          <button
            onClick={() => {
              const prev = new Date(weekStart);
              prev.setDate(prev.getDate() - 7);
              setWeekStart(prev);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm transition-colors active:scale-95"
          >
            ← <span className="hidden sm:inline">Semana anterior</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMonthPicker((v) => !v)}
              className="font-semibold text-xs sm:text-sm text-gray-800 hover:text-blue-600 transition-colors active:scale-95"
            >
              {weekLabel}
            </button>
            {showMonthPicker && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMonthPicker(false)}
                  onPointerDown={(e) => {
                    // Don't close on backdrop touch before selection fires
                    if (e.target === e.currentTarget) setShowMonthPicker(false);
                  }}
                />
                {/* Popup */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 w-64">
                  {/* Year nav */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setPickerYear((y) => y - 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 active:bg-gray-200 text-lg"
                    >
                      ←
                    </button>
                    <span className="font-bold text-sm text-gray-800">{pickerYear}</span>
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setPickerYear((y) => y + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 active:bg-gray-200 text-lg"
                    >
                      →
                    </button>
                  </div>
                  {/* Month grid */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {MONTHS.map((m, i) => {
                      const now = new Date();
                      const isThisMonth =
                        now.getFullYear() === pickerYear && now.getMonth() === i;
                      return (
                        <button
                          key={m}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const d = new Date(pickerYear, i, 15);
                            setWeekStart(getWeekStart(d));
                            setShowMonthPicker(false);
                          }}
                          className={`rounded-xl py-2 text-xs font-medium transition-colors active:scale-95 ${
                            isThisMonth
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                          }`}
                        >
                          {m.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                  {/* Today button */}
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setWeekStart(getWeekStart(new Date()));
                      setPickerYear(new Date().getFullYear());
                      setShowMonthPicker(false);
                    }}
                    className="w-full mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 py-1.5 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors"
                  >
                    📅 Ir a hoy
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => {
              const next = new Date(weekStart);
              next.setDate(next.getDate() + 7);
              setWeekStart(next);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm transition-colors active:scale-95"
          >
            <span className="hidden sm:inline">Siguiente </span>→
          </button>
        </div>

        {/* Today button + user */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-gray-100">
          <button
            onClick={() => setWeekStart(getWeekStart(new Date()))}
            className={`text-[11px] sm:text-xs font-medium transition-colors ${
              isThisWeek
                ? "text-gray-300 cursor-default"
                : "text-gray-400 hover:text-blue-600"
            }`}
            disabled={isThisWeek}
          >
            📅 Volver a hoy
          </button>
          {!userEmail && (
            <a
              href="/login"
              className="text-[11px] sm:text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Iniciar sesión para reservar →
            </a>
          )}
          {userEmail && (
            <span className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1.5">
              <span className="hidden sm:inline">👤</span> {userName}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-50 rounded-xl mx-4" />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-2 text-sm">{error}</p>
            <button
              onClick={fetchEvents}
              className="text-blue-600 underline text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Error panel */}
        {lastError && (
          <div className="mx-3 sm:mx-4 mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800">Error al procesar la reserva</p>
              <p className="text-xs text-red-600 mt-0.5 break-words">{lastError}</p>
              <p className="text-[11px] text-red-400 mt-1">Si el problema persiste, avísame para revisar los logs.</p>
            </div>
            <button
              onClick={() => setLastError(null)}
              className="text-red-400 hover:text-red-600 shrink-0 text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* Calendar Grid */}
        {!loading && !error && (
          <div className="overflow-x-auto scrollbar-thin">
            <div className="grid grid-cols-[40px_repeat(7,1fr)] min-w-[520px] sm:min-w-[580px]">
              {/* Corner */}
              <div className="p-1 text-[9px] sm:text-[10px] text-gray-300 text-right pr-1.5 sm:pr-2 self-end pb-1.5 sm:pb-2">
                Hora
              </div>

              {/* Day headers */}
              {weekDays.map((d, i) => {
                const isToday = formatDate(d) === formatDate(new Date());
                return (
                  <div
                    key={i}
                    className={`p-1.5 sm:p-2 text-center ${
                      i < 6 ? "border-r border-gray-200" : ""
                    }`}
                  >
                    <div
                      className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${
                        isToday ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {DAYS[d.getDay()]}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-bold mt-0.5 ${
                        isToday
                          ? "bg-blue-600 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto shadow-sm"
                          : "text-gray-700"
                      }`}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}

              {/* Hour rows */}
              {HOURS.map((hour) => (
                <div key={hour} className="contents">
                  <div className="text-[9px] sm:text-[10px] text-gray-300 text-right pr-1.5 sm:pr-2 py-2 sm:py-2.5 border-t border-gray-200">
                    {formatHour(hour)}
                  </div>
                  {weekDays.map((d, di) => {
                    const booking = isBooked(d, hour);
                    const slotTime = new Date(d).setHours(hour, 0, 0, 0);
                    const isPast = slotTime < Date.now();
                    const isMine = booking?.creatorEmail === userEmail;

                    // Check if this is the first hour of a multi-hour booking
                    const prevHour = hour - 1;
                    const prevBooking = prevHour >= 7 ? isBooked(d, prevHour) : undefined;
                    const isBookingStart = booking && prevBooking?.id !== booking.id;

                    // Check if the booking continues to next hour
                    const nextHour = hour + 1;
                    const nextBooking = nextHour <= 23 ? isBooked(d, nextHour) : undefined;
                    const isBookingContinuation = booking && nextBooking?.id === booking.id;

                    let cellBg = "hover:bg-blue-50 cursor-pointer transition-colors";
                    if (isPast) cellBg = "bg-gray-100/60";
                    else if (booking) cellBg = "";

                    const pillColor = isMine
                      ? "bg-blue-500 text-white"
                      : "bg-amber-400 text-white";
                    const pillRounded = isBookingStart ? "rounded-t-lg" : "";
                    const pillBottomRounded = !isBookingContinuation ? "rounded-b-lg" : "";

                    return (
                      <div
                        key={di}
                        className={`border-t border-l border-gray-200 min-h-[28px] sm:min-h-[32px] relative group ${cellBg}`}
                        onClick={() => !isPast && handleSlotClick(d, hour)}
                      >
                        {booking && (
                          <div className="absolute inset-0 flex items-stretch p-0.5">
                            <div
                              className={`flex-1 ${pillColor} ${pillRounded} ${pillBottomRounded} flex items-center px-1.5 sm:px-2 overflow-hidden shadow-sm`}
                            >
                              {isBookingStart ? (
                                <div className="flex items-center gap-1.5 min-w-0 w-full">
                                  <span className="font-semibold text-[10px] sm:text-xs truncate min-w-0">
                                    {isMine ? "Tú" : booking.creator.split(" ")[0]}
                                  </span>
                                  <span className="text-[8px] sm:text-[10px] opacity-80 shrink-0">
                                    {formatHour(new Date(booking.start).getHours())}
                                  </span>
                                  {isMine && !isPast && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel(booking.id);
                                      }}
                                      className="ml-auto text-[8px] sm:text-[10px] underline opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:opacity-100"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ) : (
                                // Continuation bar — subtle dot
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/60" />
                                </div>
                              )}
                            </div>
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
      </div>

      {/* My Reservations Section */}
      {userEmail && (
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
            <h2 className="font-bold text-sm sm:text-base text-gray-800 flex items-center gap-2">
              🏊 Mis reservas
              {myBookings.length > 0 && (
                <span className="text-xs font-normal text-gray-400">
                  ({myBookings.length})
                </span>
              )}
            </h2>
          </div>

          {myBookings.length === 0 ? (
            <div className="px-4 sm:px-5 py-6 text-center">
              <p className="text-gray-400 text-sm">No tienes reservas esta semana</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Upcoming bookings */}
              {upcomingBookings.length > 0 && (
                <div className="px-4 sm:px-5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Próximas
                  </p>
                  <div className="space-y-2">
                    {upcomingBookings.map((b) => {
                      const d = new Date(b.start);
                      return (
                        <div
                          key={b.id}
                          className="flex items-center justify-between gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-gray-800">
                              {DAYS[d.getDay()]}, {d.getDate()} {MONTHS[d.getMonth()]}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatTimeRange(b.start, b.end)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCancel(b.id)}
                            disabled={cancelling === b.id}
                            className="shrink-0 px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-xl transition-colors active:scale-95 disabled:opacity-50"
                          >
                            {cancelling === b.id ? "Cancelando..." : "Cancelar"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Past bookings */}
              {pastBookings.length > 0 && (
                <div className="px-4 sm:px-5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Pasadas
                  </p>
                  <div className="space-y-1.5">
                    {pastBookings.map((b) => {
                      const d = new Date(b.start);
                      return (
                        <div
                          key={b.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl opacity-60"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-500">
                              {DAYS[d.getDay()]}, {d.getDate()} {MONTHS[d.getMonth()]}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatTimeRange(b.start, b.end)}
                            </p>
                          </div>
                          <span className="text-[11px] text-gray-400 shrink-0">
                            ✓ Pasada
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <BookingModal
          start={modal.start}
          end={modal.end}
          userName={userName || ""}
          onConfirm={handleBook}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
