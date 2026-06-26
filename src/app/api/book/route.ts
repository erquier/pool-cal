import { auth } from "@/app/api/auth/[...nextauth]/route";
import { createBooking, getEvents } from "@/lib/google-calendar";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { start, end } = await request.json();
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Validaciones
  if (endDate <= startDate) {
    return NextResponse.json({ error: "La reserva debe terminar después de empezar" }, { status: 400 });
  }

  const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  if (duration > 3) {
    return NextResponse.json({ error: "Máximo 3 horas por reserva" }, { status: 400 });
  }

  if (startDate < new Date()) {
    return NextResponse.json({ error: "No se puede reservar en el pasado" }, { status: 400 });
  }

  const hour = startDate.getHours();
  if (hour < 7 || hour >= 22) {
    return NextResponse.json({ error: "Horario de piscina: 7:00 - 22:00" }, { status: 400 });
  }

  // Verificar overlap
  const existing = await getEvents(startDate, endDate);
  if (existing.length > 0) {
    // Check if any overlap
    const hasOverlap = existing.some((e) => {
      const eStart = new Date(e.start);
      const eEnd = new Date(e.end);
      return startDate < eEnd && endDate > eStart;
    });
    if (hasOverlap) {
      return NextResponse.json({ error: "Ese horario ya está reservado" }, { status: 409 });
    }
  }

  // Verificar max 1 reserva por usuario por día
  const dayStart = new Date(startDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(startDate);
  dayEnd.setHours(23, 59, 59, 999);
  const userEvents = await getEvents(dayStart, dayEnd);
  const userHasBooking = userEvents.some((e) => e.creatorEmail === session.user?.email);
  if (userHasBooking) {
    return NextResponse.json({ error: "Ya tienes una reserva este día. Máximo 1 por hogar." }, { status: 409 });
  }

  const eventId = await createBooking(
    startDate,
    endDate,
    session.user.name || "Vecino",
    session.user.email || ""
  );

  return NextResponse.json({ id: eventId, success: true });
}
